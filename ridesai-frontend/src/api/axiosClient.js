import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://ridesai.cloud/api",
    withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ---- Auto-refresh on 401, logout on 403 / refresh-failure ----
// If a request comes back 401 (access token expired), try once to get a
// fresh access token using the refresh token, then retry the original
// request. Logs the user out (redirect to /login) if:
//   - there's no refresh token to use
//   - the refresh request itself fails (refresh token expired/invalid)
//   - the server returns 403 (valid token, but not authorized)
let isRefreshing = false;
let pendingQueue = [];

function resolveQueue(error, token = null) {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error) {
            reject(error);
        } else {
            resolve(token);
        }
    });
    pendingQueue = [];
}

function redirectToLogin() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Avoid redirect loop if already on the login page
    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
}

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint =
            originalRequest?.url?.includes("/login/") ||
            originalRequest?.url?.includes("/token/refresh/");

        // ---- 401: token expired/missing -> try refresh ----
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
                redirectToLogin();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // A refresh is already in flight — wait for it, then retry
                // this request with whatever token it produces.
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(
                    "https://ridesai.cloud/api/token/refresh/",
                    { refresh: refreshToken },
                    { withCredentials: true }
                );

                const newAccessToken = res.data.access;
                localStorage.setItem("access_token", newAccessToken);

                // SimpleJWT gives a new refresh token too when
                // ROTATE_REFRESH_TOKENS is on — save it if present.
                if (res.data.refresh) {
                    localStorage.setItem("refresh_token", res.data.refresh);
                }

                axiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                resolveQueue(null, newAccessToken);

                return axiosClient(originalRequest);
            } catch (refreshError) {
                resolveQueue(refreshError, null);

                // Refresh token itself is invalid/expired — real logout.
                redirectToLogin();

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // ---- 403: valid token but not authorized -> logout + redirect ----
        if (error.response?.status === 403 && !isAuthEndpoint) {
            redirectToLogin();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
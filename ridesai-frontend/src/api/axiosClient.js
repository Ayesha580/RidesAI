import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://ridesai.cloud/api",
    withCredentials : true,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ---- Auto-refresh on 401 ----
// If a request comes back 401 (access token expired), try once to get a
// fresh access token using the refresh token, then retry the original
// request. Only logs the user out if the refresh itself fails
// (refresh token expired/invalid too).

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

axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthEndpoint =
            originalRequest?.url?.includes("/login/") ||
            originalRequest?.url?.includes("/token/refresh/");

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !isAuthEndpoint
        ) {
            const refreshToken = localStorage.getItem("refresh_token");

            if (!refreshToken) {
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

                // Refresh token itself is invalid/expired — this is a real
                // logout, not just a slow request.
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
                window.location.href = "/login";

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
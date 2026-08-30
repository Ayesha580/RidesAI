import axios from "axios";

const axiosClient = axios.create({
    baseURL: "https://ridesai.cloud/api",
    withCredentials: true,
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

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

        // =========================
        // 401 - ACCESS TOKEN EXPIRED
        // =========================
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

            // Another refresh request is already running
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((newToken) => {
                        originalRequest.headers.Authorization =
                            `Bearer ${newToken}`;

                        return axiosClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(
                    "https://ridesai.cloud/api/token/refresh/",
                    {
                        refresh: refreshToken,
                    },
                    {
                        withCredentials: true,
                    }
                );

                const newAccessToken = res.data.access;

                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                // If refresh token rotation is enabled
                if (res.data.refresh) {
                    localStorage.setItem(
                        "refresh_token",
                        res.data.refresh
                    );
                }

                axiosClient.defaults.headers.common.Authorization =
                    `Bearer ${newAccessToken}`;

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                resolveQueue(null, newAccessToken);

                return axiosClient(originalRequest);

            } catch (refreshError) {
                resolveQueue(refreshError, null);

                redirectToLogin();

                return Promise.reject(refreshError);

            } finally {
                isRefreshing = false;
            }
        }

        // =========================
        // 403 - FORBIDDEN
        // =========================
        if (
            error.response?.status === 403 &&
            !isAuthEndpoint
        ) {
            redirectToLogin();

            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;

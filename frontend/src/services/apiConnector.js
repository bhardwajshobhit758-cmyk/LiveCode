import axios from "axios";

export const axiosInstance = axios.create({});

// --- ADDED INTERCEPTOR START ---
axiosInstance.interceptors.response.use(
    (response) => {
        // If the request is successful, just return the response
        return response;
    },
    (error) => {
        // Check if the error is 401 (Unauthorized) which usually means JWT expired
        if (error.response && error.response.status === 401) {
            console.log("Session expired. Logging out...");
            
            // 1. Clear LocalStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // 2. Redirect to login page
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);
// --- ADDED INTERCEPTOR END ---

export const apiConnector = (method, url, bodyData, headers, params) => {
    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        headers: headers ? headers : null,
        params: params ? params : null,
    });
}
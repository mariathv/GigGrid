import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const axiosRequest = async <T = any>(
    endpoint: string,
    data?: Record<string, any> | FormData | null,
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
    timeout = 20000
): Promise<T> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url: `${API_BASE_URL}/${endpoint}`,
            timeout,
            headers: {},
        };

        if (data instanceof FormData) {
            config.headers!["Content-Type"] = "multipart/form-data";

            config.data = data;
        } else if (data) {
            config.headers!["Content-Type"] = "multipart/form-data";

            config.data = data;
        }

        const response = await axios(config);
        return response.data as T;

    } catch (error: any) {
        if (axios.isAxiosError(error)) {
            console.error("Axios error:", error.message);
        } else {
            console.error("Unexpected error:", error);
        }

        throw new Error("Axios request failed");
    }
};

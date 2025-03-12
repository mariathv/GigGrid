const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const apiRequest = async <T = any>(
    endpoint: string,
    bodyData?: Record<string, any> | null,
    method: string = "POST",
    timeout: number = 20000 //20 seconds time out
): Promise<T> => {
    let success = false;

    while (!success) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method,
                headers: { "Content-Type": "application/json" },
                body: bodyData ? JSON.stringify(bodyData) : null,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const json = await response.json() as T;
            success = true;
            return json;

        } catch (error) {
            clearTimeout(timeoutId);

            if ((error as any).name === "AbortError") {
                console.error("Request timed out");
            } else {
                console.log(`${API_BASE_URL}/${endpoint}`, bodyData);
                console.error("Fetch error:", error instanceof Error ? error.message : String(error));
            }
        }
    }

    throw new Error("Failed to complete API request");
};

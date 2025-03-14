const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const getUserPFP = (userid: string | undefined, cacheBust: boolean = false) => {
    if (userid) {
        const baseUrl = `${API_BASE_URL}/user/${userid}/pfp`;
        return cacheBust ? `${baseUrl}?t=${Date.now()}` : baseUrl;
    } else {
        return null;
    }
};

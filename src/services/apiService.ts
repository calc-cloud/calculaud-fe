import {API_CONFIG} from '@/config/api';

class ApiService {
    private readonly baseUrl: string;
    private getToken: (() => string | undefined) | null = null;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    setTokenProvider(getToken: () => string | undefined) {
        this.getToken = getToken;
    }

    async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
        const searchParams = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    // Handle array values by adding multiple parameters with the same name
                    if (Array.isArray(value)) {
                        value.forEach(item => {
                            if (item !== undefined && item !== null && item !== '') {
                                searchParams.append(key, String(item));
                            }
                        });
                    } else {
                        searchParams.append(key, String(value));
                    }
                }
            });
        }

        const queryString = searchParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;

        return this.request<T>(url);
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async patch<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string> || {}),
        };

        // Add Authorization header if token is available
        if (this.getToken) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        const config: RequestInit = {
            headers,
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: 'An error occurred'
            }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        // Handle 204 No Content responses
        if (response.status === 204) {
            return undefined as T;
        }

        return await response.json();

    }
}

export const apiService = new ApiService();

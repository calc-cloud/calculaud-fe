import { API_CONFIG } from '@/config/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('=== ApiService.request ===');
    console.log('Full URL:', url);
    console.log('Options:', options);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          message: 'An error occurred' 
        }));
        console.error('Error response data:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();
      console.log('Success response data:', data);
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    console.log('=== ApiService.get ===');
    console.log('Endpoint:', endpoint);
    console.log('Params:', params);
    
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Handle array values by adding multiple parameters with the same name
          if (Array.isArray(value)) {
            value.forEach(item => {
              if (item !== undefined && item !== null && item !== '') {
                searchParams.append(key, String(item));
                console.log(`Added array param: ${key}=${String(item)}`);
              }
            });
          } else {
            searchParams.append(key, String(value));
            console.log(`Added param: ${key}=${String(value)}`);
          }
        }
      });
    }
    
    const queryString = searchParams.toString();
    console.log('Query string:', queryString);
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    console.log('Final endpoint with query:', url);
    
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
}

export const apiService = new ApiService();

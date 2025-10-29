const API_BASE_URL = 'http://localhost:8081/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'agent' | 'customer';
}

export interface VerifyOtpPayload {
  email: string;
  otp: string; // Changed from 'code' to 'otp' to match backend
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'agent' | 'customer' | 'admin';
    avatar?: string;
  };
}

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  commission: number;
  totalPolicies: number;
  activeCustomers: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface Policy {
  id: string;
  type: 'motor' | 'microinsurance' | 'health' | 'travel';
  status: 'active' | 'expired' | 'pending' | 'cancelled';
  premium: number;
  startDate: string;
  endDate: string;
  coverageAmount: number;
  description: string;
}

export interface PaymentPayload {
  amount: number;
  method: 'mtn' | 'airtel' | 'card';
  phone?: string;
  policyId?: string;
}

export interface PaymentResponse {
  transactionId: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
  amount: number;
  timestamp: string;
}

export interface ReportData {
  totalUsers: number;
  totalAgents: number;
  totalPolicies: number;
  totalRevenue: number;
  monthlyRevenue: number;
  topAgents: Agent[];
  policyDistribution: Record<string, number>;
}

class ApiService {
  private getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  private getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(),
      });

      const data = await response.json() as any;

      // Check if backend already returns success/error format
      if (data.success !== undefined) {
        if (!data.success) {
          return {
            success: false,
            error: data.error || data.message || 'Request failed',
          };
        }
        
        // Success response - extract token and user if present
        if (data.token) {
          return {
            success: true,
            data: {
              token: data.token,
              user: data.user,
            } as any,
            message: data.message,
          } as ApiResponse<T>;
        }
        
        // Simple success response
        return {
          success: true,
          data: data.data || data,
          message: data.message,
        } as ApiResponse<T>;
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data: data,
      } as ApiResponse<T>;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Auth endpoints
  async login(payload: AuthPayload): Promise<ApiResponse<{message: string, email: string}>> {
    return this.request<{message: string, email: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
  
  async verifyLoginOtp(payload: {email: string, otp: string}): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async register(payload: RegisterPayload): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async resendOtp(email: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Agent endpoints
  async getAgentProfile(): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('/agents/profile');
  }

  async updateAgentProfile(data: Partial<Agent>): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('/agents/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadKycDocuments(formData: FormData): Promise<ApiResponse<{ message: string }>> {
    const headers = { ...this.getHeaders() } as any;
    delete headers['Content-Type']; // Let browser set it for FormData
    return this.request<{ message: string }>('/agents/kyc', {
      method: 'POST',
      body: formData,
      headers,
    });
  }

  async getAgentDashboard(): Promise<ApiResponse<Agent>> {
    return this.request<Agent>('/agents/dashboard');
  }

  // Policy endpoints
  async getPolicies(): Promise<ApiResponse<Policy[]>> {
    return this.request<Policy[]>('/policies');
  }

  async getPolicy(id: string): Promise<ApiResponse<Policy>> {
    return this.request<Policy>(`/policies/${id}`);
  }

  async createPolicy(data: Partial<Policy>): Promise<ApiResponse<Policy>> {
    return this.request<Policy>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePolicy(id: string, data: Partial<Policy>): Promise<ApiResponse<Policy>> {
    return this.request<Policy>(`/policies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelPolicy(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/policies/${id}/cancel`, {
      method: 'POST',
    });
  }

  // Payment endpoints
  async initiatePayment(payload: PaymentPayload): Promise<ApiResponse<PaymentResponse>> {
    return this.request<PaymentResponse>('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getPaymentStatus(transactionId: string): Promise<ApiResponse<PaymentResponse>> {
    return this.request<PaymentResponse>(`/payments/${transactionId}`);
  }

  async getPaymentHistory(): Promise<ApiResponse<PaymentResponse[]>> {
    return this.request<PaymentResponse[]>('/payments/history');
  }

  // Admin endpoints
  async getReports(): Promise<ApiResponse<ReportData>> {
    return this.request<ReportData>('/admin/reports');
  }

  async exportReport(format: 'csv' | 'pdf'): Promise<Blob> {
    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}/admin/reports/export?format=${format}`, {
      method: 'GET',
      headers,
    });
    return response.blob();
  }

  // User profile endpoints
  async getUserProfile(): Promise<ApiResponse<any>> {
    return this.request<any>('/users/profile');
  }

  async updateUserProfile(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();

export class ApiError extends Error {
  status: number;
  data?: Record<string, unknown>;

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export interface SafeResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status: number;
    data?: unknown;
  };
}

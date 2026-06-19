export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
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

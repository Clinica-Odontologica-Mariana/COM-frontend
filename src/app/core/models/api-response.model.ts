export interface ApiError {
  code: string;
  message: string;
  details: string[];
  timestamp: string;
  path: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: ApiError | null;
}

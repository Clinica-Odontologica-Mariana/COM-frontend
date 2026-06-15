export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
  createdAt: string;
}

export interface UpdateUserProfilePayload {
  name: string;
  email: string;
  phone: string | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiFieldError {
  field?: string;
  message?: string;
}

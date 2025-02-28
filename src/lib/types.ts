export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'freelancer' | 'client';
  address: {
    country: string;
    state: string;
    city: string;
    street: string;
    zip: string;
  };
  skills: string[];
  bio?: string;
}

export interface ApiResponse {
  message: string;
  user?: {
    id: string;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_verified: boolean;
  };
  error?: string;
}
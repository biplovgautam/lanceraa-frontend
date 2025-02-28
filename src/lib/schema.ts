import { z } from 'zod'

export const FormDataSchema = z.object({
  // Account Details
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain uppercase, lowercase, number and special character'),
  confirmPassword: z.string(),
  
  // Personal Information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9][0-9]{7,14}$/, 'Invalid phone number'),
  role: z.enum(['freelancer', 'client']),
  
  // Address
  country: z.string().min(2, 'Country must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  street: z.string().min(5, 'Street address must be at least 5 characters'),
  zip: z.string().min(2, 'ZIP code must be at least 2 characters'),
  
  // Professional Details
  skills: z.string()
    .transform(str => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [])
    .pipe(z.array(z.string()).min(1, 'At least one skill is required')),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
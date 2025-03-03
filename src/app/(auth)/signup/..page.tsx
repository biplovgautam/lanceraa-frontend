'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormDataSchema } from '@/lib/schema'
import { CheckIcon } from 'lucide-react'
import { signupUser } from '@/lib/api';
import { SignupData } from '@/lib/types';
import { useRouter } from 'next/navigation';

type Inputs = z.infer<typeof FormDataSchema>

const steps = [
  {
    id: 'Step 1',
    name: 'Account Details',
    fields: ['username', 'email', 'password', 'confirmPassword']
  },
  {
    id: 'Step 2',
    name: 'Personal Information',
    fields: ['firstName', 'lastName', 'phone', 'role']
  },
  {
    id: 'Step 3',
    name: 'Address',
    fields: ['country', 'state', 'city', 'street', 'zip']
  },
  {
    id: 'Step 4',
    name: 'Professional Details',
    fields: ['skills', 'bio']
  },
  { id: 'Step 5', name: 'Complete' }
]

export default function SignupForm() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0)
  const [delta, setDelta] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordsMatch, setPasswordsMatch] = useState(true)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [signupData, setSignupData] = useState<{email: string, username: string} | null>(null)

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors, dirtyFields }
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    mode: 'onChange'
  })

  // Watch form values for validation
  const watchedFields = watch()
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  // Check if passwords match
  useEffect(() => {
    if (password && confirmPassword) {
      setPasswordsMatch(password === confirmPassword)
    }
  }, [password, confirmPassword])

  // Check if current step fields are valid
  const currentFields = steps[currentStep]?.fields || []
  const isCurrentStepValid = currentFields.every(
    field => {
      // Special case for confirmPassword to check if passwords match
      if (field === 'confirmPassword') {
        return dirtyFields[field as keyof Inputs] && 
               !errors[field as keyof Inputs] && 
               passwordsMatch;
      }
      return dirtyFields[field as keyof Inputs] && !errors[field as keyof Inputs]
    }
  )

  const next = async () => {
    const fields = steps[currentStep].fields
    
    if (!fields) return // Handle last step case
    
    // Add password match validation for step 1
    if (currentStep === 0 && password !== confirmPassword) {
      return // Don't proceed if passwords don't match
    }

    const output = await trigger(fields as Array<keyof Inputs>)
    console.log('Validation result:', output, 'for fields:', fields)

    if (!output) return

    // If we're on step 4 (Professional Details), submit the form
    if (currentStep === 3) {
      const formData = watch()
      try {
        setIsSubmitting(true)
        setError(null)
        
        const signupData: SignupData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          address: {
            country: formData.country,
            state: formData.state,
            city: formData.city,
            street: formData.street,
            zip: formData.zip
          },
          skills: Array.isArray(formData.skills) ? formData.skills : 
            formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          bio: formData.bio
        }

        const response = await signupUser(signupData)
        console.log('Signup successful:', response)
        setCurrentStep(steps.length - 1)
        
        // Store signup data for login redirect
        setSignupSuccess(true)
        setSignupData({
          email: formData.email,
          username: formData.username
        })
        
      } catch (error) {
        console.error('Signup error:', error)
        setError(error instanceof Error ? error.message : 'Failed to create account')
        return // Don't proceed to next step if there's an error
      } finally {
        setIsSubmitting(false)
      }
    }

    // Proceed to next step for other steps
    if (currentStep < steps.length - 1) {
      setDelta(1)
      setCurrentStep(step => step + 1)
    }
  }

  const prev = () => {
    if (currentStep > 0) {
      setDelta(-1)
      setCurrentStep(step => step - 1)
    }
  }

  const processForm: SubmitHandler<Inputs> = async (data) => {
    try {
      const signupData: SignupData = {
        username: data.username,
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        address: {
          country: data.country,
          state: data.state,
          city: data.city,
          street: data.street,
          zip: data.zip
        },
        skills: Array.isArray(data.skills) ? data.skills : 
          data.skills.split(',').map(s => s.trim()).filter(Boolean),
        bio: data.bio
      };

      const response = await signupUser(signupData);
      console.log('Signup successful:', response);
      setCurrentStep(steps.length - 1);

    } catch (error) {
      console.error('Form submission error:', error);
      // Handle error (show error message to user)
    }
  };

  const redirectToLogin = () => {
    if (signupData?.email) {
      // Redirect to login with username/email prefilled
      const loginParam = encodeURIComponent(signupData.username || signupData.email);
      router.push(`/login?username=${loginParam}`);
    } else {
      // Fallback if no email is available
      router.push('/login');
    }
  };

  return (
    <section className='min-h-screen flex flex-col justify-between p-4 md:p-8 lg:p-12'>
      {/* Progress Steps */}
      <nav aria-label='Progress' className='py-4'>
        <ol role='list' 
          className='overflow-x-auto flex space-x-2 md:space-x-4 p-1 md:justify-center'
        >
          {steps.map((step, index) => (
            <li key={step.name} className='flex-shrink-0 md:flex-1 max-w-[150px]'>
              {currentStep > index ? (
                <div className='group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-sky-600 transition-colors '>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className='flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'
                  aria-current='step'
                >
                  <span className='text-sm font-medium text-sky-600'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              ) : (
                <div className='group flex w-full flex-col border-l-4 border-gray-300 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4'>
                  <span className='text-sm font-medium text-gray-500 group-hover:text-gray-700'>
                    {step.id}
                  </span>
                  <span className='text-sm font-medium'>{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className='flex-1 max-w-3xl mx-auto w-full py-8'>
        {/* Account Details Step */}
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <h2 className='text-xl font-semibold text-[var(--text)]'>
              Account Details
            </h2>
            
            <div className='grid gap-6'>
              <div className='grid gap-2'>
                <label htmlFor='username' className='text-sm font-medium text-[var(--text)]'>
                  Username
                </label>
                <input
                  {...register('username')}
                  id='username'
                  type='text'
                  className='input-field'
                  placeholder='john_doe'
                />
                {errors.username && (
                  <p className='text-sm text-red-500'>{errors.username.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='email' className='text-sm font-medium text-[var(--text)]'>
                  Email
                </label>
                <input
                  {...register('email')}
                  id='email'
                  type='email'
                  className='input-field'
                  placeholder='john@example.com'
                />
                {errors.email && (
                  <p className='text-sm text-red-500'>{errors.email.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='password' className='text-sm font-medium text-[var(--text)]'>
                  Password
                </label>
                <input
                  {...register('password')}
                  id='password'
                  type='password'
                  className='input-field'
                />
                {errors.password && (
                  <p className='text-sm text-red-500'>{errors.password.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='confirmPassword' className='text-sm font-medium text-[var(--text)]'>
                  Confirm Password
                </label>
                <input
                  {...register('confirmPassword')}
                  id='confirmPassword'
                  type='password'
                  className={`input-field ${confirmPassword && !passwordsMatch ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className='text-sm text-red-500'>{errors.confirmPassword.message}</p>
                )}
                {confirmPassword && !passwordsMatch && !errors.confirmPassword && (
                  <p className='text-sm text-red-500'>Passwords do not match</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Personal Information Step */}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <h2 className='text-xl font-semibold text-[var(--text)]'>
              Personal Information
            </h2>
            
            <div className='grid gap-6'>
              <div className='grid gap-2'>
                <label htmlFor='firstName' className='text-sm font-medium text-[var(--text)]'>
                  First Name
                </label>
                <input
                  {...register('firstName')}
                  id='firstName'
                  type='text'
                  className='input-field'
                  placeholder='John'
                />
                {errors.firstName && (
                  <p className='text-sm text-red-500'>{errors.firstName.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='lastName' className='text-sm font-medium text-[var(--text)]'>
                  Last Name
                </label>
                <input
                  {...register('lastName')}
                  id='lastName'
                  type='text'
                  className='input-field'
                  placeholder='Doe'
                />
                {errors.lastName && (
                  <p className='text-sm text-red-500'>{errors.lastName.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='phone' className='text-sm font-medium text-[var(--text)]'>
                  Phone
                </label>
                <input
                  {...register('phone')}
                  id='phone'
                  type='tel'
                  className='input-field'
                  placeholder='+1234567890'
                />
                {errors.phone && (
                  <p className='text-sm text-red-500'>{errors.phone.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label className='text-sm font-medium text-[var(--text)]'>
                  Role
                </label>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <label className='radio-card'>
                    <input
                      {...register('role')}
                      type='radio'
                      value='freelancer'
                    />
                    <span>
                      Freelancer
                      <small className='block text-[var(--text-secondary)]'>
                        I want to work on projects
                      </small>
                    </span>
                  </label>
                  
                  <label className='radio-card'>
                    <input
                      {...register('role')}
                      type='radio'
                      value='client'
                    />
                    <span>
                      Client
                      <small className='block text-[var(--text-secondary)]'>
                        I want to hire freelancers
                      </small>
                    </span>
                  </label>
                </div>
                {errors.role && (
                  <p className='text-sm text-red-500'>{errors.role.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Address Step */}
        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <h2 className='text-xl font-semibold text-[var(--text)]'>
              Address
            </h2>
            
            <div className='grid gap-6'>
              <div className='grid gap-2'>
                <label htmlFor='country' className='text-sm font-medium text-[var(--text)]'>
                  Country
                </label>
                <input
                  {...register('country')}
                  id='country'
                  type='text'
                  className='input-field'
                  placeholder='USA'
                />
                {errors.country && (
                  <p className='text-sm text-red-500'>{errors.country.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='state' className='text-sm font-medium text-[var(--text)]'>
                  State
                </label>
                <input
                  {...register('state')}
                  id='state'
                  type='text'
                  className='input-field'
                  placeholder='California'
                />
                {errors.state && (
                  <p className='text-sm text-red-500'>{errors.state.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='city' className='text-sm font-medium text-[var(--text)]'>
                  City
                </label>
                <input
                  {...register('city')}
                  id='city'
                  type='text'
                  className='input-field'
                  placeholder='Los Angeles'
                />
                {errors.city && (
                  <p className='text-sm text-red-500'>{errors.city.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='street' className='text-sm font-medium text-[var(--text)]'>
                  Street
                </label>
                <input
                  {...register('street')}
                  id='street'
                  type='text'
                  className='input-field'
                  placeholder='123 Main St'
                />
                {errors.street && (
                  <p className='text-sm text-red-500'>{errors.street.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='zip' className='text-sm font-medium text-[var(--text)]'>
                  ZIP Code
                </label>
                <input
                  {...register('zip')}
                  id='zip'
                  type='text'
                  className='input-field'
                  placeholder='90001'
                />
                {errors.zip && (
                  <p className='text-sm text-red-500'>{errors.zip.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Professional Details Step */}
        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-6'
          >
            <h2 className='text-xl font-semibold text-[var(--text)]'>
              Professional Details
            </h2>
            
            <div className='grid gap-6'>
              <div className='grid gap-2'>
                <label htmlFor='skills' className='text-sm font-medium text-[var(--text)]'>
                  Skills
                </label>
                <input
                  {...register('skills')}
                  id='skills'
                  type='text'
                  className='input-field'
                  placeholder='JavaScript, React, Node.js'
                />
                {errors.skills && (
                  <p className='text-sm text-red-500'>{errors.skills.message}</p>
                )}
              </div>

              <div className='grid gap-2'>
                <label htmlFor='bio' className='text-sm font-medium text-[var(--text)]'>
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  id='bio'
                  className='input-field'
                  placeholder='Tell us about yourself'
                />
                {errors.bio && (
                  <p className='text-sm text-red-500'>{errors.bio.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Complete Step */}
        {currentStep === 4 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='space-y-6 text-center'
          >
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-2">
                <CheckIcon className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className='text-xl font-semibold text-[var(--text)]'>
              Account Created Successfully!
            </h2>
            <p className='text-[var(--text-secondary)] mb-8'>
              Your account has been created. You can now log in to access your dashboard.
            </p>
            <button
              onClick={redirectToLogin}
              className="btn-primary w-full sm:w-auto px-8"
            >
              Go to Login
            </button>
          </motion.div>
        )}
      </form>

      {/* Navigation */}
      <div className='sticky bottom-0 px-4 py-4 bg-[var(--background)] border-t border-[var(--border)]'>
        <div className='max-w-3xl mx-auto flex flex-col sm:flex-row gap-4 justify-between items-center'>
          {error && (
            <p className='text-sm text-red-500 w-full text-center'>
              {error}
            </p>
          )}
          
          <div className='flex w-full sm:w-auto justify-between items-center gap-4'>
            {currentStep !== 4 && (
              <>
                <button
                  type='button'
                  onClick={prev}
                  disabled={currentStep === 0 || isSubmitting}
                  className={`btn-secondary ${(currentStep === 0 || isSubmitting) ? 'opacity-50' : ''}`}
                >
                  Back
                </button>

                <div className='text-sm text-[var(--text-secondary)]'>
                  Step {currentStep + 1} of {steps.length}
                </div>

                <button
                  type='button'
                  onClick={next}
                  disabled={
                    !isCurrentStepValid || 
                    currentStep === steps.length - 1 || 
                    isSubmitting || 
                    (currentStep === 0 && confirmPassword && !passwordsMatch)
                  }
                  className={`btn-primary ${(!isCurrentStepValid || isSubmitting || (currentStep === 0 && confirmPassword && !passwordsMatch)) ? 'opacity-50' : ''}`}
                >
                  {isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'/>
                      Submitting...
                    </span>
                  ) : currentStep === steps.length - 2 ? (
                    'Complete'
                  ) : (
                    'Next'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
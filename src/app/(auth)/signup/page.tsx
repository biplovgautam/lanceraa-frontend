"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Lock, ArrowRight, Check, ArrowLeft, X } from "lucide-react";
import { config } from "@/config";
import Link from "next/link";

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(
    null
  );
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isStrongPassword = (password: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  useEffect(() => {
    const password = formData.password;

    setPasswordValidation({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password),
    });
  }, [formData.password]);

  const passwordStrength =
    Object.values(passwordValidation).filter(Boolean).length;

  const getFirstMissingRequirement = () => {
    if (!passwordValidation.minLength) {
      return {
        type: "minLength",
        message: "Password must be at least 8 characters",
      };
    }
    if (!passwordValidation.hasUppercase) {
      return {
        type: "hasUppercase",
        message: "Add at least 1 uppercase letter (A-Z)",
      };
    }
    if (!passwordValidation.hasLowercase) {
      return {
        type: "hasLowercase",
        message: "Add at least 1 lowercase letter (a-z)",
      };
    }
    if (!passwordValidation.hasSpecial) {
      return {
        type: "hasSpecial",
        message: "Add at least 1 special character (@$!%*?&)",
      };
    }
    if (!passwordValidation.hasNumber) {
      return { type: "hasNumber", message: "Add at least 1 number (0-9)" };
    }
    return null;
  };

  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  const lastCheckedEmail = useRef("");

  useEffect(() => {
    // Skip checking if email is invalid or unchanged from last check
    if (!formData.email || !isValidEmail(formData.email)) {
      setIsEmailAvailable(null);
      return;
    }

    // Store the current email for comparison
    const currentEmail = formData.email;

    // Skip if we've already checked this exact email
    if (
      isEmailAvailable !== null &&
      currentEmail === lastCheckedEmail.current
    ) {
      return;
    }

    const checkEmailAvailability = async () => {
      setIsCheckingAvailability(true);
      try {
        const apiEndpoint = `${config.apiUrl}/api/auth/check-email`;
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: currentEmail }),
        });

        const data = await response.json();
        setIsEmailAvailable(data.exists === false);

        // Update the last checked email
        lastCheckedEmail.current = currentEmail;
      } catch (error) {
        console.error("Error checking email availability:", error);
        setIsEmailAvailable(null);
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    const debouncedCheck = debounce(checkEmailAvailability, 500);
    debouncedCheck();

    return () => {
      // Clean up any pending debounced calls
      setIsCheckingAvailability(false);
    };
  }, [formData.email, isEmailAvailable]);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    setAlert({ show: false, type: "", message: "" });

    if (!isValidEmail(formData.email)) {
      setAlert({
        show: true,
        type: "error",
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsCheckingEmail(true);

    try {
      const apiEndpoint = `${config.apiUrl}/api/auth/check-email`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists === false) {
          setCurrentStep(2);
        } else {
          setAlert({
            show: true,
            type: "error",
            message:
              data.message ||
              "This email is already registered. Please login instead.",
          });
        }
      } else {
        setAlert({
          show: true,
          type: "error",
          message:
            data.detail ||
            "Could not verify email availability. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);

      setAlert({
        show: true,
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setAlert({ show: false, type: "", message: "" });

    if (!isStrongPassword(formData.password)) {
      setAlert({
        show: true,
        type: "error",
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        show: true,
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const initialSignupData = {
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      const apiEndpoint = `${config.apiUrl}/api/auth/signup/initial`;
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(initialSignupData),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        const text = await response.text();
        console.log("Raw response text:", text);
        throw new Error("Failed to parse response");
      }

      if (response.ok && data.user_id) {
        setAlert({
          show: true,
          type: "success",
          message:
            data.message ||
            "Account created! Redirecting to verification page...",
        });

        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
        });

        localStorage.setItem("verification_user_id", data.user_id);

        console.log(
          "Signup successful, redirecting to verification with user_id:",
          data.user_id
        );

        setTimeout(() => {
          window.location.href = `/verify-email/${data.user_id}`;
        }, 2000);
      } else {
        setAlert({
          show: true,
          type: "error",
          message:
            data.detail ||
            data.error ||
            "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("API Error:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Left side - Branding section */}
      <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] flex-col justify-center items-center p-8">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4 text-[var(--background)]">
            Join Lanceraa
          </h1>
          <p className="text-lg text-[var(--background)] opacity-90 mb-6">
            Connect with top clients and find exciting freelance opportunities
            that match your skills and interests.
          </p>
          <div className="space-y-4 mt-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                <Check className="text-[var(--text)]" size={20} />
              </div>
              <p className="text-[var(--background)] opacity-90">
                Access to thousands of projects
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                <Check className="text-[var(--text)]" size={20} />
              </div>
              <p className="text-[var(--background)] opacity-90">
                Secure payment protection
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                <Check className="text-[var(--text)]" size={20} />
              </div>
              <p className="text-[var(--background)] opacity-90">
                Build your professional profile
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form section */}
      <div className="w-full md:w-1/2 bg-[var(--background)] flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-2 text-center text-[var(--text)]">
            {currentStep === 1 ? "Create Your Account" : "Set Password"}
          </h2>

          {/* Update the step indicator with smoother transitions */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)] flex items-center justify-center text-[var(--background)] font-bold transition-all duration-300">
                {currentStep > 1 ? <Check size={16} /> : "1"}
              </div>

              {/* Curved line with dynamic color */}
              <div className="relative h-1 w-16 mx-1">
                <div className="absolute inset-0 bg-[var(--text)] bg-opacity-20 rounded-full"></div>
                <div
                  className={`absolute inset-0 bg-[var(--accent)] rounded-full transition-transform duration-500 ease-out origin-left ${
                    currentStep > 1 ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
              </div>

              {/* Second step with animated background fill */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden relative ${
                  currentStep === 2
                    ? "text-[var(--background)] transition-colors duration-300 delay-300"
                    : "text-[var(--text)] text-opacity-50"
                }`}
              >
                {/* Background circle that animates in from left */}
                <div
                  className={`absolute inset-0 bg-[var(--accent)] transition-transform duration-300 ease-out origin-left delay-300 ${
                    currentStep > 1 ? "scale-x-100" : "scale-x-0"
                  }`}
                ></div>
                <span className="relative z-10">2</span>
              </div>
            </div>
          </div>

          {alert.show && (
            <div
              className={`mb-4 p-3 rounded-md text-center text-sm font-medium ${
                alert.type === "success"
                  ? "bg-green-100 text-green-700 dark:bg-green-800 dark:bg-opacity-30 dark:text-green-300"
                  : "bg-red-100 text-red-700 dark:bg-red-800 dark:bg-opacity-30 dark:text-red-300"
              }`}
            >
              {alert.message}
            </div>
          )}

          {/* Wrap all forms in a parent relative container */}
          <div className="relative overflow-hidden">
            {/* Step 1 form with slide animation */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                currentStep === 1
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              {currentStep === 1 && (
                <form onSubmit={handleCheckEmail} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-[var(--text)] text-opacity-80">
                      Enter your email to get started
                    </p>
                  </div>

                  {/* Email input with validation */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)] text-opacity-60"
                        size={20}
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                          formData.email && !isValidEmail(formData.email)
                            ? "border-red-500 focus:ring-red-500"
                            : formData.email &&
                              isValidEmail(formData.email) &&
                              isEmailAvailable === false
                            ? "border-red-500 focus:ring-red-500"
                            : formData.email &&
                              isValidEmail(formData.email) &&
                              isEmailAvailable === true
                            ? "border-[var(--accent)]-500 focus:ring-[var(--accent)]-500"
                            : "border-[var(--text)] border-opacity-20 focus:ring-[var(--accent)]"
                        } bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2`}
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        autoFocus
                      />

                      {/* Status indicators inside input */}
                      {formData.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {isCheckingAvailability ? (
                            <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                          ) : !isValidEmail(formData.email) ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 text-white">
                              <X size={12} />
                            </span>
                          ) : isEmailAvailable === false ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white">
                              <X size={12} />
                            </span>
                          ) : isEmailAvailable === true ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white">
                              <Check size={12} />
                            </span>
                          ) : isValidEmail(formData.email) ? (
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white">
                              <Check size={12} />
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {/* Only show error message for already registered email */}
                    {formData.email && isEmailAvailable === false && (
                      <div className="py-1">
                        <div className="flex items-center text-xs">
                          <span className="text-red-500 dark:text-red-400 font-medium drop-shadow-sm">
                            Email already registered. Please{" "}
                            <Link href="/login" className="underline">
                              sign in
                            </Link>{" "}
                            instead.
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Continue button with proper validation */}
                  <button
                    type="submit"
                    disabled={
                      isCheckingEmail ||
                      isCheckingAvailability ||
                      !formData.email ||
                      !isValidEmail(formData.email) ||
                      isEmailAvailable === false
                    }
                    className="w-full flex items-center justify-center bg-[var(--accent)] text-[var(--background)] py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCheckingEmail ? (
                      "Checking..."
                    ) : (
                      <>
                        Continue
                        <ArrowRight size={16} className="ml-2" />
                      </>
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <p className="text-[var(--text)] text-opacity-70 text-sm">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-[var(--accent)] hover:underline"
                      >
                        login
                      </Link>
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2 form with slide animation */}
            <div
              className={`transition-all duration-500 ease-in-out transform ${
                currentStep === 2
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
              }`}
            >
              {currentStep === 2 && (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-[var(--text)] text-opacity-80">
                      Create a secure password for {formData.email}
                    </p>
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)] text-opacity-60"
                      size={20}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--text)] border-opacity-20 bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      autoFocus
                      minLength={8}
                    />
                  </div>

                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)] text-opacity-60"
                      size={20}
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-[var(--text)] border-opacity-20 bg-[var(--background)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {formData.password && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[var(--text)] text-opacity-80">
                          Password Strength:{" "}
                          {passwordStrength === 0
                            ? "Very Weak"
                            : passwordStrength <= 2
                            ? "Weak"
                            : passwordStrength <= 4
                            ? "Moderate"
                            : "As Strong As You!"}
                        </span>
                        <span className="text-xs text-[var(--text)] text-opacity-80">
                          {passwordStrength}/5
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-[var(--text)] bg-opacity-10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            passwordStrength <= 2
                              ? "bg-red-500"
                              : passwordStrength <= 4
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {formData.password && (
                    <div className="py-1">
                      {(() => {
                        const missingRequirement = getFirstMissingRequirement();

                        if (missingRequirement) {
                          return (
                            <div className="flex items-center text-xs">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-yellow-500 text-white">
                                <X size={12} />
                              </span>
                              <span className="text-[var(--text)] font-medium drop-shadow-sm">
                                {missingRequirement.message}
                              </span>
                            </div>
                          );
                        } else if (
                          formData.confirmPassword &&
                          formData.password !== formData.confirmPassword
                        ) {
                          return (
                            <div className="flex items-center text-xs">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-red-500 text-white">
                                <X size={12} />
                              </span>
                              <span className="text-red-500 dark:text-red-400 font-medium drop-shadow-sm">
                                Passwords do not match
                              </span>
                            </div>
                          );
                        } else if (
                          formData.confirmPassword &&
                          formData.password === formData.confirmPassword
                        ) {
                          return (
                            <div className="flex items-center text-xs">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-[var(--accent)] text-white">
                                <Check size={12} />
                              </span>
                              <span className="text-[var(--accent)] font-medium drop-shadow-sm">
                                You&apos;re good to go!
                              </span>
                            </div>
                          );
                        } else if (
                          Object.values(passwordValidation).every(Boolean)
                        ) {
                          return (
                            <div className="flex items-center text-xs">
                              <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 mr-2 rounded-full bg-green-500 text-white">
                                <Check size={12} />
                              </span>
                              <span className="text-[var(--text)] font-medium drop-shadow-sm">
                                Password meets all requirements. Please confirm
                                it.
                              </span>
                            </div>
                          );
                        }

                        return null;
                      })()}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-12 flex items-center justify-center bg-[var(--accent)] bg-opacity-10 text-[var(--text)] py-3 rounded-lg hover:bg-opacity-20 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>

                    <button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !formData.password ||
                        !formData.confirmPassword ||
                        formData.password !== formData.confirmPassword ||
                        !Object.values(passwordValidation).every(Boolean)
                      }
                      className="flex-1 flex items-center justify-center bg-[var(--accent)] text-[var(--background)] py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  ArrowLeft,
  Edit2,
  X,
} from "lucide-react";
import { config } from "@/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthRedirect from "@/components/auth/AuthRedirect";

export default function LoginPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<
    "unchecked" | "checking" | "not-found" | "found" | "inactive"
  >("unchecked");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const lastCheckedEmail = useRef("");

  // Check email availability/status when typing
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email)) {
      setEmailStatus("unchecked");
      return;
    }

    // Skip if we've already checked this email
    if (formData.email === lastCheckedEmail.current) {
      return;
    }

    const checkEmailStatus = async () => {
      setEmailStatus("checking");
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
          if (data.exists) {
            // Email exists, check if it's active
            if (data.is_active === false) {
              setEmailStatus("inactive");
            } else {
              setEmailStatus("found");
            }
          } else {
            setEmailStatus("not-found");
          }
        } else {
          // API error, reset status
          setEmailStatus("unchecked");
        }

        // Update the last checked email
        lastCheckedEmail.current = formData.email;
      } catch (error) {
        console.error("Error checking email status:", error);
        setEmailStatus("unchecked");
      }
    };

    // Debounce check
    const timeout = setTimeout(() => {
      checkEmailStatus();
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData.email]);

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
      // Check if email exists in the database
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
        if (data.exists) {
          // Email exists, check if it's active
          if (data.is_active === false) {
            // If inactive, show alert and redirect to verification
            setAlert({
              show: true,
              type: "warning",
              message:
                "Your account needs verification. Redirecting to verification page...",
            });

            // We need to get their verification code first
            const resendResponse = await fetch(
              `${config.apiUrl}/api/auth/resend-verification`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
              }
            );

            if (resendResponse.ok) {
              const resendData = await resendResponse.json();
              localStorage.setItem(
                "verification_user_id",
                resendData.user_id || ""
              );

              setTimeout(() => {
                router.push(`/verify-email/${resendData.user_id}`);
              }, 2000);
            } else {
              throw new Error("Failed to send verification code");
            }
          } else {
            // Email exists and is active, proceed to password step
            setCurrentStep(2);
          }
        } else {
          // Email doesn't exist
          setAlert({
            show: true,
            type: "error",
            message: "Email not found. Please check your email or sign up.",
          });
        }
      } else {
        setAlert({
          show: true,
          type: "error",
          message: data.detail || "Could not verify email. Please try again.",
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
  // Add this function
  const handleVerifyInactiveAccount = async (e: React.MouseEvent) => {
    e.preventDefault();

    setIsCheckingEmail(true);
    setAlert({
      show: true,
      type: "warning",
      message:
        "Your account needs verification. Redirecting to verification page...",
    });

    try {
      // We need to get their verification code first
      const resendResponse = await fetch(
        `${config.apiUrl}/api/auth/resend-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (resendResponse.ok) {
        const resendData = await resendResponse.json();
        localStorage.setItem("verification_user_id", resendData.user_id || "");

        setTimeout(() => {
          router.push(`/verify-email/${resendData.user_id}`);
        }, 2000);
      } else {
        throw new Error("Failed to send verification code");
      }
    } catch (error) {
      console.error("Error initiating verification:", error);
      setAlert({
        show: true,
        type: "error",
        message: "Failed to start verification process. Please try again.",
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAlert({ show: false, type: "", message: "" });

    try {
      // Create form data for OAuth2 password flow
      const formDataObj = new FormData();
      formDataObj.append("username", formData.email);
      formDataObj.append("password", formData.password);

      console.log(`Attempting to login: ${formData.email}`);

      const response = await fetch(`${config.apiUrl}/api/auth/login`, {
        method: "POST",
        body: formDataObj,
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful, processing user data");

        // Store token and user data
        localStorage.setItem("token", data.token.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Create and dispatch a custom event to notify auth context
        const authEvent = new Event("authStateChanged");
        window.dispatchEvent(authEvent);

        setAlert({
          show: true,
          type: "success",
          message: "Login successful! Redirecting to dashboard...",
        });

        // Use window.location.href for a full page reload
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        console.log("Login failed:", data.detail);
        setAlert({
          show: true,
          type: "error",
          message: data.detail || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setAlert({
        show: true,
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "An error occurred during login. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <AuthRedirect>
      <div className="min-h-screen w-full flex flex-col md:flex-row">
        {/* Left side - Form section */}
        <div className="w-full md:w-1/2 bg-[var(--background)] flex items-center justify-center min-h-screen p-4">
          <div className="w-full max-w-md p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-2 text-center text-[var(--text)]">
              {currentStep === 1 ? "Welcome Back" : "Enter Password"}
            </h2>

            {/* Step indicator */}
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
                    : alert.type === "warning"
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:bg-opacity-30 dark:text-yellow-300"
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
                        Enter your email to continue
                      </p>
                    </div>

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
                              : formData.email && emailStatus === "not-found"
                              ? "border-red-500 focus:ring-red-500"
                              : formData.email && emailStatus === "found"
                              ? "border-green-500 focus:ring-green-500"
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
                            {emailStatus === "checking" ? (
                              <div className="w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
                            ) : !isValidEmail(formData.email) ? (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500 text-white">
                                <X size={12} />
                              </span>
                            ) : emailStatus === "not-found" ? (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white">
                                <X size={12} />
                              </span>
                            ) : emailStatus === "found" ||
                              emailStatus === "inactive" ? (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--accent)] text-white">
                                <Check size={12} />
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Only show error message for not found email */}
                      {formData.email && emailStatus === "not-found" && (
                        <div className="py-1">
                          <div className="flex items-center text-xs">
                            <span className="text-red-500 dark:text-red-400 font-medium drop-shadow-sm">
                              Email not found. Need an account?{" "}
                              <Link href="/signup" className="underline">
                                Sign up
                              </Link>
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Show warning for inactive account */}
                      {formData.email && emailStatus === "inactive" && (
                        <div className="py-1">
                          <div className="flex items-center text-xs">
                            <span className="text-yellow-500 dark:text-yellow-400 font-medium drop-shadow-sm">
                              Account needs verification. Continue to verify
                              your email.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {emailStatus === "inactive" ? (
                      <button
                        type="button"
                        onClick={handleVerifyInactiveAccount}
                        disabled={isCheckingEmail}
                        className="w-full flex items-center justify-center bg-yellow-500 text-white py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCheckingEmail ? "Processing..." : "Verify Account"}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={
                          isCheckingEmail ||
                          emailStatus === "checking" ||
                          !formData.email ||
                          !isValidEmail(formData.email) ||
                          emailStatus === "not-found"
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
                    )}

                    <div className="text-center mt-6">
                      <p className="text-[var(--text)] text-opacity-70 text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                          href="/signup"
                          className="text-[var(--accent)] hover:underline"
                        >
                          Sign up
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
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-[var(--text)] text-opacity-80">
                        Enter your password to sign in
                      </p>
                    </div>

                    {/* Email display (not editable) */}
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text)] text-opacity-60"
                        size={20}
                      />
                      <div className="w-full pl-10 pr-10 py-3 rounded-lg border border-[var(--text)] border-opacity-20 bg-[var(--background)] text-[var(--text)] flex items-center justify-between">
                        <span className="truncate">{formData.email}</span>
                        <button
                          type="button"
                          onClick={handleBack}
                          className="text-[var(--accent)] hover:text-[var(--accent)] hover:underline"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
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
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember"
                          name="remember"
                          type="checkbox"
                          className="h-4 w-4 text-[var(--accent)] focus:ring-[var(--accent)] border-gray-300 rounded"
                        />
                        <label
                          htmlFor="remember"
                          className="ml-2 block text-sm text-[var(--text)] text-opacity-80"
                        >
                          Remember me
                        </label>
                      </div>

                      <div className="text-sm">
                        <Link
                          href="/forgot-password"
                          className="font-medium text-[var(--accent)] hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    </div>

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
                        disabled={isLoading || !formData.password}
                        className="flex-1 flex items-center justify-center bg-[var(--accent)] text-[var(--background)] py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? "Signing in..." : "Sign in"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Branding section */}
        <div className="hidden md:flex md:w-1/2 bg-[var(--primary)] flex-col justify-center items-center p-8">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4 text-[var(--background)]">
              Welcome Back to Lanceraa
            </h1>
            <p className="text-lg text-[var(--background)] opacity-90 mb-6">
              Sign in to access your account and continue your freelancing
              journey.
            </p>
            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                  <Check className="text-[var(--text)]" size={20} />
                </div>
                <p className="text-[var(--background)] opacity-90">
                  Find and manage your ongoing projects
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                  <Check className="text-[var(--text)]" size={20} />
                </div>
                <p className="text-[var(--background)] opacity-90">
                  Track payments and earnings
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[var(--background)] bg-opacity-20 flex items-center justify-center">
                  <Check className="text-[var(--text)]" size={20} />
                </div>
                <p className="text-[var(--background)] opacity-90">
                  Connect with clients and collaborators
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthRedirect>
  );
}

"use client";

import { useForgotPasswordMutation, useVerifyOtpMutation, useResetPasswordMutation, useResendOtpMutation } from "@/redux/api/auth/authApi";
import { ArrowRight, KeyRound, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";

interface FormErrors {
  general?: string;
  passwordConfirm?: string;
}

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Reset Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [resendTimer, setResendTimer] = useState(60);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [resetToken, setResetToken] = useState("");

  const [forgotPassword, { isLoading: isSendingEmail }] = useForgotPasswordMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleSendEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ general: "Please enter your email address." });
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      toast.success("A password reset OTP has been sent to your email.");
      setStep(2);
      setResendTimer(60);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to initiate password reset. Please verify your email.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pastedData) return;

    const digits = pastedData.split("");
    const newOtp = [...otp];
    let lastFilledIndex = index;

    for (let i = 0; i < digits.length && index + i < 6; i++) {
      newOtp[index + i] = digits[i];
      lastFilledIndex = index + i;
    }

    setOtp(newOtp);

    const targetIndex = Math.min(lastFilledIndex + 1, 5);
    inputRefs.current[targetIndex]?.focus();
  };

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue && value !== "") return;

    if (cleanValue.length > 1) {
      const digits = cleanValue.split("");
      const newOtp = [...otp];
      let lastFilledIndex = index;

      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newOtp[index + i] = digits[i];
        lastFilledIndex = index + i;
      }

      setOtp(newOtp);
      const targetIndex = Math.min(lastFilledIndex + 1, 5);
      inputRefs.current[targetIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = cleanValue;
      setOtp(newOtp);

      if (cleanValue && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    const otpCode = otp.join("");

    if (otpCode.length < 6) {
      setErrors({ general: "Please enter the complete 6-digit code." });
      return;
    }

    try {
      const response = await verifyOtp({ email, otp: otpCode }).unwrap();
      
      // Capture reset token if returned by backend, otherwise fall back to otp code or predefined behavior
      const token = (response as any)?.data?.token || (response as any)?.token || (response as any)?.data?.resetToken || otpCode;
      setResetToken(token);
      
      toast.success("OTP verified successfully! Please set your new password.");
      setStep(3);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Invalid or expired OTP. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setErrors({});
    try {
      await resendOtp({ email }).unwrap();
      toast.success("A new password reset OTP has been sent to your email.");
      setResendTimer(60);
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to resend OTP. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!newPassword || !confirmPassword) {
      setErrors({ general: "Please fill in all fields." });
      return;
    }

    if (newPassword.length < 6) {
      setErrors({ general: "Password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ passwordConfirm: "Passwords do not match." });
      return;
    }

    try {
      await resetPassword({ token: resetToken, password: newPassword }).unwrap();
      toast.success("Password reset successfully! Please log in with your new password.");
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Failed to reset password. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="md:h-[calc(84vh-1rem)] flex items-center justify-center p-4 poppins-regular">
        <div className="w-full max-w-2xl gap-2 overflow-hidden">
          <div className="flex flex-col justify-center p-6 mt-20 mb-12 md:mx-24 bg-white">
            
            {step === 1 && (
              <>
                <div className="mb-6 text-center flex flex-col items-center">
                  <Link href="/" className="inline-block mb-4">
                    <img
                      src="/main-logo.jpg"
                      alt="Pristto Logo"
                      className="h-14 w-auto object-contain mx-auto select-none invert"
                    />
                  </Link>
                  <h1 className="text-3xl font-bold text-black text-center">Forgot Password?</h1>
                  <p className="mt-4 text-sm text-black text-center">
                    Enter your email address and we&#39;ll send you a 6-digit OTP to reset your password.
                  </p>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-6">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-700 border border-red-200 rounded-none bg-red-50">
                      {errors.general}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="block w-full py-3 pl-12 pr-4 text-gray-700 transition border border-gray-300 rounded-none outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full bg-black text-white hover:bg-zinc-800 gap-4 font-bold py-3.5 px-4 rounded-none flex justify-center items-center cursor-pointer transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSendingEmail ? "Sending Code..." : "Send OTP"}
                    <span>
                      <ArrowRight />
                    </span>
                  </button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="font-semibold text-black underline hover:text-neutral-600">
                      Log In
                    </Link>
                  </p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-6 text-center flex flex-col items-center">
                  <Link href="/" className="inline-block mb-4">
                    <img
                      src="/main-logo.jpg"
                      alt="Pristto Logo"
                      className="h-14 w-auto object-contain mx-auto select-none invert"
                    />
                  </Link>
                  <h1 className="text-3xl font-bold text-black text-center">Enter Verification Code</h1>
                  <p className="mt-4 text-sm text-black flex items-center justify-center gap-1.5 flex-wrap text-center">
                    <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>We sent a 6-digit verification code to <span className="font-semibold">{email}</span></span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-700 border border-red-200 rounded-none bg-red-50">
                      {errors.general}
                    </div>
                  )}

                  {/* 6-box OTP Input */}
                  <div>
                    <label className="block mb-4 text-sm font-medium text-gray-700 text-center">
                      Enter the 6-digit code
                    </label>
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={digit}
                          ref={(el) => {
                            inputRefs.current[idx] = el;
                          }}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          onKeyDown={(e) => handleKeyDown(e, idx)}
                          onPaste={(e) => handlePaste(e, idx)}
                          className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-bold border border-gray-300 focus:border-black focus:ring-1 focus:ring-black outline-none transition rounded-none text-black bg-white"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full bg-black text-white hover:bg-zinc-800 gap-4 font-bold py-3.5 px-4 rounded-none flex justify-center items-center cursor-pointer transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isVerifying ? "Verifying..." : "Verify Code"}
                    <span>
                      <ArrowRight />
                    </span>
                  </button>

                  {/* Resend and Back links */}
                  <div className="text-center text-sm space-y-4">
                    <p className="text-gray-600">
                      Didn&#39;t receive the code?{" "}
                      {resendTimer > 0 ? (
                        <span className="text-gray-400">Resend in {resendTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="font-semibold text-black hover:text-neutral-600 underline cursor-pointer disabled:opacity-50"
                        >
                          {isResending ? "Sending..." : "Resend OTP"}
                        </button>
                      )}
                    </p>

                    <p>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 w-full text-center"
                      >
                        ← Back to Email Input
                      </button>
                    </p>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <div className="mb-6 text-center flex flex-col items-center">
                  <Link href="/" className="inline-block mb-4">
                    <img
                      src="/main-logo.jpg"
                      alt="Pristto Logo"
                      className="h-14 w-auto object-contain mx-auto select-none invert"
                    />
                  </Link>
                  <h1 className="text-3xl font-bold text-black text-center">Reset Password</h1>
                  <p className="mt-4 text-sm text-black text-center">
                    Please create a strong new password.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-6">
                  {errors.general && (
                    <div className="p-3 text-sm text-red-700 border border-red-200 rounded-none bg-red-50">
                      {errors.general}
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="block w-full py-3 pl-12 pr-12 text-gray-700 transition border border-gray-300 rounded-none outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="block w-full py-3 pl-12 pr-12 text-gray-700 transition border border-gray-300 rounded-none outline-none focus:ring-1 focus:ring-black focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.passwordConfirm && (
                      <p className="mt-1.5 text-xs text-red-600">{errors.passwordConfirm}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-black text-white hover:bg-zinc-800 gap-4 font-bold py-3.5 px-4 rounded-none flex justify-center items-center cursor-pointer transition disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isResetting ? "Resetting Password..." : "Reset Password"}
                    <span>
                      <ArrowRight />
                    </span>
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

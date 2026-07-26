"use client";

import { setCredentials } from "@/feature/user/userSlice";
import { useSignUpMutation } from "@/redux/api/auth/authApi";
import { ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface FormErrors {
  general?: string;
}

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [signUp, { isLoading }] = useSignUpMutation();
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!name || !email || !password) {
      setErrors({ general: "Please fill in all fields." });
      return;
    }

    if (password.length < 6) {
      setErrors({ general: "Password must be at least 6 characters long." });
      return;
    }

    try {
      // Pass required registration fields to the backend
      const response = await signUp({ name, email, password }).unwrap();

      // Backend returns `{ token, data: { user } }` on successful register
      const accessToken = (response as any)?.token || (response as any)?.data?.accessToken || (response as any)?.accessToken;

      if (!accessToken) {
        throw new Error("Registration succeeded but no access token was returned.");
      }

      const user: UserProfile = {
        id: (response as any)?.data?.user?.id || (response as any)?.data?.id || "",
        email: (response as any)?.data?.user?.email || (response as any)?.data?.email || email,
        name: (response as any)?.data?.user?.name || (response as any)?.data?.name || name,
        role: (response as any)?.data?.user?.role || (response as any)?.data?.role || "USER",
      };

      dispatch(
        setCredentials({
          user,
          accessToken,
        })
      );

      toast.success("Account created successfully!");

      if (user.role === "ADMIN" || user.role === "SUPERADMIN") {
        router.push("/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Something went wrong during sign up. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <div className="md:h-[calc(84vh-1rem)] flex items-center justify-center p-4 poppins-regular">
        <div className="w-full max-w-2xl gap-2 overflow-hidden">
          <div className="flex flex-col justify-center p-6 mt-20 mb-12 md:mx-24 bg-white">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black">Create Account</h1>
              <p className="mt-4 text-sm text-black">
                Sign up to start shopping and manage your orders
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-3 text-sm text-red-700 border border-red-200 rounded-none bg-red-50">
                  {errors.general}
                </div>
              )}

              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="block w-full py-3 pl-12 pr-4 text-gray-700 transition border border-gray-300 rounded-none outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
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

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="block w-full py-3 pl-12 pr-12 text-gray-700 transition border border-gray-300 rounded-none outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white hover:bg-zinc-800 gap-4 font-bold py-3.5 px-4 rounded-none flex justify-center items-center cursor-pointer transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
                <span>
                  <ArrowRight />
                </span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase">Or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={() => toast("Google registration integration coming soon.")}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-4 rounded-none flex justify-center items-center gap-3 cursor-pointer transition"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Sign up with Google
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-black underline hover:text-neutral-600">
                  Log In
                </Link>
              </p>

              <p className="mt-4">
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  ← Back to Home
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

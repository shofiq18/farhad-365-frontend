import LoginForm from "@/components/ui/AuthenticationAllPage/login";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
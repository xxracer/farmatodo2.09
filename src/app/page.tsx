import { LoginForm } from "@/components/auth/login-form";
import { ClipboardCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <ClipboardCheck className="mb-4 h-12 w-12 text-primary" />
          <h1 className="font-headline text-3xl font-bold text-center">Onboard Panel</h1>
          <p className="text-muted-foreground text-center">Secure login for HR personnel.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

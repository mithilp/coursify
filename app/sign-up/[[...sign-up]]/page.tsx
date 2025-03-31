import { SignUp } from "@clerk/nextjs";
import { UserPlus } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col items-center text-center mb-10">
        <UserPlus className="h-12 w-12 mb-4" />
        <h1 className="text-4xl font-bold mb-2">Create Account</h1>
        <p className="text-xl text-muted-foreground">
          Join the Coursify community
        </p>
      </div>

      <div className="w-full flex justify-center">
        <SignUp />
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@clerk/nextjs";

export default function LoginButton() {
  const { isSignedIn } = useAuth();

  const handleClick = () => {
    if (isSignedIn) {
      alert("You are logged in!");
    } else {
      alert("You are not logged in!");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm h-10 px-4"
    >
      Check Login Status
    </button>
  );
}

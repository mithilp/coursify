import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Dashboard() {
  const user = await currentUser();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <nav className="w-full max-w-3xl flex justify-between items-center mb-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Home
        </Link>
        <UserButton afterSignOutUrl="/" />
      </nav>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-3xl w-full">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p className="mb-4">Welcome, {user?.firstName || "User"}!</p>
        <p>
          This is a protected page. Only authenticated users can see this
          content.
        </p>
      </div>
    </div>
  );
}

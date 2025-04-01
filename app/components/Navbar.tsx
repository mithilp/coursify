"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth, useUser } from "@clerk/nextjs";
import { BookOpen, PlusCircle, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./DarkModeSwitcher";

interface NavbarProps {
  isSignedIn: boolean;
}

export default function Navbar({ isSignedIn }: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();

  // Profile URL that uses the user's ID
  const profileUrl = userId ? `/user/${userId}` : "/profile";

  const isActive = (path: string) => {
    return pathname === path
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground";
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-30">
      <nav className="flex items-center justify-between h-16 px-4">
        {/* Wordmark/Logo */}
        <Link href="/" className="flex items-center gap-2 z-10">
          <BookOpen className="h-6 w-6" />
          <span className="font-bold text-xl">Coursify</span>
        </Link>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden z-10"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link href="/gallery" className={`text-sm ${isActive("/gallery")}`}>
            Gallery
          </Link>

          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm ${isActive("/dashboard")}`}
              >
                Dashboard
              </Link>
              <Link
                href={profileUrl}
                className={`text-sm ${isActive(profileUrl)}`}
              >
                Profile
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={`text-sm ${isActive("/sign-in")}`}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className={`text-sm ${isActive("/sign-up")}`}
              >
                Sign Up
              </Link>
            </>
          )}

          <ModeToggle />

          <Link
            href="/"
            className="flex items-center gap-1 text-sm bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Create new course
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={closeMobileMenu}
          ></div>
        )}

        {/* Mobile Navigation Menu */}
        <div
          className={`
            fixed inset-0 top-16 z-20 bg-background border-t border-border
            transform transition-transform duration-300 ease-in-out lg:hidden
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="flex flex-col p-6 space-y-6">
            <Link
              href="/gallery"
              className={`text-base ${isActive("/gallery")}`}
              onClick={closeMobileMenu}
            >
              Gallery
            </Link>

            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-base ${isActive("/dashboard")}`}
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href={profileUrl}
                  className={`text-base ${isActive(profileUrl)}`}
                  onClick={closeMobileMenu}
                >
                  Profile
                </Link>
                <div className="py-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    Account
                  </div>
                  <div onClick={closeMobileMenu}>
                    <UserButton />
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={`text-base ${isActive("/sign-in")}`}
                  onClick={closeMobileMenu}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className={`text-base ${isActive("/sign-up")}`}
                  onClick={closeMobileMenu}
                >
                  Sign Up
                </Link>
              </>
            )}

            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Appearance</span>
              <ModeToggle />
            </div>

            <Link
              href="/"
              className="flex items-center justify-center gap-1 text-base bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary/90 transition-colors mt-4"
              onClick={closeMobileMenu}
            >
              <PlusCircle className="h-5 w-5" />
              Create new course
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

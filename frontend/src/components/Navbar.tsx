"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export default function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar on homepage
  if (pathname === "/" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    localStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Redirect to login page (or homepage)
    router.push("/");
    toast.success("Logged out successfully");
  };

  return (
    <nav className="bg-gray-900 shadow-md sticky top-0 z-50 mb-[2rem]">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Left - Home */}
        <Link
          href="/"
          className="text-xl font-semibold text-white hover:text-gray-300"
        >
          Home
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* Right - Logout */}
        <div
          className={`flex space-x-6 md:flex ${
            menuOpen ? "flex" : "hidden"
          } md:block`}
        >
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

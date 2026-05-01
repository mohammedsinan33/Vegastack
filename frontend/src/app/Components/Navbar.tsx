"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Home, Search, User, LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/signin");
  };

  const isActive = (path: string) => pathname === path;

  // Desktop Sidebar Navigation
  const DesktopNav = () => (
    <div className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:bg-white md:border-r md:border-gray-200 md:flex md:flex-col md:justify-between md:p-6">
      <div>
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-blue-600">VegaStack</h1>
          <p className="text-sm text-gray-600">Social Network</p>
        </div>

        {/* Nav Links */}
        <nav className="space-y-4">
          <Link href="/feed" className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition ${
            isActive("/feed") 
              ? "bg-blue-100 text-blue-600 font-semibold" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <Home size={24} />
            <span className="text-lg">Home</span>
          </Link>

          <Link href="/search" className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition ${
            isActive("/search") 
              ? "bg-blue-100 text-blue-600 font-semibold" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <Search size={24} />
            <span className="text-lg">Search</span>
          </Link>

          <Link href="/profile" className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition ${
            isActive("/profile") 
              ? "bg-blue-100 text-blue-600 font-semibold" 
              : "text-gray-700 hover:bg-gray-100"
          }`}>
            <User size={24} />
            <span className="text-lg">Profile</span>
          </Link>
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center space-x-4 w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-600 transition"
      >
        <LogOut size={24} />
        <span className="text-lg">Logout</span>
      </button>
    </div>
  );

  // Mobile Bottom Navigation
  const MobileNav = () => (
    <div className="fixed md:hidden bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16">
        <Link href="/feed" className={`flex flex-col items-center justify-center h-16 flex-1 ${
          isActive("/feed") ? "text-blue-600 border-t-2 border-blue-600" : "text-gray-600"
        }`}>
          <Home size={24} />
        </Link>

        <Link href="/search" className={`flex flex-col items-center justify-center h-16 flex-1 ${
          isActive("/search") ? "text-blue-600 border-t-2 border-blue-600" : "text-gray-600"
        }`}>
          <Search size={24} />
        </Link>

        <Link href="/profile" className={`flex flex-col items-center justify-center h-16 flex-1 ${
          isActive("/profile") ? "text-blue-600 border-t-2 border-blue-600" : "text-gray-600"
        }`}>
          <User size={24} />
        </Link>

        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center h-16 flex-1 text-gray-600 hover:text-red-600"
        >
          <LogOut size={24} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
}
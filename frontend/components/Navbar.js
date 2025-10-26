"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 transition-all duration-300">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between whitespace-nowrap glassmorphism rounded-xl px-6 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 text-white hover:opacity-90 transition-opacity"
          >
            <div className="size-6 text-primary">
              <svg
                fill="currentColor"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 6C14.058 6 6 14.058 6 24s8.058 18 18 18 18-8.058 18-18S33.942 6 24 6zm0 30c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm0-20c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold font-display leading-tight tracking-[-0.015em]">
              Sentinel Oracle
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/YOUR_USERNAME/sentinel-oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                GitHub
              </a>
            </div>
            <Link href="/dashboard">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-[#0A0A0A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_25px_rgba(0,225,255,0.6)]">
                <span className="truncate">Launch App</span>
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="material-symbols-outlined text-white">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 glassmorphism rounded-xl px-6 py-4 animate-slide-up">
            <div className="flex flex-col gap-4">
              <Link
                href="/"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/#how-it-works"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <a
                href="https://github.com/YOUR_USERNAME/sentinel-oracle"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium leading-normal hover:text-primary transition-colors"
              >
                GitHub
              </a>
              <Link href="/dashboard">
                <button className="w-full flex items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary text-[#0A0A0A] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-opacity-90 transition-all duration-300 shadow-[0_0_15px_rgba(0,225,255,0.4)] hover:shadow-[0_0_25px_rgba(0,225,255,0.6)]">
                  <span className="truncate">Launch App</span>
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}


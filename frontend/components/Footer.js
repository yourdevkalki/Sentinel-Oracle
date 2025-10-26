"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full pt-20 pb-10">
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8"></div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="size-5 text-primary">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 6C14.058 6 6 14.058 6 24s8.058 18 18 18 18-8.058 18-18S33.942 6 24 6zm0 30c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12zm0-20c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"></path>
            </svg>
          </div>
          <h3 className="text-white text-md font-bold font-display">
            Sentinel Oracle
          </h3>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <a
            href="https://github.com/yourdevkalki/Sentinel-Oracle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F0F0F0]/80 hover:text-primary transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://x.com/yourdevkalki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#F0F0F0]/80 hover:text-primary transition-colors"
          >
            Twitter
          </a>
          <a
            href="#"
            className="text-[#F0F0F0]/80 hover:text-primary transition-colors"
          >
            Docs
          </a>
          <a
            href="mailto:contact@sentineloracle.io"
            className="text-[#F0F0F0]/80 hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>
        <p className="text-xs text-[#F0F0F0]/50">Built for ETHOnline 2025</p>
      </div>
    </footer>
  );
}


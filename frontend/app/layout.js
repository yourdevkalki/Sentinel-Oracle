import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sentinel Oracle - AI-Powered DeFi Guardian",
  description:
    "Privacy-preserving oracle with AI anomaly detection and automated execution",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

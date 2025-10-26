"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="relative w-full flex flex-col items-center overflow-x-hidden">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Navbar />

        {/* Main Content */}
        <main className="flex flex-col gap-24 sm:gap-32 lg:gap-40 mt-24">
          {/* Hero Section */}
          <section className="min-h-[calc(100vh-6rem)] flex items-center relative">
            {/* Radial Glow from Radar */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="container mx-auto relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-8 text-center lg:text-left relative">
                  <div className="flex flex-col gap-4 relative z-10">
                    <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-black font-display leading-tight tracking-[-0.033em]">
                      The Intelligent Oracle Layer{" "}
                      <span className="text-transparent bg-clip-text bg-primary">
                        Securing DeFi 🛡️
                      </span>
                    </h1>
                    <h2 className="text-[#F0F0F0] text-base sm:text-lg font-normal leading-normal max-w-xl mx-auto lg:mx-0">
                      Powered by Pyth, ASI, and Lit, Sentinel Oracle provides
                      real-time threat detection and autonomous protection for
                      your on-chain assets.
                    </h2>
                  </div>
                  <div className="flex-wrap gap-4 flex justify-center lg:justify-start relative z-10">
                    <Link href="/dashboard">
                      <button className="hero-button hero-button-primary group">
                        <span className="truncate">Launch Dashboard</span>
                        <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </Link>
                    <a
                      href="https://github.com/yourdevkalki/Sentinel-Oracle"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="hero-button hero-button-secondary group">
                        <span className="truncate">View on GitHub</span>
                        <span className="material-symbols-outlined ml-2 group-hover:rotate-12 transition-transform">
                          code
                        </span>
                      </button>
                    </a>
                  </div>
                </div>
                <div className="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-xl relative overflow-hidden">
                  <div className="absolute inset-0 "></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Concentric Circles */}
                    <div className="absolute w-[20%] h-[20%] border border-primary/30 rounded-full"></div>
                    <div className="absolute w-[35%] h-[35%] border border-primary/25 rounded-full"></div>
                    <div className="absolute w-[50%] h-[50%] border border-primary/20 rounded-full"></div>
                    <div className="absolute w-[65%] h-[65%] border border-primary/15 rounded-full"></div>
                    <div className="absolute w-[80%] h-[80%] border border-primary/10 rounded-full"></div>
                    <div className="absolute w-[95%] h-[95%] border-2 border-primary/20 rounded-full"></div>

                    {/* Cross-hair Grid Lines */}
                    <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                    <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-primary/20 to-transparent"></div>

                    {/* Rotating Radar Sweep - Enhanced */}
                    <div
                      className="absolute top-0 left-0 w-full h-full radar-sweep"
                      style={{ transformOrigin: "50% 50%" }}
                    >
                      <div
                        className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent"
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
                          filter: "blur(12px)",
                          transformOrigin: "0 0",
                        }}
                      ></div>
                      {/* Sharper sweep line */}
                      <div
                        className="absolute top-1/2 left-1/2 w-1/2 h-[2px] bg-gradient-to-r from-primary via-primary/50 to-transparent"
                        style={{
                          transformOrigin: "0 0",
                        }}
                      ></div>
                    </div>

                    {/* Radar Blips - Enhanced */}
                    <div
                      className="absolute w-3 h-3 bg-accent-green rounded-full shadow-[0_0_20px_8px] shadow-accent-green/60 radar-blip"
                      style={{ top: "25%", left: "60%" }}
                    >
                      <div className="absolute inset-0 bg-accent-green rounded-full animate-ping"></div>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_20px_8px] shadow-yellow-400/60 radar-blip"
                      style={{
                        top: "40%",
                        left: "30%",
                        animationDelay: "0.5s",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-yellow-400 rounded-full animate-ping"
                        style={{ animationDelay: "0.5s" }}
                      ></div>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-red-500 rounded-full shadow-[0_0_20px_8px] shadow-red-500/60 radar-blip"
                      style={{ top: "65%", left: "70%", animationDelay: "1s" }}
                    >
                      <div
                        className="absolute inset-0 bg-red-500 rounded-full animate-ping"
                        style={{ animationDelay: "1s" }}
                      ></div>
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-accent-green rounded-full shadow-[0_0_20px_8px] shadow-accent-green/60 radar-blip"
                      style={{
                        top: "75%",
                        left: "45%",
                        animationDelay: "1.5s",
                      }}
                    >
                      <div
                        className="absolute inset-0 bg-accent-green rounded-full animate-ping"
                        style={{ animationDelay: "1.5s" }}
                      ></div>
                    </div>

                    {/* Center Dot - Enhanced */}
                    <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-primary rounded-full shadow-[0_0_30px_10px] shadow-primary/80 transform -translate-x-1/2 -translate-y-1/2 z-10">
                      <div className="absolute inset-0 bg-primary rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="flex flex-col gap-6">
            <h2 className="text-white text-3xl sm:text-4xl font-bold font-display leading-tight tracking-[-0.015em] text-center">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
              <div className="flex flex-1 flex-col gap-4 p-6 rounded-xl glassmorphism glow-border-hover transition-all duration-300">
                <div className="text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "32px" }}
                  >
                    monitoring
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white text-xl font-bold font-display">
                    Monitor
                  </h3>
                  <p className="text-[#F0F0F0]/80 text-sm font-normal leading-normal">
                    Continuously scans on-chain data streams for anomalies and
                    suspicious patterns using Pyth's real-time data feeds.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 rounded-xl glassmorphism glow-border-hover transition-all duration-300">
                <div className="text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "32px" }}
                  >
                    neurology
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white text-xl font-bold font-display">
                    Detect
                  </h3>
                  <p className="text-[#F0F0F0]/80 text-sm font-normal leading-normal">
                    Leverages advanced AI models from the ASI Alliance to
                    identify potential threats with high accuracy and
                    explainability.
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4 p-6 rounded-xl glassmorphism glow-border-hover transition-all duration-300">
                <div className="text-primary">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "32px" }}
                  >
                    shield
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white text-xl font-bold font-display">
                    Protect
                  </h3>
                  <p className="text-[#F0F0F0]/80 text-sm font-normal leading-normal">
                    Automatically triggers privacy-preserving protective actions
                    via Lit Protocol to secure assets before they are
                    compromised.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard Preview Section */}
          <section className="flex flex-col gap-6">
            <h2 className="text-white text-3xl sm:text-4xl font-bold font-display leading-tight tracking-[-0.015em] text-center">
              See Your Guardian in Action
            </h2>
            <div className="mt-8 p-4 sm:p-6 rounded-xl glassmorphism border-primary/20 border">
              <div className="w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 via-accent-violet/5 to-accent-green/5">
                <iframe
                  src="https://drive.google.com/file/d/1yfY8TQ4lms8BiTr158aTEnGLaeQ6KTt5/preview"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          </section>

          {/* Ecosystem Integration Section */}
          <section className="flex flex-col gap-6">
            <h2 className="text-white text-3xl sm:text-4xl font-bold font-display leading-tight tracking-[-0.015em] text-center">
              Built on the Strongest Foundations
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="flex flex-col items-center justify-center p-8 gap-4 rounded-xl glassmorphism glow-border-hover transition-all duration-300 aspect-square">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">P</span>
                </div>
                <p className="text-white font-bold font-display">
                  Pyth Network
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-8 gap-4 rounded-xl glassmorphism glow-border-hover transition-all duration-300 aspect-square">
                <div className="h-12 w-12 rounded-full bg-accent-violet/20 flex items-center justify-center">
                  <span className="text-accent-violet text-2xl font-bold">
                    A
                  </span>
                </div>
                <p className="text-white font-bold font-display">
                  ASI Alliance
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-8 gap-4 rounded-xl glassmorphism glow-border-hover transition-all duration-300 aspect-square">
                <div className="h-12 w-12 rounded-full bg-accent-green/20 flex items-center justify-center">
                  <span className="text-accent-green text-2xl font-bold">
                    L
                  </span>
                </div>
                <p className="text-white font-bold font-display">
                  Lit Protocol
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-8 gap-4 rounded-xl glassmorphism glow-border-hover transition-all duration-300 aspect-square">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary text-2xl font-bold">V</span>
                </div>
                <p className="text-white font-bold font-display">Vincent</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="w-full py-20 sm:py-24 rounded-xl flex flex-col items-center justify-center text-center gap-8 relative overflow-hidden bg-gradient-to-r from-primary/20 via-accent-violet/20 to-accent-green/20">
            <div className="absolute inset-0 bg-background-dark/50"></div>
            <div className="relative z-10 flex flex-col items-center gap-6 px-4">
              <h2 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold font-display leading-tight tracking-[-0.015em]">
                Stay Protected. Get Started Today.
              </h2>
              <p className="text-[#F0F0F0]/80 max-w-2xl">
                Integrate Sentinel Oracle in minutes and give your on-chain
                assets the intelligent protection they deserve.
              </p>
              <Link href="/dashboard">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 mt-4 text-white text-lg font-bold p-1 glow-button">
                  <span className="truncate">Launch App</span>
                </button>
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}

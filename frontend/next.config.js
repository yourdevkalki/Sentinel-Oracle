/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ORACLE_ADDRESS: process.env.NEXT_PUBLIC_ORACLE_ADDRESS,
    NEXT_PUBLIC_RPC_URL: process.env.NEXT_PUBLIC_RPC_URL,
    NEXT_PUBLIC_AGENT_API_URL: process.env.NEXT_PUBLIC_AGENT_API_URL,
  },
};

module.exports = nextConfig;

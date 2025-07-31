/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: true,
  },
  // Add this cron configuration
  // This will trigger the /api/admin/process-automation route every minute
  // You can adjust the schedule as needed (e.g., '0 * * * *' for every hour)
  cron: [
    {
      path: '/api/admin/process-automation',
      schedule: '* * * * *', // Runs every minute
    },
  ],
};

export default nextConfig;

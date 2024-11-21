/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.com',
            }
        ]
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};
export default nextConfig;

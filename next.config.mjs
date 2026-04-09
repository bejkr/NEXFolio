/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'product-images.s3.cardmarket.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'i.ebayimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'www.cardmarket.com',
                port: '',
                pathname: '/**',
            }
        ],
    },
};

export default nextConfig;

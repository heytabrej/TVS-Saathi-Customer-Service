module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['your-image-domain.com'], // Add your image domains here
  },
  env: {
    API_URL: process.env.API_URL, // Example of an environment variable
  },
  webpack: (config) => {
    // Custom webpack configurations can be added here
    return config;
  },
};
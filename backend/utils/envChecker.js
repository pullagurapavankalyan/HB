const validateEnv = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_URL',
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n[FATAL ERROR] Missing required environment variables:');
    missing.forEach((key) => console.error(`- ${key}`));
    console.error('\nServer cannot start without these configurations. Exiting...');
    process.exit(1);
  }
};

module.exports = validateEnv;

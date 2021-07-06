module.exports = {
  apps: [
    {
      name: "app",
      script: "npm run start",
      instances: 1,
      autorestart: true,
    },
  ],
};

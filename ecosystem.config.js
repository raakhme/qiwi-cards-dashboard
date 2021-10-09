module.exports = {
  apps: [
    {
      name: "app",
      script: "npm run start",
      instances: 2,
      cron_restart: "0 0 * * *",
      autorestart: true,
    },
  ],
};

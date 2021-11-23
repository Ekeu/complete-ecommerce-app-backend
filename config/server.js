module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  cron: {
    enabled: true,
  },
  url: env("URL", "http://localhost")
  admin: {
    auth: {
      secret: env("ADMIN_JWT_SECRET", "d92bcf63f564b13cc7bf1f5fa6a0e915"),
    },
  },
});

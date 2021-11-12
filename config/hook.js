module.exports = ({ env }) => ({
  settings: {
    algolia: {
      enabled: true,
      applicationId: env("ALGOLIA_APPLICATION_ID"),
      apiKey: env("ALGOLIA_ADMIN_API_KEY"),
      debug: true,
      prefix: "const",
    },
  },
});

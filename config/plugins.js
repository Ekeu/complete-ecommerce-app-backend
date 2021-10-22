module.exports = ({ env }) => ({
  email: {
    provider: "sendgrid",
    providerOptions: {
      apiKey: env("SENDGRID_API_KEY"),
    },
    settings: {
      defaultFrom: "constjavascript@gmail.com",
      defaultReplyTo: "constjavascript@gmail.com",
    },
  },
});

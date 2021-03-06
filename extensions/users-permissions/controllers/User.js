const { sanitizeEntity } = require("strapi-utils");

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

module.exports = {
  async setSettings(ctx) {
    const { id, contactInfo, locations } = ctx.state.user;
    const { details, detailSlot, location, locationSlot } = ctx.request.body;

    let newInfo = [...contactInfo];
    let newLocations = [...locations];

    if (typeof details !== "undefined" && typeof detailSlot !== "undefined") {
      newInfo[detailSlot] = details;
    }

    if (
      typeof location !== "undefined" &&
      typeof locationSlot !== "undefined"
    ) {
      newLocations[locationSlot] = location;
    }

    let newUser = await strapi.plugins["users-permissions"].services.user.edit(
      { id },
      {
        contactInfo: newInfo,
        locations: newLocations,
      }
    );

    newUser = sanitizeUser(newUser);

    ctx.send(newUser, 200);
  },

  async changePassword(ctx) {
    const { id } = ctx.state.user;
    const { password } = ctx.request.body;

    await strapi.plugins["users-permissions"].services.user.edit(
      { id },
      { password }
    );

    ctx.send("Password changed successfully.", 200);
  },

  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const updatedUser = { ...sanitizeUser(user) };
    const favorites = await strapi.services.favorite.find({ user });
    const subscriptions = await strapi.services.subscription.find({ user });
    updatedUser.favorites = favorites.map((favorite) => ({
      variant: favorite.variant.id,
      id: favorite.id,
    }));

    updatedUser.subscriptions = subscriptions.map((subscription) => {
      delete subscription.user;
      return subscription;
    });

    ctx.body = sanitizeUser(updatedUser);
  },
};

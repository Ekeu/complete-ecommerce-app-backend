"use strict";

const { sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async userSubscriptions(ctx) {
    let subscriptions = await strapi.services.subscription.find({
      user: ctx.state.user.id,
    });

    subscriptions.map((subscription) => {
      delete subscription.user;
      subscription = sanitizeEntity(subscription, {
        model: strapi.models.subscription,
      });
    });

    ctx.send(subscriptions, 200);
  },
};

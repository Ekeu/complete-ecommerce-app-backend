"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async average(id) {
    const product = await strapi.services.product.findOne({ id });

    const total = product.reviews.reduce((acc, curr) => acc + curr.rating, 0);

    let average = total / product.reviews.length;

    if (product.reviews.length === 0) {
      average = 0;
    }

    await strapi.services.product.update(
      { id },
      { rating: Math.round(average * 2) / 2 }
    );
  },
};

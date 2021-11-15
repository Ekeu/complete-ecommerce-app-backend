"use strict";

const moment = require("moment");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const index = "variant";

module.exports = {
  lifecycles: {
    afterCreate(result, data) {
      result.product.createdAt_timestamp = moment(
        result.product.createdAt
      ).unix();
      strapi.services.algolia.saveObject(result, index);
    },
    afterUpdate(result, params, data) {
      if (result.published_at) {
        strapi.services.algolia.saveObject(result, index);
      } else {
        strapi.services.algolia.deleteObject(result.id, index);
      }
    },
    afterDelete(result, params) {
      strapi.services.algolia.deleteObject(result.id, index);
    },
  },
};

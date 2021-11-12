"use strict";

const { parseMultipartData, sanitizeEntity } = require("strapi-utils");

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async create(ctx) {
    let entity;
    if (ctx.is("multipart")) {
      const { data, files } = parseMultipartData(ctx);
      data.user = ctx.state.user.id;
      entity = await strapi.services.favorite.create(data, { files });
    } else {
      ctx.request.body.user = ctx.state.user.id;
      entity = await strapi.services.favorite.create(ctx.request.body);
    }
    return sanitizeEntity(entity, { model: strapi.models.favorite });
  },

  async delete(ctx) {
    const { id } = ctx.params;

    const [favorite] = await strapi.services.favorite.find({
      id: ctx.params.id,
      user: ctx.state.user.id,
    });

    if (!favorite) {
      return ctx.unauthorized(`You can't update this entry`);
    }

    const entity = await strapi.services.favorite.delete({ id });
    return sanitizeEntity(entity, { model: strapi.models.favorite });
  },

  async userFavorites(ctx) {
    const favorites = await strapi.services.favorite.find({
      user: ctx.state.user.id,
    });

    await Promise.all(
      favorites.map(async (favorite, idx) => {
        const variants = await strapi.services.variant.find({
          product: favorite.variant.product,
        });

        variants.forEach((variant) => {
          delete variant.created_by;
          delete variant.updated_by;
        });

        favorites[idx].variants = variants;

        delete favorites[idx].user;
        delete favorites[idx].updated_by;
        delete favorites[idx].created_by;
      })
    );

    ctx.send(favorites, 200);
  },
};

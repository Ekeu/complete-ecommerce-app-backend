"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);
const GUEST_ID = "616f44e05fdd09e104dfc9fa";

module.exports = {
  async processOrder(ctx) {
    let serverItemsTotalsPrice = 0;
    let unavailableItems = [];

    const deliveryMethods = [
      {
        id: 1,
        title: "Free",
        turnaround: "9–15 business days",
        price: 0,
      },
      {
        id: 2,
        title: "Standard",
        turnaround: "4–10 business days",
        price: 9.99,
      },
      {
        id: 3,
        title: "Express",
        turnaround: "2–5 business days",
        price: 29.99,
      },
    ];

    const {
      items,
      total,
      deliveryMethod,
      idempotencyKey,
      storedIntent,
      email,
    } = ctx.request.body;

    await Promise.all(
      items.map(async (customerItem) => {
        const serverItem = await strapi.services.variant.findOne({
          id: customerItem.variant.id,
        });

        if (serverItem.quantity < customerItem.quantity) {
          unavailableItems.push({
            id: serverItem.id,
            name: serverItem.product.name,
            imageURL: serverItem.images[0].url,
            quantity: serverItem.quantity,
          });
        }
        serverItemsTotalsPrice += serverItem.price * customerItem.quantity;
      })
    );

    const validDeliveryMethod = deliveryMethods.find(
      (method) =>
        method.title === deliveryMethod.title &&
        method.price === deliveryMethod.price
    );

    if (
      validDeliveryMethod === undefined ||
      (serverItemsTotalsPrice * 1.2 + validDeliveryMethod.price).toFixed(2) !==
        total
    ) {
      ctx.send({ error: "Invalid cart" }, 400);
    } else if (unavailableItems.length > 0) {
      ctx.send({ unavailableItems }, 409);
    } else {
      if (storedIntent) {
        const update = await stripe.paymentIntents.update(
          storedIntent,
          {
            amount: total * 100,
          },
          {
            idempotencyKey,
          }
        );
        ctx.send({
          client_secret: update.client_secret,
          intentID: update.id,
        });
      } else {
        const intent = await stripe.paymentIntents.create(
          {
            amount: total * 100,
            currency: "eur",
            customer: ctx.state.user ? ctx.state.user.stripeID : undefined,
            receipt_email: email,
          },
          {
            idempotencyKey,
          }
        );

        ctx.send({
          client_secret: intent.client_secret,
          intentID: intent.id,
        });
      }
    }
  },

  async finalizeOrder(ctx) {
    let customerID;

    const {
      shippingAddress,
      billingAddress,
      shippingInformation,
      billingInformation,
      deliveryMethod,
      subtotal,
      tax,
      total,
      items,
      transaction
    } = ctx.request.body;

    if (ctx.state.user) {
      customerID = ctx.state.user.id;
    } else {
      customerID = GUEST_ID;
    }

    await Promise.all(
      items.map(async (customerItem) => {
        const serverItem = await strapi.services.variant.findOne({
          id: customerItem.variant.id,
        });
        await strapi.services.variant.update(
          { id: customerItem.variant.id },
          { quantity: serverItem.quantity - customerItem.quantity }
        );
      })
    );

    let validOrder = await strapi.services.order.create({
      shippingAddress,
      billingAddress,
      shippingInformation,
      billingInformation,
      deliveryMethod,
      subtotal,
      tax,
      total,
      items,
      transaction,
      user: customerID,
    });
    validOrder = sanitizeEntity(validOrder, {
      model: strapi.models.order,
    });
    if (validOrder.user.username === "Guest") {
      validOrder.user = {
        username: "Guest",
      };
    }

    ctx.send({ validOrder }, 200);
  },
};

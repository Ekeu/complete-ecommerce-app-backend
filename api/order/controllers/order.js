"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const { sanitizeEntity } = require("strapi-utils");
const stripe = require("stripe")(process.env.STRIPE_SK);
const GUEST_ID = "616f44e05fdd09e104dfc9fa";

const sanitizeUser = (user) =>
  sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

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
        price: 10,
      },
      {
        id: 3,
        title: "Express",
        turnaround: "2–5 business days",
        price: 30,
      },
    ];

    const {
      items,
      total,
      deliveryMethod,
      idempotencyKey,
      storedIntent,
      email,
      savedCard,
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
        let saved;
        if (savedCard) {
          const stripeMethods = await stripe.paymentMethods.list({
            customer: ctx.state.user.stripeID,
            type: "card",
          });
          saved = stripeMethods.data.find(
            (method) => method.card.last4 === savedCard
          );
        }
        const intent = await stripe.paymentIntents.create(
          {
            amount: total * 100,
            currency: "eur",
            customer: ctx.state.user ? ctx.state.user.stripeID : undefined,
            receipt_email: email,
            payment_method: saved ? saved.id : undefined,
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
      transaction,
      paymentMethod,
      saveCard,
      selectedPaymentSlot,
    } = ctx.request.body;

    if (ctx.state.user) {
      customerID = ctx.state.user.id;
    } else {
      customerID = GUEST_ID;
    }

    const subsFrequencies = await strapi.services.order.frequency();

    await Promise.all(
      items.map(async (customerItem) => {
        const serverItem = await strapi.services.variant.findOne({
          id: customerItem.variant.id,
        });

        if (customerItem.subscription) {
          const frequency = subsFrequencies.find(
            (option) => option.label === customerItem.subscription
          );
          console.log(frequency);
          await strapi.services.subscription.create({
            user: customerID,
            variant: customerItem.variant.id,
            name: customerItem.name,
            frequency: frequency.value,
            last_delivery: moment().toDate(),
            next_delivery: frequency.delivery(),
            quantity: customerItem.quantity,
            paymentMethod,
            shippingAddress,
            billingAddress,
            shippingInformation,
            billingInformation,
          });
        }

        await strapi.services.variant.update(
          { id: customerItem.variant.id },
          { quantity: serverItem.quantity - customerItem.quantity }
        );
      })
    );

    if (saveCard && ctx.state.user) {
      let updatedPaymentMethods = [...ctx.state.user.paymentMethods];
      updatedPaymentMethods[selectedPaymentSlot] = paymentMethod;

      await strapi.plugins["users-permissions"].services.user.edit(
        {
          id: customerID,
        },
        {
          paymentMethods: updatedPaymentMethods,
        }
      );
    }
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
      paymentMethod,
    });
    validOrder = sanitizeEntity(validOrder, {
      model: strapi.models.order,
    });

    const confirmation = await strapi.services.order.confirmationEmail(
      validOrder
    );

    await strapi.plugins["email"].services.email.send({
      to: validOrder.billingInformation.email,
      subject: "YOUR ORDER HAS BEEN PLACED!",
      html: confirmation,
    });

    if (validOrder.user.username === "Guest") {
      validOrder.user = {
        username: "Guest",
      };
    }

    ctx.send({ validOrder }, 200);
  },

  async removeCard(ctx) {
    const { card } = ctx.request.body;
    const { stripeID } = ctx.state.user;

    const stripeMethods = await stripe.paymentMethods.list({
      customer: stripeID,
      type: "card",
    });
    const stripeCard = stripeMethods.data.find(
      (method) => method.card.last4 === card
    );

    await stripe.paymentMethods.detach(stripeCard.id);

    let updatedPaymentMethods = [...ctx.state.user.paymentMethods];

    const paymentMethodSlot = updatedPaymentMethods.findIndex(
      (method) => method.last4 === card
    );

    updatedPaymentMethods[paymentMethodSlot] = {
      brand: "",
      last4: "",
      exp_month: "",
      exp_year: "",
    };

    const updatedUser = await strapi.plugins[
      "users-permissions"
    ].services.user.edit(
      {
        id: ctx.state.user.id,
      },
      {
        paymentMethods: updatedPaymentMethods,
      }
    );

    ctx.send({ user: sanitizeUser(updatedUser) }, 200);
  },

  async history(ctx) {
    const orders = await strapi.services.order.find({
      user: ctx.state.user.id,
    });

    const sanitizedOrders = orders.map((order) =>
      sanitizeEntity(order, {
        model: strapi.models.order,
      })
    );

    ctx.send(
      {
        orders: sanitizedOrders,
      },
      200
    );
  },
};

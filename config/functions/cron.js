"use strict";

const moment = require("moment");
const stripe = require("stripe")(process.env.STRIPE_SK);
/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */

module.exports = {
  /**
   * Simple example.
   * Every monday at 1am.
   */
  // '0 1 * * 1': () => {
  //
  // }

  "*/2 * * * *": async () => {
    const subscriptions = await strapi.services.subscription.find({
      next_delivery: moment().toDate(),
    });

    await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        const paymentMethods = await stripe.paymentMethods.list({
          customer: subscription.user.stripeID,
          type: "card",
        });

        const paymentMethod = paymentMethods.data.find(
          (method) => method.card.last4 === subscription.paymentMethod.last4
        );

        try {
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(subscription.variant.price * 1.2 * 100),
            currency: "eur",
            customer: subscription.user.stripeID,
            payment_method: paymentMethod.id,
            off_session: true,
            confirm: true,
          });

          const order = await strapi.services.order.create({
            shippingAddress: subscription.shippingAddress,
            billingAddress: subscription.billingAddress,
            shippingInformation: subscription.shippingInformation,
            billingInformation: subscription.billingInformation,
            deliveryMethod: {
              label: "subscription",
              price: 0,
            },
            subtotal: subscription.variant.price,
            tax: subscription.variant.price * 0.2,
            total: subscription.variant.price * 1.2,
            items: [
              {
                variant: subscription.variant,
                name: subscription.name,
                quantity: subscription.quantity,
                stock: subscription.variant.quantity,
                product: subscription.variant.product,
              },
            ],
            transaction: paymentIntent.id,
            paymentMethod: subscription.paymentMethod,
            user: subscription.user.id,
            subscription: subscription.id,
          });

          const subsFrequencies = await strapi.services.order.frequency();
          const confirmation = await strapi.services.order.confirmationEmail(
            order
          );

          await strapi.plugins["email"].services.email.send({
            to: subscription.billingInformation.email,
            subject: "YOUR ORDER HAS BEEN PLACED!",
            html: confirmation,
          });

          const frequency = subsFrequencies.find(
            (option) => option.value === subscription.frequency
          );

          await strapi.services.subscription.update(
            { id: subscription.id },
            {
              next_delivery: frequency.delivery(),
              last_delivery: moment().toDate(),
            }
          );
        } catch (error) {
          // Notify user by email
          console.log(error);
        }
      })
    );
  },
};

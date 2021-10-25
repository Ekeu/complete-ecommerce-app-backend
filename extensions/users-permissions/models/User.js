const stripe = require("stripe")(process.env.STRIPE_SK);

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const customer = await stripe.customers.create({
        name: data.username,
        email: data.email,
      });

      data.stripeID = customer.id;
      data.paymentMethods = [
        { brand: "", last4: "", exp_month: "", exp_year: "" },
        { brand: "", last4: "", exp_month: "", exp_year: "" },
        { brand: "", last4: "", exp_month: "", exp_year: "" },
      ];
      data.contactInfo = [
        { name: data.username, email: data.email, phone: "" },
        { name: data.username, email: data.email, phone: "" },
        { name: data.username, email: data.email, phone: "" },
      ];
      data.locations = [
        { street: "", zip: "", city: "", state: "" },
        { street: "", zip: "", city: "", state: "" },
        { street: "", zip: "", city: "", state: "" },
      ];
    },
  },
};

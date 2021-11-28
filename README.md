<h1 align="center">
  Adidas Ecom Platform for Developers - Backend
</h1>

---

## What is it? 🧐

This is the backend part of full e-commerce web app. The main purpose is to help developers start fast when building their own e-commerce web App.

---

## Stack Used

I used the following technologies:

1. [Strapi](https://strapi.io/) CMS
2. [MongoDB Atlas](https://www.mongodb.com/atlas/database) as Database

## Stack Info

1. The Strapi CMS contains the following models or collection types
   1. Categories
   2. Favorites
   3. Orders
   4. Products
   5. Reviews
   6. Subscriptions
   7. Users
   8. Variants

## Run the CMS

1. Create and add in your `.env` the below keys

```env
DATABASE_URI='YOUR MONGODB ATLAS DATABASE URL'
DATABASE_NAME='YOUR DATABSE NAME'
SENDGRID_API_KEY='YOUR SENDGRID API KEY' (To send email after a product has been ordered)
STRIPE_SK='YOUR STRIPE SECRETE KEY'
ALGOLIA_APPLICATION_ID='YOUR ALGOLIA APP ID'
ALGOLIA_ADMIN_API_KEY='YOUR ALGOLIA ADMIN API KEY'
AWS_ACCESS_KEY_ID='YOUR AWS ACCESS KEY'
AWS_ACCESS_SECRET='YOUR AWS ACCESS SECRET'
AWS_REGION='YOUR AWS REGION'
AWS_BUCKET_NAME='YOUR AWS BUCKET NAME' (For image upload)
```

2. Run the server

```npm
- npm install
- npm run develop or strapi develop (if you have the strapi cli)
```

3. Open your browser and go to http://localhost:1337 to see the result.

4. YOU WILL NEED TO UPLOAD YOUR IMAGES BEFORE RUNNING THE FRONTEND (!!IMPORTANT)

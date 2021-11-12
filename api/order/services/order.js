"use strict";

const moment = require("moment");
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

const currencyFormatter = (value) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

module.exports = {
  async frequency() {
    return [
      {
        value: "one_week",
        label: "Week",
        delivery: () => moment().add(7, "d").toDate(),
      },
      {
        value: "two_weeks",
        label: "Two Weeks",
        delivery: () => moment().add(2, "w").toDate(),
      },
      {
        value: "one_month",
        label: "Month",
        delivery: () => moment().add(1, "M").toDate(),
      },
      {
        value: "two_months",
        label: "Two Months",
        delivery: () => moment().add(2, "M").toDate(),
      },
      {
        value: "annually",
        label: "Year",
        delivery: () => moment().add(1, "y").toDate(),
      },
    ];
  },
  async confirmationEmail(order) {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta http-equiv="x-ua-compatible" content="ie=edge" />
        <title>Email Receipt</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style type="text/css">
          /**
       * Google webfonts. Recommended to include the .woff version for cross-client compatibility.
       */
          @media screen {
            /* devanagari */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU69_a8oxmIdGh4BCOz.woff2)
                format('woff2');
              unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D,
                U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
            }
            /* latin-ext */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU69_a8oxmIdGd4BCOz.woff2)
                format('woff2');
              unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
                U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
            /* latin */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 400;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU69_a8oxmIdGl4BA.woff2)
                format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
                U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
                U+2212, U+2215, U+FEFF, U+FFFD;
            }
            /* devanagari */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU19_a8oxmIfNJdER2SjQpf.woff2)
                format('woff2');
              unicode-range: U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D,
                U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;
            }
            /* latin-ext */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU19_a8oxmIfNJdERKSjQpf.woff2)
                format('woff2');
              unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB,
                U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
            }
            /* latin */
            @font-face {
              font-family: 'Hind';
              font-style: normal;
              font-weight: 700;
              font-display: swap;
              src: url(https://fonts.gstatic.com/s/hind/v11/5aU19_a8oxmIfNJdERySjQ.woff2)
                format('woff2');
              unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6,
                U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193,
                U+2212, U+2215, U+FEFF, U+FFFD;
            }
          }

          /**
       * Avoid browser level font resizing.
       * 1. Windows Mobile
       * 2. iOS / OSX
       */
          body,
          table,
          td,
          a {
            -ms-text-size-adjust: 100%; /* 1 */
            -webkit-text-size-adjust: 100%; /* 2 */
          }

          /**
       * Remove extra space added to tables and cells in Outlook.
       */
          table,
          td {
            mso-table-rspace: 0pt;
            mso-table-lspace: 0pt;
          }

          /**
       * Better fluid images in Internet Explorer.
       */
          img {
            -ms-interpolation-mode: bicubic;
          }

          /**
       * Remove blue links for iOS devices.
       */
          a[x-apple-data-detectors] {
            font-family: inherit !important;
            font-size: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
            color: inherit !important;
            text-decoration: none !important;
          }

          /**
       * Fix centering issues in Android 4.4.
       */
          div[style*='margin: 16px 0;'] {
            margin: 0 !important;
          }

          body {
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /**
       * Collapse table borders to avoid space between cells.
       */
          table {
            border-collapse: collapse !important;
          }

          a {
            color: #6d28d9;
          }

          img {
            height: auto;
            line-height: 100%;
            text-decoration: none;
            border: 0;
            outline: none;
          }
        </style>
      </head>
      <body style="background-color: #c4b5fd">
        <!-- start preheader -->
        <div
          class="preheader"
          style="
            display: none;
            max-width: 0;
            max-height: 0;
            overflow: hidden;
            font-size: 1px;
            line-height: 1px;
            color: #fff;
            opacity: 0;
          "
        >
          Your new products have just arrived!
        </div>
        <!-- end preheader -->

        <!-- start body -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <!-- start logo -->
          <tr>
            <td align="center" bgcolor="#C4B5FD">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 800px"
              >
                <tr>
                  <td align="center" valign="top" style="padding: 36px 24px">
                    <a
                      href="https://constjs.dev"
                      target="_blank"
                      style="display: inline-block"
                    >
                      <img
                        src="https://res.cloudinary.com/dmcookpro/image/upload/v1635304089/adidas-ecom/icon-adidas-logo_png.png"
                        alt="Logo"
                        border="0"
                        width="48"
                        style="display: block; height: 50px; width: auto"
                      />
                    </a>
                  </td>
                </tr>
              </table>
              <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
            </td>
          </tr>
          <!-- end logo -->

          <!-- start hero -->
          <tr>
            <td align="center" bgcolor="#C4B5FD">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 800px"
              >
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 36px 24px 0;
                      font-family: 'Hind', Helvetica, Arial, sans-serif;
                      border-top: 3px solid #e5e7eb;
                    "
                  >
                    <h1
                      style="
                        margin: 0;
                        font-size: 32px;
                        font-weight: 700;
                        color: #1f2937;
                        letter-spacing: -1px;
                        line-height: 48px;
                      "
                    >
                      Thank you for your order!
                    </h1>
                  </td>
                </tr>
              </table>
              <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
            </td>
          </tr>
          <!-- end hero -->

          <!-- start copy block -->
          <tr>
            <td align="center" bgcolor="#C4B5FD">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 800px"
              >
                <!-- start copy -->
                <tr>
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 24px;
                      font-family: 'Hind', Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      line-height: 24px;
                    "
                  >
                    <p style="margin: 0">
                      Here is a summary of your recent order. If you have any
                      questions or concerns about your order, please contact us via constjavascript@gmail.com
                    </p>
                    <p style="margin-top: 12px">
                      Order number:
                      <span
                        style="
                          color: #fff;
                          background-color: #8b5cf6;
                          padding: 2px 4px;
                          text-transform: uppercase;
                        "
                        >${order.id.slice(
                          order.id.length - 14,
                          order.id.length
                        )}</span
                      >
                    </p>
                  </td>
                </tr>
                <!-- end copy -->

                <!-- start receipt table -->
                <tr style="color: #1f2937">
                  <td
                    align="left"
                    bgcolor="#ffffff"
                    style="
                      padding: 24px;
                      font-family: 'Hind', Helvetica, Arial, sans-serif;
                      font-size: 16px;
                      line-height: 24px;
                    "
                  >
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <th align="left" scope="col" style="padding: 0">Product</th>
                        <th align="left" scope="col" style="padding: 0">Size</th>
                        <th align="left" scope="col" style="padding: 0">
                          Quantity
                        </th>
                        <th align="left" scope="col" style="padding: 0">Price</th>
                      </tr>
                      ${order.items.map(
                        (item) => `
                        <tr>
                        <td align="left" scope="row">
                          ${item.name}
                        </td>
                        <td align="left">${item.variant.size}</td>
                        <td align="left">${item.quantity}</td>
                        <td align="left">${currencyFormatter(
                          item.variant.price
                        )}</td>
                      </tr>
                        `
                      )}
                      <tr>
                        <td align="left" scope="row" />
                        <td align="left" scope="row" />
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          Shipping
                        </td>
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          ${currencyFormatter(order.deliveryMethod.price)}
                        </td>
                      </tr>
                      <tr>
                        <td align="left" scope="row" />
                        <td align="left" scope="row" />
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          Subtotal
                        </td>
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                        ${currencyFormatter(order.subtotal)}
                        </td>
                      </tr>
                      <tr>
                        <td align="left" scope="row" />
                        <td align="left" scope="row" />
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          Sales Tax
                        </td>
                        <td
                          align="left"
                          style="
                            padding: 6px 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                        ${currencyFormatter(order.tax)}
                        </td>
                      </tr>
                      <tr>
                        <td align="left" scope="row" />
                        <td align="left" scope="row" />
                        <td
                          align="left"
                          style="
                            padding: 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          <strong>Total</strong>
                        </td>
                        <td
                          align="left"
                          style="
                            padding: 0px;
                            font-family: 'Hind', Helvetica, Arial, sans-serif;
                            font-size: 16px;
                            line-height: 24px;
                          "
                        >
                          <strong>${currencyFormatter(order.total)}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- end reeipt table -->
              </table>
              <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
            </td>
          </tr>
          <!-- end copy block -->

          <!-- start receipt address block -->
          <tr style="color: #1f2937;">
            <td align="center" bgcolor="#C4B5FD" valign="top" width="100%">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                align="center"
                bgcolor="#ffffff"
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 800px"
              >
                <tr>
                  <td
                    align="center"
                    valign="top"
                    style="font-size: 0; border-bottom: 3px solid #e5e7eb"
                  >
                    <!--[if (gte mso 9)|(IE)]>
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
                  <tr>
                  <td align="left" valign="top" width="300">
                  <![endif]-->
                    <div
                      style="
                        display: inline-block;
                        width: 100%;
                        max-width: 50%;
                        min-width: 240px;
                        vertical-align: top;
                      "
                    >
                      <table
                        align="left"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 300px"
                      >
                        <tr>
                          <td
                            align="left"
                            valign="top"
                            style="
                              padding-bottom: 36px;
                              padding-left: 36px;
                              font-family: 'Hind', Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 24px;
                            "
                          >
                            <p><strong>Delivery Address</strong></p>
                            <p>${order.shippingInformation.name}</p>
                            <p>
                              ${order.shippingAddress.street}<br />${
      order.shippingAddress.city
    }<br />${order.shippingAddress.state}, ${order.shippingAddress.zip}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!--[if (gte mso 9)|(IE)]>
                  </td>
                  <td align="left" valign="top" width="300">
                  <![endif]-->
                    <div
                      style="
                        display: inline-block;
                        width: 100%;
                        max-width: 50%;
                        min-width: 240px;
                        vertical-align: top;
                      "
                    >
                      <table
                        align="left"
                        border="0"
                        cellpadding="0"
                        cellspacing="0"
                        width="100%"
                        style="max-width: 300px"
                      >
                        <tr>
                          <td
                            align="left"
                            valign="top"
                            style="
                              padding-bottom: 36px;
                              padding-left: 36px;
                              font-family: 'Hind', Helvetica, Arial, sans-serif;
                              font-size: 16px;
                              line-height: 24px;
                            "
                          >
                            <p><strong>Billing Address</strong></p>
                            <p>${order.billingInformation.name}</p>
                            <p>
                            ${order.billingAddress.street}<br />${
      order.billingAddress.city
    }<br />${order.billingAddress.state}, ${order.billingAddress.zip}
                            </p>
                          </td>
                        </tr>
                      </table>
                    </div>
                    <!--[if (gte mso 9)|(IE)]>
                  </td>
                  </tr>
                  </table>
                  <![endif]-->
                  </td>
                </tr>
              </table>
              <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
            </td>
          </tr>
          <!-- end receipt address block -->

          <!-- start footer -->
          <tr>
            <td align="center" bgcolor="#C4B5FD" style="padding: 24px">
              <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellpadding="0" cellspacing="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
              <table
                border="0"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 800px"
              >
                <!-- start permission -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#C4B5FD"
                    style="
                      padding: 12px 24px;
                      font-family: 'Hind', Helvetica, Arial, sans-serif;
                      font-size: 14px;
                      line-height: 20px;
                      color: #374151;
                    "
                  >
                    <p style="margin: 0">Sarl au capital de 6. 176.619,60 euros</p>
                    <p style="margin: 0">
                      Strasbourg RCS 085 480 069. Siren/Siret : 085 480 069 00971
                    </p>
                    <p style="margin: 0">
                      N° de TVA intracommunautaire : FR 58 085 480 069
                    </p>
                  </td>
                </tr>
                <!-- end permission -->

                <!-- start unsubscribe -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#C4B5FD"
                    style="
                      padding: 12px 24px;
                      font-family: 'Hind', Helvetica, Arial, sans-serif;
                      font-size: 14px;
                      line-height: 20px;
                      color: #374151;
                    "
                  >
                    <p style="margin: 0">
                      Adidas France. 1 Allée des Orcades. 67000 Strasbourg, France
                    </p>
                  </td>
                </tr>
                <!-- end unsubscribe -->
              </table>
              <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
            </td>
          </tr>
          <!-- end footer -->
        </table>
        <!-- end body -->
      </body>
    </html>

    `;
  },
};

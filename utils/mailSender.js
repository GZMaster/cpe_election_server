/* eslint-disable import/no-extraneous-dependencies */
// const nodemailer = require("nodemailer");
// const sendgridTransport = require("nodemailer-sendgrid-transport");
const sgMail = require("@sendgrid/mail");
const catchAsync = require("./catchAsync");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports.sendMail = catchAsync(async (params) => {
  const msg = {
    from: "retrodevstechnology@gmail.com",
    to: params.to,
    subject: "Hello ✔",
    html: `
    <div
      class="container"
      style="max-width: 90%; margin: auto; padding-top: 20px"
    >
      <h2>Welcome to the club.</h2>
      <h4>You are officially In ✔</h4>
      <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
      <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
 </div>
  `,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
});

// const transporter = nodemailer.createTransport(
//   sendgridTransport({
//     auth: {
//       api_key: process.env.SENDGRID_API_KEY,
//     },
//   })
// );

// module.exports.sendMail = catchAsync(async (params) => {
//   const info = await transporter.sendMail({
//     from: "danigamester@gmail.com",
//     to: params.to,
//     subject: "Hello ✔",
//     html: `
//         <div
//           class="container"
//           style="max-width: 90%; margin: auto; padding-top: 20px"
//         >
//           <h2>Welcome to the club.</h2>
//           <h4>You are officially In ✔</h4>
//           <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
//           <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${params.OTP}</h1>
//      </div>
//       `,
//   });
//   return info;
// });

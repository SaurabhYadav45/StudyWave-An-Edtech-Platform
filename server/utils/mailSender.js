// const nodemailer = require("nodemailer");

// const mailSender = async(email, title, body) =>{
//     try {
//         // Create Transporter
//         let transporter = nodemailer.createTransport({
//             host:process.env.MAIL_HOST,
//             port: 587,
//             secure: false,
//             auth:{
//                 user:process.env.MAIL_USER,
//                 pass:process.env.MAIL_PASS,
//             }
//         })

//         // Send mail using transporter
//         let info = await transporter.sendMail({
//             from: 'StudyWave',
//             to: `${email}`,
//             subject:`${title}`,
//             html:`${body}`,
//         })
//         console.log(info);
//         return info;

//     } catch (error) {
//         console.log(error.message);
//         return error.message
//     }
// }


// module.exports = mailSender;



// require("dotenv").config();
// const { Resend } = require('resend');
// const resend = new Resend(process.env.RESEND_API_KEY);

// const mailSender = async (email, title, body) => {
//   try {
//     const data = await resend.emails.send({
//       from: 'StudyWave <onboarding@resend.dev>',
//       to: email,
//       subject: title,
//       html: body,
//     });
//     console.log("✅ Email sent:", data.id);
//     return data;
//   } catch (error) {
//     console.error("❌ Email send failed:", error);
//     return error.message;
//   }
// };

// module.exports = mailSender;




const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    // Create transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.BREVO_HOST,
      port: parseInt(process.env.BREVO_PORT) || 587,
      secure: false, // TLS
      auth: {
        user: process.env.BREVO_USER,
        pass: process.env.BREVO_PASS,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: '"StudyWave" <no-reply@studywave.com>', // replace with verified domain or Brevo default
      to: email,     // dynamic user email
      subject: title,
      html: body,
    });

    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    return error.message;
  }
};

module.exports = mailSender;

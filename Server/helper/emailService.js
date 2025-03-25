require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async (toEmail, username, house) => {
  try {
    await transporter.sendMail({
      from: `"Sorting Hat AI" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject:
        "Acceptance Letter to Hogwarts School of Witchcraft and Wizardry!",
      text: `Dear ${username},

We are pleased to inform you that you have been officially sorted into **${house}** at Hogwarts School of Witchcraft and Wizardry.  

Students shall be required to embrace the values of their house and uphold the traditions of Hogwarts as they embark on their magical journey.  

Please ensure that the utmost attention is given to the principles of your house, for they will guide you through your years at Hogwarts.  

We very much look forward to welcoming you as part of the new generation of Hogwarts' heritage.  

Draco Dormiens Nunquam Titillandus,

Prof.McGonagall`,
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = { sendWelcomeEmail };

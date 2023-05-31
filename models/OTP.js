const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expire: 5 * 60,
  },
});

//a function -> to send email

async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
       email,
      "Verification Email",
       emailTemplate(otp),
    );
    console.log("email sent Successfully", mailResponse.response);
  } catch (error) {
    console.log("error occured while sending mail", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  console.log("new document saved to database");
// only send email when a new document is created

  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);

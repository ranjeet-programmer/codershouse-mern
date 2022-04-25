const crypto = require("crypto");
const HashService = require("../services/hash-service");
const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require("twilio")(smsSid, smsAuthToken, {
  lazyLoading: true,
});

class OtpService {
  async generateOtp() {
    const otp = await crypto.randomInt(1000, 9999);
    return otp;
  }

  async sendBySMS(phone, otp) {
    return await twilio.messages.create({
      to: phone,
      from: process.env.SMS_FROM_NUMBER,
      body: `Your Coder's House OTP is ${otp}`,
    });
  }

  verifyOtp(hashedOtp, data) {
    let computedHash = HashService.hashOtp(data);

    return computedHash === hashedOtp;
  }
}

module.exports = new OtpService();

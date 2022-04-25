const OtpService = require("../services/otp-service");
const HashService = require("../services/hash-service");
const UserService = require("../services/user-service");
const TokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");

class AuthController {
  async sendOtp(req, res) {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number is required",
      });
    }

    const otp = await OtpService.generateOtp();

    // hash  the otp

    const ttl = 1000 * 60 * 2; // 2 minutes
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;

    const hash = HashService.hashOtp(data);

    // send otp to phone

    try {
      // await OtpService.sendBySMS(phone, otp);
      res.json({
        hash: `${hash}.${expires}`,
        phone: phone,
        otp,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Message sending failed",
      });
    }
  }

  async verifyOtp(req, res) {
    const { otp, hash, phone } = req.body;

    if (!otp || !hash || !phone) {
      res.status(400).json({
        message: "Invalid request",
      });
    }

    const [hashedOtp, expires] = hash.split(".");

    if (Date.now() > +expires) {
      res.status(400).json({
        message: "Otp has expired",
      });
    }

    const data = `${phone}.${otp}.${expires}`;

    const isValid = OtpService.verifyOtp(hashedOtp, data);

    if (!isValid) {
      res.status(400).json({
        message: "Invalid otp",
      });
    }

    let user;
    // let accessToken;

    try {
      user = await UserService.findUser({ phone: phone });

      if (!user) {
        user = await UserService.createUser({
          phone: phone,
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "DB Error",
      });
    }

    // Generate JWT Token

    const { accessToken, refreshToken } = TokenService.generateTokens({
      _id: user._id,
      activated: false,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    res.json({ accessToken, user: userDto });
  }
}

module.exports = new AuthController();

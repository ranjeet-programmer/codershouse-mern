const OtpService = require("../services/otp-service");
const HashService = require("../services/hash-service");
const UserService = require("../services/user-service");
const TokenService = require("../services/token-service");
const UserDto = require("../dtos/user-dto");
const tokenService = require("../services/token-service");
const userService = require("../services/user-service");

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

    // Store refresh token in db
    await tokenService.storeRefreshToken(refreshToken, user._id);

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    const userDto = new UserDto(user);
    res.json({ user: userDto, auth: true });
  }

  async refresh(req, res) {
    // get refresh token from cookie
    const { refreshToken: refreshTokenFromCookie } = req.cookies;
    // check if token is valid
    let userData;
    try {
      userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
    } catch (err) {
      return res.status(401).json({ message: "Invalid Token" });
    }
    // Check if token is in db
    try {
      const token = await tokenService.findRefreshToken(
        userData._id,
        refreshTokenFromCookie
      );
      if (!token) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (err) {
      return res.status(500).json({ message: "Internal error" });
    }
    // check if valid user
    const user = await userService.findUser({ _id: userData._id });
    if (!user) {
      return res.status(404).json({ message: "No user" });
    }
    // Generate new tokens
    const { refreshToken, accessToken } = tokenService.generateTokens({
      _id: userData._id,
    });

    // Update refresh token
    try {
      await tokenService.updateRefreshToken(userData._id, refreshToken);
    } catch (err) {
      return res.status(500).json({ message: "Internal error" });
    }
    // put in cookie
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
    });
    // response
    const userDto = new UserDto(user);
    res.json({ user: userDto, auth: true });
  }

  async logout(req, res) {
    // delete refresh token from db
    const { refreshToken } = req.cookies;
    await tokenService.removeToken(refreshToken);

    // delete access token from cookie

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    res.json({ user: null, auth: false });
  }
}

module.exports = new AuthController();

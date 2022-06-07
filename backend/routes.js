const router = require("express").Router();
const AuthController = require("./controllers/auth-controller");
const ActivateController = require("./controllers/activate-controller");
const authMiddleware = require("./midllewares/auth-middleware");
const RoomsController = require("./controllers/rooms-controller");

router.post("/api/send-otp", AuthController.sendOtp);
router.post("/api/verify-otp", AuthController.verifyOtp);
router.post("/api/activate", authMiddleware, ActivateController.activate);
router.get("/api/refresh", AuthController.refresh);
router.post("/api/logout", authMiddleware, AuthController.logout);
router.post("/api/rooms", authMiddleware, RoomsController.create);
router.get("/api/rooms", authMiddleware, RoomsController.index);

module.exports = router;

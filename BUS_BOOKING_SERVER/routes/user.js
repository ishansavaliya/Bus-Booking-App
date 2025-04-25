import express from "express";
import {
  loginOrSignup,
  refreshToken,
  loginWithPhone,
} from "../controllers/user.js";

const router = express.Router();

router.post("/login", loginOrSignup);
router.post("/login-phone", loginWithPhone);
router.post("/refresh", refreshToken);

export default router;

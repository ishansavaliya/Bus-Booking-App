import express from "express";
import { loginOrSignup, refreshToken } from "../controllers/user";

const router = express.Router();

router.post("/login", loginOrSignup);
router.post("/refresh", refreshToken);

export default router;

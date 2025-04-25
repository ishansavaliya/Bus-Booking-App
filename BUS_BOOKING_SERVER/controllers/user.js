import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user?._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { userId: user?._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  return { accessToken, refreshToken };
};

export const loginOrSignup = async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: google_id, name, picture, email_verified } = payload;

    if (!email_verified) {
      return res.status(400).json({ error: "Email not verified by google" });
    }

    let user = await User.findOne({ email });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = new User({
        google_id,
        email,
        name,
        user_photo: picture,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user.toObject());

    res.status(200).json({
      user,
      accessToken,
      refreshToken,
      isNewUser,
    });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
};

export const loginWithPhone = async (req, res) => {
  const { phone } = req.body;

  try {
    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Check if user exists with this phone number
    let user = await User.findOne({ phone });
    let isNewUser = false;

    // If user doesn't exist, create a new user
    if (!user) {
      isNewUser = true;

      // Explicitly create a user document with only the required fields
      // Omitting email entirely rather than setting it to null or undefined
      const userData = {
        phone,
        name: `User-${phone.substring(6)}`, // Default name using last 4 digits
      };

      try {
        // Direct create method to avoid any middleware issues
        user = await User.create(userData);
        // console.log("New user created successfully with phone:", phone);
      } catch (createError) {
        console.error("Error creating user:", createError);
        return res.status(500).json({ error: "Failed to create user account" });
      }
    }

    // Generate tokens for authentication
    const { accessToken, refreshToken } = generateTokens(user.toObject());

    // Return user data and tokens
    res.status(200).json({
      user,
      accessToken,
      refreshToken,
      isNewUser,
    });
  } catch (error) {
    console.error("Phone login error: ", error);
    res.status(500).json({ error: "Failed to authenticate with phone number" });
  }
};

export const refreshToken = async (req, res) => {
  const { refreshToken: reqRefreshToken } = req.body;

  if (!reqRefreshToken) {
    return res.status(401).json({ error: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(
      reqRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.log("Refresh token error: ", error);
    res.status(403).json({ error: "Invalid or expired refresh token" });
  }
};

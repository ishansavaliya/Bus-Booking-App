import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import * as AdminJSMongoose from "@adminjs/mongoose";
import { COOKIE_PASSWORD } from "./config.js";
import { dark, light, noSidebar } from "@adminjs/themes";
import dotenv from "dotenv";
import session from "express-session";
import ConnectMongoDBSession from "connect-mongodb-session";
import User from "../models/user.js";
import Bus from "../models/bus.js";
import Ticket from "../models/ticket.js";

dotenv.config();

AdminJS.registerAdapter({
  Resource: AdminJSMongoose.Resource,
  Database: AdminJSMongoose.Database,
});

const DEFAULT_ADMIN = {
  email: process.env.ADMIN_LOGIN_EMAIL,
  password: process.env.ADMIN_LOGIN_PASSWORD,
};

const authenticate = async (email, password) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN);
  }
  return null;
};

export const buildAdminJS = async (app) => {
  const admin = new AdminJS({
    resources: [
      { resource: User, options: { navigation: { name: "Users" } } },
      { resource: Bus, options: { navigation: { name: "Buses" } } },
      { resource: Ticket, options: { navigation: { name: "Tickets" } } },
    ],
    branding: {
      companyName: "Bus Booking",
      withMadeWithLove: false,
    },
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    rootPath: "/admin",
  });

  const MongoDBStore = ConnectMongoDBSession(session);
  const sessionStore = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "sessions",
    // Removed deprecated options that are now defaults in MongoDB v4.0.0+
  });

  // Handle potential errors
  sessionStore.on("error", function (error) {
    console.log("Session store error:", error);
  });

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      authenticate,
      cookieName: "adminjs",
      cookiePassword:
        COOKIE_PASSWORD || "some-secure-password-for-cookie-signing",
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: COOKIE_PASSWORD || "some-secure-password-for-cookie-signing",
      cookie: {
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      name: "adminjs",
    }
  );

  app.use(admin.options.rootPath, adminRouter);

  return admin;
};

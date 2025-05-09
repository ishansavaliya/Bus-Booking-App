import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/connect.js";
import { PORT } from "./config/config.js";
import userRoutes from "./routes/user.js";
import busRoutes from "./routes/bus.js";
import ticketRoutes from "./routes/ticket.js";
import { buildAdminJS } from "./config/setup.js";
import setupIndexes from "./config/setupIndexes.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.use("/user", userRoutes);
app.use("/bus", busRoutes);
app.use("/ticket", ticketRoutes);

// Debug route to test if server is working
app.get("/test", (req, res) => {
  res.status(200).json({ message: "Server is working!" });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Setup MongoDB indexes properly
    await setupIndexes();

    await buildAdminJS(app);

    app.listen(PORT, "0.0.0.0", (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`Server Started on http://localhost:${PORT}/admin`);
      }
    });
  } catch (error) {
    console.log("Error in starting server: " + error);
  }
};

start();

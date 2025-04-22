import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/connect.js";
import { PORT } from "./config/config.js";
import userRoutes from "./routes/user.js";
import busRoutes from "./routes/bus.js";
import ticketRoutes from "./routes/ticket.js";
import { buildAdminJS } from "./config/setup.js";

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

//Routes
app.use("/user", userRoutes);
app.use("/bus", busRoutes);
app.use("/ticket", ticketRoutes);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
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

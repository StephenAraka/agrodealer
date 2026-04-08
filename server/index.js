import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import { testDatabaseConnection } from "./config/db.js";
import { initializeDatabase } from "./data/initDb.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", async (req, res, next) => {
  try {
    const dbMeta = await testDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "Server and database are healthy",
      data: dbMeta,
    });
  } catch (error) {
    next(error);
  }
});

app.use("/api", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
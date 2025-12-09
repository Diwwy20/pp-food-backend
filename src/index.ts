import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { config } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import path from "path";
import { fileURLToPath } from "url";
// import { apiLimiter } from "./middlewares/rateLimiter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import cartRoutes from "./routes/cartRoutes";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);
app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan(config.NODE_ENV === "development" ? "dev" : "combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.join(__dirname, "../uploaded")));

// app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/cart", cartRoutes);

app.get("/", (_, res) => {
  res.send("API is running...");
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});

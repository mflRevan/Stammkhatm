import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import cycleRoutes from "./routes/cycles.js";
import adminRoutes from "./routes/admin.js";
import { startCron } from "./cron.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);

// Middleware
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/cycles", cycleRoutes);
app.use("/segments", cycleRoutes); // POST /segments/:id/claim
app.use("/claims", cycleRoutes);   // POST /claims/:id/complete
app.use("/admin", adminRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
  startCron();
});

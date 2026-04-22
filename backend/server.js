const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// ✅ LOAD ENV FIRST
dotenv.config();

// ✅ IMPORT DB
const connectDB = require("./config/db");

// ✅ IMPORT ROUTES
const taskRoutes = require("./routes/Taskroutes");
const aiRoutes = require("./routes/aiRoutes");
const aiChatRoutes = require("./routes/aiChat");
const aiSchedulerRoutes = require("./routes/aiScheduler"); // 🔥 NEW
const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ MIDDLEWARE
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ DEBUG
console.log(
  process.env.GEMINI_API_KEY
    ? "✅ Gemini API loaded"
    : "❌ Gemini API missing"
);

// ✅ CONNECT DB
connectDB();

// ✅ ROUTES
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/chat", aiChatRoutes);

// 🔥 NEW FEATURE ROUTE
app.use("/api/ai/schedule", aiSchedulerRoutes);

app.use("/api/auth", authRoutes);

// ✅ TEST
app.get("/", (req, res) => {
  res.send("NeuraTask Backend Running 🚀");
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ✅ START
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
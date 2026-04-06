const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

// LOAD ENV FIRST
dotenv.config();

const connectDB = require("./config/db");
const taskRoutes = require("./routes/Taskroutes");
const aiRoutes = require("./routes/aiRoutes");

// DEBUG (check if env is loaded)
console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/tasks", taskRoutes);
app.use("/api/ai", aiRoutes);

// test route
app.get("/", (req, res) => {
  res.send("NeuraTask Backend Running 🚀");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
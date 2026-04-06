const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/plan", async (req, res) => {
  try {
    const { tasks } = req.body;

    // ✅ validation
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks must be an array" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // ✅ improved prompt
    const prompt = `
Return ONLY valid JSON (no markdown, no explanation).

Create a daily schedule with REALISTIC TIMES (like 9:00 AM, 2:30 PM).

Format:
[
  { "task": "...", "priority": "High/Medium/Low", "time": "HH:MM AM/PM" }
]

Tasks:
${tasks.join(", ")}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();

    // ✅ clean markdown if exists
    output = output.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(output);
    } catch (err) {
      console.log("❌ JSON PARSE ERROR:", output);
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: output,
      });
    }

    // ✅ sanitize + map data
    const cleanedTasks = parsed.map((item) => ({
      title: item.task || "Untitled Task",
      priority: ["High", "Medium", "Low"].includes(item.priority)
        ? item.priority
        : "Medium",
      time: item.time || "Not specified",
    }));

    // ✅ insert all at once (faster)
    const savedTasks = await Task.insertMany(cleanedTasks);

    res.json({
      message: "✅ Tasks generated & saved successfully",
      count: savedTasks.length,
      tasks: savedTasks,
    });

  } catch (err) {
    console.log("🔥 ERROR:", err.message);
    res.status(500).json({ error: "AI processing failed" });
  }
});

module.exports = router;
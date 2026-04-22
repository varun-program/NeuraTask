const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Task = require("../models/Task");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/", async (req, res) => {
  try {
    const { tasks, userId } = req.body;

    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks must be array" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Create a smart daily schedule.

Rules:
- Assign realistic times (morning, afternoon, evening)
- Keep balance
- Include priority (High/Medium/Low)

Return ONLY JSON:
[
 { "task": "...", "time": "HH:MM AM", "priority": "High/Medium/Low" }
]

Tasks:
${tasks.join(", ")}
`;

    const result = await model.generateContent(prompt);
    let output = result.response.text();

    output = output.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(output);
    } catch {
      return res.status(500).json({ error: "Invalid AI response", raw: output });
    }

    const finalTasks = parsed.map((t) => ({
      title: t.task,
      time: t.time,
      priority: t.priority,
      userId,
    }));

    const saved = await Task.insertMany(finalTasks);

    res.json({
      message: "AI schedule created 🚀",
      tasks: saved,
    });

  } catch (err) {
    console.log("🔥 AI SCHEDULER ERROR:", err.message);
    res.status(500).json({ error: "AI scheduler failed" });
  }
});

module.exports = router;
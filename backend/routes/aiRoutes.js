const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/plan", async (req, res) => {
  try {
    const { tasks } = req.body;

    if (!tasks) {
      return res.status(400).json({ error: "Tasks are required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Return ONLY valid JSON. Do NOT include markdown, explanation, or backticks.

Format:
[
  { "task": "...", "priority": "High/Medium/Low", "time": "..." }
]

Tasks:
${tasks.join(", ")}
`;

    const result = await model.generateContent(prompt);

    let output = result.response.text();

    // 🔥 CLEAN MARKDOWN (IMPORTANT)
    output = output.replace(/```json|```/g, "").trim();

    // 🔥 PARSE JSON SAFELY
    try {
      const parsed = JSON.parse(output);
      return res.json({ plan: parsed });
    } catch (err) {
      console.log("⚠️ JSON Parse Error:", err.message);
      return res.json({ plan: output }); // fallback
    }

  } catch (err) {
    console.log("🔥 ERROR:", err.message);
    res.status(500).json({ error: "AI failed" });
  }
});

module.exports = router;
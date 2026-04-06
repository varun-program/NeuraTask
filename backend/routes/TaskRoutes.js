const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const scheduleTasks = require("../utils/scheduler")
const autoMoveTasks = require("../utils/aiAutomation")

// ✅ Create Task
router.post("/", async (req, res) => {
    try {
        if (!req.body.title) {
            return res.status(400).json({ error: "Title is required" })
        }

        const task = await Task.create(req.body)
        res.json(task)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// ✅ Get All Tasks
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 })
        res.json(tasks)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🤖 AI Schedule
router.get("/schedule", async (req, res) => {
    try {
        const tasks = await Task.find()
        const scheduled = scheduleTasks(tasks)
        res.json(scheduled)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🤖 AI Automation
router.get("/ai-auto", async (req, res) => {
    try {
        const result = await autoMoveTasks(Task)
        res.json({ message: result })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🤖 AI Suggestion
router.get("/ai-suggest", async (req, res) => {
    try {
        const tasks = await Task.find()

        const highPriority = tasks.filter(
            t => t.priority === "high" && t.status !== "completed"
        )

        let suggestion

        if (highPriority.length > 0) {
            suggestion = `Start with: ${highPriority[0].title} (High priority)`
        } else {
            suggestion = "You're doing great! Continue your tasks 💪"
        }

        res.json({ suggestion })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🤖 CHATBOT (🔥 NEW - IMPORTANT)
router.post("/chat", async (req, res) => {
    try {
        const { message } = req.body
        const tasks = await Task.find()

        let reply = ""

        if (!message) {
            return res.status(400).json({ error: "Message required" })
        }

        if (message.toLowerCase().includes("what")) {
            const high = tasks.find(
                t => t.priority === "high" && t.status !== "completed"
            )

            reply = high
                ? `You should work on: ${high.title}`
                : "No high priority tasks. You're doing great!"
        }
        else if (message.toLowerCase().includes("plan")) {
            reply = "Start with high priority → then medium → then low tasks."
        }
        else if (message.toLowerCase().includes("progress")) {
            const completed = tasks.filter(t => t.status === "completed").length
            const total = tasks.length
            reply = `You completed ${completed} out of ${total} tasks. Keep going 💪`
        }
        else {
            reply = "Keep going! You're productive 🚀"
        }

        res.json({ reply })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🔥 FIX OLD TASK STATUS
router.get("/fix-status", async (req, res) => {
    try {
        await Task.updateMany({}, { status: "todo" })
        res.send("All tasks updated to todo")
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

/* ================= IMPORTANT =================
   Keep dynamic routes LAST
============================================== */

// ❌ DELETE Task
router.delete("/:id", async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id)
        res.json({ message: "Task deleted" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// 🔄 UPDATE Task
router.put("/:id", async (req, res) => {
    try {
        const updated = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        )
        res.json(updated)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
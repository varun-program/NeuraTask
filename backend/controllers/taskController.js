const Task = require("../models/Task");

// ✅ CREATE TASK (FIXED)
exports.createTask = async (req, res) => {
  try {
    const { title, priority, time, userId } = req.body;

    // 🔥 VALIDATION
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const task = await Task.create({
      title,
      priority,
      time,
      userId, // ✅ REQUIRED FIELD
    });

    res.json(task);
  } catch (err) {
    console.log("CREATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET TASKS (USER-SPECIFIC 🔥)
exports.getTasks = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.log("GET ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log("UPDATE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ✅ DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.log("DELETE ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};
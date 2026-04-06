const autoMoveTasks = async (Task) => {
    const tasks = await Task.find()

    for (let task of tasks) {

        let newStatus = task.status

        // 🧠 AI RULES
        if (task.priority === "high") {
            newStatus = "progress"
        }

        if (task.priority === "low") {
            newStatus = "todo"
        }

        if (task.status === "completed") {
            newStatus = "completed"
        }

        await Task.findByIdAndUpdate(task._id, {
            status: newStatus
        })
    }

    return "AI Automation Applied"
}

module.exports = autoMoveTasks
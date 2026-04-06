const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    status: {
  type: String,
  enum: ["todo", "progress", "completed"],
  default: "todo"
},
    deadline: Date,
    priority: {
        type: String,
        enum: ["low","medium","high"],
        default: "medium"
    }
}, { timestamps: true })

module.exports = mongoose.model("Task", taskSchema)
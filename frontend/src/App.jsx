import { useEffect, useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

function App() {
  const [tasks, setTasks] = useState([])
  const [taskTitle, setTaskTitle] = useState("")
  const [priority, setPriority] = useState("medium")
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState("")

  const API = "http://127.0.0.1:8000/api/tasks"

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(API)
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      console.log("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  // ➕ ADD TASK
  const addTask = async () => {
    if (!taskTitle) return alert("Enter task")

    try {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: taskTitle,
          priority,
          status: "todo"
        })
      })

      setTaskTitle("")
      fetchTasks()
    } catch (err) {
      console.log(err)
    }
  }

  // ❌ DELETE
  const deleteTask = async (id) => {
    try {
      await fetch(`${API}/${id}`, {
        method: "DELETE"
      })
      fetchTasks()
    } catch (err) {
      console.log(err)
    }
  }

  // 🔥 DRAG
  const handleDragEnd = async (result) => {
    if (!result.destination) return

    try {
      await fetch(`${API}/${result.draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: result.destination.droppableId })
      })

      fetchTasks()
    } catch (err) {
      console.log(err)
    }
  }

  // 🤖 AI AUTO
  const runAI = async () => {
    await fetch(`${API}/ai-auto`)
    fetchTasks()
  }

  // 🧠 AI SUGGEST
  const getSuggestion = async () => {
    try {
      const res = await fetch(`${API}/ai-suggest`)
      const data = await res.json()
      setSuggestion(data.suggestion)
    } catch (err) {
      console.log(err)
    }
  }

  // 📊 PROGRESS
  const completed = tasks.filter(t => t.status === "completed").length
  const total = tasks.length
  const percent = total === 0 ? 0 : (completed / total) * 100

  const columns = {
    todo: "To Do",
    progress: "In Progress",
    completed: "Completed"
  }

  return (
    <div className="h-screen bg-slate-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-4">NeuraTask 🚀</h1>

      {/* 📊 PROGRESS */}
      <div className="mb-6">
        <p className="mb-2">Progress: {Math.round(percent)}%</p>
        <div className="w-full bg-slate-700 h-3 rounded">
          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* 🤖 AI BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={runAI}
          className="bg-purple-500 px-4 py-2 rounded hover:bg-purple-600"
        >
          🤖 Auto Move
        </button>

        <button
          onClick={getSuggestion}
          className="bg-indigo-500 px-4 py-2 rounded hover:bg-indigo-600"
        >
          🧠 Suggest
        </button>
      </div>

      {/* 🧠 SHOW SUGGESTION */}
      {suggestion && (
        <div className="bg-slate-800 p-3 rounded mb-4">
          🤖 {suggestion}
        </div>
      )}

      {/* ➕ ADD TASK */}
      <div className="flex gap-3 mb-6">
        <input
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Enter task..."
          className="p-2 rounded bg-slate-800 border border-slate-700"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="p-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button
          onClick={addTask}
          className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {!loading && tasks.length === 0 && <p>No tasks yet...</p>}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-6">

          {Object.entries(columns).map(([key, columnTitle]) => (
            <Droppable droppableId={key} key={key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-slate-800 p-4 rounded-lg min-h-[400px]"
                >
                  <h2 className="text-xl font-semibold mb-4">{columnTitle}</h2>

                  {tasks
                    .filter(task => task.status === key)
                    .map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-slate-700 p-3 mb-3 rounded flex justify-between items-center hover:scale-[1.02] transition"
                          >
                            <div>
                              <h3 className="font-semibold">{task.title}</h3>

                              <p className={`text-sm font-semibold ${
                                task.priority === "high"
                                  ? "text-red-400"
                                  : task.priority === "medium"
                                  ? "text-yellow-400"
                                  : "text-green-400"
                              }`}>
                                {task.priority}
                              </p>
                            </div>

                            <button
                              onClick={() => deleteTask(task._id)}
                              className="text-red-400 hover:text-red-600"
                            >
                              ✖
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}

        </div>
      </DragDropContext>
    </div>
  )
}

export default App
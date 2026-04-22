import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Auth from "./Auth";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API = "http://localhost:8000";

function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [date, setDate] = useState(new Date());

  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const chatRef = useRef(null);

  const userId = user?._id || user?.id;

  // 📊 ANALYTICS
  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;

  const chartData = [
    { name: "Done", value: completed },
    { name: "Pending", value: pending },
  ];

  const COLORS = ["#22c55e", "#ef4444"];

  // 🔄 FETCH TASKS
  const fetchTasks = async () => {
    try {
      if (!userId) return;

      const res = await axios.get(`${API}/api/tasks`, {
        params: { userId },
      });

      setTasks(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  // ➕ ADD / UPDATE
  const addTask = async () => {
    if (!input.trim()) return;

    try {
      if (editingId) {
        await axios.put(`${API}/api/tasks/${editingId}`, {
          title: input,
          time: taskTime,
          priority,
        });
        setEditingId(null);
      } else {
        await axios.post(`${API}/api/tasks`, {
          title: input,
          time: taskTime,
          priority,
          userId,
        });
      }

      setInput("");
      setTaskTime("");
      setPriority("Medium");

      fetchTasks();
    } catch (err) {
      console.error("Add error:", err);
    }
  };

  // ✅ COMPLETE
  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API}/api/tasks/${task._id}`, {
        completed: !task.completed,
      });
      fetchTasks();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  // ❌ DELETE
  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ⚡ AI SCHEDULE
  const autoSchedule = async () => {
    const txt = prompt("Enter tasks (comma separated)");
    if (!txt) return;

    try {
      setLoading(true);

      await axios.post(`${API}/api/ai/schedule`, {
        tasks: txt.split(",").map((t) => t.trim()),
        userId,
      });

      fetchTasks();
    } catch (err) {
      console.error("AI error:", err);
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  // 🤖 CHAT
  const sendMessage = async () => {
    if (!message.trim()) return;

    setChat((prev) => [...prev, { role: "user", text: message }]);
    setMessage("");

    try {
      const res = await axios.post(`${API}/api/ai/chat`, { message });

      setChat((prev) => [
        ...prev,
        { role: "bot", text: res.data.reply },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "AI failed 😢" },
      ]);
    }
  };

  // 🔽 AUTO SCROLL
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat]);

  // 📅 FILTER TASKS BY DATE (optional future)
  const selectedDate = date.toDateString();

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) return <Auth setUser={setUser} />;

  return (
    <div className="min-h-screen p-6 bg-black text-white">

      {/* HEADER */}
      <div className="flex justify-between max-w-2xl mx-auto mb-6">
        <h1 className="text-3xl font-bold">🚀 NeuraTask</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="px-3 py-1 rounded-full bg-white/20"
          >
            📅
          </button>

          <button
            onClick={logout}
            className="px-3 py-1 rounded-full bg-red-500"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 📅 CALENDAR */}
      {showCalendar && (
        <div className="max-w-2xl mx-auto mb-6 bg-white text-black p-4 rounded-xl">
          <Calendar onChange={setDate} value={date} />
          <p className="mt-2 text-center">
            Selected: {selectedDate}
          </p>
        </div>
      )}

      {/* 📊 CHART */}
      <div className="max-w-2xl mx-auto mb-6 bg-white/10 p-5 rounded-xl">
        <h2 className="text-center mb-3">📊 Analytics</h2>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={chartData} dataKey="value" outerRadius={70}>
              {chartData.map((e, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* INPUT */}
      <div className="max-w-2xl mx-auto mb-4 bg-white/10 p-5 rounded-xl">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add task..."
          className="w-full p-2 mb-2 rounded text-black"
        />

        <div className="flex gap-2 mb-3">
          <input
            type="time"
            value={taskTime}
            onChange={(e) => setTaskTime(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-2 rounded text-black"
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button onClick={addTask} className="bg-blue-500 px-4 py-2 rounded">
            {editingId ? "Update" : "Add"}
          </button>

          <button onClick={autoSchedule} className="bg-purple-500 px-4 py-2 rounded">
            {loading ? "..." : "AI"}
          </button>
        </div>
      </div>

      {/* TASKS */}
      <div className="max-w-2xl mx-auto space-y-4">
        {tasks.map((task) => (
          <div key={task._id} className="bg-white/10 p-4 rounded-xl">
            <h2 className={task.completed ? "line-through" : ""}>
              {task.title}
            </h2>
            <p>⏰ {task.time || "Not set"}</p>
            <p>{task.priority}</p>

            <div className="flex gap-2 mt-2">
              <button onClick={() => toggleComplete(task)}>✔</button>
              <button onClick={() => deleteTask(task._id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>

      {/* CHAT */}
      <div className="max-w-2xl mx-auto mt-6 bg-white/10 p-4 rounded-xl">
        <h2>🤖 AI Chat</h2>

        <div ref={chatRef} className="h-40 overflow-y-auto mb-2">
          {chat.map((c, i) => (
            <div key={i}>{c.text}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 p-2 rounded text-black"
          />
          <button onClick={sendMessage} className="bg-green-500 px-3 py-2">
            Send
          </button>
        </div>
      </div>

    </div>
  );
}

export default App;
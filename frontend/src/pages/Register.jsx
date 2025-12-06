import { useState } from "react";
import api from "../utils/api";
import { setToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Create NeuraTask Account</h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={register}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>

      <p className="mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-500">Login</a>
      </p>
    </div>
  );
}

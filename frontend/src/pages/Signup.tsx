import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup(): React.JSX.Element {
  const BASE = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";

  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [msg, setMsg] = useState<string>("");
  const nav = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch(`${BASE}/api/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Account created. Redirecting to login...");
        setTimeout(() => {
          nav("/login");
        }, 1200);
      } else {
        setMsg(data.username || data.password || JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      setMsg("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Signup</h2>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* FAKE INPUTS: Traps the browser autofill on page render */}
          <input type="text" name="prevent_autofill" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
          <input type="password" name="prevent_autofill_pwd" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />

          <input
            name="username"
            type="text"
            onChange={handleChange}
            value={form.username}
            placeholder="Username"
            required
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <input
            name="email"
            type="email"
            onChange={handleChange}
            value={form.email}
            placeholder="Email"
            required
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <input
            name="password"
            type="password"
            onChange={handleChange}
            value={form.password}
            placeholder="Password"
            required
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <input
            name="password2"
            type="password"
            onChange={handleChange}
            value={form.password2}
            placeholder="Confirm Password"
            required
            autoComplete="new-password"
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Create Account
          </button>
        </form>

        {msg && (
          <p className={`mt-3 text-sm font-semibold ${msg.includes("created") ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
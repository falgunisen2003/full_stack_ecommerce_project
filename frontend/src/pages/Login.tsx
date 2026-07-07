import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveToken } from "../utils/auth";

export default function Login(): React.JSX.Element {
  const BASE = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";
  
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access incoming navigation state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMsg("");
    
    try {
      const response = await fetch(`${BASE}/api/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data); 
        setMsg("Login successful! Redirecting...");
        
        setTimeout(() => {
          // If the user came from a specific page (like ProductDetails), send them back there.
          // Otherwise, fall back to the home page ('/').
          const from = location.state?.from?.pathname || "/";
          navigate(from, { replace: true });
        }, 800);
      } else {
        setMsg(data.detail || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login submission error:", error);
      setMsg("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* FAKE INPUTS: These trap the browser's automatic autofill trigger */}
          <input type="text" name="prevent_autofill" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />
          <input type="password" name="prevent_autofill_pwd" style={{ display: "none" }} aria-hidden="true" tabIndex={-1} />

          <input
            name="username"
            type="text"
            onChange={handleChange}
            value={form.username}
            placeholder="Username"
            required
            autoComplete="new-password" // Disables standard credential matching loops
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
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            Login
          </button>
        </form>

        {msg && (
          <p className={`mt-3 text-sm font-semibold ${msg.includes("successful") ? "text-green-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={() => navigate("/signup", { state: location.state })} 
            className="text-blue-600 hover:underline font-medium focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
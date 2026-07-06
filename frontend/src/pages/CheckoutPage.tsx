import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { authFetch } from "../utils/auth";

interface CheckoutFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  payment_method: string;
}

function CheckoutPage(): React.JSX.Element {
  const BASEURL = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [form, setForm] = useState<CheckoutFormData>({
    name: "",
    address: "",
    phone: "",
    email: "",
    payment_method: "COD",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Create a normalized backend payload to fulfill both naming variations
    const backendPayload = {
      ...form,
      shipping_address: form.address, // Fallback for standard Django addresses
      phone_number: form.phone,       // Fallback for phone plugins
    };

    try {
      // FIX: Standardized to /api/order/create/ (singular) to match production standards
      const res = await authFetch(`${BASEURL}/api/order/create/`, {
        method: "POST",
        body: JSON.stringify(backendPayload),
      });

      // Safely parse JSON text without throwing an unhandled exception
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "Invalid response from server" };
      }

      if (res.ok) {
        setMessage("Order Placed Successfully!");
        await clearCart(); 
        
        setTimeout(() => {
          navigate("/"); 
        }, 2000);
      } else {
        // Fallback chains to display the actual message sent by Django models
        const detailedError = data.error || data.detail || (typeof data === 'object' ? JSON.stringify(data) : "Failed to place order.");
        setMessage(detailedError);
      }
    } catch (error) {
      console.error("Detailed Debug Log:", error);
      setMessage("Connection error. Ensure your Django server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="payment_method"
            value={form.payment_method}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="COD">Cash on Delivery</option>
            <option value="CreditCard">Online Payment</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 font-semibold"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>

          {message && (
            <p className={`text-center mt-4 text-sm font-semibold ${message.includes("Successfully") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default CheckoutPage;
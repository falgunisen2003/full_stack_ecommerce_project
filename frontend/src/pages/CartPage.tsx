import React from "react";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export const CartPage: React.FC = () => {
  // Destructure state and actions from our typed cart context
  const { cartItems, total, removeFromCart, updateQuantity } = useCart();

  // Environment base URL setup for image paths
  const BASEURL = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";

  return (
    <div className="pt-24 min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      {/* Centered Shopping Cart Title */}
      <h1 className="text-3xl font-bold mb-8 text-center flex items-center gap-2 text-gray-900">
        🛒 Your Cart
      </h1>

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-sm w-full max-w-2xl">
          Your cart is empty.
        </p>
      ) : (
        /* Card container - Centered and sized exactly like the screenshot */
        <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md flex flex-col">

          {/* Cart Items List */}
          <div className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-4 items-center py-6 w-full"
              >
                {/* Column 1: Product Image */}
                <div className="col-span-1 flex items-center justify-start">
                  {item.product_image && (
                    <img
                      src={`${BASEURL}${item.product_image}`}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded-md block shadow-sm"
                    />
                  )}
                </div>

                {/* Column 2: Product Name & Price - FIXED: Increased text size and contrast */}
                <div className="col-span-2 flex flex-col justify-center select-none text-center pr-6">
                  <h2 className="text-base font-bold text-gray-800 tracking-wide">
                    {item.product_name}
                  </h2>
                  <p className="text-sm font-semibold text-gray-500 mt-1.5">
                    ${Number(item.product_price).toFixed(2)}
                  </p>
                </div>

                {/* Column 3: Quantity Controls & Remove Button */}
                <div className="col-span-1 flex items-center justify-end gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-gray-200 text-gray-700 w-8 h-8 rounded-lg font-bold hover:bg-gray-300 transition flex items-center justify-center text-base"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800 text-base">
                      {item.quantity}
                    </span>
                    <button
                      className="bg-gray-200 text-gray-700 w-8 h-8 rounded-lg font-bold hover:bg-gray-300 transition flex items-center justify-center text-base"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="text-red-500 hover:text-red-700 font-semibold text-sm transition pl-2"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Card Summary Section - FIXED: Enhanced typography to make font bold and clear */}
          <div className="border-t border-gray-300 pt-6 mt-4 grid grid-cols-4 items-center w-full">
            <h2 className="col-span-1 text-base font-extrabold text-gray-800 text-left">
              Total:
            </h2>
            
            <p className="col-span-2 text-base font-extrabold text-gray-900 text-center pr-6 tracking-wide">
              ${total.toFixed(2)}
            </p>

            <div className="col-span-1 flex justify-end">
              <Link
                to="/checkout"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition shadow-sm whitespace-nowrap"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { clearTokens, getAccessToken } from '../utils/auth';

export const Navbar: React.FC = () => {
  const { cartItems } = useCart();
  const navigate = useNavigate();

  // Compute total item count in the cart
  const cartCount: number = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Authenticate session check based on token existence
  const isLoggedIn: boolean = !!getAccessToken();

  // Handle system logout
  const handleLogout = (): void => {
    clearTokens();
    navigate('/login');
  };

  return (
    /* FIXED: Added 'sticky top-0 left-0 z-50' to keep the navbar locked at the top during scrolls */
    <nav className="bg-white shadow-md px-6 py-6 flex justify-between items-center sticky top-0 left-0 z-50">
      {/* Brand logo link */}
      <Link to="/" className="text-2xl font-bold text-gray-800">
        🛍️ ShopVerse
      </Link>

      <div className="flex items-center gap-6">
        {/* Dynamic Auth Section: Login/SignUp or Logout */}
        {!isLoggedIn ? (
          <>
            <Link to="/login" className="text-gray-800 hover:text-gray-600">
              Login
            </Link>
            <Link to="/signup" className="text-gray-800 hover:text-gray-600">
              Sign Up
            </Link>
          </>
        ) : (
          <button onClick={handleLogout} className="text-gray-800 hover:text-gray-600">
            Logout
          </button>
        )}

        {/* Cart button link with badge notifications */}
        <Link to="/cart" className="relative text-gray-800 hover:text-gray-600 font-medium">
          🛒 Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center px-1">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./pages/ProductList";
import ProductDetails from "./pages/ProductDetails";
import { Navbar } from "./components/Navbar";
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";

// Standardized import to Capital CamelCase for the React component
import PrivateRouter from "./components/PrivateRouter"; 
import Signup from "./pages/Signup";
import Login from "./pages/Login";

function App(): React.JSX.Element {
  return (
    <CartProvider>
      <Router>
        {/* Navbar sits outside Routes so it renders globally on every page layout */}
        <Navbar />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected Routes (Accessible only to authenticated users) */}
          <Route element={<PrivateRouter />}>
            <Route path="/checkout" element={<CheckoutPage />} />
          </Route>
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
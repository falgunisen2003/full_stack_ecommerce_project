import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authFetch } from "../utils/auth"; 

// Base Product definition
export interface Product {
  id: string | number;
  name: string;
  price: number;
  image?: string | null;
}

// Updated CartItem interface matching Django's response keys
export interface CartItem {
  id: string | number;         
  product: number;             
  product_name: string;        
  product_price: string | number; 
  product_image: string | null;
  quantity: number;            
}

interface CartContextType {
  cartItems: CartItem[];
  total: number; 
  addToCart: (product: Product) => void;
  removeFromCart: (itemId: string | number) => void;
  updateQuantity: (itemId: string | number, quantity: number) => void;
  clearCart: () => void; 
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const BASEURL = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<number>(0); 

  // Fetch cart data from Django API (GET)
  const fetchCart = async () => {
    try {
      const res = await authFetch(`${BASEURL}/api/cart/`);
      
      // CRITICAL GUARD: Handles failed/unauthorized requests gracefully 
      if (!res.ok) {
        throw new Error("Failed to fetch cart data");
      }

      const data = await res.json();
      
      setCartItems(data.items || []);
      setTotal(Number(data.total) || 0);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add a product to the cart (POST)
  const addToCart = async (product: Product) => {
    try {
      const response = await authFetch(`${BASEURL}/api/cart/add/`, {
        method: "POST",
        body: JSON.stringify({ product_id: product.id, quantity: 1 }),
      });
      if (response.ok) {
        await fetchCart(); 
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Remove item completely from backend cart (POST)
  const removeFromCart = async (itemId: string | number) => {
    try {
      const response = await authFetch(`${BASEURL}/api/cart/remove/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId }),
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update item quantity on the backend (POST)
  const updateQuantity = async (itemId: string | number, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      const response = await authFetch(`${BASEURL}/api/cart/update/`, {
        method: "POST",
        body: JSON.stringify({ item_id: itemId, quantity: quantity }),
      });
      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Clear all items from the cart (POST)
  const clearCart = async () => {
    try {
      setCartItems([]);
      setTotal(0);

      const response = await authFetch(`${BASEURL}/api/cart/clear/`, {
        method: "POST",
      });

      if (!response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      await fetchCart();
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, total, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
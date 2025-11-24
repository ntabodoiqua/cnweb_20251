import React, { createContext, useState, useEffect, useContext } from "react";
import { getCartApi, getCartCountApi } from "../util/api";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load cart count on mount
  useEffect(() => {
    loadCartCount();
  }, []);

  const loadCartCount = async () => {
    try {
      const response = await getCartCountApi();
      if (response && response.code === 200) {
        setCartCount(response.result || 0);
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  const refreshCart = async () => {
    try {
      setLoading(true);
      const response = await getCartApi();
      if (response && response.code === 200) {
        setCartData(response.result);
        setCartCount(response.result.totalItems || 0);
      }
    } catch (error) {
      console.error("Error refreshing cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const incrementCartCount = (amount = 1) => {
    setCartCount((prev) => prev + amount);
  };

  const decrementCartCount = (amount = 1) => {
    setCartCount((prev) => Math.max(0, prev - amount));
  };

  const resetCart = () => {
    setCartCount(0);
    setCartData(null);
  };

  const value = {
    cartCount,
    cartData,
    loading,
    loadCartCount,
    refreshCart,
    incrementCartCount,
    decrementCartCount,
    resetCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

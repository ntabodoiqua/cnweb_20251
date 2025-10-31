import { useState, useEffect } from "react";
import storageService from "../utils/storage";

/**
 * Custom hook for cart management
 */
const useCart = () => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = storageService.getCart();
    setCart(savedCart);
    updateCartStats(savedCart);
  }, []);

  // Update cart statistics
  const updateCartStats = (cartItems) => {
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCartCount(count);
    setCartTotal(total);
  };

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id
      );

      let newCart;
      if (existingItemIndex > -1) {
        // Update quantity if item already exists
        newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        newCart = [...prevCart, { ...product, quantity }];
      }

      storageService.setCart(newCart);
      updateCartStats(newCart);
      return newCart;
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId);
      storageService.setCart(newCart);
      updateCartStats(newCart);
      return newCart;
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
      storageService.setCart(newCart);
      updateCartStats(newCart);
      return newCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCartCount(0);
    setCartTotal(0);
    storageService.removeCart();
  };

  // Check if item is in cart
  const isInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  // Get item quantity
  const getItemQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  return {
    cart,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
  };
};

export default useCart;

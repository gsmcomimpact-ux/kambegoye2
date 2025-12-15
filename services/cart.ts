import { CartItem, Product } from '../types';

const CART_KEY = 'kambegoye_cart';

export const cartService = {
  getCart: (): CartItem[] => {
    try {
      const cart = localStorage.getItem(CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (e) {
      return [];
    }
  },

  addToCart: (product: Product, quantity: number = 1) => {
    const cart = cartService.getCart();
    const existingIndex = cart.findIndex(item => item.product.id === product.id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  },

  updateQuantity: (productId: string, quantity: number) => {
    let cart = cartService.getCart();
    const index = cart.findIndex(item => item.product.id === productId);

    if (index >= 0) {
      if (quantity <= 0) {
        cart = cart.filter(item => item.product.id !== productId);
      } else {
        cart[index].quantity = quantity;
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    }
  },

  removeFromCart: (productId: string) => {
    let cart = cartService.getCart();
    cart = cart.filter(item => item.product.id !== productId);
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  },

  clearCart: () => {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cart-updated'));
  },

  getTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  },

  getCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  }
};
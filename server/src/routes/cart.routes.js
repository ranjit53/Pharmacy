import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getWholesaleCart,
  addToWholesaleCart,
  updateWholesaleCartItem,
  removeFromWholesaleCart,
} from '../controllers/cart.controller.js';
import { protect, wholesale } from '../middleware/auth.middleware.js';

const router = express.Router();

// Customer cart routes
router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:itemId', protect, updateCartItem);
router.delete('/:itemId', protect, removeFromCart);
router.delete('/', protect, clearCart);

// Wholesale cart routes
router.get('/wholesale', protect, wholesale, getWholesaleCart);
router.post('/wholesale', protect, wholesale, addToWholesaleCart);
router.put('/wholesale/:itemId', protect, wholesale, updateWholesaleCartItem);
router.delete('/wholesale/:itemId', protect, wholesale, removeFromWholesaleCart);

export default router;


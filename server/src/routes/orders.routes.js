import express from 'express';
import {
  createOrder,
  initiatePayment,
  verifyPaymentAndUpdateOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  createWholesaleOrder,
  approveWholesaleOrder,
  getMyWholesaleOrders,
  getAllWholesaleOrders,
} from '../controllers/order.controller.js';
import { protect, admin, wholesale } from '../middleware/auth.middleware.js';

const router = express.Router();

// Customer order routes
router.post('/', protect, createOrder);
router.post('/:id/initiate-payment', protect, initiatePayment);
router.post('/:id/verify-payment', protect, verifyPaymentAndUpdateOrder);
router.get('/', protect, getMyOrders);
router.get('/:id', protect, getOrder);

// Admin order routes
router.get('/admin/all', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

// Wholesale order routes
router.post('/wholesale', protect, wholesale, createWholesaleOrder);
router.get('/wholesale', protect, wholesale, getMyWholesaleOrders);
router.get('/wholesale/admin/all', protect, admin, getAllWholesaleOrders);
router.put('/wholesale/:id/approve', protect, admin, approveWholesaleOrder);

export default router;


import express from 'express';
import {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllCoupons,
} from '../controllers/coupon.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getCoupons);
router.get('/:code', getCoupon);
router.get('/admin/all', protect, admin, getAllCoupons);

router.post('/', protect, admin, createCoupon);

router.put('/:id', protect, admin, updateCoupon);

router.delete('/:id', protect, admin, deleteCoupon);

export default router;


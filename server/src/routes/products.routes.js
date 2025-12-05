import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getWholesaleProducts,
  createWholesaleProduct,
} from '../controllers/product.controller.js';
import { protect, admin, wholesale } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProduct);
router.get('/wholesale/list', protect, wholesale, getWholesaleProducts);

router.post('/', protect, admin, createProduct);
router.post('/wholesale', protect, admin, createWholesaleProduct);

router.put('/:id', protect, admin, updateProduct);

router.delete('/:id', protect, admin, deleteProduct);

export default router;


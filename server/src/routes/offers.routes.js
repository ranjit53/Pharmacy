import express from 'express';
import {
  getOffers,
  getFestivalOffers,
  getOffer,
  createOffer,
  updateOffer,
  deleteOffer,
  getAllOffers,
} from '../controllers/offer.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getOffers);
router.get('/festival', getFestivalOffers);
router.get('/:id', getOffer);
router.get('/admin/all', protect, admin, getAllOffers);

router.post('/', protect, admin, createOffer);

router.put('/:id', protect, admin, updateOffer);

router.delete('/:id', protect, admin, deleteOffer);

export default router;


import mongoose from 'mongoose';

const wholesaleProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    minQuantity: {
      type: Number,
      required: [true, 'Please provide minimum quantity'],
      min: 1,
    },
    bulkDiscount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
wholesaleProductSchema.index({ productId: 1 });
wholesaleProductSchema.index({ isActive: 1 });

const WholesaleProduct = mongoose.model('WholesaleProduct', wholesaleProductSchema);

export default WholesaleProduct;


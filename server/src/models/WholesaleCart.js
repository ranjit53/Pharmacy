import mongoose from 'mongoose';

const wholesaleCartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        price: Number,
        wholesalePrice: Number,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        image: String,
        minQuantity: Number,
      },
    ],
    totalAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index
wholesaleCartSchema.index({ userId: 1 });

const WholesaleCart = mongoose.model('WholesaleCart', wholesaleCartSchema);

export default WholesaleCart;


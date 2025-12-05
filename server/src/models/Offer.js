import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an offer title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an offer description'],
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Please provide discount value'],
      min: 0,
    },
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    applicableCategories: [String],
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFestivalOffer: {
      type: Boolean,
      default: false,
    },
    bannerImage: {
      url: String,
      publicId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
offerSchema.index({ isActive: 1 });
offerSchema.index({ isFestivalOffer: 1 });
offerSchema.index({ validFrom: 1, validTo: 1 });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;


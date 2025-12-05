import Order from '../models/Order.js';
import WholesaleOrder from '../models/WholesaleOrder.js';
import Cart from '../models/Cart.js';
import WholesaleCart from '../models/WholesaleCart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { createOrder as createPaymentOrder, verifyPayment } from '../services/payment.service.js';
import {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentSlip,
} from '../services/email.service.js';
import User from '../models/User.js';
import crypto from 'crypto';

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, paymentMethod = 'esewa', couponCode } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    let discountAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} is not available`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
      totalAmount += item.price * item.quantity;
    }

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        applicableTo: { $in: ['all', 'customer'] },
      });

      if (coupon && totalAmount >= coupon.minPurchase) {
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }

        if (coupon.discountType === 'percentage') {
          discountAmount = (totalAmount * coupon.discountValue) / 100;
          if (coupon.maxDiscount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscount);
          }
        } else {
          discountAmount = coupon.discountValue;
        }
        discountAmount = Math.min(discountAmount, totalAmount);
      }
    }

    const finalAmount = totalAmount - discountAmount;

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: cart.items,
      totalAmount: finalAmount,
      discountAmount,
      couponCode: couponCode || undefined,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    // Update coupon usage
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // Create payment order if online payment
    let paymentOrder = null;
    if (paymentMethod === 'esewa' || paymentMethod === 'khalti') {
      const paymentResult = await createPaymentOrder(
        finalAmount,
        paymentMethod,
        order._id.toString(),
        `Order ${order._id}`
      );
      if (paymentResult.success) {
        paymentOrder = paymentResult.order;
        order.paymentMethod = paymentMethod;
        await order.save();
      }
    }

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Send confirmation email
    const user = await User.findById(req.user._id);
    await sendOrderConfirmation(user.email, order);

    res.status(201).json({
      success: true,
      data: order,
      paymentOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate payment
// @route   POST /api/orders/:id/initiate-payment
// @access  Private
export const initiatePayment = async (req, res, next) => {
  try {
    const { paymentMethod = 'esewa' } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid' });
    }

    const paymentResult = await createPaymentOrder(
      order.totalAmount,
      paymentMethod,
      order._id.toString(),
      `Order ${order._id}`
    );

    if (paymentResult.success) {
      order.paymentMethod = paymentMethod;
      await order.save();

      res.status(200).json({
        success: true,
        paymentOrder: paymentResult,
      });
    } else {
      res.status(400).json({
        success: false,
        message: paymentResult.error || 'Failed to initiate payment',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment and update order
// @route   POST /api/orders/:id/verify-payment
// @access  Private
export const verifyPaymentAndUpdateOrder = async (req, res, next) => {
  try {
    const { paymentMethod, verificationData } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const verification = await verifyPayment(paymentMethod || order.paymentMethod, verificationData);

    if (verification.verified) {
      order.paymentStatus = 'paid';
      order.paymentId = verification.paymentId;
      order.status = 'approved';

      // Update stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      await order.save();

      // Send payment slip
      const user = await User.findById(req.user._id);
      await sendPaymentSlip(user.email, order, {
        paymentId: verification.paymentId,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed',
        data: order,
      });
    } else {
      order.paymentStatus = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: verification.error || 'Payment verification failed',
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (notes) order.notes = notes;

    // Add location update if provided
    if (req.body.location) {
      order.locationUpdates.push({
        location: req.body.location,
        status,
        timestamp: new Date(),
      });
    }

    await order.save();

    // Send status update email
    const user = await User.findById(order.userId);
    await sendOrderStatusUpdate(user.email, order);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create wholesale order
// @route   POST /api/orders/wholesale
// @access  Private/Wholesale
export const createWholesaleOrder = async (req, res, next) => {
  try {
    const { shippingAddress, notes } = req.body;

    const cart = await WholesaleCart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name} is not available`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}`,
        });
      }
      totalAmount += (item.wholesalePrice || item.price) * item.quantity;
    }

    // Create wholesale order
    const order = await WholesaleOrder.create({
      userId: req.user._id,
      items: cart.items,
      totalAmount,
      shippingAddress,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // Send confirmation email
    const user = await User.findById(req.user._id);
    await sendOrderConfirmation(user.email, order);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject wholesale order (Admin)
// @route   PUT /api/orders/wholesale/:id/approve
// @access  Private/Admin
export const approveWholesaleOrder = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' or 'reject'

    const order = await WholesaleOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (action === 'approve') {
      order.status = 'approved';
      order.adminApproval = {
        approved: true,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      };

      // Update stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    } else if (action === 'reject') {
      order.status = 'rejected';
      order.rejectionReason = rejectionReason || 'Order rejected by admin';
      order.adminApproval = {
        approved: false,
        approvedBy: req.user._id,
        approvedAt: new Date(),
      };
    }

    await order.save();

    // Send status update email
    const user = await User.findById(order.userId);
    await sendOrderStatusUpdate(user.email, order);

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wholesale orders
// @route   GET /api/orders/wholesale
// @access  Private/Wholesale
export const getMyWholesaleOrders = async (req, res, next) => {
  try {
    const orders = await WholesaleOrder.find({ userId: req.user._id })
      .populate('items.productId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all wholesale orders (Admin)
// @route   GET /api/orders/wholesale/admin/all
// @access  Private/Admin
export const getAllWholesaleOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await WholesaleOrder.find(query)
      .populate('userId', 'name email')
      .populate('items.productId')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit));

    const total = await WholesaleOrder.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

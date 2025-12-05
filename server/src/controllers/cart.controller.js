import Cart from '../models/Cart.js';
import WholesaleCart from '../models/WholesaleCart.js';
import Product from '../models/Product.js';
import WholesaleProduct from '../models/WholesaleProduct.js';

// @desc    Get customer cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0]?.url || '',
      });
    }

    // Calculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.productId);
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    item.quantity = quantity;

    // Calculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Calculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wholesale cart
// @route   GET /api/cart/wholesale
// @access  Private/Wholesale
export const getWholesaleCart = async (req, res, next) => {
  try {
    let cart = await WholesaleCart.findOne({ userId: req.user._id }).populate('items.productId');

    if (!cart) {
      cart = await WholesaleCart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to wholesale cart
// @route   POST /api/cart/wholesale
// @access  Private/Wholesale
export const addToWholesaleCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const wholesaleProduct = await WholesaleProduct.findOne({
      productId,
      isActive: true,
    }).populate('productId');

    if (!wholesaleProduct) {
      return res.status(404).json({ success: false, message: 'Wholesale product not found' });
    }

    if (quantity < wholesaleProduct.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum quantity required: ${wholesaleProduct.minQuantity}`,
      });
    }

    const product = wholesaleProduct.productId;
    if (product.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    let cart = await WholesaleCart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await WholesaleCart.create({ userId: req.user._id, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    const wholesalePrice = product.wholesalePrice || product.price;

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId,
        name: product.name,
        price: product.price,
        wholesalePrice,
        quantity,
        image: product.images[0]?.url || '',
        minQuantity: wholesaleProduct.minQuantity,
      });
    }

    // Calculate total with wholesale pricing
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.wholesalePrice || item.price) * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update wholesale cart item
// @route   PUT /api/cart/wholesale/:itemId
// @access  Private/Wholesale
export const updateWholesaleCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await WholesaleCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity < item.minQuantity) {
      return res.status(400).json({
        success: false,
        message: `Minimum quantity required: ${item.minQuantity}`,
      });
    }

    item.quantity = quantity;

    // Calculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.wholesalePrice || item.price) * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from wholesale cart
// @route   DELETE /api/cart/wholesale/:itemId
// @access  Private/Wholesale
export const removeFromWholesaleCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const cart = await WholesaleCart.findOne({ userId: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);

    // Calculate total
    cart.totalAmount = cart.items.reduce(
      (total, item) => total + (item.wholesalePrice || item.price) * item.quantity,
      0
    );

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};


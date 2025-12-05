import crypto from 'crypto';
import axios from 'axios';

// eSewa Payment Integration
export const createEsewaOrder = async (amount, orderId, productName = 'Order Payment') => {
  try {
    const esewaConfig = {
      amount: amount.toFixed(2),
      tax_amount: '0',
      total_amount: amount.toFixed(2),
      transaction_uuid: orderId,
      product_code: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST', // Use 'EPAYTEST' for test, actual product code for production
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
      failure_url: `${process.env.FRONTEND_URL}/payment/failure?orderId=${orderId}`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
    };

    // Generate signature for eSewa
    const message = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
    const secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
    const signature = crypto
      .createHash('sha256')
      .update(message + secretKey)
      .digest('base64');

    return {
      success: true,
      paymentMethod: 'esewa',
      order: {
        ...esewaConfig,
        signature,
        esewaUrl: process.env.ESEWA_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      },
    };
  } catch (error) {
    console.error('Error creating eSewa order:', error);
    return { success: false, error: error.message };
  }
};

// Khalti Payment Integration
export const createKhaltiOrder = async (amount, orderId, productName = 'Order Payment') => {
  try {
    const khaltiConfig = {
      return_url: `${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      amount: Math.round(amount * 100), // Convert to paisa
      purchase_order_id: orderId,
      purchase_order_name: productName,
    };

    // Make API call to Khalti
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/initiate/',
      khaltiConfig,
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      paymentMethod: 'khalti',
      order: response.data,
    };
  } catch (error) {
    console.error('Error creating Khalti order:', error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

// Verify eSewa Payment
export const verifyEsewaPayment = async (data) => {
  try {
    const { amount, referenceId, transactionCode, status } = data;

    // Verify with eSewa API
    const verifyUrl = process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';
    const response = await axios.get(verifyUrl, {
      params: {
        product_code: 'EPAYTEST',
        total_amount: amount,
        transaction_uuid: referenceId,
      },
    });

    if (response.data.status === 'COMPLETE' && status === 'COMPLETE') {
      return {
        success: true,
        verified: true,
        paymentId: transactionCode || referenceId,
      };
    }

    return { success: false, verified: false, error: 'Payment verification failed' };
  } catch (error) {
    console.error('Error verifying eSewa payment:', error);
    return { success: false, verified: false, error: error.message };
  }
};

// Verify Khalti Payment
export const verifyKhaltiPayment = async (pidx) => {
  try {
    const response = await axios.post(
      'https://a.khalti.com/api/v2/epayment/lookup/',
      { pidx },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.status === 'Completed') {
      return {
        success: true,
        verified: true,
        paymentId: pidx,
        amount: response.data.total_amount / 100, // Convert from paisa to NRS
      };
    }

    return { success: false, verified: false, error: 'Payment not completed' };
  } catch (error) {
    console.error('Error verifying Khalti payment:', error);
    return { success: false, verified: false, error: error.message };
  }
};

// Create payment order (supports both eSewa and Khalti)
export const createOrder = async (amount, paymentMethod = 'esewa', orderId, productName) => {
  if (paymentMethod === 'khalti') {
    return await createKhaltiOrder(amount, orderId, productName);
  } else {
    return await createEsewaOrder(amount, orderId, productName);
  }
};

// Verify payment (supports both eSewa and Khalti)
export const verifyPayment = async (paymentMethod, verificationData) => {
  if (paymentMethod === 'khalti') {
    return await verifyKhaltiPayment(verificationData.pidx);
  } else {
    return await verifyEsewaPayment(verificationData);
  }
};

// Refund payment (if supported by payment gateway)
export const refundPayment = async (paymentMethod, paymentId, amount) => {
  try {
    // Khalti refund
    if (paymentMethod === 'khalti') {
      const response = await axios.post(
        'https://a.khalti.com/api/v2/epayment/refund/',
        {
          pidx: paymentId,
          amount: Math.round(amount * 100), // Convert to paisa
          remarks: 'Order refund',
        },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return { success: true, refund: response.data };
    }

    // eSewa refund (if API available)
    // Note: eSewa refund API may vary, implement based on their documentation
    return { success: false, error: 'Refund not supported for this payment method' };
  } catch (error) {
    console.error('Error processing refund:', error);
    return { success: false, error: error.message };
  }
};


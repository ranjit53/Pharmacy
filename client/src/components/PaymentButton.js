'use client';

import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PaymentButton({ order, paymentMethod = 'esewa' }) {
  const [loading, setLoading] = useState(false);

  const handleEsewaPayment = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      // Get payment order from backend
      const response = await axios.post(
        `${API_URL}/orders/${order._id}/initiate-payment`,
        { paymentMethod: 'esewa' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.paymentOrder) {
        const paymentData = response.data.paymentOrder.order;
        
        // Create form and submit to eSewa
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.esewaUrl || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
        
        Object.keys(paymentData).forEach((key) => {
          if (key !== 'esewaUrl') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = paymentData[key];
            form.appendChild(input);
          }
        });
        
        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.error('Error initiating eSewa payment:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKhaltiPayment = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      
      // Get payment order from backend
      const response = await axios.post(
        `${API_URL}/orders/${order._id}/initiate-payment`,
        { paymentMethod: 'khalti' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success && response.data.paymentOrder) {
        const paymentUrl = response.data.paymentOrder.order.payment_url;
        
        // Redirect to Khalti payment page
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error('Error initiating Khalti payment:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={handleEsewaPayment}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay with eSewa'}
      </button>
      <button
        onClick={handleKhaltiPayment}
        disabled={loading}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Pay with Khalti'}
      </button>
    </div>
  );
}


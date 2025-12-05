'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    }
  }, [orderId]);

  const verifyPayment = async () => {
    try {
      const token = Cookies.get('token');
      
      // Get payment data from URL params
      const data = {};
      searchParams.forEach((value, key) => {
        data[key] = value;
      });

      // Determine payment method from data
      const paymentMethod = data.pidx ? 'khalti' : 'esewa';

      const verificationData = paymentMethod === 'khalti' 
        ? { pidx: data.pidx }
        : {
            amount: data.total_amount,
            referenceId: data.transaction_uuid,
            transactionCode: data.transaction_code,
            status: data.status,
          };

      const response = await axios.post(
        `${API_URL}/orders/${orderId}/verify-payment`,
        {
          paymentMethod,
          verificationData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess(true);
      } else {
        setSuccess(false);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setSuccess(false);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Verifying payment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {success ? (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your payment has been verified and your order is confirmed.
            </p>
            <Link
              href={`/customer/orders/${orderId}`}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-block"
            >
              View Order
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
            <p className="text-gray-600 mb-6">
              We couldn't verify your payment. Please contact support if you were charged.
            </p>
            <Link
              href="/customer/orders"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 inline-block"
            >
              View Orders
            </Link>
          </>
        )}
      </div>
    </div>
  );
}


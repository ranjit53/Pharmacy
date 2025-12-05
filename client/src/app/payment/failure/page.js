'use client';

import Link from 'next/link';

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          Your payment could not be processed. Please try again or use a different payment method.
        </p>
        <Link
          href="/customer"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 inline-block"
        >
          Back to Store
        </Link>
      </div>
    </div>
  );
}


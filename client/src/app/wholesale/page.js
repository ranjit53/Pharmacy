'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function WholesalePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = Cookies.get('token');
      const response = await axios.get(`${API_URL}/products/wholesale/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wholesale products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Wholesale Portal
          </Link>
          <div className="flex gap-4">
            <Link href="/wholesale/cart" className="text-gray-700 hover:text-blue-600">
              Cart
            </Link>
            <Link href="/wholesale/orders" className="text-gray-700 hover:text-blue-600">
              Orders
            </Link>
            <Link href="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Wholesale Products</h1>
        <p className="text-gray-600 mb-6">
          Browse our wholesale catalog. Minimum quantities apply for bulk pricing.
        </p>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No wholesale products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((wholesaleProduct) => {
              const product = wholesaleProduct.productId;
              if (!product) return null;

              return (
                <div key={wholesaleProduct._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {product.images && product.images[0] && (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">
                        Min. Quantity: <span className="font-bold">{wholesaleProduct.minQuantity}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Bulk Discount: <span className="font-bold">{wholesaleProduct.bulkDiscount}%</span>
                      </p>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-500 line-through">NRS {product.price}</p>
                        <span className="text-green-600 font-bold">
                          NRS {product.wholesalePrice || product.price}
                        </span>
                      </div>
                      <Link
                        href={`/wholesale/products/${product._id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


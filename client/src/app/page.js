import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Pharmacy Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your complete e-commerce solution for pharmacy products
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/customer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition"
            >
              Customer Store
            </Link>
            <Link
              href="/wholesale"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Wholesale
            </Link>
            <Link
              href="/admin"
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}


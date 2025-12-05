# Pharmacy E-commerce Platform

A complete pharmacy e-commerce platform with admin panel, customer store, and wholesale module.

## Features

### Customer Module
- User registration and email verification (OTP)
- Browse products by category
- Shopping cart management
- Order placement and tracking
- Online payment integration (eSewa/Khalti)
- Order status notifications via email

### Wholesale Module
- Wholesale buyer registration
- Bulk product catalog
- Minimum quantity requirements
- Special wholesale pricing
- Order approval workflow
- Bulk order management

### Admin Panel
- Dashboard with analytics
- Product management (CRUD)
- Wholesale product management
- Order management and approval
- Coupon and offer management
- User management
- Sales analytics

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- eSewa/Khalti payment integration
- Nodemailer for email automation
- PDF generation for payment slips

### Frontend
- Next.js 14 (App Router)
- React 18
- Redux Toolkit for state management
- TailwindCSS for styling
- Axios for API calls

## Project Structure

```
pharma/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # React components
│   │   ├── store/         # Redux store and slices
│   │   └── services/      # API services
│   └── package.json
├── server/                 # Express.js backend
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # MongoDB models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in server directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/pharma_db
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
# eSewa Payment Configuration
ESEWA_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFY_URL=https://rc-epay.esewa.com.np/api/epay/transaction/status/
ESEWA_PRODUCT_CODE=EPAYTEST

# Khalti Payment Configuration
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key
FRONTEND_URL=http://localhost:3000
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file in client directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/categories` - Get all categories
- `GET /api/products/wholesale/list` - Get wholesale products

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `POST /api/orders/:id/verify-payment` - Verify payment
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Wholesale Orders
- `POST /api/orders/wholesale` - Create wholesale order
- `GET /api/orders/wholesale` - Get user wholesale orders
- `PUT /api/orders/wholesale/:id/approve` - Approve/reject order (Admin)
- `GET /api/orders/wholesale/admin/all` - Get all wholesale orders (Admin)

### Coupons
- `GET /api/coupons` - Get active coupons
- `GET /api/coupons/:code` - Get coupon by code
- `POST /api/coupons` - Create coupon (Admin)
- `PUT /api/coupons/:id` - Update coupon (Admin)
- `DELETE /api/coupons/:id` - Delete coupon (Admin)

### Offers
- `GET /api/offers` - Get active offers
- `GET /api/offers/festival` - Get festival offers
- `POST /api/offers` - Create offer (Admin)
- `PUT /api/offers/:id` - Update offer (Admin)
- `DELETE /api/offers/:id` - Delete offer (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## Database Models

- **User** - User accounts (admin, customer, wholesale)
- **Product** - Product catalog
- **WholesaleProduct** - Wholesale product configurations
- **Order** - Customer orders
- **WholesaleOrder** - Wholesale orders
- **Cart** - Customer shopping cart
- **WholesaleCart** - Wholesale shopping cart
- **Coupon** - Discount coupons
- **Offer** - Special offers and promotions

## Email Automation

The platform automatically sends emails for:
- Email verification (OTP)
- Password reset
- Order confirmation
- Order status updates
- Payment receipts

## Payment Integration

Integrated with eSewa and Khalti for online payments (Nepal's popular payment gateways). The platform supports:
- Online payment via eSewa
- Online payment via Khalti
- Payment verification for both gateways
- Payment slip generation (PDF)
- Refund processing (Khalti)
- Currency: Nepalese Rupees (NRS)

## Deployment

### Quick Deploy to Vercel

This project is configured for easy deployment to Vercel. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

#### Quick Steps:

1. **Set up MongoDB Atlas:**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get connection string
   - Configure network access (allow 0.0.0.0/0 for Vercel)

2. **Deploy to Vercel:**
   - Import GitHub repository to Vercel
   - Configure environment variables (see DEPLOYMENT.md)
   - Deploy!

3. **Environment Variables:**
   - Add all variables from `.env.example` to Vercel
   - Use MongoDB Atlas connection string
   - Configure payment gateway credentials

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Database: MongoDB Atlas

The application uses MongoDB Atlas (cloud database):
- Free tier available
- Automatic backups
- Global distribution
- Easy scaling

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/pharma_db?retryWrites=true&w=majority
```

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.


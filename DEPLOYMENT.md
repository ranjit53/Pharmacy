# Deployment Guide

This guide covers deploying the Pharmacy E-commerce Platform to Vercel.

## Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account (for database)
4. eSewa/Khalti merchant accounts (for payments)

## Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or log in
3. Create a new cluster (Free tier available)
4. Choose a cloud provider and region
5. Create cluster

### Step 2: Configure Database Access

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create username and password (save these securely)
5. Set user privileges to **Read and write to any database**
6. Click **Add User**

### Step 3: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For Vercel deployment, click **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Confirm**

### Step 4: Get Connection String

1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with your database name (e.g., `pharma_db`)

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pharma_db?retryWrites=true&w=majority
```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Import Project

1. Go to https://vercel.com/dashboard
2. Click **Add New Project**
3. Import your GitHub repository
4. Select the repository

#### Step 2: Configure Project Settings

**Root Directory:** Leave as default (or set to project root)

**Framework Preset:** 
- For client: Next.js
- For server: Other (Node.js)

**Build Settings:**

For **Client** (if deploying separately):
- Framework Preset: Next.js
- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

For **Server** (if deploying separately):
- Framework Preset: Other
- Root Directory: `server`
- Build Command: (leave empty or `npm install`)
- Output Directory: (leave empty)
- Install Command: `npm install`

#### Step 3: Configure Environment Variables

Add the following environment variables in Vercel:

**Client Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app/api
```

**Server Environment Variables:**
```
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/pharma_db?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_production
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_production
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@pharma.com

# eSewa Payment Configuration
ESEWA_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_VERIFY_URL=https://rc-epay.esewa.com.np/api/epay/transaction/status/
ESEWA_PRODUCT_CODE=your_esewa_product_code
ESEWA_SECRET_KEY=your_esewa_secret_key

# Khalti Payment Configuration
KHALTI_SECRET_KEY=your_khalti_secret_key
KHALTI_PUBLIC_KEY=your_khalti_public_key

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.vercel.app

# Google Maps API (optional)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

#### Step 4: Deploy

1. Click **Deploy**
2. Wait for deployment to complete
3. Your app will be live at the provided Vercel URL

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy client:
```bash
cd client
vercel
```

4. Deploy server:
```bash
cd server
vercel
```

5. Link projects:
```bash
vercel link
```

## Deployment Architecture

### Recommended Setup: Separate Deployments

1. **Client (Frontend)** - Deploy as Next.js app
   - URL: `https://pharma-client.vercel.app`
   - Environment: `NEXT_PUBLIC_API_URL=https://pharma-api.vercel.app/api`

2. **Server (Backend)** - Deploy as Node.js serverless function
   - URL: `https://pharma-api.vercel.app`
   - Environment: All server environment variables

### Alternative: Monorepo Deployment

If deploying as monorepo:
- Use the root `vercel.json` configuration
- Vercel will handle routing automatically

## Post-Deployment Steps

### 1. Update CORS Settings

In your server code, ensure CORS allows your frontend domain:
```javascript
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'https://your-frontend.vercel.app',
    credentials: true,
  })
);
```

### 2. Update Payment Gateway URLs

Update success/failure URLs in payment service:
- eSewa: Update `success_url` and `failure_url` to your production domain
- Khalti: Update `return_url` and `website_url` to your production domain

### 3. Test Deployment

1. Test user registration and email verification
2. Test product browsing
3. Test cart functionality
4. Test payment flow (use test credentials)
5. Test order tracking

### 4. Set Up Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Configure DNS records as instructed

## Environment Variables Management

### For Production

Use Vercel's environment variable management:
1. Go to Project Settings → Environment Variables
2. Add variables for Production, Preview, and Development
3. Use different values for each environment

### Security Best Practices

1. Never commit `.env` files to GitHub
2. Use strong, unique secrets for production
3. Rotate secrets regularly
4. Use Vercel's environment variable encryption
5. Limit database access to specific IPs when possible

## Monitoring and Logs

### Vercel Logs

1. Go to your project dashboard
2. Click on **Deployments**
3. Click on a deployment to view logs
4. Use **Functions** tab to see serverless function logs

### MongoDB Atlas Monitoring

1. Go to MongoDB Atlas dashboard
2. Monitor database performance
3. Set up alerts for unusual activity
4. Review connection metrics

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB Atlas network access settings
   - Verify connection string is correct
   - Ensure database user has proper permissions

2. **CORS Errors**
   - Verify FRONTEND_URL matches your actual frontend domain
   - Check CORS configuration in server code

3. **Payment Gateway Issues**
   - Verify payment gateway credentials
   - Check success/failure URLs are correct
   - Ensure using production credentials (not test)

4. **Build Failures**
   - Check build logs in Vercel
   - Verify all dependencies are in package.json
   - Ensure Node.js version is compatible

## Continuous Deployment

The included GitHub Actions workflow (`/.github/workflows/deploy.yml`) enables:
- Automatic deployment on push to main branch
- Preview deployments for pull requests
- Build verification before deployment

To enable:
1. Add Vercel secrets to GitHub:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `NEXT_PUBLIC_API_URL`

2. Go to GitHub repository → Settings → Secrets → Actions
3. Add the required secrets
4. Push to main branch to trigger deployment

## Support

For issues:
- Check Vercel documentation: https://vercel.com/docs
- Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com
- Review application logs in Vercel dashboard


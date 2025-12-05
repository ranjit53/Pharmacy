# Quick Start Guide

Get your Pharmacy E-commerce Platform up and running in minutes!

## Option 1: Deploy to Vercel (5 minutes) ⚡

### Step 1: Set up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create a cluster (Free tier M0)
4. Create database user (Database Access → Add New User)
5. Whitelist IP: Add `0.0.0.0/0` (Network Access → Add IP Address)
6. Get connection string: Click "Connect" → "Connect your application"
7. Copy the connection string and replace `<password>` with your password

### Step 2: Deploy to Vercel

1. **Fork this repository** on GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Other (for monorepo) or Next.js (for client only)
   - **Root Directory:** Leave default or set to project root

5. **Add Environment Variables:**

   **For Client:**
   ```
   NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app/api
   ```

   **For Server:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pharma_db?retryWrites=true&w=majority
   JWT_SECRET=your_random_secret_key_here
   JWT_REFRESH_SECRET=your_random_refresh_secret_here
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ESEWA_PRODUCT_CODE=EPAYTEST
   ESEWA_SECRET_KEY=your_esewa_secret
   KHALTI_SECRET_KEY=your_khalti_secret
   KHALTI_PUBLIC_KEY=your_khalti_public_key
   ```

6. Click **Deploy**
7. Wait for deployment to complete
8. Your app is live! 🎉

### Step 3: Update API URL

After deployment:
1. Get your server URL from Vercel (e.g., `https://pharma-api.vercel.app`)
2. Update client environment variable:
   - Go to Vercel project settings
   - Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to `https://your-server-url.vercel.app/api`
3. Redeploy client

## Option 2: Local Development

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Setup

1. **Clone repository:**
```bash
git clone https://github.com/yourusername/pharma.git
cd pharma
```

2. **Install dependencies:**
```bash
npm run install:all
```

3. **Set up MongoDB:**
   - Option A: Use MongoDB Atlas (see Step 1 above)
   - Option B: Install MongoDB locally

4. **Configure environment:**

   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pharma_db
   JWT_SECRET=your_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   FRONTEND_URL=http://localhost:3000
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

5. **Start servers:**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

6. **Open browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## Next Steps

1. **Create Admin User:**
   - Register a new user
   - Manually update role to `admin` in MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

2. **Add Products:**
   - Login as admin
   - Go to admin panel
   - Add products

3. **Configure Payments:**
   - Get eSewa/Khalti merchant credentials
   - Update environment variables
   - Test with test credentials first

4. **Set up Email:**
   - For Gmail: Use App Password
   - Enable 2FA on Gmail
   - Generate App Password
   - Use it in `EMAIL_PASS`

## Troubleshooting

### Database Connection Failed
- Check MongoDB Atlas network access (allow 0.0.0.0/0)
- Verify connection string is correct
- Check username/password

### CORS Errors
- Verify `FRONTEND_URL` matches your frontend domain
- Check CORS configuration in `server/src/app.js`

### Build Failures
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check build logs in Vercel

## Support

- 📖 Full documentation: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions


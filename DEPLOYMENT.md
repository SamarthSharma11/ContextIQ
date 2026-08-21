# ContextIQ — Production Deployment & Launch Guide 🚀

This document outlines the complete staging and production deployment process for ContextIQ across Railway (Backend API), Vercel (Frontend Dashboard & Widget), MongoDB Atlas, Pinecone, and Stripe.

---

## 1. Environment Variables Matrix

| Variable | Description | Example (Production) |
|---|---|---|
| `NODE_ENV` | Environment flag | `production` |
| `PORT` | HTTP Server port | `5000` |
| `CLIENT_URL` | Frontend Dashboard Origin | `https://app.contextiq.ai` |
| `MONGODB_URI` | MongoDB Atlas cluster connection URI | `mongodb+srv://.../contextiq` |
| `GEMINI_API_KEY` | Google AI Studio Gemini API Key | `AIzaSy...` |
| `PINECONE_API_KEY` | Pinecone API key | `pcsk_...` |
| `PINECONE_INDEX` | Shared Pinecone serverless index | `contextiq` |
| `JWT_SECRET` | 32+ character cryptographic secret | *(Generate random 32-char string)* |
| `STRIPE_SECRET_KEY` | Stripe Secret Key (Live or Test mode) | `sk_live_...` / `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET`| Stripe Webhook Signing Secret | `whsec_...` |
| `REDIS_URL` | Redis URL for caching & distributed rate limiting | `redis://default:...@redis.railway.internal:6379` |

---

## 2. Backend Deployment on Railway

1. **Link Repository**:
   - In Railway dashboard, click **New Project** → **Deploy from GitHub repo** → select `ContextIQ`.
2. **Configure Dockerfile**:
   - Set Root Directory to `/` and Dockerfile Path to `server/Dockerfile` (defined in `railway.json`).
3. **Add Environment Variables**:
   - Add all variables listed in the matrix above under the **Variables** tab.
4. **Health Check & Auto-Scaling**:
   - Healthcheck Path: `/health`
   - Auto-scaling: Configure 2+ replicas on CPU/Memory thresholds.

---

## 3. Frontend Deployment on Vercel

1. **Import Repository**:
   - In Vercel, click **Add New Project** → Import `ContextIQ`.
   - Set Root Directory to `client`.
2. **Build Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: `https://api.contextiq.ai` (or Railway API URL).

---

## 4. Stripe Webhook Configuration

1. In Stripe Dashboard → **Developers** → **Webhooks** → **Add Endpoint**:
   - Endpoint URL: `https://<your-backend-domain>/api/billing/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
2. Copy the **Signing Secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` on Railway.

---

## 5. Pre-Launch Verification Checklist

- [x] Run automated test suite: `cd server && npm test`
- [x] Run load test benchmark: `cd server && npx ts-node-dev src/tests/load_test.ts`
- [x] Verify Pinecone 1536-dimension index is online
- [x] Confirm MongoDB Atlas IP access list allows `0.0.0.0/0` or hosting provider IPs
- [x] Test end-to-end signup → knowledge ingestion → grounded chat answer

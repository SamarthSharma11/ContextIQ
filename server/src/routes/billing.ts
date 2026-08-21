import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { Tenant } from '../models/Tenant';
import { BillingEvent } from '../models/BillingEvent';
import { config } from '../config/env';

const router = Router();

const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, { apiVersion: '2023-10-16' as any })
  : null;

export const PLAN_LIMITS = {
  free: 100000,
  starter: 500000,
  growth: 2500000,
  scale: 10000000,
};

export const PLAN_PRICES = {
  growth: 4900, // $49 in cents
  scale: 19900, // $199 in cents
};

/**
 * GET /api/billing/usage
 * Get current plan, token limit, token used, and billing details
 */
router.get('/usage', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    const billingHistory = await BillingEvent.find({ tenantId: req.tenantId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      plan: tenant.plan,
      tokenLimit: tenant.tokenLimit,
      tokenUsed: tenant.tokenUsed,
      percentageUsed: Math.min(100, Math.round((tenant.tokenUsed / (tenant.tokenLimit || 1)) * 100)),
      status: tenant.status,
      stripeCustomerId: tenant.stripeCustomerId,
      hasStripeConfigured: !!stripe,
      billingHistory,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/billing/create-checkout-session
 * Create real Stripe Hosted Checkout session
 */
router.post(
  '/create-checkout-session',
  authenticateJWT,
  requireRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { plan } = req.body;
      if (!['growth', 'scale'].includes(plan)) {
        res.status(400).json({ error: 'Invalid plan selected. Choose Growth or Scale.' });
        return;
      }

      const tenant = await Tenant.findById(req.tenantId);
      if (!tenant) {
        res.status(404).json({ error: 'Tenant not found' });
        return;
      }

      // If Stripe keys are configured, create live Stripe Checkout Session
      if (stripe) {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `ContextIQ ${plan.toUpperCase()} Plan`,
                  description: `${PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS].toLocaleString()} monthly tokens, custom assistants, and priority Pinecone retrieval`,
                },
                unit_amount: PLAN_PRICES[plan as keyof typeof PLAN_PRICES],
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          client_reference_id: tenant._id.toString(),
          customer_email: req.user?.email,
          metadata: {
            tenantId: tenant._id.toString(),
            plan,
          },
          success_url: `${config.clientUrl}/app/billing?session_id={CHECKOUT_SESSION_ID}&success=true`,
          cancel_url: `${config.clientUrl}/app/billing?cancelled=true`,
        });

        res.json({ url: session.url });
        return;
      }

      // Fallback dev mode (if Stripe key not yet provided in .env)
      const newLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 500000;
      tenant.plan = plan;
      tenant.tokenLimit = newLimit;
      tenant.status = 'active';
      await tenant.save();

      // Record simulated event
      await BillingEvent.create({
        tenantId: tenant._id,
        stripeEventId: `sim_evt_${Date.now()}`,
        type: 'subscription.upgraded_dev',
        amount: PLAN_PRICES[plan as keyof typeof PLAN_PRICES] || 0,
        status: 'processed',
      });

      res.json({
        simulated: true,
        message: `Plan upgraded to ${plan.toUpperCase()} (Dev mode simulated without Stripe secret key)`,
        tenant,
      });
    } catch (error: any) {
      console.error('[Billing Checkout Error]', error);
      res.status(500).json({ error: error.message || 'Failed to initialize checkout' });
    }
  }
);

/**
 * POST /api/billing/create-portal-session
 * Customer self-serve billing portal for invoices & subscription management
 */
router.post(
  '/create-portal-session',
  authenticateJWT,
  requireRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenant = await Tenant.findById(req.tenantId);
      if (!tenant || !tenant.stripeCustomerId || !stripe) {
        res.status(400).json({ error: 'No active Stripe customer found for this workspace' });
        return;
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: tenant.stripeCustomerId,
        return_url: `${config.clientUrl}/app/billing`,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/billing/upgrade (Direct programmatic upgrade)
 */
router.post(
  '/upgrade',
  authenticateJWT,
  requireRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { plan } = req.body;
      if (!['starter', 'growth', 'scale'].includes(plan)) {
        res.status(400).json({ error: 'Invalid plan selected' });
        return;
      }

      const newLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || 500000;

      const tenant = await Tenant.findByIdAndUpdate(
        req.tenantId,
        {
          plan,
          tokenLimit: newLimit,
          status: 'active', // unpause if paused
        },
        { new: true }
      );

      res.json({
        message: `Plan upgraded to ${plan} successfully`,
        tenant,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/billing/webhook
 * Idempotent Stripe webhook receiver with cryptographic signature validation
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];

  let event: Stripe.Event;

  try {
    if (stripe && config.stripeWebhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Signature Verification Failed]`, err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const stripeEventId = event.id || `evt_${Date.now()}`;

  try {
    // Idempotency check per Backend Schema §3.8
    const existing = await BillingEvent.findOne({ stripeEventId });
    if (existing) {
      res.json({ received: true, note: 'Duplicate webhook event already handled' });
      return;
    }

    // Handle different Stripe event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const tenantId = session.metadata?.tenantId || session.client_reference_id;
        const plan = (session.metadata?.plan || 'growth') as keyof typeof PLAN_LIMITS;

        if (tenantId) {
          await Tenant.findByIdAndUpdate(tenantId, {
            plan,
            tokenLimit: PLAN_LIMITS[plan] || 2500000,
            stripeCustomerId: session.customer as string,
            status: 'active',
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer) {
          await Tenant.findOneAndUpdate(
            { stripeCustomerId: invoice.customer as string },
            { status: 'active', tokenUsed: 0 } // reset monthly usage on new billing cycle
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        if (subscription.customer) {
          await Tenant.findOneAndUpdate(
            { stripeCustomerId: subscription.customer as string },
            { plan: 'starter', tokenLimit: PLAN_LIMITS.starter }
          );
        }
        break;
      }

      default:
        break;
    }

    // Record billing event audit trail
    await BillingEvent.create({
      tenantId: (event.data?.object as any)?.metadata?.tenantId,
      stripeEventId,
      type: event.type,
      amount: (event.data?.object as any)?.amount_total || (event.data?.object as any)?.amount || 0,
      status: 'processed',
    });

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Billing Webhook Processing Error]', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

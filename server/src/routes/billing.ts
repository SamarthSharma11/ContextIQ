import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { Tenant } from '../models/Tenant';
import { BillingEvent } from '../models/BillingEvent';

const router = Router();

const PLAN_LIMITS = {
  free: 100000,
  starter: 500000,
  growth: 2500000,
  scale: 10000000,
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
      billingHistory,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/billing/upgrade
 * Update plan and token limits
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
 * Idempotent Stripe webhook receiver
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const event = req.body;
    const stripeEventId = event.id || `evt_${Date.now()}`;

    // Check idempotency
    const existing = await BillingEvent.findOne({ stripeEventId });
    if (existing) {
      res.json({ received: true, note: 'Duplicate event already processed' });
      return;
    }

    // Save event
    await BillingEvent.create({
      tenantId: event.data?.object?.metadata?.tenantId,
      stripeEventId,
      type: event.type || 'payment.succeeded',
      amount: event.data?.object?.amount,
      status: 'processed',
    });

    res.json({ received: true });
  } catch (error: any) {
    console.error('[Billing Webhook] Error:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;

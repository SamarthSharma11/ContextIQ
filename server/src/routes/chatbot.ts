import { Router, Request, Response } from 'express';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { Tenant } from '../models/Tenant';

const router = Router();

/**
 * GET /api/chatbot
 * Get chatbot config for the authenticated tenant
 */
router.get('/', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Tenant not found' });
      return;
    }

    res.json({
      chatbotConfig: tenant.chatbotConfig,
      slug: tenant.slug,
      workspaceName: tenant.name,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/chatbot
 * Update chatbot configuration (name, greeting, accentColor, placeholder)
 */
router.put(
  '/',
  authenticateJWT,
  requireRole('owner', 'admin', 'editor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, greeting, accentColor, placeholder, allowedOrigins } = req.body;

      const tenant = await Tenant.findById(req.tenantId);
      if (!tenant) {
        res.status(404).json({ error: 'Tenant not found' });
        return;
      }

      if (name !== undefined) tenant.chatbotConfig.name = name;
      if (greeting !== undefined) tenant.chatbotConfig.greeting = greeting;
      if (accentColor !== undefined) tenant.chatbotConfig.accentColor = accentColor;
      if (placeholder !== undefined) tenant.chatbotConfig.placeholder = placeholder;
      if (allowedOrigins !== undefined) tenant.chatbotConfig.allowedOrigins = allowedOrigins;

      await tenant.save();

      res.json({
        message: 'Chatbot configuration updated successfully',
        chatbotConfig: tenant.chatbotConfig,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/chatbot/public/:slug
 * Public endpoint for embeddable widget to load appearance and settings
 */
router.get('/public/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const tenant = await Tenant.findOne({ slug }).select('name slug status chatbotConfig tokenUsed tokenLimit');

    if (!tenant) {
      res.status(404).json({ error: 'Workspace chatbot not found' });
      return;
    }

    const isAvailable = tenant.status === 'active' && tenant.tokenUsed < tenant.tokenLimit;

    res.json({
      name: tenant.chatbotConfig.name,
      greeting: tenant.chatbotConfig.greeting,
      accentColor: tenant.chatbotConfig.accentColor || '#E8675F',
      placeholder: tenant.chatbotConfig.placeholder || 'Ask a question...',
      isAvailable,
      slug: tenant.slug,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

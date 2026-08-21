import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthPayload } from '../middleware/auth';
import { Tenant } from '../models/Tenant';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { executeRAGQuery } from '../services/rag';

const router = Router();

/**
 * Helper to extract tenantId either from JWT (dashboard) or tenantSlug / header (widget)
 */
async function resolveTenant(req: Request): Promise<Types.ObjectId | null> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;
      return new Types.ObjectId(decoded.tenantId);
    } catch (e) {
      // Ignore and fallback to slug
    }
  }

  const slug = (req.headers['x-tenant-slug'] as string) || req.body.tenantSlug || req.query.slug;
  if (slug) {
    const tenant = await Tenant.findOne({ slug });
    if (tenant) return tenant._id;
  }

  return null;
}

/**
 * POST /api/chat
 * Primary conversational query endpoint for both widget and dashboard test sandbox
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, sessionId = 'default-session' } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'A user message is required' });
      return;
    }

    const tenantId = await resolveTenant(req);
    if (!tenantId) {
      res.status(401).json({ error: 'Unable to identify tenant workspace. Provide Authorization token or tenantSlug.' });
      return;
    }

    const ragResult = await executeRAGQuery({
      tenantId,
      sessionId,
      userMessage: message.trim(),
    });

    res.json(ragResult);
  } catch (error: any) {
    console.error('[Chat] Query error:', error);
    res.status(500).json({ error: error.message || 'Error generating grounded response' });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Fetch conversation history for session
 */
router.get('/history/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const tenantId = await resolveTenant(req);
    if (!tenantId) {
      res.status(401).json({ error: 'Tenant identification required' });
      return;
    }

    const { sessionId } = req.params;
    const chat = await Chat.findOne({ tenantId, sessionId });

    if (!chat) {
      res.json({ messages: [] });
      return;
    }

    const messages = await Message.find({ tenantId, chatId: chat._id })
      .sort({ createdAt: 1 })
      .select('role content sources tokensUsed latencyMs feedback createdAt')
      .lean();

    res.json({
      chat,
      messages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/chat/message/:id/feedback
 * Submit thumbs up / down feedback on an assistant message
 */
router.post('/message/:id/feedback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { feedback } = req.body; // 'up' | 'down' | null

    if (!['up', 'down', null].includes(feedback)) {
      res.status(400).json({ error: 'Feedback must be "up", "down", or null' });
      return;
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { feedback },
      { new: true }
    );

    if (!message) {
      res.status(404).json({ error: 'Message not found' });
      return;
    }

    res.json({ success: true, messageId: message._id, feedback: message.feedback });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

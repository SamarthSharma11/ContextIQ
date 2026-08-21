import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import slugify from 'slugify';
import { Types } from 'mongoose';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';
import { config } from '../config/env';
import { authenticateJWT, AuthPayload } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/signup
 * Creates a new tenant workspace and the owner user in one atomic-like flow.
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, workspaceName } = req.body;

    if (!name || !email || !password || !workspaceName) {
      res.status(400).json({ error: 'Name, email, password, and workspace name are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if workspace slug already exists
    let slug = slugify(workspaceName, { lower: true, strict: true });
    if (!slug) slug = 'workspace';
    
    // Check if slug taken
    const existingTenant = await Tenant.findOne({ slug });
    if (existingTenant) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create placeholder IDs for mutual reference
    const tenantId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    // Create Tenant
    const tenant = await Tenant.create({
      _id: tenantId,
      name: workspaceName.trim(),
      slug,
      ownerId: userId,
      plan: 'starter',
      tokenLimit: 500000, // 500k tokens starter
      tokenUsed: 0,
      status: 'active',
      onboardingCompleted: false,
      pineconeNamespace: slug,
      chatbotConfig: {
        name: `${workspaceName} Assistant`,
        greeting: `Hello! I am your AI assistant for ${workspaceName}. Ask me anything about our documents!`,
        accentColor: '#E8675F',
        placeholder: 'Ask a question...',
      },
    });

    // Create Owner User
    const user = await User.create({
      _id: userId,
      tenantId: tenant._id,
      email: normalizedEmail,
      passwordHash,
      role: 'owner',
      name: name.trim(),
      status: 'active',
      lastLoginAt: new Date(),
    });

    // Generate JWT
    const payload: AuthPayload = {
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        onboardingCompleted: tenant.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({ error: error.message || 'Failed to create workspace account' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Fetch tenant
    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const payload: AuthPayload = {
      userId: user._id.toString(),
      tenantId: tenant._id.toString(),
      role: user.role,
      email: user.email,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        onboardingCompleted: tenant.onboardingCompleted,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    res.json({
      user,
      tenant,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/onboarding
 * Complete onboarding wizard
 */
router.post('/onboarding', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatbotName, greeting, accentColor } = req.body;

    const tenant = await Tenant.findById(req.tenantId);
    if (!tenant) {
      res.status(404).json({ error: 'Workspace not found' });
      return;
    }

    if (chatbotName) tenant.chatbotConfig.name = chatbotName;
    if (greeting) tenant.chatbotConfig.greeting = greeting;
    if (accentColor) tenant.chatbotConfig.accentColor = accentColor;
    
    tenant.onboardingCompleted = true;
    await tenant.save();

    res.json({ success: true, tenant });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

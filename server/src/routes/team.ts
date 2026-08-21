import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { User, UserRole } from '../models/User';
import { Invite } from '../models/Invite';

const router = Router();

/**
 * GET /api/team
 * List all users and pending invites in the tenant
 */
router.get('/', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({ tenantId: req.tenantId })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .lean();

    const invites = await Invite.find({ tenantId: req.tenantId, status: 'pending' })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users, invites });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/team/invite
 * Send invite to a new team member
 */
router.post(
  '/invite',
  authenticateJWT,
  requireRole('owner', 'admin'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, role = 'viewer' } = req.body;
      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user is already a member
      const existingUser = await User.findOne({ tenantId: req.tenantId, email: normalizedEmail });
      if (existingUser) {
        res.status(400).json({ error: 'User is already a member of this workspace' });
        return;
      }

      const token = crypto.randomBytes(24).toString('hex');

      const invite = await Invite.create({
        tenantId: req.tenantId,
        email: normalizedEmail,
        role: role as UserRole,
        token,
        invitedBy: req.user!.userId,
        status: 'pending',
      });

      res.status(201).json({
        message: 'Invitation generated successfully',
        invite,
        inviteUrl: `${req.protocol}://${req.get('host')}/signup?invite=${token}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * PUT /api/team/:userId/role
 * Update role of a team member (owner only)
 */
router.put(
  '/:userId/role',
  authenticateJWT,
  requireRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { role } = req.body;
      const { userId } = req.params;

      if (!['admin', 'editor', 'viewer'].includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const user = await User.findOneAndUpdate(
        { _id: userId, tenantId: req.tenantId },
        { role },
        { new: true }
      ).select('-passwordHash');

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User role updated', user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/team/:userId
 * Remove a user from the workspace
 */
router.delete(
  '/:userId',
  authenticateJWT,
  requireRole('owner'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (userId === req.user?.userId) {
        res.status(400).json({ error: 'Cannot remove yourself as workspace owner' });
        return;
      }

      const user = await User.findOneAndDelete({ _id: userId, tenantId: req.tenantId });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ message: 'User removed from workspace' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;

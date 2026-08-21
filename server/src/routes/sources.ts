import { Router, Request, Response } from 'express';
import multer from 'multer';
import { Types } from 'mongoose';
import { authenticateJWT, requireRole } from '../middleware/auth';
import { Source } from '../models/Source';
import { Chunk } from '../models/Chunk';
import { Tenant } from '../models/Tenant';
import { extractTextFromPDF, extractTextFromURL, processSourceIngestion } from '../services/ingestion';
import { deleteVectorsByIds } from '../services/pinecone';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

/**
 * POST /api/sources
 * Upload a PDF or submit a Web URL for ingestion
 */
router.post(
  '/',
  authenticateJWT,
  requireRole('owner', 'admin', 'editor'),
  upload.single('file'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = req.tenantId!;
      const tenant = await Tenant.findById(tenantId);
      if (!tenant) {
        res.status(404).json({ error: 'Tenant workspace not found' });
        return;
      }

      const sourceType = req.body.type || (req.file ? 'pdf' : 'url');
      let title = req.body.title || '';
      let origin = '';
      let rawText = '';

      if (sourceType === 'pdf') {
        if (!req.file) {
          res.status(400).json({ error: 'No PDF file uploaded' });
          return;
        }
        origin = req.file.originalname;
        if (!title) title = req.file.originalname.replace(/\.[^/.]+$/, '');
        rawText = await extractTextFromPDF(req.file.buffer);
      } else if (sourceType === 'url') {
        const url = req.body.url;
        if (!url) {
          res.status(400).json({ error: 'URL is required for web ingestion' });
          return;
        }
        origin = url;
        const extracted = await extractTextFromURL(url);
        if (!title) title = extracted.title || url;
        rawText = extracted.text;
      } else {
        res.status(400).json({ error: 'Invalid source type. Must be "pdf" or "url".' });
        return;
      }

      // Create queued Source document
      const source = await Source.create({
        tenantId,
        type: sourceType,
        title,
        origin,
        status: 'queued',
        chunkCount: 0,
      });

      // Kick off async ingestion in background so API responds immediately
      processSourceIngestion({
        sourceId: source._id,
        tenantId,
        namespace: tenant.pineconeNamespace,
        rawText,
        title,
      }).catch((err) => {
        console.error(`[Sources] Async ingestion failed for source ${source._id}:`, err);
      });

      res.status(202).json({
        message: 'Source submitted and queued for ingestion',
        source,
      });
    } catch (error: any) {
      console.error('[Sources] Ingestion submit error:', error);
      res.status(500).json({ error: error.message || 'Failed to submit source for ingestion' });
    }
  }
);

/**
 * GET /api/sources
 * List all knowledge sources for the tenant (owner, admin, editor only per App Flow §5)
 */
router.get(
  '/',
  authenticateJWT,
  requireRole('owner', 'admin', 'editor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const sources = await Source.find({ tenantId: req.tenantId })
        .sort({ createdAt: -1 })
        .lean();

      res.json(sources);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/sources/:id
 * Get single source details and its chunk previews (owner, admin, editor only)
 */
router.get(
  '/:id',
  authenticateJWT,
  requireRole('owner', 'admin', 'editor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const source = await Source.findOne({
        _id: req.params.id,
        tenantId: req.tenantId,
      });

      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      const chunks = await Chunk.find({
        sourceId: source._id,
        tenantId: req.tenantId,
      })
        .sort({ chunkIndex: 1 })
        .select('chunkIndex text tokenCount vectorId createdAt')
        .lean();

      res.json({
        source,
        chunks,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/sources/:id
 * Cascaded deletion: Deletes Pinecone vectors, MongoDB chunks, and the source document
 */
router.delete(
  '/:id',
  authenticateJWT,
  requireRole('owner', 'admin', 'editor'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const source = await Source.findOne({
        _id: req.params.id,
        tenantId: req.tenantId,
      });

      if (!source) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      const tenant = await Tenant.findById(req.tenantId);
      if (tenant) {
        // Find chunk vector IDs to delete from Pinecone
        const chunks = await Chunk.find({ sourceId: source._id, tenantId: req.tenantId });
        const vectorIds = chunks.map((c) => c.vectorId);
        
        if (vectorIds.length > 0) {
          await deleteVectorsByIds(tenant.pineconeNamespace, vectorIds);
        }
      }

      // Delete chunks from MongoDB
      await Chunk.deleteMany({ sourceId: source._id, tenantId: req.tenantId });

      // Delete the source document
      await Source.findByIdAndDelete(source._id);

      res.json({ message: 'Source and its vector chunks deleted successfully' });
    } catch (error: any) {
      console.error('[Sources] Delete error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete source' });
    }
  }
);

export default router;

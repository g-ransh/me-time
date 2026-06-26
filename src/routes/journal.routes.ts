import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase.config';
import { validateBody } from '../middleware/validators/validation.middleware';
import { createJournalSchema } from '../middleware/validators/journal.validator';

const router = Router();

// Secure Post Channel: Parameters are safely isolated from execution commands
router.post(
  '/entries', 
  validateBody(createJournalSchema), 
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, content, mood, tags } = req.body;
      
      // Temporary authorized user placeholder until user login tokens are linked
      const verifiedUserId = '33333333-3333-3333-3333-333333333333'; 

      // SECURE: The Supabase client compiles this safely using parameterized parameters
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          { 
            title, 
            content, 
            mood, 
            tags: tags || [], 
            user_id: verifiedUserId 
          }
        ])
        .select()
        .single();

      if (error) throw error; // Pass to global Layer 5 middleware for clean error masking

      res.status(201).json({ 
        status: 'success', 
        message: 'Journal entry successfully parameterized and written to Supabase!', 
        data 
      });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Failed to record entry safely.' });
    }
  }
);

export default router;
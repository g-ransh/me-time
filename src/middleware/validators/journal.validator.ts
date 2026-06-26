import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string()
    .min(1, { message: "Title is required and cannot be empty." })
    .max(100, { message: "Title length cannot exceed 100 characters." })
    .trim(),
  content: z.string()
    .min(1, { message: "Journal entry body cannot be empty." })
    .max(5000, { message: "Content size cannot exceed 5000 characters." }),
  mood: z.string().refine(
    (val) => ["happy", "neutral", "anxious", "sad", "energetic"].includes(val),
    { message: "Selected mood must match an authorized app metric." }
  ),
  tags: z.array(z.string().max(20)).max(5, { message: "Maximum of 5 tags allowed per entry." }).optional(),
});
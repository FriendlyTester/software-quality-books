import { z } from 'zod'

export const BookSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(1, 'Description is required')
    .max(750, 'Description must be less than 500 characters'),
})

export type CreateBookInput = z.infer<typeof BookSchema> 
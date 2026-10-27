import { z } from 'zod'

export const ApiKeyCreateSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
})

export type CreateApiKeyInput = z.infer<typeof ApiKeyCreateSchema>

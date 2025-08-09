import { z } from 'zod'

export const NodeDataSchema = z.object({
  label: z.string().min(1),
  conf: z.record(z.any()).optional().default({}),
})

export const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['input', 'dense', 'conv', 'pool', 'dropout', 'output', 'custom']),
  data: NodeDataSchema,
  position: z.object({ x: z.number(), y: z.number() }),
})

export const EdgeSchema = z.object({
  id: z.string().min(1).optional(),
  source: z.string().min(1),
  target: z.string().min(1),
})

export const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
})



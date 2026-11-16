import type { CollectionSchema } from 'deepspace/schema'

export const decisionRoomsSchema: CollectionSchema = {
  name: 'decision_rooms',
  columns: [
    { name: 'title', storage: 'text', interpretation: 'plain', required: true, maxLength: 180 },
    { name: 'context', storage: 'text', interpretation: 'plain', required: true, maxLength: 2000 },
    { name: 'status', storage: 'text', interpretation: { kind: 'select', options: ['open', 'decided'] }, required: true },
  ],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

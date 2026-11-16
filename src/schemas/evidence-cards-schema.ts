import type { CollectionSchema } from 'deepspace/schema'

export const evidenceCardsSchema: CollectionSchema = {
  name: 'evidence_cards',
  columns: [
    { name: 'roomId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'stance', storage: 'text', interpretation: { kind: 'select', options: ['support', 'risk', 'question'] }, required: true },
    { name: 'title', storage: 'text', interpretation: 'plain', required: true, maxLength: 140 },
    { name: 'detail', storage: 'text', interpretation: 'plain', required: true, maxLength: 1500 },
  ],
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

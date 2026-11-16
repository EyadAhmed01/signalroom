import type { CollectionSchema } from 'deepspace/schema'

export const confidenceVotesSchema: CollectionSchema = {
  name: 'confidence_votes',
  columns: [
    { name: 'roomId', storage: 'text', interpretation: 'plain', required: true, immutable: true },
    { name: 'userId', storage: 'text', interpretation: 'plain', required: true, immutable: true, userBound: true },
    { name: 'score', storage: 'number', interpretation: 'plain', required: true },
  ],
  uniqueOn: ['roomId', 'userId'],
  ownerField: 'userId',
  permissions: {
    '*': { read: true, create: false, update: false, delete: false },
    viewer: { read: true, create: false, update: false, delete: false },
    member: { read: true, create: true, update: 'own', delete: 'own' },
    admin: { read: true, create: true, update: true, delete: true },
  },
}

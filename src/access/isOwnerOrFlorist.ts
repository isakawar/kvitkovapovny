import type { Access } from 'payload'

export const isOwnerOrFlorist: Access = ({ req: { user } }) =>
  Boolean(user && (user.role === 'owner' || user.role === 'florist'))

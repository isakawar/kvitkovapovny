import type { Access } from 'payload'

export const isOwner: Access = ({ req: { user } }) => Boolean(user && user.role === 'owner')

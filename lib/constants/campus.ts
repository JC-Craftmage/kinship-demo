// Campus configuration

export const CAMPUSES = ['Downtown', 'Westside'] as const;

export type Campus = typeof CAMPUSES[number];

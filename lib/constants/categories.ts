// Need categories and asset types

import { NeedCategory } from '@/lib/types';

export const NEED_CATEGORIES: NeedCategory[] = [
  'Moving Help',
  'Prayer Request',
  'Childcare',
  'Transportation',
  'Home Repair',
  'Event Help'
];

export const ASSET_TYPES = [
  'vehicle',
  'equipment',
  'tools',
  'business'
] as const;

export type AssetType = typeof ASSET_TYPES[number];

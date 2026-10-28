// Member-related TypeScript types

export interface Asset {
  type: 'vehicle' | 'equipment' | 'tools' | 'business';
  name: string;
  available: string;
  description: string;
}

export interface Member {
  /** `members.id` — a uuid. Mock rows used to use numbers. */
  id: string;
  name: string;
  /** Campus name from the `campuses` table. Mock rows hardcoded two values. */
  campus: string;
  skills: string[];
  interests: string[];
  avatar: string;
  kudos: number;
  jobTitle: string;
  company: string | null;
  bio: string;
  seekingWork: boolean;
  lookingForGroups: string[];
  assets: Asset[];
  memberSince: string;
}

export interface AssetWithOwner extends Asset {
  owner: Member;
}

// Bible Study related TypeScript types

export interface BibleStudyGroup {
  /** `bible_study_groups.id` — a uuid. Mock rows used to use numbers. */
  id: string;
  name: string;
  description: string;
  leader: GroupLeader;
  schedule: string;
  location: string;
  campus: string;
  currentBook: string;
  currentChapter: string;
  nextStudyDate: string;
  memberCount: number;
  maxMembers: number | null;
  isOpen: boolean;
  tags: string[];
  createdAt: string;
}

export interface GroupLeader {
  name: string;
  avatar: string;
  email?: string;
  phone?: string;
}

export interface StudySession {
  id: string;
  groupId: string;
  date: string;
  topic: string;
  notes: string;
  attendance: number;
}

export interface GroupPost {
  id: string;
  groupId: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}
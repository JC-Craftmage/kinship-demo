// Bible Study related TypeScript types

export interface BibleStudyGroup {
  id: number;
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
  id: number;
  groupId: number;
  date: string;
  topic: string;
  notes: string;
  attendance: number;
}

export interface GroupPost {
  id: number;
  groupId: number;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  likes: number;
}
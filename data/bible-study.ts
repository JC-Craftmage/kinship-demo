// Mock Bible Study data - will be replaced with API calls later

// Featured Verse
// "in whom are hidden all the treasures of wisdom and knowledge" — Colossians 2:3
// Application: resources flow FROM the body of Christ, not just through it — Kinship activates the channel

import { BibleStudyGroup } from '@/lib/types';

export const bibleStudyGroups: BibleStudyGroup[] = [
  {
    id: 1,
    name: 'Gospel of John',
    description: 'Diving deep into the book of John, verse by verse. All levels welcome, come as you are.',
    leader: { name: 'Pastor Tim', avatar: '👨‍🦱' },
    schedule: 'Sundays at 9:00 AM',
    location: 'Room 201',
    campus: 'Downtown',
    currentBook: 'John',
    currentChapter: 'Chapter 3',
    nextStudyDate: '2025-11-02',
    memberCount: 12,
    maxMembers: null,
    isOpen: true,
    tags: ['Gospel', 'Deep Dive', 'All Welcome'],
    createdAt: '2025-08-15'
  },
  {
    id: 2,
    name: 'Romans Study',
    description: 'Working through Paul\'s letter to the Romans. Great for those who want to understand salvation and grace.',
    leader: { name: 'Mike Chen', avatar: '👨' },
    schedule: 'Wednesdays at 7:00 PM',
    location: 'Fellowship Hall B',
    campus: 'Downtown',
    currentBook: 'Romans',
    currentChapter: 'Chapter 6',
    nextStudyDate: '2025-10-29',
    memberCount: 8,
    maxMembers: 15,
    isOpen: true,
    tags: ['Epistle', 'Grace', 'Theology'],
    createdAt: '2025-06-01'
  },
  {
    id: 3,
    name: 'Women\'s Bible Study',
    description: 'Ladies gathering to study God\'s Word together. Coffee, fellowship, and honest conversation.',
    leader: { name: 'Sarah Johnson', avatar: '👩' },
    schedule: 'Tuesdays at 10:00 AM',
    location: 'Women\'s Lounge',
    campus: 'Westside',
    currentBook: 'Psalms',
    currentChapter: 'Psalm 23',
    nextStudyDate: '2025-10-28',
    memberCount: 14,
    maxMembers: 20,
    isOpen: true,
    tags: ['Women', 'Fellowship', 'Psalms'],
    createdAt: '2025-01-10'
  },
  {
    id: 4,
    name: 'Young Adults Study',
    description: '20s and 30s group tackling relevant topics and deep Bible study. Bring your questions.',
    leader: { name: 'David Martinez', avatar: '👨‍💼' },
    schedule: 'Thursdays at 7:30 PM',
    location: 'The Loft',
    campus: 'Eastside',
    currentBook: '1 Corinthians',
    currentChapter: 'Chapter 12',
    nextStudyDate: '2025-10-30',
    memberCount: 18,
    maxMembers: 30,
    isOpen: true,
    tags: ['Young Adults', 'Questions Welcome', 'Life Issues'],
    createdAt: '2025-03-20'
  },
  {
    id: 5,
    name: 'Genesis Study',
    description: 'From the beginning — tracing God\'s story from Genesis through Revelation.',
    leader: { name: 'Robert Chen', avatar: '👴' },
    schedule: 'Mondays at 6:00 PM',
    location: 'Room 105',
    campus: 'Downtown',
    currentBook: 'Genesis',
    currentChapter: 'Chapter 25',
    nextStudyDate: '2025-10-27',
    memberCount: 10,
    maxMembers: null,
    isOpen: false,
    tags: ['Old Testament', 'Narrative', 'In-Depth'],
    createdAt: '2024-09-01'
  },
  {
    id: 6,
    name: 'Prayer & Proverbs',
    description: 'Short, focused study through Proverbs with strong emphasis on prayer life.',
    leader: { name: 'Lisa Thompson', avatar: '👩‍🎨' },
    schedule: 'Fridays at 8:30 AM',
    location: 'Chapel',
    campus: 'Westside',
    currentBook: 'Proverbs',
    currentChapter: 'Chapter 10',
    nextStudyDate: '2025-10-31',
    memberCount: 6,
    maxMembers: 12,
    isOpen: true,
    tags: ['Wisdom', 'Prayer', 'Short & Sweet'],
    createdAt: '2025-02-15'
  }
];
// Custom hook for Bible Study groups management

import { useState } from 'react';
import { bibleStudyGroups as mockGroups } from '@/data/bible-study';
import { BibleStudyGroup } from '@/lib/types';

export function useBibleStudy() {
  const [groups] = useState<BibleStudyGroup[]>(mockGroups);
  const [filter, setFilter] = useState<'all' | 'open' | 'campus'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(group => {
    const matchesSearch = searchQuery === '' ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.currentBook.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filter === 'all' ||
      (filter === 'open' && group.isOpen);

    return matchesSearch && matchesFilter;
  });

  return {
    groups,
    filteredGroups,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
  };
}
'use client';

// Bible Study Board — loads the study groups of the caller's church.

import { useState } from 'react';
import { useBoardData } from './use-board-data';
import { BibleStudyGroup } from '@/lib/types';

export function useBibleStudy() {
  const { data, loading, error, refresh } = useBoardData<{ groups: BibleStudyGroup[] }>('/api/bible-study');
  const [filter, setFilter] = useState<'all' | 'open' | 'campus'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const groups = data?.groups ?? [];

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
    loading,
    error,
    refresh,
  };
}

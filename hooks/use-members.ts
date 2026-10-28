'use client';

// Member Directory — loads the members of the caller's church.

import { useMemo, useState } from 'react';
import { useBoardData, BoardEnvelope } from './use-board-data';
import { Member } from '@/lib/types';

type CampusFilter = 'all' | string;

export function useMembers() {
  const { data, loading, error, refresh } = useBoardData<{ members: Member[] } & BoardEnvelope>('/api/directory');
  const [campusFilter, setCampusFilter] = useState<CampusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const members = useMemo(() => data?.members ?? [], [data]);

  // The campuses that actually have members, so the filter is not hardcoded.
  const campuses = useMemo(
    () => [...new Set(members.map(member => member.campus))].sort(),
    [members]
  );

  // Filter members by campus
  const filteredMembers = useMemo(() => {
    let filtered = members;

    // Apply campus filter
    if (campusFilter !== 'all') {
      filtered = filtered.filter(m => m.campus === campusFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(query) ||
        m.skills.some(s => s.toLowerCase().includes(query)) ||
        m.interests.some(i => i.toLowerCase().includes(query)) ||
        m.campus.toLowerCase().includes(query) ||
        (m.jobTitle && m.jobTitle.toLowerCase().includes(query)) ||
        (m.company && m.company.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [members, campusFilter, searchQuery]);

  // Get champion members (50+ kudos)
  const champions = useMemo(() =>
    members.filter(m => m.kudos >= 50),
    [members]
  );

  // Get members seeking work
  const seekingWork = useMemo(() =>
    members.filter(m => m.seekingWork),
    [members]
  );

  // Get members with assets
  const withAssets = useMemo(() =>
    members.filter(m => m.assets.length > 0),
    [members]
  );

  // Get total member count
  const totalMembers = members.length;

  // Get total assets count
  const totalAssets = useMemo(() =>
    members.reduce((sum, m) => sum + m.assets.length, 0),
    [members]
  );

  return {
    members,
    filteredMembers,
    champions,
    seekingWork,
    withAssets,
    totalMembers,
    totalAssets,
    campuses,
    campusFilter,
    setCampusFilter,
    searchQuery,
    setSearchQuery,
    demo: data?.demo ?? false,
    loading,
    error,
    refresh,
  };
}

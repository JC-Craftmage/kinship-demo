// Custom hook for member management and filtering

import { useState, useMemo } from 'react';
import { members as mockMembers } from '@/data/members';
import { Member } from '@/lib/types';

type CampusFilter = 'all' | 'Downtown' | 'Westside';

export function useMembers() {
  const [members] = useState<Member[]>(mockMembers);
  const [campusFilter, setCampusFilter] = useState<CampusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
        m.jobTitle.toLowerCase().includes(query)
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
    campusFilter,
    setCampusFilter,
    searchQuery,
    setSearchQuery,
  };
}

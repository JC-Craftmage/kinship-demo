// Global search hook - searches across all data sources

import { useMemo } from 'react';
import { useMembers } from './use-members';
import { useNeeds } from './use-needs';
import { useOffers } from './use-offers';
import { useAssets } from './use-assets';
import { useBibleStudy } from './use-bible-study';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'member' | 'need' | 'offer' | 'asset' | 'bible-study';
  href: string;
}

export interface GroupedSearchResults {
  members: SearchResult[];
  needs: SearchResult[];
  offers: SearchResult[];
  assets: SearchResult[];
  bibleStudies: SearchResult[];
}

export function useGlobalSearch(query: string) {
  const { members } = useMembers();
  const { needs } = useNeeds();
  const { offers } = useOffers();
  const { allAssets } = useAssets();
  const { groups } = useBibleStudy();

  const results = useMemo<GroupedSearchResults>(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return { members: [], needs: [], offers: [], assets: [], bibleStudies: [] };
    }

    const membersResults: SearchResult[] = members
      .filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.skills.some(s => s.toLowerCase().includes(q)) ||
        m.interests.some(i => i.toLowerCase().includes(q)) ||
        m.jobTitle.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(m => ({
        id: String(m.id),
        title: m.name,
        subtitle: m.jobTitle || m.skills.slice(0, 2).join(', '),
        type: 'member' as const,
        href: '/directory',
      }));

    const needsResults: SearchResult[] = needs
      .filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(n => ({
        id: String(n.id),
        title: n.title,
        subtitle: n.category,
        type: 'need' as const,
        href: '/needs',
      }));

    const offersResults: SearchResult[] = offers
      .filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(o => ({
        id: String(o.id),
        title: o.title,
        subtitle: o.category,
        type: 'offer' as const,
        href: '/offers',
      }));

    const assetsResults: SearchResult[] = allAssets
      .filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(a => ({
        id: `${a.owner.id}-${a.name}`,
        title: a.name,
        subtitle: a.type,
        type: 'asset' as const,
        href: '/assets',
      }));

    const bibleStudiesResults: SearchResult[] = groups
      .filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.currentBook.toLowerCase().includes(q)
      )
      .slice(0, 10)
      .map(g => ({
        id: String(g.id),
        title: g.name,
        subtitle: g.currentBook,
        type: 'bible-study' as const,
        href: '/bible-study',
      }));

    return {
      members: membersResults,
      needs: needsResults,
      offers: offersResults,
      assets: assetsResults,
      bibleStudies: bibleStudiesResults,
    };
  }, [query, members, needs, offers, allAssets, groups]);

  const totalCount =
    results.members.length +
    results.needs.length +
    results.offers.length +
    results.assets.length +
    results.bibleStudies.length;

  return { results, totalCount };
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Heart, Handshake, Truck, BookOpen, ArrowRight } from 'lucide-react';
import { useGlobalSearch, SearchResult } from '@/hooks/use-global-search';
import { Modal } from '@/components/ui/modal';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_CONFIG = {
  member: { icon: Users, label: 'Members', href: '/directory', color: 'bg-blue-100 text-blue-600' },
  need: { icon: Heart, label: 'Needs', href: '/needs', color: 'bg-red-100 text-red-600' },
  offer: { icon: Handshake, label: 'Offers', href: '/offers', color: 'bg-teal-100 text-teal-600' },
  asset: { icon: Truck, label: 'Assets', href: '/assets', color: 'bg-green-100 text-green-600' },
  'bible-study': { icon: BookOpen, label: 'Bible Studies', href: '/bible-study', color: 'bg-indigo-100 text-indigo-600' },
} as const;

function ResultItem({
  result,
  onClick,
}: {
  result: SearchResult;
  onClick: () => void;
}) {
  const config = CATEGORY_CONFIG[result.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition text-left"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.color}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{result.title}</p>
        <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
      </div>
      <ArrowRight size={14} className="text-gray-400 flex-shrink-0" />
    </button>
  );
}

function CategorySection({
  label,
  results,
  onResultClick,
  icon: Icon,
  color,
  seeAllHref,
}: {
  label: string;
  results: SearchResult[];
  onResultClick: () => void;
  icon: React.ComponentType<{ size: number }>;
  color: string;
  seeAllHref: string;
}) {
  if (results.length === 0) return null;

  const displayResults = results.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${color}`}>
            <Icon size={12} />
          </div>
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        {results.length > 3 && (
          <button
            onClick={onResultClick}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            See all {results.length} →
          </button>
        )}
      </div>
      <div className="space-y-1">
        {displayResults.map(result => (
          <ResultItem
            key={result.id}
            result={result}
            onClick={onResultClick}
          />
        ))}
      </div>
    </div>
  );
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { results, totalCount } = useGlobalSearch(query);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleResultClick = (result: SearchResult, seeAllHref?: string) => {
    router.push(seeAllHref || result.href);
    onClose();
  };

  const handleSeeAll = (href: string) => {
    router.push(href);
    onClose();
  };

  const hasResults = totalCount > 0;
  const showEmptyState = query.length > 0 && !hasResults;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Kinship">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search members, needs, offers, assets..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {query.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Start typing to search across Kinship</p>
            </div>
          ) : showEmptyState ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-gray-400 mt-1">Try different keywords</p>
            </div>
          ) : (
            <div className="space-y-6">
              <CategorySection
                label="Members"
                results={results.members}
                onResultClick={() => handleSeeAll('/directory')}
                icon={Users}
                color="bg-blue-100 text-blue-600"
                seeAllHref="/directory"
              />
              <CategorySection
                label="Needs"
                results={results.needs}
                onResultClick={() => handleSeeAll('/needs')}
                icon={Heart}
                color="bg-red-100 text-red-600"
                seeAllHref="/needs"
              />
              <CategorySection
                label="Offers"
                results={results.offers}
                onResultClick={() => handleSeeAll('/offers')}
                icon={Handshake}
                color="bg-teal-100 text-teal-600"
                seeAllHref="/offers"
              />
              <CategorySection
                label="Assets"
                results={results.assets}
                onResultClick={() => handleSeeAll('/assets')}
                icon={Truck}
                color="bg-green-100 text-green-600"
                seeAllHref="/assets"
              />
              <CategorySection
                label="Bible Studies"
                results={results.bibleStudies}
                onResultClick={() => handleSeeAll('/bible-study')}
                icon={BookOpen}
                color="bg-indigo-100 text-indigo-600"
                seeAllHref="/bible-study"
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

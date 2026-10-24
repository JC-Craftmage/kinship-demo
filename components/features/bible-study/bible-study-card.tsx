// Bible Study group card component

import { BibleStudyGroup } from '@/lib/types';
import { MapPin, Users, BookOpen, Calendar, Clock, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BibleStudyCardProps {
  group: BibleStudyGroup;
  onSelect: (group: BibleStudyGroup) => void;
}

export function BibleStudyCard({ group, onSelect }: BibleStudyCardProps) {
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-purple-100 text-purple-700',
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    const index = tag.length % colors.length;
    return colors[index];
  };

  return (
    <Card hover onClick={() => onSelect(group)}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{group.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {group.campus}
                </span>
              </div>
            </div>
          </div>
          {!group.isOpen && (
            <Badge className="bg-gray-100 text-gray-600 border-gray-300">
              <Lock size={12} className="mr-1" />
              Full
            </Badge>
          )}
          {group.isOpen && group.memberCount >= 10 && (
            <Badge className="bg-green-100 text-green-700 border-green-300">
              Open
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{group.description}</p>

        {/* Current Study */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">Currently Studying</p>
          <p className="font-bold text-indigo-900">{group.currentBook} — {group.currentChapter}</p>
        </div>

        {/* Schedule */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            <span>{group.schedule}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span>{group.location}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {group.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{group.leader.avatar}</div>
              <div>
                <p className="text-sm font-medium text-gray-700">{group.leader.name}</p>
                <p className="text-xs text-gray-500">Leader</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Users size={16} />
              <span>{group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
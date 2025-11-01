// Member card component for directory list

import { Member } from '@/lib/types';
import { MapPin, Award, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MemberCardProps {
  member: Member;
  onSelect: (member: Member) => void;
  onViewAssets?: () => void;
}

export function MemberCard({ member, onSelect, onViewAssets }: MemberCardProps) {
  return (
    <Card hover onClick={() => onSelect(member)}>
      <div className="p-5">
        <div className="flex gap-4">
          <div className="text-5xl">{member.avatar}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg">{member.name}</h3>
              {member.kudos >= 50 && (
                <Badge variant="kudos" icon={<Award size={12} />}>
                  {member.kudos}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-500 flex items-center gap-1">
              <MapPin size={14} />
              {member.campus} Campus
            </p>

            <div className="flex flex-wrap gap-2 mt-2">
              {member.seekingWork && (
                <Badge variant="warning" className="flex items-center gap-1">
                  💼 Seeking Work
                </Badge>
              )}
              {member.lookingForGroups && member.lookingForGroups.length > 0 && (
                <Badge variant="info" className="flex items-center gap-1">
                  👥 {member.lookingForGroups.length === 1
                    ? `Looking for: ${member.lookingForGroups[0]}`
                    : 'Looking for Groups'}
                </Badge>
              )}
            </div>

            {member.assets.length > 0 && onViewAssets && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAssets();
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 font-medium"
              >
                <Truck size={12} />
                View {member.assets.length} asset{member.assets.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

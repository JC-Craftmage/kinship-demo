// Need card component

import { Need } from '@/lib/types';
import { MapPin, Calendar, Clock, Truck, Heart, Baby, Car, Wrench, Sparkles, HandHeart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NeedCardProps {
  need: Need;
  onSelect: (need: Need) => void;
}

export function NeedCard({ need, onSelect }: NeedCardProps) {
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      truck: <Truck size={20} />,
      heart: <Heart size={20} />,
      baby: <Baby size={20} />,
      car: <Car size={20} />,
      wrench: <Wrench size={20} />,
      sparkles: <Sparkles size={20} />
    };
    return icons[iconName] || <HandHeart size={20} />;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'open') return { variant: 'status' as const, text: '🔵 Open' };
    if (status === 'in-progress') return { variant: 'warning' as const, text: '🟡 In Progress' };
    if (status === 'fulfilled') return { variant: 'success' as const, text: '🟢 Fulfilled' };
    return { variant: 'default' as const, text: status };
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'high') return { variant: 'warning' as const, text: '🔴 Urgent' };
    if (urgency === 'medium') return { variant: 'warning' as const, text: '🟡 Soon' };
    return { variant: 'default' as const, text: '⚪ Flexible' };
  };

  const statusBadge = getStatusBadge(need.status);
  const urgencyBadge = getUrgencyBadge(need.urgency);
  const volunteersCount = need.volunteers.length;
  const needsMore = need.volunteersNeeded ? volunteersCount < need.volunteersNeeded : false;

  return (
    <Card hover onClick={() => onSelect(need)}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
              {getCategoryIcon(need.categoryIcon)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{need.category}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {need.poster.campus}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
        </div>

        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{need.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{need.description}</p>

        <div className="space-y-2">
          {need.date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={14} />
              <span>{new Date(need.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          )}
          {need.timeframe && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={14} />
              <span>{need.timeframe}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{need.poster.avatar}</div>
              <span className="text-sm font-medium text-gray-700">
                {need.isAnonymous ? 'Anonymous' : need.poster.name}
              </span>
            </div>
            {need.volunteersNeeded && (
              <div className="text-sm">
                <span className={`font-bold ${needsMore ? 'text-teal-600' : 'text-green-600'}`}>
                  {volunteersCount}/{need.volunteersNeeded}
                </span>
                <span className="text-gray-500"> volunteers</span>
              </div>
            )}
          </div>
        </div>

        {need.urgency !== 'low' && need.status === 'open' && (
          <div className="mt-3">
            <Badge variant={urgencyBadge.variant} className="w-full justify-center">
              {urgencyBadge.text}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}

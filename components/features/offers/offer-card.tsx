// Offer card component

import { Offer } from '@/lib/types';
import { MapPin, Truck, Baby, Car, Wrench, Sparkles, Hammer, Package, Circle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OfferCardProps {
  offer: Offer;
  onSelect: (offer: Offer) => void;
}

export function OfferCard({ offer, onSelect }: OfferCardProps) {
  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      truck: <Truck size={20} />,
      baby: <Baby size={20} />,
      car: <Car size={20} />,
      wrench: <Wrench size={20} />,
      sparkles: <Sparkles size={20} />,
      hammer: <Hammer size={20} />,
      package: <Package size={20} />,
      circle: <Circle size={20} />
    };
    return icons[iconName] || <Circle size={20} />;
  };

  const getAvailabilityBadge = (availability: string) => {
    if (availability === 'available') return { variant: 'success' as const, text: 'Available', bgClass: 'bg-green-100 text-green-700 border-green-300' };
    if (availability === 'limited') return { variant: 'warning' as const, text: 'Limited', bgClass: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    if (availability === 'unavailable') return { variant: 'default' as const, text: 'Unavailable', bgClass: 'bg-gray-100 text-gray-600 border-gray-300' };
    return { variant: 'default' as const, text: availability };
  };

  const availabilityBadge = getAvailabilityBadge(offer.availability);

  return (
    <Card hover onClick={() => onSelect(offer)}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-teal-100 text-teal-600 p-2 rounded-lg">
              {getCategoryIcon(offer.categoryIcon)}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{offer.category}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={12} />
                  {offer.poster.campus}
                </span>
              </div>
            </div>
          </div>
          <Badge className={availabilityBadge.bgClass}>{availabilityBadge.text}</Badge>
        </div>

        <h4 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{offer.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{offer.description}</p>

        {offer.availabilityNote && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">When:</span>
              <span>{offer.availabilityNote}</span>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-2xl">{offer.poster.avatar}</div>
              <span className="text-sm font-medium text-gray-700">{offer.poster.name}</span>
            </div>
            {offer.isVerified && (
              <div className="flex items-center gap-1 text-teal-600" title="Verified church member">
                <CheckCircle size={16} />
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
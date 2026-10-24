// Offer details modal

import { Offer } from '@/lib/types';
import { MapPin, CheckCircle2, Truck, Baby, Car, Wrench, Sparkles, Hammer, Package, Circle, Mail } from 'lucide-react';
import { ProfileCompletenessGate } from '@/components/features/onboarding/profile-completeness-gate';
import { shouldShowGateForAction } from '@/hooks/use-contextual-gate';
import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface OfferModalProps {
  offer: Offer | null;
  onClose: () => void;
}

export function OfferModal({ offer, onClose }: OfferModalProps) {
  const [showGate, setShowGate] = useState(false);
  const [pendingContact, setPendingContact] = useState(false);

  if (!offer) return null;

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      truck: <Truck size={24} />,
      baby: <Baby size={24} />,
      car: <Car size={24} />,
      wrench: <Wrench size={24} />,
      sparkles: <Sparkles size={24} />,
      hammer: <Hammer size={24} />,
      package: <Package size={24} />,
      circle: <Circle size={24} />
    };
    return icons[iconName] || <Circle size={24} />;
  };

  const handleContact = () => {
    // Check if profile gate should be shown
    if (shouldShowGateForAction('contact_member')) {
      setPendingContact(true);
      setShowGate(true);
      return;
    }
    doContact();
  };

  const doContact = () => {
    alert(`Contact initiated!\n\nIn the real app, this would:\n• Open a message to ${offer.poster.name}\n• They would receive a notification\n• You could coordinate details directly`);
  };

  const availabilityColors = {
    available: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-500' },
    limited: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', badge: 'bg-yellow-500' },
    unavailable: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800', badge: 'bg-gray-500' }
  };

  const colors = availabilityColors[offer.availability] || availabilityColors.unavailable;

  return (
    <>
      <Modal
        isOpen={!!offer}
      onClose={onClose}
      headerColor="from-teal-500 to-cyan-600"
      titleIcon={<div className="bg-white/20 p-3 rounded-xl">{getCategoryIcon(offer.categoryIcon)}</div>}
      title=""
    >
      <div className="mb-6 -mt-6">
        <h2 className="text-3xl font-bold text-gray-900">{offer.title}</h2>
        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {offer.category}
          </span>
          <span className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin size={14} />
            {offer.poster.campus}
          </span>
          <span className={`${colors.badge} text-white px-3 py-1 rounded-full text-sm font-semibold capitalize`}>
            {offer.availability}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">About This Offer</h3>
          <p className="text-gray-700 text-lg leading-relaxed">{offer.description}</p>
        </div>

        {offer.availabilityNote && (
          <div className={`${colors.bg} border-2 ${colors.border} p-4 rounded-xl`}>
            <h4 className={`font-bold mb-1 flex items-center gap-2 ${colors.text}`}>
              ⏰ Availability
            </h4>
            <p className={colors.text}>{offer.availabilityNote}</p>
          </div>
        )}

        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">Offered By</h3>
          <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{offer.poster.avatar}</div>
              <div className="flex-1">
                <p className="font-bold text-lg">{offer.poster.name}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={14} />
                  {offer.poster.campus} Campus
                </p>
                {offer.isVerified && (
                  <span className="inline-flex items-center gap-1 mt-2 text-teal-600 text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Verified Church Member
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {offer.availability !== 'unavailable' && (
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            icon={<Mail size={24} />}
            onClick={handleContact}
          >
            Contact {offer.poster.name.split(' ')[0]}
          </Button>
        )}

        {offer.availability === 'unavailable' && (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
            <p className="text-gray-600 font-medium">
              This offer is currently unavailable. Check back later or browse other offers.
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p><strong>Posted:</strong> {new Date(offer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </Modal>

    {/* Profile Completeness Gate */}
    <ProfileCompletenessGate
      isOpen={showGate}
      onClose={() => {
        setShowGate(false);
        if (pendingContact) {
          setPendingContact(false);
          doContact();
        }
      }}
      onComplete={() => {
        setShowGate(false);
        setPendingContact(false);
      }}
      actionType="contact_member"
    />
    </>
  );
}
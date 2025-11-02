// Need details modal

import { Need } from '@/lib/types';
import { MapPin, Calendar, Clock, CheckCircle2, HandHeart, Truck, Heart, Baby, Car, Wrench, Sparkles } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface NeedModalProps {
  need: Need | null;
  onClose: () => void;
  onViewPoster?: (poster: any) => void;
}

export function NeedModal({ need, onClose, onViewPoster }: NeedModalProps) {
  if (!need) return null;

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactElement> = {
      truck: <Truck size={24} />,
      heart: <Heart size={24} />,
      baby: <Baby size={24} />,
      car: <Car size={24} />,
      wrench: <Wrench size={24} />,
      sparkles: <Sparkles size={24} />
    };
    return icons[iconName] || <HandHeart size={24} />;
  };

  const handleVolunteer = () => {
    alert(`Thank you for volunteering!\n\nIn the real app, this would:\n• Notify ${need.isAnonymous ? 'the pastor/admin' : need.poster.name}\n• Add you to the volunteer list\n• Send you coordination details\n• Award you kudos after completion`);
  };

  return (
    <Modal
      isOpen={!!need}
      onClose={onClose}
      headerColor="from-teal-500 to-cyan-600"
      titleIcon={<div className="bg-white/20 p-3 rounded-xl">{getCategoryIcon(need.categoryIcon)}</div>}
      title=""
    >
      <div className="mb-6 -mt-6">
        <h2 className="text-3xl font-bold text-gray-900">{need.title}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-semibold">
            {need.category}
          </span>
          <span className="text-gray-600 text-sm flex items-center gap-1">
            <MapPin size={14} />
            {need.poster.campus}
          </span>
          {need.status === 'fulfilled' && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircle2 size={14} />
              Fulfilled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">About This Need</h3>
          <p className="text-gray-700 text-lg leading-relaxed">{need.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {need.date && (
            <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
              <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-2">
                <Calendar size={18} />
                Date Needed
              </h4>
              <p className="text-blue-800">
                {new Date(need.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
          {need.timeframe && (
            <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
              <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                <Clock size={18} />
                Timeframe
              </h4>
              <p className="text-purple-800">{need.timeframe}</p>
            </div>
          )}
        </div>

        {!need.isAnonymous && onViewPoster && (
          <div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">Posted By</h3>
            <div
              className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl cursor-pointer hover:border-indigo-400 transition"
              onClick={() => {
                onClose();
                onViewPoster(need.poster);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{need.poster.avatar}</div>
                <div className="flex-1">
                  <p className="font-bold text-lg">{need.poster.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {need.poster.campus} Campus
                  </p>
                </div>
              </div>
              <p className="text-xs text-indigo-600 mt-3 font-medium">Click to view full profile →</p>
            </div>
          </div>
        )}

        {need.isAnonymous && (
          <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
            <h3 className="font-bold text-lg mb-2 text-purple-900 flex items-center gap-2">
              🙏 Anonymous Request
            </h3>
            <p className="text-sm text-purple-800">
              This request was posted anonymously. The poster's identity is only visible to pastoral staff.
              Your help and prayers are still deeply appreciated!
            </p>
          </div>
        )}

        {need.volunteers.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-3 text-gray-900">
              Current Volunteers ({need.volunteers.length}
              {need.volunteersNeeded && `/${need.volunteersNeeded}`})
            </h3>
            <div className="space-y-2">
              {need.volunteers.map((volunteer, index) => (
                <div key={index} className="bg-green-50 border-2 border-green-200 p-3 rounded-xl flex items-center gap-3">
                  <div className="text-3xl">{volunteer.avatar}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{volunteer.name}</p>
                    {volunteer.confirmed && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-bold">
                        ✓ Confirmed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {need.suggestedGroups && need.suggestedGroups.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-lg mb-2 text-amber-900 flex items-center gap-2">
              💡 Admin Notes
            </h3>
            <p className="text-sm text-amber-800 mb-2"><strong>Suggested Groups:</strong></p>
            <div className="flex flex-wrap gap-2 mb-3">
              {need.suggestedGroups.map((group, i) => (
                <span key={i} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                  {group}
                </span>
              ))}
            </div>
            {need.adminNotes && (
              <p className="text-sm text-amber-800">{need.adminNotes}</p>
            )}
          </div>
        )}

        {need.status !== 'fulfilled' && (
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            icon={<HandHeart size={24} />}
            onClick={handleVolunteer}
          >
            I Can Help!
          </Button>
        )}

        {need.status === 'fulfilled' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
            <CheckCircle2 size={48} className="text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-xl text-green-900 mb-2">This Need Has Been Met!</h3>
            <p className="text-green-800">
              Thank you to everyone who helped. This is what community looks like! 💚
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p><strong>Posted:</strong> {new Date(need.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          {need.urgency === 'high' && (
            <p className="mt-1 text-red-600 font-semibold">🔴 This is an urgent need</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// Member details modal component

import { Member } from '@/lib/types';
import { MapPin, Award, Truck } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface MemberModalProps {
  member: Member | null;
  onClose: () => void;
  onViewAsset?: (asset: any) => void;
}

export function MemberModal({ member, onClose, onViewAsset }: MemberModalProps) {
  if (!member) return null;

  return (
    <Modal
      isOpen={!!member}
      onClose={onClose}
      headerColor="from-indigo-600 to-purple-600"
      titleIcon={<div className="text-6xl">{member.avatar}</div>}
      title=""
    >
      {/* Custom header content */}
      <div className="mb-6 -mt-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-bold text-gray-900">{member.name}</h2>
          {member.kudos > 0 && (
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
              <Award size={16} />
              {member.kudos}
            </span>
          )}
        </div>
        <p className="text-gray-600 flex items-center gap-2">
          <MapPin size={16} />
          {member.campus} Campus
        </p>
        <p className="text-gray-600 text-sm mt-1">
          Member since {member.memberSince}
        </p>
      </div>

      <div className="space-y-6">
        {/* Status Badges */}
        <div className="space-y-3">
          {member.kudos >= 50 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Award className="text-yellow-600" size={24} />
                <div>
                  <p className="font-bold text-yellow-900 text-lg">
                    {member.kudos >= 100 ? 'Church Family Hero!' : 'Super Connector'}
                  </p>
                  <p className="text-xs text-yellow-700">
                    Earned {member.kudos} kudos by serving the community
                  </p>
                </div>
              </div>
            </div>
          )}

          {member.seekingWork && (
            <div className="bg-orange-50 border-2 border-orange-300 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="text-3xl">💼</div>
                <div>
                  <p className="font-bold text-orange-900 text-lg">Actively Seeking Employment</p>
                  <p className="text-sm text-orange-700">
                    Open to opportunities • Available for interviews • Connect to help!
                  </p>
                </div>
              </div>
            </div>
          )}

          {member.lookingForGroups && member.lookingForGroups.length > 0 && (
            <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="text-3xl">👥</div>
                <div>
                  <p className="font-bold text-purple-900 text-lg">Looking to Join Groups</p>
                  <p className="text-sm text-purple-700">
                    Interested in: {member.lookingForGroups.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {member.bio && (
          <div>
            <h3 className="font-bold text-lg mb-2">About</h3>
            <p className="text-gray-700">{member.bio}</p>
          </div>
        )}

        {/* Professional Info */}
        <div>
          <h3 className="font-bold text-lg mb-3">Professional Info</h3>
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <div>
              <p className="text-xs text-gray-500">Title</p>
              <p className="font-medium">{member.jobTitle}</p>
            </div>
            {member.company && (
              <div>
                <p className="text-xs text-gray-500">Company</p>
                <p className="font-medium">{member.company}</p>
              </div>
            )}
          </div>
        </div>

        {/* Assets */}
        {member.assets.length > 0 && (
          <div>
            <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-indigo-900">
              <Truck size={24} className="text-indigo-600" />
              Available Assets ({member.assets.length})
            </h3>
            <div className="space-y-3">
              {member.assets.map((asset, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-xl cursor-pointer hover:border-green-400 transition"
                  onClick={() => onViewAsset && onViewAsset({ ...asset, owner: member })}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">
                      {asset.type === 'vehicle' ? '🚗' :
                       asset.type === 'equipment' ? '🚜' :
                       asset.type === 'business' ? '💼' : '🔧'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">{asset.name}</p>
                      <p className="text-sm text-green-700 font-medium mt-1">
                        📅 {asset.available}
                      </p>
                      {asset.description && (
                        <p className="text-sm text-gray-600 mt-2">{asset.description}</p>
                      )}
                      <p className="text-xs text-indigo-600 mt-2 font-medium">Click to request →</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        <div>
          <h3 className="font-bold text-xl mb-3 text-indigo-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="font-bold text-xl mb-3 text-indigo-900">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {member.interests.map((interest, i) => (
              <span key={i} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Message Button */}
        <Button variant="primary" className="w-full">
          💬 Send Message
        </Button>
      </div>
    </Modal>
  );
}

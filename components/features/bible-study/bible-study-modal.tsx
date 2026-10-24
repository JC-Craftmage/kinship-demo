// Bible Study group details modal

import { BibleStudyGroup } from '@/lib/types';
import { MapPin, Calendar, Clock, Users, BookOpen, Mail, CheckCircle2, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface BibleStudyModalProps {
  group: BibleStudyGroup | null;
  onClose: () => void;
}

export function BibleStudyModal({ group, onClose }: BibleStudyModalProps) {
  if (!group) return null;

  const handleJoin = () => {
    alert(`Join request sent!\n\nIn the real app, this would:\n• Notify ${group.leader.name} (the group leader)\n• Send you a confirmation\n• Add you to the group's communication channel`);
  };

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
    <Modal
      isOpen={!!group}
      onClose={onClose}
      headerColor="from-indigo-500 to-purple-600"
      titleIcon={<div className="bg-white/20 p-3 rounded-xl"><BookOpen size={24} /></div>}
      title=""
    >
      <div className="mb-6 -mt-6">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900">{group.name}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">
                {group.currentBook}
              </span>
              <span className="text-gray-600 text-sm flex items-center gap-1">
                <MapPin size={14} />
                {group.campus}
              </span>
              {!group.isOpen && (
                <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                  <Lock size={14} />
                  Group Full
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* About */}
        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">About This Group</h3>
          <p className="text-gray-700 text-lg leading-relaxed">{group.description}</p>
        </div>

        {/* Current Study */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-indigo-600" />
            <h3 className="font-bold text-lg text-indigo-900">Currently Studying</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-800">{group.currentBook}</p>
          <p className="text-indigo-700 text-lg">{group.currentChapter}</p>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Calendar size={18} />
              Schedule
            </h4>
            <p className="text-blue-800 font-medium">{group.schedule}</p>
            <p className="text-blue-600 text-sm mt-1">
              Next: {new Date(group.nextStudyDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
            <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
              <Clock size={18} />
              Location
            </h4>
            <p className="text-purple-800 font-medium">{group.location}</p>
            <p className="text-purple-600 text-sm mt-1">{group.campus} Campus</p>
          </div>
        </div>

        {/* Leader */}
        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">Group Leader</h3>
          <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{group.leader.avatar}</div>
              <div className="flex-1">
                <p className="font-bold text-lg">{group.leader.name}</p>
                <p className="text-sm text-gray-600">Group Leader</p>
                {group.leader.email && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-indigo-600">
                    <Mail size={14} />
                    <span>{group.leader.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <h3 className="font-bold text-xl mb-3 text-gray-900">Topics & Focus</h3>
          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${getTagColor(tag)}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Members */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-gray-600" />
              <span className="font-semibold text-gray-700">Members</span>
            </div>
            <span className="font-bold text-xl text-gray-900">
              {group.memberCount}{group.maxMembers ? ` / ${group.maxMembers}` : ''}
            </span>
          </div>
        </div>

        {/* Join Button */}
        {group.isOpen ? (
          <Button
            variant="primary"
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            icon={<CheckCircle2 size={24} />}
            onClick={handleJoin}
          >
            Join This Study Group
          </Button>
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-center">
            <Lock size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">
              This group is currently full. Check back later or browse other groups.
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <p><strong>Started:</strong> {new Date(group.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </Modal>
  );
}
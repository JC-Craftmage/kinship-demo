// Post Bible Study Group Modal - Form for creating new groups

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { BookOpen, Check } from 'lucide-react';

interface PostGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PostGroupData) => void;
}

export interface PostGroupData {
  name: string;
  description: string;
  schedule: string;
  location: string;
  campus: string;
  currentBook: string;
  currentChapter: string;
  maxMembers: string;
  tags: string[];
}

const CAMPUSES = ['Downtown', 'Westside', 'Eastside', 'North Campus', 'South Campus'];

const SUGGESTED_TAGS = ['Gospel', 'Epistle', 'Old Testament', 'New Testament', 'Prayer', 'Fellowship', 'Deep Dive', 'All Welcome', 'Young Adults', 'Women', 'Men', 'Theology', 'Application', 'Life Issues'];

export function PostGroupModal({ isOpen, onClose, onSubmit }: PostGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');
  const [location, setLocation] = useState('');
  const [campus, setCampus] = useState('Downtown');
  const [currentBook, setCurrentBook] = useState('');
  const [currentChapter, setCurrentChapter] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setDescription('');
    setSchedule('');
    setLocation('');
    setCampus('Downtown');
    setCurrentBook('');
    setCurrentChapter('');
    setMaxMembers('');
    setSelectedTags([]);
    setShowSuccess(false);
    setErrors({});
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Group name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!schedule.trim()) newErrors.schedule = 'Schedule is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (!currentBook.trim()) newErrors.currentBook = 'Current study book is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      schedule: schedule.trim(),
      location: location.trim(),
      campus,
      currentBook: currentBook.trim(),
      currentChapter: currentChapter.trim(),
      maxMembers: maxMembers.trim(),
      tags: selectedTags,
    });

    setShowSuccess(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-indigo-500 to-purple-600">
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Group Created!</h2>
          <p className="text-gray-600 text-lg">
            Your Bible study group is now live and ready for members to join.
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} headerColor="from-indigo-500 to-purple-600">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Start a Bible Study</h2>
          <p className="text-gray-600 mt-1">Create a new group for your church family.</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Group Name *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Gospel of John Study"
            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
              errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={80}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What is this group about? Who is it for?"
            rows={3}
            className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none ${
              errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            maxLength={300}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Schedule *</label>
            <input
              type="text"
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
              placeholder="e.g., Sundays at 9 AM"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.schedule ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.schedule && <p className="text-red-500 text-sm mt-1">{errors.schedule}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location *</label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g., Room 201"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.location ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>
        </div>

        {/* Campus */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Campus</label>
          <select
            value={campus}
            onChange={e => setCampus(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white"
          >
            {CAMPUSES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Current Study */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Book *</label>
            <input
              type="text"
              value={currentBook}
              onChange={e => setCurrentBook(e.target.value)}
              placeholder="e.g., John"
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
                errors.currentBook ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.currentBook && <p className="text-red-500 text-sm mt-1">{errors.currentBook}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chapter/Section</label>
            <input
              type="text"
              value={currentChapter}
              onChange={e => setCurrentChapter(e.target.value)}
              placeholder="e.g., Chapter 3"
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
        </div>

        {/* Max Members */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Members (optional)</label>
          <input
            type="text"
            value={maxMembers}
            onChange={e => setMaxMembers(e.target.value)}
            placeholder="Leave blank for no limit"
            className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (optional)</label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm border-2 transition ${
                  selectedTags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-700 border-indigo-300 ring-2 ring-indigo-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            icon={<BookOpen size={18} />}
          >
            Create Group
          </Button>
        </div>
      </div>
    </Modal>
  );
}
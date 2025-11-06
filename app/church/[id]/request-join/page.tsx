// Request to join church page with questionnaire

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';

interface Church {
  id: string;
  name: string;
  campuses: Array<{
    id: string;
    name: string;
    location: string | null;
  }>;
}

interface Questionnaire {
  id: string;
  question: string;
  is_required: boolean;
  display_order: number;
}

export default function RequestJoinPage() {
  const router = useRouter();
  const params = useParams();
  const churchId = params.id as string;
  const { user } = useUser();
  const { membership } = useChurchMembership();

  const [church, setChurch] = useState<Church | null>(null);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [personalNote, setPersonalNote] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch church details
        const churchRes = await fetch(`/api/churches/${churchId}`);
        const churchData = await churchRes.json();

        if (!churchRes.ok) {
          throw new Error(churchData.error || 'Failed to load church');
        }

        setChurch(churchData.church);

        // Auto-select campus if only one
        if (churchData.church.campuses?.length === 1) {
          setSelectedCampusId(churchData.church.campuses[0].id);
        }

        // Fetch questionnaire
        const questionnaireRes = await fetch(`/api/churches/${churchId}/questionnaire`);
        const questionnaireData = await questionnaireRes.json();

        if (questionnaireRes.ok && questionnaireData.questions) {
          setQuestionnaires(questionnaireData.questions);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    if (churchId) {
      fetchData();
    }
  }, [churchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required questions are answered
      const unansweredRequired = questionnaires.filter(
        q => q.is_required && !answers[q.id]?.trim()
      );

      if (unansweredRequired.length > 0) {
        throw new Error('Please answer all required questions');
      }

      // Validate campus selection for multi-campus churches
      if (church && church.campuses.length > 1 && !selectedCampusId) {
        throw new Error('Please select a campus');
      }

      const response = await fetch('/api/join-requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId,
          campusId: selectedCampusId || null,
          personalNote: personalNote.trim() || null,
          questionnaireResponses: questionnaires.map(q => ({
            questionnaireId: q.id,
            answer: answers[q.id] || '',
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      // Success! Show confirmation and redirect
      alert('Request submitted successfully! Church admins will review your request.');
      router.push('/browse-churches');
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !church) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => router.back()}>
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Check if user is already a member
  if (membership?.churchId === churchId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Already a Member</h2>
          <p className="text-gray-600 mb-4">You are already a member of this church.</p>
          <Button variant="primary" onClick={() => router.push('/home')}>
            Go to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="mb-3 bg-indigo-500 text-white border-0 hover:bg-indigo-400"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Request to Join</h1>
          <p className="text-indigo-200">{church?.name}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Warning about current membership */}
        {membership && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-yellow-900 text-sm mb-1">
                  You are currently a member of {membership.churchName}
                </h4>
                <p className="text-xs text-yellow-800">
                  Submitting this request does not automatically remove you from your current church.
                  If approved, you will need to decide whether to leave your current church.
                  Please consider your commitment carefully.
                </p>
              </div>
            </div>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campus Selection */}
          {church && church.campuses.length > 1 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Select Campus</h3>
              <div className="space-y-3">
                {church.campuses.map((campus) => (
                  <label
                    key={campus.id}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      selectedCampusId === campus.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="campus"
                      value={campus.id}
                      checked={selectedCampusId === campus.id}
                      onChange={(e) => setSelectedCampusId(e.target.value)}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{campus.name}</div>
                      {campus.location && (
                        <div className="text-sm text-gray-600">{campus.location}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </Card>
          )}

          {/* Personal Note */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Personal Note (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tell the church leadership why you'd like to join their community.
            </p>
            <textarea
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              placeholder="e.g., I've been attending services for 3 months and would love to become an official member..."
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-2">
              {personalNote.length}/1000 characters
            </p>
          </Card>

          {/* Questionnaire */}
          {questionnaires.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Questionnaire</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please answer the following questions to help the church leadership get to know you.
              </p>
              <div className="space-y-4">
                {questionnaires.map((q, index) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {index + 1}. {q.question}
                      {q.is_required && <span className="text-red-600 ml-1">*</span>}
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      rows={3}
                      required={q.is_required}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      maxLength={500}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h3 className="text-xl font-bold mb-2">Ready to Submit?</h3>
            <p className="text-indigo-100 mb-4 text-sm">
              Your request will be reviewed by church leadership. They may contact you for additional
              information or to invite you to attend services in person.
            </p>
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-white text-indigo-600 hover:bg-gray-100 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Submit Join Request
                </>
              )}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

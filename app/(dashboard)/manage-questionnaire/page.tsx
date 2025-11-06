// Manage church questionnaire page (Owner only)

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Plus, Edit2, Trash2, GripVertical, HelpCircle, Check, X } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
}

export default function ManageQuestionnairePage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [isRequired, setIsRequired] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = role === 'owner';

  useEffect(() => {
    fetchQuestions();
  }, [membership?.churchId]);

  const fetchQuestions = async () => {
    if (!membership?.churchId || !isOwner) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`/api/churches/${membership.churchId}/questionnaire`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch questions');
      }

      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    if (!questionText.trim()) {
      setError('Question text is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/${membership?.churchId}/questionnaire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          isRequired,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add question');
      }

      await fetchQuestions();
      setShowAddModal(false);
      setQuestionText('');
      setIsRequired(true);
    } catch (err) {
      console.error('Error adding question:', err);
      setError(err instanceof Error ? err.message : 'Failed to add question');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion || !questionText.trim()) {
      setError('Question text is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/questionnaire/${selectedQuestion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText.trim(),
          isRequired,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update question');
      }

      await fetchQuestions();
      setShowEditModal(false);
      setSelectedQuestion(null);
      setQuestionText('');
      setIsRequired(true);
    } catch (err) {
      console.error('Error updating question:', err);
      setError(err instanceof Error ? err.message : 'Failed to update question');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/questionnaire/${selectedQuestion.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete question');
      }

      await fetchQuestions();
      setShowDeleteModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      console.error('Error deleting question:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (question: Question) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/questionnaire/${question.id}/toggle`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to toggle question');
      }

      await fetchQuestions();
    } catch (err) {
      console.error('Error toggling question:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle question');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">Manage Questionnaire</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
            <p className="text-gray-600">
              Only church owners can manage the questionnaire.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading questionnaire...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Manage Questionnaire</h1>
          <p className="text-sm text-indigo-200">{membership?.churchName}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 text-sm mb-1">About Questionnaires</h3>
              <p className="text-xs text-blue-800">
                Questions are asked when people request to join your church (not when using invite codes).
                Use them to vet prospective members and learn about their background.
              </p>
            </div>
          </div>
        </Card>

        {/* Add Question Button */}
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Add Question
        </Button>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q, index) => (
              <Card key={q.id} className={`p-4 ${!q.is_active ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {index + 1}. {q.question}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setQuestionText(q.question);
                            setIsRequired(q.is_required);
                            setShowEditModal(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedQuestion(q);
                            setShowDeleteModal(true);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        q.is_required
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {q.is_required ? 'Required' : 'Optional'}
                      </span>
                      <button
                        onClick={() => handleToggleActive(q)}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {q.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">No Questions Yet</h3>
            <p className="text-gray-600 mb-4">
              Add questions to vet members who request to join your church.
            </p>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} className="mr-2" />
              Add First Question
            </Button>
          </Card>
        )}

        {/* Example Questions */}
        <Card className="p-4 bg-gray-50">
          <h4 className="font-bold text-gray-900 text-sm mb-2">Example Questions:</h4>
          <ul className="text-sm text-gray-700 space-y-1 list-disc ml-5">
            <li>How long have you been attending our church?</li>
            <li>Which campus do you attend?</li>
            <li>What is our lead pastor's name?</li>
            <li>Why do you want to become an official member?</li>
            <li>Have you completed our membership class?</li>
          </ul>
        </Card>
      </div>

      {/* Add Question Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setQuestionText('');
            setIsRequired(true);
            setError(null);
          }}
          title="Add Question"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., How long have you been attending our church?"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {questionText.length}/500 characters
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Required Question
                </span>
              </label>
              <p className="text-xs text-gray-500 ml-6">
                Users must answer this question to submit their request
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setQuestionText('');
                  setIsRequired(true);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddQuestion}
                className="flex-1"
                disabled={isProcessing || !questionText.trim()}
              >
                {isProcessing ? 'Adding...' : 'Add Question'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Question Modal */}
      {showEditModal && selectedQuestion && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedQuestion(null);
            setQuestionText('');
            setIsRequired(true);
            setError(null);
          }}
          title="Edit Question"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                maxLength={500}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Required Question
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedQuestion(null);
                  setQuestionText('');
                  setIsRequired(true);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateQuestion}
                className="flex-1"
                disabled={isProcessing || !questionText.trim()}
              >
                {isProcessing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Question Modal */}
      {showDeleteModal && selectedQuestion && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedQuestion(null);
            setError(null);
          }}
          title="Delete Question"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete this question?
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">{selectedQuestion.question}</p>
            </div>
            <p className="text-xs text-gray-600">
              This action cannot be undone. Existing responses to this question will remain in past join requests.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedQuestion(null);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteQuestion}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Question'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

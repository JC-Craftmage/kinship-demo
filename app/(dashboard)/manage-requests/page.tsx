// Admin dashboard for managing join requests

'use client';

import { useEffect, useState } from 'react';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { UserCheck, UserX, Eye, MapPin, Mail, Calendar, MessageSquare } from 'lucide-react';

interface JoinRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_photo: string | null;
  personal_note: string | null;
  created_at: string;
  campus: {
    id: string;
    name: string;
  } | null;
  responses: Array<{
    question: string;
    answer: string;
  }>;
}

export default function ManageRequestsPage() {
  const { membership, role } = useChurchMembership();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Check if user has permission (Moderator or higher)
  const canManageRequests = role && ['moderator', 'overseer', 'owner'].includes(role);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!membership?.churchId || !canManageRequests) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/join-requests?churchId=${membership.churchId}&status=pending`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch requests');
        }

        setRequests(data.requests || []);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [membership?.churchId, canManageRequests]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/join-requests/${selectedRequest.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNote: reviewNote.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve request');
      }

      // Remove from list
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
      setReviewNote('');
      alert('Request approved successfully! The user has been added as a member.');
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;

    if (!reviewNote.trim()) {
      setError('Please provide a reason for denial');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/join-requests/${selectedRequest.id}/deny`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewNote: reviewNote.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to deny request');
      }

      // Remove from list
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setSelectedRequest(null);
      setReviewNote('');
      alert('Request denied. The user has been notified.');
    } catch (err) {
      console.error('Error denying request:', err);
      setError(err instanceof Error ? err.message : 'Failed to deny request');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canManageRequests) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">Manage Join Requests</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">
              You need to be a Moderator or higher to manage join requests.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Manage Join Requests</h1>
          <p className="text-sm text-indigo-200">{membership?.churchName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>{requests.length}</strong> pending {requests.length === 1 ? 'request' : 'requests'}
          </p>
        </Card>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {request.user_photo ? (
                    <img
                      src={request.user_photo}
                      alt={request.user_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {request.user_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{request.user_name}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mt-1">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        {request.user_email}
                      </div>
                      {request.campus && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {request.campus.name}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setSelectedRequest(request)}
                    className="flex-shrink-0"
                  >
                    <Eye size={16} className="mr-2" />
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-600">
              There are no join requests waiting for review at this time.
            </p>
          </Card>
        )}
      </div>

      {/* Review Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => {
            setSelectedRequest(null);
            setReviewNote('');
            setError(null);
          }}
          title="Review Join Request"
        >
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-4 pb-4 border-b">
              {selectedRequest.user_photo ? (
                <img
                  src={selectedRequest.user_photo}
                  alt={selectedRequest.user_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {selectedRequest.user_name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedRequest.user_name}</h3>
                <p className="text-sm text-gray-600">{selectedRequest.user_email}</p>
                {selectedRequest.campus && (
                  <p className="text-sm text-gray-600">Campus: {selectedRequest.campus.name}</p>
                )}
              </div>
            </div>

            {/* Personal Note */}
            {selectedRequest.personal_note && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Personal Note
                </h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {selectedRequest.personal_note}
                </p>
              </div>
            )}

            {/* Questionnaire Responses */}
            {selectedRequest.responses.length > 0 && (
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3">Questionnaire Responses</h4>
                <div className="space-y-3">
                  {selectedRequest.responses.map((response, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {response.question}
                      </p>
                      <p className="text-sm text-gray-700">{response.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response to Applicant (Optional for approval, required for denial)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="e.g., Welcome! Please attend our next new member orientation..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={handleDeny}
                disabled={isProcessing}
                className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
              >
                <UserX size={16} className="mr-2" />
                {isProcessing ? 'Processing...' : 'Deny'}
              </Button>
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <UserCheck size={16} className="mr-2" />
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

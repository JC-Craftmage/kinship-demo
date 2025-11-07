'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react';

interface JoinRequest {
  id: string;
  user_name: string;
  user_email: string;
  user_photo: string | null;
  personal_note: string | null;
  status: 'pending' | 'approved' | 'denied' | 'withdrawn';
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  campus: {
    id: string;
    name: string;
  } | null;
  responses: {
    question: string;
    answer: string;
  }[];
}

export default function RequestHistoryPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const isModerator = role && ['moderator', 'overseer', 'owner'].includes(role);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!membership?.churchId || !isModerator) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/join-requests?churchId=${membership.churchId}`);
        const data = await response.json();

        if (data.requests) {
          setRequests(data.requests);
          setFilteredRequests(data.requests);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching request history:', error);
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [membership, isModerator]);

  // Filter and search logic
  useEffect(() => {
    let filtered = requests;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    // Search by name or email
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.user_name.toLowerCase().includes(query) ||
        req.user_email.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  }, [requests, searchQuery, statusFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'withdrawn':
        return <MinusCircle className="w-5 h-5 text-gray-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-green-100 text-green-800 border-green-300',
      denied: 'bg-red-100 text-red-800 border-red-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      withdrawn: 'bg-gray-100 text-gray-800 border-gray-300',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (!isModerator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">You do not have permission to view request history.</p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading request history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Request History</h1>
          <p className="text-gray-600">
            View all join requests including approved, denied, and pending requests.
          </p>
        </div>

        {/* Filters and Search */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Name or Email
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        </Card>

        {/* Request List */}
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">
                {searchQuery || statusFilter !== 'all'
                  ? 'No requests match your filters.'
                  : 'No join requests yet.'}
              </p>
            </Card>
          ) : (
            filteredRequests.map(request => (
              <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* User Photo */}
                  {request.user_photo ? (
                    <img
                      src={request.user_photo}
                      alt={request.user_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                      {request.user_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Request Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{request.user_name}</h3>
                        <p className="text-sm text-gray-600">{request.user_email}</p>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.campus && (
                      <p className="text-sm text-gray-600 mb-2">
                        Campus: <strong>{request.campus.name}</strong>
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Requested</p>
                        <p className="font-medium text-gray-900">
                          {new Date(request.created_at).toLocaleDateString()} at{' '}
                          {new Date(request.created_at).toLocaleTimeString()}
                        </p>
                      </div>

                      {request.reviewed_at && (
                        <div>
                          <p className="text-gray-500">
                            {request.status === 'approved' ? 'Approved' : 'Denied'}
                          </p>
                          <p className="font-medium text-gray-900">
                            {new Date(request.reviewed_at).toLocaleDateString()} at{' '}
                            {new Date(request.reviewed_at).toLocaleTimeString()}
                          </p>
                        </div>
                      )}
                    </div>

                    {request.review_note && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-xs text-blue-700 font-bold mb-1">Admin Note</p>
                        <p className="text-sm text-blue-900">{request.review_note}</p>
                      </div>
                    )}

                    {request.personal_note && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-xs text-gray-600 font-bold mb-1">Applicant's Note</p>
                        <p className="text-sm text-gray-800">{request.personal_note}</p>
                      </div>
                    )}

                    {/* View Details Button */}
                    {request.responses.length > 0 && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetailsModal(true);
                        }}
                        variant="outline"
                        className="mt-3"
                      >
                        View Questionnaire Responses ({request.responses.length})
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.user_name}</h2>
                  <p className="text-gray-600">{selectedRequest.user_email}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4">Questionnaire Responses</h3>

              <div className="space-y-4">
                {selectedRequest.responses.map((response, index) => (
                  <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded">
                    <p className="font-bold text-gray-900 mb-2">{response.question}</p>
                    <p className="text-gray-800">{response.answer}</p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="primary"
                className="mt-6 w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

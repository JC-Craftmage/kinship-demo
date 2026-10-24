'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SupportTicket {
  id: string;
  user_id: string;
  church_id: string;
  category: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_name?: string;
  user_email?: string;
}

interface SupportAdminProps {
  churchId: string;
}

export default function SupportAdmin({ churchId }: SupportAdminProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
  }, [churchId, filter]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select('*')
        .eq('church_id', churchId)
        .order('created_at', { ascending: false });

      if (filter === 'open') {
        query = query.in('status', ['open', 'in_progress']);
      } else if (filter === 'resolved') {
        query = query.in('status', ['resolved', 'closed']);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Support Tickets</h2>
        <div className="flex gap-2">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white border rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatDate(ticket.created_at)}
                  </p>
                </div>
                <div className="ml-4">
                  <select
                    value={ticket.status}
                    onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
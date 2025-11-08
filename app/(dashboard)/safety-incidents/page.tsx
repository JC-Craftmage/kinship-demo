'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';

interface IncidentReport {
  id: string;
  campus_id: string | null;
  reported_by: string;
  incident_type: 'medical' | 'security' | 'accident' | 'fire' | 'weather' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string | null;
  occurred_at: string;
  people_involved: string | null;
  witnesses: string | null;
  actions_taken: string;
  follow_up_needed: boolean;
  follow_up_notes: string | null;
  status: 'open' | 'under_review' | 'resolved' | 'closed';
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  reporterName: string;
  resolverName: string | null;
  campusName: string | null;
}

interface Campus {
  id: string;
  name: string;
}

interface IncidentForm {
  campusId: string;
  incidentType: string;
  severity: string;
  title: string;
  description: string;
  location: string;
  occurredAt: string;
  peopleInvolved: string;
  witnesses: string;
  actionsTaken: string;
  followUpNeeded: boolean;
  followUpNotes: string;
}

export default function SafetyIncidentsPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState<IncidentReport | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentReport | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCampus, setFilterCampus] = useState<string>('all');

  const [incidentForm, setIncidentForm] = useState<IncidentForm>({
    campusId: '',
    incidentType: 'other',
    severity: 'low',
    title: '',
    description: '',
    location: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    peopleInvolved: '',
    witnesses: '',
    actionsTaken: '',
    followUpNeeded: false,
    followUpNotes: '',
  });

  const isAdmin = role && ['owner', 'overseer', 'moderator'].includes(role);

  useEffect(() => {
    const fetchData = async () => {
      if (!membership?.churchId || !isAdmin) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Build query params
        const params = new URLSearchParams();
        if (filterType !== 'all') params.append('type', filterType);
        if (filterSeverity !== 'all') params.append('severity', filterSeverity);
        if (filterStatus !== 'all') params.append('status', filterStatus);
        if (filterCampus !== 'all') params.append('campusId', filterCampus);

        // Fetch incidents
        const incidentsResponse = await fetch(
          `/api/churches/${membership.churchId}/safety-incidents?${params.toString()}`
        );
        const incidentsData = await incidentsResponse.json();

        if (!incidentsResponse.ok) {
          throw new Error(incidentsData.error || 'Failed to fetch incidents');
        }

        setIncidents(incidentsData.incidents || []);

        // Fetch campuses
        const campusesResponse = await fetch(`/api/churches/${membership.churchId}/campuses`);
        const campusesData = await campusesResponse.json();

        if (campusesResponse.ok) {
          setCampuses(campusesData.campuses || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load incident reports');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [membership, isAdmin, filterType, filterSeverity, filterStatus, filterCampus]);

  const refreshIncidents = async () => {
    if (!membership?.churchId) return;

    const response = await fetch(`/api/churches/${membership.churchId}/safety-incidents`);
    const data = await response.json();
    setIncidents(data.incidents || []);
  };

  const handleAddIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId) return;

    try {
      const response = await fetch(`/api/churches/${membership.churchId}/safety-incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create incident report');
      }

      await refreshIncidents();

      // Reset form
      setIncidentForm({
        campusId: '',
        incidentType: 'other',
        severity: 'low',
        title: '',
        description: '',
        location: '',
        occurredAt: new Date().toISOString().slice(0, 16),
        peopleInvolved: '',
        witnesses: '',
        actionsTaken: '',
        followUpNeeded: false,
        followUpNotes: '',
      });
      setShowAddModal(false);
    } catch (err) {
      console.error('Error creating incident:', err);
      alert(err instanceof Error ? err.message : 'Failed to create incident report');
    }
  };

  const handleEditIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!membership?.churchId || !editingIncident) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-incidents/${editingIncident.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(incidentForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update incident report');
      }

      await refreshIncidents();
      setEditingIncident(null);
    } catch (err) {
      console.error('Error updating incident:', err);
      alert(err instanceof Error ? err.message : 'Failed to update incident report');
    }
  };

  const handleDeleteIncident = async (incidentId: string, title: string) => {
    if (!membership?.churchId) return;
    if (!confirm(`Delete incident report: "${title}"?`)) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-incidents/${incidentId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete incident');
      }

      await refreshIncidents();
    } catch (err) {
      console.error('Error deleting incident:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete incident');
    }
  };

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    if (!membership?.churchId) return;

    try {
      const response = await fetch(
        `/api/churches/${membership.churchId}/safety-incidents/${incidentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update status');
      }

      await refreshIncidents();
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const openEditModal = (incident: IncidentReport) => {
    setIncidentForm({
      campusId: incident.campus_id || '',
      incidentType: incident.incident_type,
      severity: incident.severity,
      title: incident.title,
      description: incident.description,
      location: incident.location || '',
      occurredAt: new Date(incident.occurred_at).toISOString().slice(0, 16),
      peopleInvolved: incident.people_involved || '',
      witnesses: incident.witnesses || '',
      actionsTaken: incident.actions_taken,
      followUpNeeded: incident.follow_up_needed,
      followUpNotes: incident.follow_up_notes || '',
    });
    setEditingIncident(incident);
  };

  const getSeverityBadge = (severity: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      low: { bg: 'bg-blue-100', text: 'text-blue-800' },
      medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      high: { bg: 'bg-orange-100', text: 'text-orange-800' },
      critical: { bg: 'bg-red-100', text: 'text-red-800' },
    };

    const badge = badges[severity] || badges.low;

    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
        {severity.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: any }> = {
      open: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertTriangle },
      under_review: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      closed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle },
    };

    const badge = badges[status] || badges.open;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-600 mb-4">
            Only church admins (owners, overseers, moderators) can view incident reports.
          </p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading incident reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle size={32} className="text-red-600" />
                Incident Reports
              </h1>
              <p className="text-gray-600">
                Document and track safety incidents (Admin Only)
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus size={18} className="mr-2" />
              Report Incident
            </Button>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push('/safety-team')}
              className="bg-white text-gray-700 border-gray-300"
            >
              Roster
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push('/safety-schedules')}
              className="bg-white text-gray-700 border-gray-300"
            >
              Schedules
            </Button>
            <Button
              variant="secondary"
              className="bg-red-100 text-red-900 border-red-300"
            >
              Incidents
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Types</option>
                <option value="medical">Medical</option>
                <option value="security">Security</option>
                <option value="accident">Accident</option>
                <option value="fire">Fire</option>
                <option value="weather">Weather</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus
              </label>
              <select
                value={filterCampus}
                onChange={(e) => setFilterCampus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="all">All Campuses</option>
                {campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>{campus.name}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Incident List */}
        {incidents.length === 0 ? (
          <Card className="p-12 text-center">
            <AlertTriangle size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Incident Reports</h3>
            <p className="text-gray-600 mb-4">
              {filterType !== 'all' || filterSeverity !== 'all' || filterStatus !== 'all' || filterCampus !== 'all'
                ? 'No incidents match your filters.'
                : 'No incidents have been reported yet.'}
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus size={18} className="mr-2" />
              Report First Incident
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {incidents.map(incident => (
              <Card key={incident.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Title & Badges */}
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="text-lg font-bold text-gray-900 flex-1">
                        {incident.title}
                      </h3>
                      <div className="flex gap-2">
                        {getSeverityBadge(incident.severity)}
                        {getStatusBadge(incident.status)}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="text-sm text-gray-600 space-y-1 mb-3">
                      <div>
                        <span className="font-medium">Type:</span> {incident.incident_type.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Occurred:</span>{' '}
                        {new Date(incident.occurred_at).toLocaleString()}
                      </div>
                      {incident.location && (
                        <div>
                          <span className="font-medium">Location:</span> {incident.location}
                        </div>
                      )}
                      {incident.campusName && (
                        <div>
                          <span className="font-medium">Campus:</span> {incident.campusName}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Reported by:</span> {incident.reporterName}
                      </div>
                    </div>

                    {/* Short Description */}
                    <p className="text-gray-700 mb-3">
                      {incident.description.length > 200
                        ? `${incident.description.slice(0, 200)}...`
                        : incident.description}
                    </p>

                    {/* View Details Link */}
                    <button
                      onClick={() => setViewingIncident(incident)}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View Full Report →
                    </button>

                    {/* Follow-up Flag */}
                    {incident.follow_up_needed && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>Follow-up needed:</strong> {incident.follow_up_notes || 'No notes provided'}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(incident)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Edit incident"
                      >
                        <Edit size={16} className="text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(incident.id, incident.title)}
                        className="p-2 hover:bg-gray-100 rounded"
                        title="Delete incident"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>

                    {/* Status Actions */}
                    {incident.status === 'open' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'under_review')}
                        className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                      >
                        Mark Reviewing
                      </button>
                    )}
                    {(incident.status === 'open' || incident.status === 'under_review') && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'resolved')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {incident.status === 'resolved' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'closed')}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Incident Modal */}
        {(showAddModal || editingIncident) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingIncident ? 'Edit Incident Report' : 'Report New Incident'}
              </h2>
              <form onSubmit={editingIncident ? handleEditIncident : handleAddIncident}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Title *
                    </label>
                    <input
                      type="text"
                      value={incidentForm.title}
                      onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                      placeholder="Brief title of incident"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incident Type *
                    </label>
                    <select
                      value={incidentForm.incidentType}
                      onChange={(e) => setIncidentForm({ ...incidentForm, incidentType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="medical">Medical</option>
                      <option value="security">Security</option>
                      <option value="accident">Accident</option>
                      <option value="fire">Fire</option>
                      <option value="weather">Weather</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity *
                    </label>
                    <select
                      value={incidentForm.severity}
                      onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Occurred At */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occurred At *
                    </label>
                    <input
                      type="datetime-local"
                      value={incidentForm.occurredAt}
                      onChange={(e) => setIncidentForm({ ...incidentForm, occurredAt: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Campus */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Campus
                    </label>
                    <select
                      value={incidentForm.campusId}
                      onChange={(e) => setIncidentForm({ ...incidentForm, campusId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Campuses</option>
                      {campuses.map(campus => (
                        <option key={campus.id} value={campus.id}>{campus.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={incidentForm.location}
                      onChange={(e) => setIncidentForm({ ...incidentForm, location: e.target.value })}
                      placeholder="e.g., Main Sanctuary, Parking Lot A"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={incidentForm.description}
                      onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                      placeholder="Detailed description of what happened"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* People Involved */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      People Involved
                    </label>
                    <textarea
                      value={incidentForm.peopleInvolved}
                      onChange={(e) => setIncidentForm({ ...incidentForm, peopleInvolved: e.target.value })}
                      placeholder="Names/descriptions of people involved"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Witnesses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Witnesses
                    </label>
                    <textarea
                      value={incidentForm.witnesses}
                      onChange={(e) => setIncidentForm({ ...incidentForm, witnesses: e.target.value })}
                      placeholder="Names/descriptions of witnesses"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  {/* Actions Taken */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actions Taken *
                    </label>
                    <textarea
                      value={incidentForm.actionsTaken}
                      onChange={(e) => setIncidentForm({ ...incidentForm, actionsTaken: e.target.value })}
                      placeholder="What actions were taken in response to the incident?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>

                  {/* Follow-up Needed */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="followUpNeeded"
                        checked={incidentForm.followUpNeeded}
                        onChange={(e) => setIncidentForm({ ...incidentForm, followUpNeeded: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="followUpNeeded" className="text-sm font-medium text-gray-700">
                        Follow-up needed
                      </label>
                    </div>
                    {incidentForm.followUpNeeded && (
                      <textarea
                        value={incidentForm.followUpNotes}
                        onChange={(e) => setIncidentForm({ ...incidentForm, followUpNotes: e.target.value })}
                        placeholder="Follow-up notes and action items"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700">
                    {editingIncident ? 'Save Changes' : 'Submit Report'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingIncident(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* View Incident Detail Modal */}
        {viewingIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewingIncident.title}
                </h2>
                <button
                  onClick={() => setViewingIncident(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Badges */}
                <div className="flex gap-2">
                  {getSeverityBadge(viewingIncident.severity)}
                  {getStatusBadge(viewingIncident.status)}
                  <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-800">
                    {viewingIncident.incident_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Occurred At:</span>
                    <p className="text-gray-900">{new Date(viewingIncident.occurred_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reported By:</span>
                    <p className="text-gray-900">{viewingIncident.reporterName}</p>
                  </div>
                  {viewingIncident.campusName && (
                    <div>
                      <span className="font-medium text-gray-700">Campus:</span>
                      <p className="text-gray-900">{viewingIncident.campusName}</p>
                    </div>
                  )}
                  {viewingIncident.location && (
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <p className="text-gray-900">{viewingIncident.location}</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingIncident.description}</p>
                </div>

                {/* People Involved */}
                {viewingIncident.people_involved && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">People Involved</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{viewingIncident.people_involved}</p>
                  </div>
                )}

                {/* Witnesses */}
                {viewingIncident.witnesses && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Witnesses</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{viewingIncident.witnesses}</p>
                  </div>
                )}

                {/* Actions Taken */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Actions Taken</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{viewingIncident.actions_taken}</p>
                </div>

                {/* Follow-up */}
                {viewingIncident.follow_up_needed && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <h3 className="font-bold text-yellow-900 mb-2">Follow-up Required</h3>
                    <p className="text-yellow-800">{viewingIncident.follow_up_notes || 'No notes provided'}</p>
                  </div>
                )}

                {/* Resolution Info */}
                {viewingIncident.resolved_at && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <h3 className="font-bold text-green-900 mb-2">Resolution</h3>
                    <p className="text-sm text-green-800">
                      Resolved by {viewingIncident.resolverName} on{' '}
                      {new Date(viewingIncident.resolved_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={() => setViewingIncident(null)}
                className="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Close
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

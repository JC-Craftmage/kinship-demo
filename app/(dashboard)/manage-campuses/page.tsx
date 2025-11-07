'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { MapPin, Edit, Trash2, Plus } from 'lucide-react';

interface Campus {
  id: string;
  name: string;
  location: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  zip_code: string | null;
  created_at: string;
}

export default function ManageCampusesPage() {
  const router = useRouter();
  const { membership, role } = useChurchMembership();
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [campusName, setCampusName] = useState('');
  const [campusLocation, setCampusLocation] = useState('');
  const [campusAddress, setCampusAddress] = useState('');
  const [campusZipCode, setCampusZipCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCampus, setDeletingCampus] = useState<Campus | null>(null);

  const isOwner = role === 'owner';

  useEffect(() => {
    const fetchCampuses = async () => {
      if (!membership?.churchId || !isOwner) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/churches/${membership.churchId}/campuses`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch campuses');
        }

        setCampuses(data.campuses || []);
      } catch (err) {
        console.error('Error fetching campuses:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campuses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampuses();
  }, [membership?.churchId, isOwner]);

  const openAddModal = () => {
    setEditingCampus(null);
    setCampusName('');
    setCampusLocation('');
    setCampusAddress('');
    setCampusZipCode('');
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (campus: Campus) => {
    setEditingCampus(campus);
    setCampusName(campus.name);
    setCampusLocation(campus.location || '');
    setCampusAddress(campus.address || '');
    setCampusZipCode(campus.zip_code || '');
    setError(null);
    setShowModal(true);
  };

  const handleSaveCampus = async () => {
    if (!campusName.trim()) {
      setError('Campus name is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const url = editingCampus
        ? `/api/churches/campuses/${editingCampus.id}`
        : `/api/churches/${membership?.churchId}/campuses`;

      const method = editingCampus ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campusName.trim(),
          location: campusLocation.trim() || null,
          address: campusAddress.trim() || null,
          zip_code: campusZipCode.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save campus');
      }

      // Update local state
      if (editingCampus) {
        setCampuses(campuses.map(c =>
          c.id === editingCampus.id ? { ...c, ...data.campus } : c
        ));
      } else {
        setCampuses([...campuses, data.campus]);
      }

      setShowModal(false);
      setEditingCampus(null);
    } catch (err) {
      console.error('Error saving campus:', err);
      setError(err instanceof Error ? err.message : 'Failed to save campus');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCampus = async () => {
    if (!deletingCampus) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/campuses/${deletingCampus.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete campus');
      }

      // Update local state
      setCampuses(campuses.filter(c => c.id !== deletingCampus.id));
      setShowDeleteModal(false);
      setDeletingCampus(null);
    } catch (err) {
      console.error('Error deleting campus:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete campus');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Owner Access Required</h2>
          <p className="text-gray-600 mb-4">
            Only church owners can manage campuses.
          </p>
          <Button onClick={() => router.push('/home')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading campuses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Campuses</h1>
          <p className="text-gray-600">
            Add, edit, or remove campuses for your church.
          </p>
        </div>

        {/* Add Campus Button */}
        <div className="mb-6">
          <Button onClick={openAddModal} variant="primary">
            <Plus size={16} className="mr-2" />
            Add New Campus
          </Button>
        </div>

        {/* Campus List */}
        <div className="space-y-4">
          {campuses.length === 0 ? (
            <Card className="p-8 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Campuses Yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first campus to get started. Campuses help organize your church across multiple locations.
              </p>
              <Button onClick={openAddModal} variant="primary">
                <Plus size={16} className="mr-2" />
                Add Campus
              </Button>
            </Card>
          ) : (
            campuses.map(campus => (
              <Card key={campus.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-xl font-bold text-gray-900">{campus.name}</h3>
                    </div>

                    {campus.location && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Location:</strong> {campus.location}
                      </p>
                    )}

                    {campus.address && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Address:</strong> {campus.address}
                      </p>
                    )}

                    {campus.zip_code && (
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>ZIP Code:</strong> {campus.zip_code}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      Created {new Date(campus.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => openEditModal(campus)}
                      className="flex items-center gap-1"
                    >
                      <Edit size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDeletingCampus(campus);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Campus Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingCampus(null);
            setError(null);
          }}
          title={editingCampus ? 'Edit Campus' : 'Add New Campus'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Downtown Campus, North Campus"
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (City/Area)
              </label>
              <input
                type="text"
                placeholder="e.g., Downtown Seattle"
                value={campusLocation}
                onChange={(e) => setCampusLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g., 123 Main St, Seattle, WA"
                value={campusAddress}
                onChange={(e) => setCampusAddress(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                placeholder="e.g., 98101"
                value={campusZipCode}
                onChange={(e) => setCampusZipCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                maxLength={10}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setEditingCampus(null);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCampus}
                className="flex-1"
                disabled={isProcessing || !campusName.trim()}
              >
                {isProcessing ? 'Saving...' : editingCampus ? 'Update Campus' : 'Add Campus'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Campus Modal */}
      {showDeleteModal && deletingCampus && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingCampus(null);
            setError(null);
          }}
          title="Delete Campus"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> Are you sure you want to delete <strong>{deletingCampus.name}</strong>?
              </p>
              <p className="text-sm text-red-800 mt-2">
                Members assigned to this campus will have their campus assignment removed.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCampus(null);
                  setError(null);
                }}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteCampus}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Campus'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

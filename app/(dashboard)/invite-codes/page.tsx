'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';

interface InviteCode {
  id: string;
  code: string;
  campusId: string | null;
  campusName: string | null;
  createdBy: string;
  expiresAt: string | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  url: string;
}

interface Campus {
  id: string;
  name: string;
}

export default function InviteCodesPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { membership, role } = useChurchMembership();
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // QR code cache
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

  // Generate invite form
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedCampusId, setSelectedCampusId] = useState<string>('');
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [maxUses, setMaxUses] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  // Fetch church data when membership is loaded
  useEffect(() => {
    const fetchData = async () => {
      if (!membership) {
        setLoading(false);
        return;
      }

      // Check permission
      if (!['owner', 'overseer'].includes(membership.role)) {
        setError('You do not have permission to manage invite codes');
        setLoading(false);
        return;
      }

      try {
        // Fetch campuses
        const campusRes = await fetch(`/api/churches/${membership.churchId}/campuses`);
        const campusData = await campusRes.json();
        setCampuses(campusData.campuses || []);

        // Fetch invite codes
        await loadInvites(membership.churchId);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load invite codes');
        setLoading(false);
      }
    };

    fetchData();
  }, [membership]);

  const loadInvites = async (churchId: string) => {
    const response = await fetch(`/api/invites/list?churchId=${churchId}`);
    const data = await response.json();

    if (data.success) {
      setInvites(data.invites);

      // Generate QR codes for active invites
      data.invites.forEach((invite: InviteCode) => {
        if (invite.isActive) {
          generateQRCode(invite.id, invite.url);
        }
      });
    }
  };

  const generateQRCode = async (inviteId: string, url: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodes(prev => ({ ...prev, [inviteId]: qrDataUrl }));
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const handleGenerateInvite = async () => {
    if (!membership) return;

    setGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/invites/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchId: membership.churchId,
          campusId: selectedCampusId || null,
          maxUses: maxUses ? parseInt(maxUses) : null,
          expiresInDays: expiresInDays ? parseInt(expiresInDays) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate invite code');
        setGenerating(false);
        return;
      }

      // Reload invites
      await loadInvites(membership.churchId);

      // Reset form
      setShowGenerateForm(false);
      setSelectedCampusId('');
      setExpiresInDays('');
      setMaxUses('');
      setGenerating(false);
    } catch (err) {
      console.error('Error generating invite:', err);
      setError('Failed to generate invite code');
      setGenerating(false);
    }
  };

  const handleDeactivate = async (inviteId: string) => {
    if (!confirm('Are you sure you want to deactivate this invite code? It can no longer be used.')) {
      return;
    }

    try {
      const response = await fetch(`/api/invites/${inviteId}/deactivate`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to deactivate invite code');
        return;
      }

      // Update local state
      setInvites(invites.map(inv =>
        inv.id === inviteId ? { ...inv, isActive: false } : inv
      ));
    } catch (err) {
      console.error('Error deactivating invite:', err);
      alert('Failed to deactivate invite code');
    }
  };

  const handleDownloadQR = (inviteCode: string) => {
    const qrDataUrl = qrCodes[inviteCode];
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `invite-${inviteCode}.png`;
    link.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading invite codes...</p>
      </div>
    );
  }

  if (error && !membership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.push('/home')} className="mt-4">
            Go Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Codes</h1>
          <p className="text-gray-600">
            Generate and manage invite codes for your church. Share QR codes or links with potential members.
          </p>
        </div>

        {/* Generate New Invite */}
        <Card className="p-6 mb-6">
          {!showGenerateForm ? (
            <Button onClick={() => setShowGenerateForm(true)} variant="primary">
              + Generate New Invite Code
            </Button>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Generate New Invite Code</h3>

              <div className="space-y-4 mb-4">
                {/* Campus Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus (Optional)
                  </label>
                  <select
                    value={selectedCampusId}
                    onChange={(e) => setSelectedCampusId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="">All Campuses (Church-wide)</option>
                    {campuses.map(campus => (
                      <option key={campus.id} value={campus.id}>
                        {campus.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a specific campus or leave blank for church-wide invites
                  </p>
                </div>

                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expires In (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Never expires"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank for no expiration
                  </p>
                </div>

                {/* Max Uses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Uses
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited uses"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank for unlimited uses
                  </p>
                </div>
              </div>

              {error && (
                <p className="text-red-600 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleGenerateInvite}
                  disabled={generating}
                  variant="primary"
                >
                  {generating ? 'Generating...' : 'Generate Invite'}
                </Button>
                <Button
                  onClick={() => {
                    setShowGenerateForm(false);
                    setError('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Invite Codes List */}
        <div className="space-y-4">
          {invites.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-gray-600">No invite codes yet. Generate one to get started!</p>
            </Card>
          ) : (
            invites.map(invite => (
              <Card
                key={invite.id}
                className={`p-6 ${!invite.isActive ? 'bg-gray-100 border-gray-300' : ''}`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* QR Code */}
                  {invite.isActive && qrCodes[invite.id] && (
                    <div className="flex-shrink-0">
                      <img
                        src={qrCodes[invite.id]}
                        alt="QR Code"
                        className="w-48 h-48 border-2 border-gray-300 rounded"
                      />
                      <Button
                        onClick={() => handleDownloadQR(invite.id)}
                        variant="outline"
                        className="w-48 mt-2 text-sm"
                      >
                        Download QR Code
                      </Button>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900 font-mono">
                            {invite.code}
                          </h3>
                          {!invite.isActive && (
                            <span className="px-2 py-1 bg-gray-300 text-gray-700 text-xs font-bold rounded">
                              INACTIVE
                            </span>
                          )}
                        </div>
                        {invite.campusName && (
                          <p className="text-sm text-gray-600">
                            Campus: <strong>{invite.campusName}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Uses</p>
                        <p className="text-lg font-bold text-gray-900">
                          {invite.currentUses}
                          {invite.maxUses ? ` / ${invite.maxUses}` : ' / ∞'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Expires</p>
                        <p className="text-sm font-medium text-gray-900">
                          {invite.expiresAt
                            ? new Date(invite.expiresAt).toLocaleDateString()
                            : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <p className={`text-sm font-bold ${
                          invite.isActive
                            ? invite.maxUses && invite.currentUses >= invite.maxUses
                              ? 'text-orange-600'
                              : invite.expiresAt && new Date(invite.expiresAt) < new Date()
                              ? 'text-red-600'
                              : 'text-green-600'
                            : 'text-gray-500'
                        }`}>
                          {!invite.isActive
                            ? 'Inactive'
                            : invite.maxUses && invite.currentUses >= invite.maxUses
                            ? 'Max Uses Reached'
                            : invite.expiresAt && new Date(invite.expiresAt) < new Date()
                            ? 'Expired'
                            : 'Active'}
                        </p>
                      </div>
                    </div>

                    {/* URL */}
                    {invite.isActive && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Shareable Link</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={invite.url}
                            readOnly
                            className="flex-1 p-2 text-sm border border-gray-300 rounded bg-gray-50 font-mono"
                          />
                          <Button
                            onClick={() => copyToClipboard(invite.url)}
                            variant="outline"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {invite.isActive && (
                      <Button
                        onClick={() => handleDeactivate(invite.id)}
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Deactivate Code
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

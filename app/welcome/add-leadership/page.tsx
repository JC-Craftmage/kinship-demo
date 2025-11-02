// Add leadership page - Prompt new church owners to add co-leaders

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import QRCode from 'qrcode';

export default function AddLeadershipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const churchId = searchParams.get('churchId');

  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInvite = async () => {
    if (!churchId) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/invites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchId,
          campusId: null, // Church-wide invite
          maxUses: null, // Unlimited
          expiresInDays: 30, // 30 days
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate invite');
      }

      setInviteCode(data.invite.code);
      setInviteUrl(data.invite.url);

      // Generate QR code
      const qr = await QRCode.toDataURL(data.invite.url, {
        width: 300,
        margin: 2,
      });
      setQrCodeUrl(qr);

    } catch (err) {
      console.error('Error generating invite:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate invite');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSkip = () => {
    router.push('/home');
  };

  if (!churchId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 max-w-md">
          <p className="text-red-600">Error: Church ID not found</p>
          <Button onClick={() => router.push('/welcome')} className="mt-4">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add Leadership (Recommended)
          </h1>
          <p className="text-lg text-gray-600">
            It's strongly recommended to add 1-3 co-leaders to help manage your church
          </p>
        </div>

        <Card className="p-8 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  Why add co-leaders?
                </h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Prevents single point of failure</li>
                  <li>• Protects against accidental changes</li>
                  <li>• Provides backup access if you're unavailable</li>
                  <li>• Distributes administrative workload</li>
                </ul>
              </div>
            </div>
          </div>

          {!inviteCode ? (
            <div>
              <p className="text-gray-700 mb-4">
                Generate an invite link to share with your co-leaders. They can join and you can promote them to Overseer or Moderator roles.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full py-3"
                onClick={generateInvite}
                disabled={isGenerating}
              >
                {isGenerating ? 'Generating...' : 'Generate Invite Link'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center">
                  <img src={qrCodeUrl} alt="Invite QR Code" className="mx-auto rounded-lg shadow-md" />
                  <p className="text-sm text-gray-600 mt-2">
                    Scan this QR code with your phone to join
                  </p>
                </div>
              )}

              {/* Invite Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteCode}
                    className="flex-1 px-4 py-3 text-center text-xl font-mono bg-gray-50 border border-gray-300 rounded-lg tracking-wider"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => navigator.clipboard.writeText(inviteCode)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              {/* Invite URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invite Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl || ''}
                    className="flex-1 px-4 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                  />
                  <Button
                    variant="secondary"
                    onClick={() => inviteUrl && navigator.clipboard.writeText(inviteUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-decimal">
                  <li>Share this invite with your co-leaders</li>
                  <li>After they join, go to the Admin dashboard</li>
                  <li>Promote them to Overseer or Moderator role</li>
                </ol>
              </div>
            </div>
          )}
        </Card>

        <div className="flex gap-4">
          <Button
            variant="secondary"
            className="flex-1 py-3"
            onClick={handleSkip}
          >
            Skip for Now
          </Button>
          {inviteCode && (
            <Button
              variant="primary"
              className="flex-1 py-3"
              onClick={() => router.push('/home')}
            >
              Continue to Dashboard →
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          You can always add more leaders later from the Admin dashboard
        </p>
      </div>
    </div>
  );
}

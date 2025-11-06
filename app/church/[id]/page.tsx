// Church profile/landing page with detailed information

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useChurchMembership } from '@/hooks/use-church-membership';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Church as ChurchIcon, MapPin, Users, ArrowLeft, Send } from 'lucide-react';

interface Church {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  campuses: Array<{
    id: string;
    name: string;
    location: string | null;
    address: string | null;
    zip_code: string | null;
    latitude: number | null;
    longitude: number | null;
  }>;
}

export default function ChurchProfilePage() {
  const router = useRouter();
  const params = useParams();
  const churchId = params.id as string;
  const { membership } = useChurchMembership();

  const [church, setChurch] = useState<Church | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCurrentChurch, setIsCurrentChurch] = useState(false);

  useEffect(() => {
    const fetchChurch = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/churches/${churchId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load church');
        }

        setChurch(data.church);

        // Check if this is the user's current church
        if (membership?.churchId === churchId) {
          setIsCurrentChurch(true);
        }
      } catch (err) {
        console.error('Error fetching church:', err);
        setError(err instanceof Error ? err.message : 'Failed to load church');
      } finally {
        setIsLoading(false);
      }
    };

    if (churchId) {
      fetchChurch();
    }
  }, [churchId, membership]);

  const handleRequestToJoin = () => {
    router.push(`/church/${churchId}/request-join`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading church information...</div>
      </div>
    );
  }

  if (error || !church) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="p-8 text-center max-w-md">
          <ChurchIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Church Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Unable to load church information'}</p>
          <Button variant="secondary" onClick={() => router.push('/browse-churches')}>
            Back to Browse
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            className="mb-3 bg-indigo-500 text-white border-0 hover:bg-indigo-400"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{church.name}</h1>
          {isCurrentChurch && (
            <span className="inline-block mt-2 text-xs bg-white text-indigo-600 px-3 py-1 rounded-full font-medium">
              Your Current Church
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Description */}
        {church.description && (
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{church.description}</p>
          </Card>
        )}

        {/* Campuses */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {church.campuses.length === 1 ? 'Campus' : 'Campuses'}
          </h2>
          <div className="space-y-4">
            {church.campuses.map((campus) => (
              <div key={campus.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{campus.name}</h3>
                    {campus.location && (
                      <p className="text-sm text-gray-600 mt-1">{campus.location}</p>
                    )}
                    {campus.address && (
                      <p className="text-sm text-gray-600 mt-1">{campus.address}</p>
                    )}
                    {campus.zip_code && (
                      <p className="text-xs text-gray-500 mt-1">ZIP: {campus.zip_code}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Church Stats */}
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-sm">
                {church.campuses.length} {church.campuses.length === 1 ? 'Campus' : 'Campuses'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <ChurchIcon className="w-5 h-5 text-indigo-600" />
              <span className="text-sm">
                Established {new Date(church.created_at).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        {!isCurrentChurch && (
          <Card className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <h3 className="text-xl font-bold mb-2">Interested in Joining?</h3>
            <p className="text-indigo-100 mb-4 text-sm">
              Submit a request to join this church. Church admins will review your request
              and may ask you to complete a questionnaire.
            </p>
            <Button
              variant="primary"
              className="w-full bg-white text-indigo-600 hover:bg-gray-100"
              onClick={handleRequestToJoin}
            >
              <Send size={16} className="mr-2" />
              Request to Join
            </Button>
          </Card>
        )}

        {isCurrentChurch && (
          <Card className="p-6 bg-green-50 border-green-200">
            <p className="text-center text-green-800">
              ✓ You are already a member of this church
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

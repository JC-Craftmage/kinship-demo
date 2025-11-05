// Browse and search churches page for existing members

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Church as ChurchIcon } from 'lucide-react';

interface Church {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  distance?: number | null;
  nearestCampus?: {
    id: string;
    name: string;
    location: string | null;
  } | null;
  campuses: Array<{
    id: string;
    name: string;
    location: string | null;
    latitude?: number | null;
    longitude?: number | null;
    zip_code?: string | null;
  }>;
}

export default function BrowseChurchesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchZipCode, setSearchZipCode] = useState('');
  const [searchLocation, setSearchLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [searchResults, setSearchResults] = useState<Church[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2 && !searchLocation && !searchZipCode.trim()) {
      setError('Please enter a church name, use your location, or enter a ZIP code');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (searchLocation) {
        params.append('latitude', searchLocation.latitude.toString());
        params.append('longitude', searchLocation.longitude.toString());
      }
      if (searchZipCode.trim()) params.append('zipCode', searchZipCode.trim());

      const response = await fetch(`/api/churches/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search');
      }

      setSearchResults(data.churches || []);
      setHasSearched(true);
    } catch (err) {
      console.error('Error searching:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchWithLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSearchLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
        // Automatically trigger search
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        }, 100);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('Unable to get your location. Please enable location permissions.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleViewChurch = (churchId: string) => {
    router.push(`/church/${churchId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Browse Churches</h1>
          <p className="text-sm text-indigo-200">Discover church communities</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Browsing churches allows you to learn about different communities.
            To join a church, you'll need to submit a request which will be reviewed by church admins.
          </p>
        </Card>

        {/* Search Form */}
        <Card className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* GPS Location Search */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Quick Search by Location
                </label>
                {searchLocation && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                    ✓ Location set
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="primary"
                className="w-full py-3"
                onClick={handleSearchWithLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? 'Getting Location...' : '📍 Find Churches Near Me'}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Manual Search */}
            <div>
              <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-2">
                Church Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  id="searchQuery"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Grace Community Church"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="searchZipCode" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  id="searchZipCode"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 98101"
                  value={searchZipCode}
                  onChange={(e) => setSearchZipCode(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3"
              disabled={isSearching || (searchQuery.trim().length < 2 && !searchLocation && !searchZipCode.trim())}
            >
              {isSearching ? 'Searching...' : 'Search Churches'}
            </Button>
          </form>
        </Card>

        {/* Search Results */}
        {hasSearched && (
          <div>
            {searchResults.length > 0 ? (
              <>
                <h3 className="font-bold text-lg mb-4 text-gray-900">
                  Found {searchResults.length} {searchResults.length === 1 ? 'church' : 'churches'}
                </h3>
                <div className="space-y-3">
                  {searchResults.map((church) => (
                    <Card
                      key={church.id}
                      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleViewChurch(church.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-indigo-100 p-3 rounded-lg">
                          <ChurchIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900">{church.name}</h4>
                            {church.distance !== null && church.distance !== undefined && (
                              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-medium">
                                {church.distance < 1
                                  ? `${(church.distance * 5280).toFixed(0)} ft`
                                  : `${church.distance.toFixed(1)} mi`
                                } away
                              </span>
                            )}
                          </div>
                          {church.description && (
                            <p className="text-sm text-gray-600 mb-2">{church.description}</p>
                          )}
                          {church.campuses && church.campuses.length > 0 && (
                            <div className="text-xs text-gray-500">
                              <MapPin className="inline w-3 h-3 mr-1" />
                              {church.campuses.length} campus{church.campuses.length !== 1 ? 'es' : ''}
                              {church.nearestCampus && (
                                <span> • Nearest: {church.nearestCampus.name}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-8 text-center">
                <ChurchIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">No churches found</h3>
                <p className="text-gray-600 mb-4">
                  No churches match your search criteria. Try different search terms or location.
                </p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

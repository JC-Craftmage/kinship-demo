// Church creation form page with search-first flow

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Church {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  campuses: Array<{
    id: string;
    name: string;
    location: string | null;
  }>;
}

export default function CreateChurchPage() {
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'create'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Church[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    churchName: '',
    churchDescription: '',
    campusName: '',
    campusLocation: '',
    campusAddress: '',
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`/api/churches/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

  const handleCreateNew = () => {
    // Pre-fill church name from search query
    setFormData(prev => ({ ...prev, churchName: searchQuery }));
    setStep('create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/churches/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create church');
      }

      // Success! Redirect to add co-owners page
      router.push(`/welcome/add-leadership?churchId=${data.church.id}`);
    } catch (err) {
      console.error('Error creating church:', err);
      setError(err instanceof Error ? err.message : 'Failed to create church');
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/welcome" className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </Link>
          <Link href="/welcome">
            <Button variant="ghost">← Back</Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {step === 'search' ? (
          // Step 1: Search for existing church
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔍</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                First, Let's Check
              </h1>
              <p className="text-lg text-gray-600">
                Search to see if your church already exists on Kinship
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-2">
                    Church Name
                  </label>
                  <input
                    type="text"
                    id="searchQuery"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                    placeholder="e.g., Grace Community Church"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter your church's name to search for it
                  </p>
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
                  disabled={isSearching || searchQuery.trim().length < 2}
                >
                  {isSearching ? 'Searching...' : 'Search for My Church'}
                </Button>
              </form>

              {/* Search Results */}
              {hasSearched && (
                <div className="mt-8 pt-8 border-t">
                  {searchResults.length > 0 ? (
                    <>
                      <h3 className="font-bold text-lg mb-4 text-gray-900">
                        Found {searchResults.length} matching church{searchResults.length !== 1 ? 'es' : ''}:
                      </h3>
                      <div className="space-y-3 mb-6">
                        {searchResults.map((church) => (
                          <Card key={church.id} className="p-4 bg-blue-50 border-blue-200">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-bold text-gray-900">{church.name}</h4>
                                {church.description && (
                                  <p className="text-sm text-gray-600 mt-1">{church.description}</p>
                                )}
                                {church.campuses && church.campuses.length > 0 && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    {church.campuses.length} campus{church.campuses.length !== 1 ? 'es' : ''}: {church.campuses.map(c => c.name).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-900">
                          <strong>Is this your church?</strong> Contact your church leader to get an invite code to join.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-gray-700 mb-2">
                        <strong>No churches found matching "{searchQuery}"</strong>
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Looks like your church isn't on Kinship yet. You can set it up!
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <Link href="/welcome/join-church" className="flex-1">
                      <Button variant="secondary" className="w-full">
                        I Have an Invite Code
                      </Button>
                    </Link>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={handleCreateNew}
                    >
                      Create New Church
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          // Step 2: Create church form
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🏛️</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Create Your Church
              </h1>
              <p className="text-lg text-gray-600">
                Set up your church and first campus location
              </p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Church Information */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Church Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="churchName" className="block text-sm font-medium text-gray-700 mb-1">
                        Church Name *
                      </label>
                      <input
                        type="text"
                        id="churchName"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Grace Community Church"
                        value={formData.churchName}
                        onChange={(e) => handleChange('churchName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="churchDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        id="churchDescription"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="A brief description of your church..."
                        value={formData.churchDescription}
                        onChange={(e) => handleChange('churchDescription', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Campus Information */}
                <div className="pt-4 border-t">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    First Campus
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="campusName" className="block text-sm font-medium text-gray-700 mb-1">
                        Campus Name *
                      </label>
                      <input
                        type="text"
                        id="campusName"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Downtown Campus"
                        value={formData.campusName}
                        onChange={(e) => handleChange('campusName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="campusLocation" className="block text-sm font-medium text-gray-700 mb-1">
                        Location (Optional)
                      </label>
                      <input
                        type="text"
                        id="campusLocation"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Seattle, WA"
                        value={formData.campusLocation}
                        onChange={(e) => handleChange('campusLocation', e.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="campusAddress" className="block text-sm font-medium text-gray-700 mb-1">
                        Address (Optional)
                      </label>
                      <input
                        type="text"
                        id="campusAddress"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., 123 Main St, Seattle, WA 98101"
                        value={formData.campusAddress}
                        onChange={(e) => handleChange('campusAddress', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-4 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 py-3"
                    onClick={() => setStep('search')}
                  >
                    ← Back to Search
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Church...' : 'Create Church →'}
                  </Button>
                </div>
              </form>
            </Card>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                By creating a church, you'll become the Church Owner with full administrative access.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

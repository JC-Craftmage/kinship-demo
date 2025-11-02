// Church creation form page

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CreateChurchPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    churchName: '',
    churchDescription: '',
    campusName: '',
    campusLocation: '',
    campusAddress: '',
  });

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
            <div className="pt-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
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
      </div>
    </div>
  );
}

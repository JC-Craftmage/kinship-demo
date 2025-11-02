// Landing page - Refactored version

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </div>
          <Link href="/home">
            <Button variant="primary">View Demo</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Ahoy! Join the Crew 👋
        </h1>
        <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
          Your church family, connected.
        </p>
        <p className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto">
          Automated coordination, frictionless engagement, meaningful community.
        </p>

        <Link href="/home">
          <Button variant="primary" className="px-12 py-4 text-xl">
            Explore the Demo ⛵
          </Button>
        </Link>

        <p className="text-gray-500 mt-8 text-sm">
          Interactive demo - click around and explore!
        </p>
      </div>
    </div>
  );
}

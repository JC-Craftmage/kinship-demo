// Landing page - Refactored version

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <Link href="/sign-in">
                <Button variant="secondary">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary">Get Started</Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/home">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
              <UserButton />
            </SignedIn>
          </div>
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

        <div className="flex gap-4 justify-center">
          <SignedOut>
            <Link href="/sign-up">
              <Button variant="primary" className="px-12 py-4 text-xl">
                Get Started Free ⛵
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="secondary" className="px-12 py-4 text-xl">
                Sign In
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/home">
              <Button variant="primary" className="px-12 py-4 text-xl">
                Go to Dashboard ⛵
              </Button>
            </Link>
          </SignedIn>
        </div>

        <p className="text-gray-500 mt-8 text-sm">
          Secure authentication • Free to join • Connect with your church family
        </p>
      </div>
    </div>
  );
}

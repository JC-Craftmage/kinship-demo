'use client';

import React, { useState } from 'react';
import { Users, MessageCircle, Calendar, Search, Home, User, PlusCircle, MapPin, Briefcase, Heart, X, Truck, Wrench, Bell, Award, ChevronRight, Check } from 'lucide-react';

export default function KinshipApp() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showMealTrain, setShowMealTrain] = useState(false);
  const [showAdminNudge, setShowAdminNudge] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAutomationDemo, setShowAutomationDemo] = useState(false);
  const [automationStep, setAutomationStep] = useState(0);

  const members = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      campus: 'Downtown', 
      skills: ['Real Estate Agent', 'Photography'], 
      interests: ['Hiking', 'Book Club'], 
      avatar: '👩',
      available: true,
      kudos: 45,
      assets: [
        { type: 'vehicle', name: 'Honda Odyssey (7 seats)', available: 'Weekends' }
      ]
    },
    { 
      id: 2, 
      name: 'Mike Chen', 
      campus: 'Downtown', 
      skills: ['Carpenter', 'Has Truck'], 
      interests: ['Biking', 'Cooking'], 
      avatar: '👨',
      available: true,
      kudos: 67,
      assets: [
        { type: 'vehicle', name: '2019 F-150 Pickup Truck', available: 'Weekends, happy to help deliver!' },
        { type: 'equipment', name: 'Kubota Tractor with loader', available: 'By arrangement' },
        { type: 'equipment', name: 'Mini Excavator', available: 'Contact first, experience required' }
      ]
    },
    { 
      id: 3, 
      name: 'Emily Rodriguez', 
      campus: 'Westside', 
      skills: ['Teacher', 'Piano'], 
      interests: ['Gardening', 'Yoga'], 
      avatar: '👩‍🦱',
      available: false,
      kudos: 23,
      assets: []
    },
    { 
      id: 4, 
      name: 'David Martinez', 
      campus: 'Downtown', 
      skills: ['Accountant', 'Financial Advisor'], 
      interests: ['Golf', 'Mentoring'], 
      avatar: '👨‍💼',
      available: true,
      kudos: 31,
      assets: []
    },
    { 
      id: 5, 
      name: 'Lisa Thompson', 
      campus: 'Westside', 
      skills: ['Graphic Designer', 'Event Planning'], 
      interests: ['Art', 'Young Moms Group'], 
      avatar: '👩‍🎨',
      available: true,
      kudos: 52,
      assets: [
        { type: 'business', name: 'Full-service print shop access', available: 'For church projects' }
      ]
    },
    { 
      id: 6, 
      name: 'James Wilson', 
      campus: 'Downtown', 
      skills: ['Plumber', 'Home Repair'], 
      interests: ['Fishing', 'Woodworking'], 
      avatar: '👨‍🔧',
      available: true,
      kudos: 89,
      assets: [
        { type: 'vehicle', name: 'Cargo trailer (6x12)', available: 'Most weekends' }
      ]
    },
  ];

  const notifications = [
    {
      id: 1,
      type: 'automation',
      icon: '🤖',
      title: 'Meal train created automatically',
      message: 'Amanda just posted about her baby arriving June 15th. System created a 14-day meal train and notified 12 past helpers.',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      type: 'reminder',
      icon: '🍽️',
      title: 'Meal delivery tomorrow!',
      message: 'Your meal for the Foster family is tomorrow at 5:30 PM. Address: 123 Oak Street.',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'kudos',
      icon: '⭐',
      title: 'You earned kudos!',
      message: 'Jennifer confirmed you helped with her move. +1 kudos! You now have 15 total.',
      time: '3 hours ago',
      unread: true
    }
  ];

  const automationSteps = [
    {
      title: "Member Posts Life Event",
      description: "Sarah posts: 'Baby arriving June 15th!'",
      icon: "👶",
      details: "Just a simple post - no forms, no complexity"
    },
    {
      title: "System Detects Event Type",
      description: "AI recognizes this as a 'New Baby' life event",
      icon: "🤖",
      details: "Automatic detection based on keywords"
    },
    {
      title: "Meal Train Auto-Creates",
      description: "14-day meal train calendar generated instantly",
      icon: "🍽️",
      details: "Start: June 17, Dinner only, 14 slots"
    },
    {
      title: "Past Helpers Notified",
      description: "12 members who've done meal trains get alerted",
      icon: "📧",
      details: "One-tap signup for helpers"
    },
    {
      title: "Reminders Scheduled",
      description: "System schedules reminders for providers",
      icon: "⏰",
      details: "Day before: 'Tomorrow at 5:30 PM'"
    },
    {
      title: "Kudos Awarded",
      description: "Helpers earn recognition automatically",
      icon: "⭐",
      details: "Public celebration of helpers"
    }
  ];

  const performSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const results: any[] = [];
    const lq = query.toLowerCase();

    if (lq.includes('truck') || lq.includes('moving')) {
      results.push({
        member: members[1],
        matchReason: 'Has F-150 truck available weekends',
        matchIcon: '🚚'
      });
      results.push({
        member: members[5],
        matchReason: 'Has cargo trailer (6x12)',
        matchIcon: '🚚'
      });
    }

    if (lq.includes('realtor') || lq.includes('real estate')) {
      results.push({
        member: members[0],
        matchReason: 'Licensed real estate agent',
        matchIcon: '🏠'
      });
    }

    if (lq.includes('carpenter')) {
      results.push({
        member: members[1],
        matchReason: 'Professional carpenter',
        matchIcon: '🔨'
      });
    }

    if (lq.includes('plumber')) {
      results.push({
        member: members[5],
        matchReason: 'Licensed plumber',
        matchIcon: '🔧'
      });
    }

    setSearchResults(results);
  };

  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-3xl">⛵</div>
            <span className="text-2xl font-bold text-indigo-600">Kinship</span>
          </div>
          <button 
            onClick={() => setCurrentView('home')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            View Demo
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Ahoy! Join the Crew 👋
        </h1>
        <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Your church family, connected. Automated coordination, frictionless engagement, meaningful community.
        </p>

        <button 
          onClick={() => setCurrentView('home')}
          className="bg-indigo-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          Explore the Demo ⛵
        </button>
      </div>
    </div>
  );

  const Header = () => (
    <div className="bg-indigo-600 text-white p-4 shadow-lg relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⛵</div>
          <div>
            <h1 className="text-xl font-bold">Kinship</h1>
            <p className="text-sm text-indigo-200">First Church</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {notifications.filter(n => n.unread).length}
            </span>
          </button>
        </div>
      </div>
      
      {showNotifications && (
        <div className="absolute right-4 top-16 w-96 bg-white rounded-xl shadow-2xl z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Notifications</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X className="text-gray-400" size={20} />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notif => (
              <div key={notif.id} className="p-4 hover:bg-gray-50 border-b">
                <div className="flex gap-3">
                  <div className="text-2xl">{notif.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">{notif.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const Navigation = () => (
    <div className="bg-white border-t fixed bottom-0 w-full z-10">
      <div className="max-w-7xl mx-auto flex justify-around py-3">
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg ${currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => setCurrentView('search')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg ${currentView === 'search' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
        >
          <Search size={24} />
          <span className="text-xs">Search</span>
        </button>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header />
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-2">Welcome! ⛵</h2>
          <p>Your community is thriving</p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl mb-2">See Automation in Action</h3>
              <p className="text-sm mb-4">
                Watch how Kinship automatically coordinates a meal train from start to finish.
              </p>
              <button
                onClick={() => setShowAutomationDemo(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
              >
                ▶️ Watch Demo
              </button>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );

  const SearchPage = () => {
    const examples = [
      { query: 'truck', icon: '🚚', label: 'Who has a truck?' },
      { query: 'realtor', icon: '🏠', label: 'Find a realtor' },
      { query: 'carpenter', icon: '🔨', label: 'Find a carpenter' },
      { query: 'plumber', icon: '🔧', label: 'Plumbing help' },
    ];

    return (
      <div className="bg-gray-50 min-h-screen pb-20">
        <Header />
        <div className="max-w-7xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-4">Who Can Help With...</h2>
          
          <div className="relative mb-6">
            <Search className="absolute left-4 top-4 text-gray-400" size={24} />
            <input 
              type="text" 
              placeholder="Try: truck, moving, realtor, carpenter..."
              className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border-2 focus:ring-2 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => performSearch(e.target.value)}
            />
          </div>

          {!searchQuery && (
            <div className="grid grid-cols-2 gap-3">
              {examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => performSearch(ex.query)}
                  className="bg-white p-4 rounded-xl shadow hover:shadow-md text-left"
                >
                  <div className="text-3xl mb-2">{ex.icon}</div>
                  <p className="font-medium text-sm">{ex.label}</p>
                </button>
              ))}
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold">Found {searchResults.length} matches:</h3>
              {searchResults.map((result, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow">
                  <div className="flex gap-4">
                    <div className="text-5xl">{result.member.avatar}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{result.member.name}</h3>
                      <p className="text-sm text-gray-500">{result.member.campus} Campus</p>
                      <div className="bg-indigo-50 p-3 rounded-lg mt-2">
                        <span className="text-2xl mr-2">{result.matchIcon}</span>
                        <span className="text-sm">{result.matchReason}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Navigation />
      </div>
    );
  };

  const AutomationDemo = () => {
    if (!showAutomationDemo) return null;

    const step = automationSteps[automationStep];
    const progress = ((automationStep + 1) / automationSteps.length) * 100;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full p-8">
          <div className="flex justify-between mb-6">
            <h2 className="text-3xl font-bold">Automated Workflow</h2>
            <button onClick={() => {
              setShowAutomationDemo(false);
              setAutomationStep(0);
            }}>
              <X size={28} />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Step {automationStep + 1} of {automationSteps.length}</span>
              <span className="text-sm">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-2xl mb-6">
            <div className="flex gap-6">
              <div className="text-7xl">{step.icon}</div>
              <div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-lg mb-3">{step.description}</p>
                <p className="text-sm text-gray-600">{step.details}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {automationStep > 0 && (
              <button
                onClick={() => setAutomationStep(automationStep - 1)}
                className="flex-1 bg-gray-200 py-4 rounded-lg font-semibold"
              >
                ← Previous
              </button>
            )}
            
            {automationStep < automationSteps.length - 1 ? (
              <button
                onClick={() => setAutomationStep(automationStep + 1)}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-lg font-semibold"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAutomationDemo(false);
                  setAutomationStep(0);
                }}
                className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold"
              >
                ✓ Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'home' && <HomePage />}
      {currentView === 'search' && <SearchPage />}
      {showAutomationDemo && <AutomationDemo />}
    </div>
  );
}
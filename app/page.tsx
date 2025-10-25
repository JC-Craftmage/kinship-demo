'use client';

import React, { useState } from 'react';
import { Users, Search, Home, MapPin, X, Truck, Bell, Award, Filter } from 'lucide-react';

export default function KinshipApp() {
  const [currentView, setCurrentView] = useState('landing');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [assetFilter, setAssetFilter] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const members = [
    { 
      id: 2, 
      name: 'Mike Chen', 
      campus: 'Downtown', 
      skills: ['Carpenter', 'Home Repair', 'Woodworking'], 
      interests: ['Biking', 'Cooking', 'Mentoring'], 
      avatar: '👨',
      kudos: 67,
      jobTitle: 'Master Carpenter',
      company: 'Chen Custom Carpentry',
      bio: 'Running my own carpentry business for 15 years. Always happy to help church family with projects!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [
        { type: 'vehicle', name: '2019 F-150 Pickup Truck', available: 'Weekends, happy to help deliver!', description: '8-foot bed, can tow up to 5000lbs' },
        { type: 'equipment', name: 'Kubota Tractor with loader', available: 'By arrangement', description: 'Perfect for landscaping projects' },
        { type: 'equipment', name: 'Mini Excavator', available: 'Contact first, experience required', description: 'Great for digging foundations or trenches' }
      ],
      memberSince: '2015'
    },
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      campus: 'Downtown',
      skills: ['Real Estate Agent', 'Photography'], 
      interests: ['Hiking', 'Book Club'], 
      avatar: '👩',
      kudos: 45,
      jobTitle: 'Senior Real Estate Agent',
      company: 'Pacific Northwest Realty',
      bio: 'Been with First Church for 8 years. Love connecting people with their dream homes.',
      seekingWork: false,
      lookingForGroups: ['Young Professionals'],
      assets: [
        { type: 'vehicle', name: 'Honda Odyssey (7 seats)', available: 'Weekends', description: 'Great for carpools' }
      ],
      memberSince: '2017'
    },
    { 
      id: 8,
      name: 'Robert Chen',
      campus: 'Downtown',
      skills: ['Retired Teacher', 'Mentoring', 'Tutoring'],
      interests: ['Reading', 'Gardening'],
      avatar: '👴',
      kudos: 156,
      jobTitle: 'Retired High School Principal',
      company: null,
      bio: 'Retired after 40 years in education. Now I have time to give back!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [],
      memberSince: '1998'
    },
    {
      id: 7,
      name: 'Rachel Kim',
      campus: 'Downtown',
      skills: ['Software Engineer', 'Web Development', 'React'],
      interests: ['Technology', 'Coffee', 'Hiking'],
      avatar: '👩‍💻',
      kudos: 12,
      jobTitle: 'Software Engineer',
      company: 'Recently laid off',
      bio: 'Recently affected by tech layoffs. Looking for my next opportunity while staying connected to community.',
      seekingWork: true,
      lookingForGroups: ['Young Adults', 'Tech Professionals', 'Career Support'],
      assets: [],
      memberSince: '2023'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      campus: 'Westside',
      skills: ['Teacher', 'Piano', 'Childcare'],
      interests: ['Gardening', 'Yoga', 'Young Moms'],
      avatar: '👩‍🦱',
      kudos: 23,
      jobTitle: 'Elementary School Teacher',
      company: 'Westside Elementary',
      bio: 'Teaching 3rd grade. Love helping families in our church community!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [],
      memberSince: '2020'
    },
    {
      id: 4,
      name: 'David Martinez',
      campus: 'Downtown',
      skills: ['Accountant', 'Financial Advisor', 'Tax Prep'],
      interests: ['Golf', 'Mentoring', 'Young Professionals'],
      avatar: '👨‍💼',
      kudos: 31,
      jobTitle: 'CPA & Financial Advisor',
      company: 'Martinez Financial Group',
      bio: 'Helping families achieve financial peace. Free consultations for church members!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [
        { type: 'business', name: 'Conference room (seats 12)', available: 'Weekday evenings', description: 'Great for small group meetings' }
      ],
      memberSince: '2018'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      campus: 'Westside',
      skills: ['Graphic Designer', 'Event Planning', 'Social Media'],
      interests: ['Art', 'Young Moms', 'Coffee'],
      avatar: '👩‍🎨',
      kudos: 52,
      jobTitle: 'Creative Director',
      company: 'Thompson Design Studio',
      bio: 'Running a design studio and raising three kids. Church bulletin designs are my love language!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [
        { type: 'business', name: 'Full-service print shop access', available: 'For church projects', description: 'Business cards, flyers, banners, etc.' }
      ],
      memberSince: '2016'
    },
    {
      id: 6,
      name: 'James Wilson',
      campus: 'Downtown',
      skills: ['Plumber', 'Home Repair', 'HVAC'],
      interests: ['Fishing', 'Woodworking', 'Men\'s Group'],
      avatar: '👨‍🔧',
      kudos: 89,
      jobTitle: 'Master Plumber',
      company: 'Wilson Plumbing & Heating',
      bio: 'Third generation plumber. Church family gets priority service!',
      seekingWork: false,
      lookingForGroups: [] as string[],
      assets: [
        { type: 'vehicle', name: 'Cargo trailer (6x12)', available: 'Most weekends', description: 'Perfect for moving or hauling' }
      ],
      memberSince: '2010'
    }
  ];

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
        <p className="text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
          Your church family, connected.
        </p>
        <p className="text-xl text-gray-500 mb-12 max-w-3xl mx-auto">
          Automated coordination, frictionless engagement, meaningful community.
        </p>

        <button 
          onClick={() => setCurrentView('home')}
          className="bg-indigo-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition shadow-lg"
        >
          Explore the Demo ⛵
        </button>
        
        <p className="text-gray-500 mt-8 text-sm">
          Interactive demo - click around and explore!
        </p>
      </div>
    </div>
  );

  const HomePage = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Kinship</h1>
          <p className="text-sm text-indigo-200">First Church Community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome! ⛵</h2>
          <p>Your community is thriving - {members.length} members connected</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{members.length}</div>
              <div className="text-sm text-gray-600">Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{members.flatMap(m => m.assets).length}</div>
              <div className="text-sm text-gray-600">Assets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{members.filter(m => m.kudos >= 50).length}</div>
              <div className="text-sm text-gray-600">Champions</div>
            </div>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );

  const DirectoryPage = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">Kinship</h1>
          <p className="text-sm text-indigo-200">Member Directory</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Member Directory</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {members.map(member => (
            <div 
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer border-2 border-transparent hover:border-indigo-200"
            >
              <div className="flex gap-4">
                <div className="text-5xl">{member.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg">{member.name}</h3>
                    {member.kudos >= 50 && (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Award size={12} />
                        {member.kudos}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin size={14} />
                    {member.campus} Campus
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {member.seekingWork && (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-orange-300 flex items-center gap-1">
                        💼 Seeking Work
                      </span>
                    )}
                    {member.lookingForGroups && member.lookingForGroups.length > 0 && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border-2 border-purple-300 flex items-center gap-1">
                        👥 {member.lookingForGroups.length === 1 
                          ? `Looking for: ${member.lookingForGroups[0]}`
                          : 'Looking for Groups'}
                      </span>
                    )}
                  </div>
                  
                  {member.assets.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentView('assets');
                        setAssetFilter('all');
                      }}
                      className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-2 font-medium"
                    >
                      <Truck size={12} />
                      View {member.assets.length} asset{member.assets.length !== 1 ? 's' : ''}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Navigation />
    </div>
  );

  const AssetsPage = () => {
    const allAssets = members.flatMap(member =>
      member.assets.map(asset => ({
        ...asset,
        owner: member
      }))
    );

    const filteredAssets = assetFilter === 'all' ? allAssets :
      allAssets.filter(asset => asset.type === assetFilter);

    const assetCounts = {
      all: allAssets.length,
      vehicle: allAssets.filter(a => a.type === 'vehicle').length,
      equipment: allAssets.filter(a => a.type === 'equipment').length,
      tools: allAssets.filter(a => a.type === 'tools').length,
      business: allAssets.filter(a => a.type === 'business').length
    };

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-indigo-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold">Kinship</h1>
            <p className="text-sm text-indigo-200">Community Assets</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Available Assets</h2>
            <p className="text-gray-600 mb-4">Equipment, vehicles, and resources you can borrow from church members</p>

            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setAssetFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  assetFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                All Assets ({assetCounts.all})
              </button>
              <button
                onClick={() => setAssetFilter('vehicle')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  assetFilter === 'vehicle' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                🚗 Vehicles ({assetCounts.vehicle})
              </button>
              <button
                onClick={() => setAssetFilter('equipment')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  assetFilter === 'equipment' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
                }`}
              >
                🚜 Equipment ({assetCounts.equipment})
              </button>
              {assetCounts.business > 0 && (
                <button
                  onClick={() => setAssetFilter('business')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    assetFilter === 'business' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border'
                  }`}
                >
                  💼 Business ({assetCounts.business})
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset, i) => (
              <div
                key={i}
                onClick={() => setSelectedAsset(asset)}
                className="bg-white rounded-xl shadow hover:shadow-lg transition border-2 border-transparent hover:border-indigo-200 cursor-pointer"
              >
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-t-xl border-b-2 border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">
                      {asset.type === 'vehicle' ? '🚗' :
                       asset.type === 'equipment' ? '🚜' :
                       asset.type === 'tools' ? '🔧' : '💼'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{asset.name}</h3>
                      <p className="text-sm text-green-700 font-medium mt-1">
                        📅 {asset.available}
                      </p>
                    </div>
                  </div>
                  {asset.description && (
                    <p className="text-sm text-gray-600 mt-3">{asset.description}</p>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-2">Owned by:</p>
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="text-3xl">{asset.owner.avatar}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{asset.owner.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={10} />
                        {asset.owner.campus} Campus
                      </p>
                      {asset.owner.kudos >= 50 && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 mt-1">
                          <Award size={10} />
                          {asset.owner.kudos}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold mb-2">No assets in this category</h3>
              <p className="text-gray-600">Try selecting a different filter</p>
            </div>
          )}
        </div>
        <Navigation />
      </div>
    );
  };

  const MemberModal = () => {
    if (!selectedMember) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMember(null)}>
        <div 
          className="bg-white rounded-2xl max-w-3xl w-full" 
          style={{ 
            maxHeight: '90vh', 
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch'
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{selectedMember.avatar}</div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold">{selectedMember.name}</h2>
                    {selectedMember.kudos > 0 && (
                      <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Award size={16} />
                        {selectedMember.kudos}
                      </span>
                    )}
                  </div>
                  <p className="text-indigo-200 flex items-center gap-2">
                    <MapPin size={16} />
                    {selectedMember.campus} Campus
                  </p>
                  <p className="text-indigo-200 text-sm mt-1">
                    Member since {selectedMember.memberSince}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-white hover:text-indigo-200">
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              {selectedMember.kudos >= 50 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Award className="text-yellow-600" size={24} />
                    <div>
                      <p className="font-bold text-yellow-900 text-lg">
                        {selectedMember.kudos >= 100 ? 'Church Family Hero!' : 'Super Connector'}
                      </p>
                      <p className="text-xs text-yellow-700">
                        Earned {selectedMember.kudos} kudos by serving the community
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMember.seekingWork && (
                <div className="bg-orange-50 border-2 border-orange-300 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">💼</div>
                    <div>
                      <p className="font-bold text-orange-900 text-lg">Actively Seeking Employment</p>
                      <p className="text-sm text-orange-700">
                        Open to opportunities • Available for interviews • Connect to help!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMember.lookingForGroups && selectedMember.lookingForGroups.length > 0 && (
                <div className="bg-purple-50 border-2 border-purple-300 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl">👥</div>
                    <div>
                      <p className="font-bold text-purple-900 text-lg">Looking to Join Groups</p>
                      <p className="text-sm text-purple-700">
                        Interested in: {selectedMember.lookingForGroups.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {selectedMember.bio && (
              <div>
                <h3 className="font-bold text-lg mb-2">About</h3>
                <p className="text-gray-700">{selectedMember.bio}</p>
              </div>
            )}

            <div>
              <h3 className="font-bold text-lg mb-3">Professional Info</h3>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Title</p>
                  <p className="font-medium">{selectedMember.jobTitle}</p>
                </div>
                {selectedMember.company && (
                  <div>
                    <p className="text-xs text-gray-500">Company</p>
                    <p className="font-medium">{selectedMember.company}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedMember.assets.length > 0 && (
              <div>
                <h3 className="font-bold text-xl mb-3 flex items-center gap-2 text-indigo-900">
                  <Truck size={24} className="text-indigo-600" />
                  Available Assets ({selectedMember.assets.length})
                </h3>
                <div className="space-y-3">
                  {selectedMember.assets.map((asset: any, i: number) => (
                    <div 
                      key={i} 
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-xl cursor-pointer hover:border-green-400 transition"
                      onClick={() => setSelectedAsset({ ...asset, owner: selectedMember })}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">
                          {asset.type === 'vehicle' ? '🚗' :
                           asset.type === 'equipment' ? '🚜' : '🔧'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">{asset.name}</p>
                          <p className="text-sm text-green-700 font-medium mt-1">
                            📅 {asset.available}
                          </p>
                          {asset.description && (
                            <p className="text-sm text-gray-600 mt-2">{asset.description}</p>
                          )}
                          <p className="text-xs text-indigo-600 mt-2 font-medium">Click to request →</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-bold text-xl mb-3 text-indigo-900">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMember.skills.map((skill: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-xl mb-3 text-indigo-900">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {selectedMember.interests.map((interest: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-lg">
              💬 Send Message
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AssetModal = () => {
    if (!selectedAsset) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedAsset(null)}>
        <div 
          className="bg-white rounded-2xl max-w-2xl w-full" 
          style={{ 
            maxHeight: '90vh', 
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch'
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl sticky top-0 z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="text-6xl">
                  {selectedAsset.type === 'vehicle' ? '🚗' :
                   selectedAsset.type === 'equipment' ? '🚜' :
                   selectedAsset.type === 'tools' ? '🔧' : '💼'}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedAsset.name}</h2>
                  <p className="text-green-100 text-sm mt-1">
                    📅 {selectedAsset.available}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-white hover
              <button onClick={() => setSelectedAsset(null)} className="text-white hover:text-green-200">
                <X size={28} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {selectedAsset.description && (
              <div>
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-gray-700">{selectedAsset.description}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="font-bold text-lg mb-3">Availability</h3>
              <p className="text-gray-700">{selectedAsset.available}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Owner</h3>
              <div 
                className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-xl cursor-pointer hover:border-indigo-400 transition"
                onClick={() => {
                  setSelectedAsset(null);
                  setSelectedMember(selectedAsset.owner);
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedAsset.owner.avatar}</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{selectedAsset.owner.name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedAsset.owner.campus} Campus
                    </p>
                    {selectedAsset.owner.kudos >= 50 && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold inline-flex items-center gap-1 mt-1">
                        <Award size={12} />
                        {selectedAsset.owner.kudos} kudos
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-indigo-600 mt-3 font-medium">Click to view full profile →</p>
              </div>
            </div>

            <button 
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg"
              onClick={() => {
                alert(`Request sent to ${selectedAsset.owner.name}!\n\nIn the real app, this would:\n• Send them a notification\n• Start a message thread\n• Track the loan request`);
              }}
            >
              📬 Request to Borrow
            </button>

            <p className="text-xs text-center text-gray-500">
              The owner will receive your request and can approve or suggest alternative dates
            </p>
          </div>
        </div>
      </div>
    );
  };

  const Navigation = () => (
    <div className="fixed bottom-0 w-full bg-white border-t shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-around py-3">
        <button 
          onClick={() => setCurrentView('home')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentView === 'home' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
        >
          <Home size={24} />
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => setCurrentView('directory')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentView === 'directory' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
        >
          <Users size={24} />
          <span className="text-xs">Directory</span>
        </button>
        <button 
          onClick={() => setCurrentView('assets')}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${currentView === 'assets' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600'}`}
        >
          <Truck size={24} />
          <span className="text-xs">Assets</span>
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {currentView === 'landing' && <LandingPage />}
      {currentView === 'home' && <HomePage />}
      {currentView === 'directory' && <DirectoryPage />}
      {currentView === 'assets' && <AssetsPage />}
      {selectedMember && <MemberModal />}
      {selectedAsset && <AssetModal />}
    </div>
  );
}
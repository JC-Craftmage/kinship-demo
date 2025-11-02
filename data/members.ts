// Mock member data - will be replaced with API calls later

import { Member } from '@/lib/types';

export const members: Member[] = [
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
    lookingForGroups: [],
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
    lookingForGroups: [],
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
    lookingForGroups: [],
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
    lookingForGroups: [],
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
    lookingForGroups: [],
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
    lookingForGroups: [],
    assets: [
      { type: 'vehicle', name: 'Cargo trailer (6x12)', available: 'Most weekends', description: 'Perfect for moving or hauling' }
    ],
    memberSince: '2010'
  }
];

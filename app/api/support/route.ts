import { NextRequest, NextResponse } from 'next/server';
import { demoWriteBlocked } from '@/lib/demo/mode';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/server';
import { getMembership } from '@/lib/supabase/queries';

// Support ticket categories
type TicketCategory = 'faq' | 'issue' | 'feature' | 'other';
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

// FAQ knowledge base for the support bot
const FAQ_KB = [
  {
    keywords: ['join', 'join church', 'become member', 'sign up', 'register'],
    question: 'How do I join my church on Kinship?',
    answer: 'Your church administrator sends you an invite link. Click the link, sign up or log in with your email, and you\'re in! If you don\'t have an invite link, ask your church admin to generate one for you.',
    escalation: false,
  },
  {
    keywords: ['password', 'forgot password', 'reset', 'can\'t log in', 'login'],
    question: 'I forgot my password / can\'t log in',
    answer: 'On the sign-in page, click "Forgot password?" and enter your email. We\'ll send you a reset link. If you don\'t receive it within a few minutes, check your spam folder or contact your church admin.',
    escalation: false,
  },
  {
    keywords: ['need', 'request help', 'post need', 'ask for help', 'help request'],
    question: 'How do I post a need / request help?',
    answer: 'Go to the Needs board in your church dashboard. Click "Post a Need," fill in what you need and the category, set urgency and deadline, then submit. Church members can then sign up to help.',
    escalation: false,
  },
  {
    keywords: ['kudos', 'give kudos', 'appreciate', 'thank someone', 'celebrate'],
    question: 'How do I give someone kudos?',
    answer: 'Find the person in the Directory or Kudos page. Click their name, then "Give Kudos." Write a brief note of appreciation — it\'s public and celebratory, no negatives, no ratings.',
    escalation: false,
  },
  {
    keywords: ['meal train', 'meal', 'food', 'cook'],
    question: 'How does a meal train work?',
    answer: 'When someone has a life event (new baby, illness, etc.), an admin creates a meal train. Sign up for a date, choose your meal type, and deliver it. The recipient\'s dietary needs and address are provided when you sign up.',
    escalation: false,
  },
  {
    keywords: ['asset', 'resource', 'equipment', 'borrow', 'truck', 'tools'],
    question: 'How do I list an asset or resource?',
    answer: 'Go to the Assets directory and click "Add Asset." Fill in what you\'re offering — name, category, description, and availability. Other members can then see and request to borrow it.',
    escalation: false,
  },
  {
    keywords: ['profile', 'update profile', 'edit name', 'change photo', 'avatar'],
    question: 'How do I update my profile?',
    answer: 'Go to Settings in your dashboard. You can update your name, photo, bio, skills, interests, and more. Keep your profile up to date so others can discover what you have to offer!',
    escalation: false,
  },
  {
    keywords: ['invite', 'invite friend', 'invite member', 'send invite'],
    question: 'How do I invite someone to my church?',
    answer: 'Admins and overseers can generate invite codes from the church settings. Share the code or link with new members — they use it to join your church on Kinship.',
    escalation: false,
  },
  {
    keywords: ['campus', 'multiple campuses', 'different location'],
    question: 'My church has multiple campuses — how does this work?',
    answer: 'Kinship supports multiple campuses within one church. Your admin assigns you to a campus, and you\'ll see content relevant to your location. Some content (like church-wide announcements) is shared across all campuses.',
    escalation: false,
  },
  {
    keywords: ['data', 'privacy', 'who sees', 'info shared', 'private'],
    question: 'Who can see my information?',
    answer: 'Only members of your church can see your profile info — and only what you choose to share. Skills, interests, and assets are visible to help others connect. Your contact info is visible only to admins.',
    escalation: false,
  },
];

// Match user message to FAQ
function matchFAQ(message: string): { question: string; answer: string; escalation: boolean } | null {
  const lowerMsg = message.toLowerCase();
  
  let bestMatch = { score: 0, entry: FAQ_KB[0] };
  
  for (const entry of FAQ_KB) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lowerMsg.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { score, entry };
    }
  }
  
  if (bestMatch.score > 0) {
    return {
      question: bestMatch.entry.question,
      answer: bestMatch.entry.answer,
      escalation: bestMatch.entry.escalation,
    };
  }
  
  return null;
}

// Create a support ticket
export async function POST(request: NextRequest) {
  try {
    // Demo mode is read-only: refuse the write so fixture data can never
    // land in a real church's database.
    const demoBlocked = demoWriteBlocked();
    if (demoBlocked) return demoBlocked;

    const { userId } = await auth();
    
    const body = await request.json();
    const { message, churchId, createTicket } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try to match FAQ first
    const faqMatch = matchFAQ(message);
    
    if (faqMatch && !createTicket) {
      return NextResponse.json({
        type: 'faq',
        data: faqMatch,
      });
    }

    // If user wants to create a ticket or no FAQ match
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required to submit a support ticket' },
        { status: 401 }
      );
    }

    // A ticket may only be filed against a church the caller belongs to.
    // Membership lookup is scoped by BOTH user_id and church_id.
    if (churchId) {
      const membership = await getMembership(userId, churchId);

      if (!membership) {
        return NextResponse.json(
          { error: 'You do not have permission to create a ticket for this church' },
          { status: 403 }
        );
      }
    }

    // Create support ticket
    const ticketCategory: TicketCategory = 'issue';
    const ticketStatus: TicketStatus = 'open';

    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        church_id: churchId || null,
        category: ticketCategory,
        subject: message.slice(0, 100),
        description: message,
        status: ticketStatus,
        priority: 'medium',
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError);
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      type: 'ticket',
      data: {
        ticketId: ticket.id,
        message: 'Your support ticket has been submitted. We\'ll get back to you soon.',
        faq: faqMatch ? {
          question: faqMatch.question,
          answer: faqMatch.answer,
        } : null,
      },
    });

  } catch (error) {
    console.error('Unexpected error in support route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get user's support tickets
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({ tickets });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
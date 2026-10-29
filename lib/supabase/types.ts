// Supabase Database TypeScript Types
// Generated from DATABASE_SCHEMA.md

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ChurchRole = 'owner' | 'overseer' | 'moderator' | 'member';
export type JoinRequestStatus = 'pending' | 'approved' | 'denied' | 'withdrawn';

// The UI's category labels, NOT the retired `need_category` enum. Migration
// 005 changed `needs.category` from that enum to TEXT + CHECK so that the
// database and `lib/types/need.ts` speak the same language.
export type NeedCategory =
  | 'Moving Help'
  | 'Prayer Request'
  | 'Childcare'
  | 'Transportation'
  | 'Home Repair'
  | 'Event Help';
export type OfferCategory =
  | 'Moving Help'
  | 'Childcare'
  | 'Transportation'
  | 'Home Repair'
  | 'Event Help'
  | 'Skilled Labor'
  | 'Equipment Rental'
  | 'Other';
export type OfferAvailability = 'available' | 'limited' | 'unavailable';
export type NeedUrgency = 'low' | 'medium' | 'high';
export type NeedStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled';
export type MealSignupStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type VolunteerStatus = 'pending' | 'accepted' | 'completed' | 'declined';
export type SupportTicketCategory = 'faq' | 'issue' | 'feature' | 'other';
export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportTicketPriority = 'low' | 'medium' | 'high';

export interface Database {
  public: {
    Tables: {
      churches: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: []
      };
      campuses: {
        Row: {
          id: string;
          church_id: string;
          name: string;
          location: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          zip_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          name: string;
          location?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          name?: string;
          location?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          zip_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campuses_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
        ]
      };
      church_members: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          user_id: string;
          role: ChurchRole;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          user_id: string;
          role: ChurchRole;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          user_id?: string;
          role?: ChurchRole;
          joined_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'church_members_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'church_members_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      campus_overseers: {
        Row: {
          id: string;
          church_member_id: string;
          campus_id: string;
          assigned_at: string;
        };
        Insert: {
          id?: string;
          church_member_id: string;
          campus_id: string;
          assigned_at?: string;
        };
        Update: {
          id?: string;
          church_member_id?: string;
          campus_id?: string;
          assigned_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'campus_overseers_church_member_id_fkey',
            columns: ['church_member_id'],
            isOneToOne: false,
            referencedRelation: 'church_members',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'campus_overseers_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      invite_codes: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          code: string;
          created_by: string;
          expires_at: string | null;
          max_uses: number | null;
          current_uses: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          code: string;
          created_by: string;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          code?: string;
          created_by?: string;
          expires_at?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invite_codes_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'invite_codes_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      members: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          avatar: string | null;
          phone: string | null;
          bio: string | null;
          job_title: string | null;
          company: string | null;
          skills: string[];
          interests: string[];
          seeking_work: boolean;
          looking_for_groups: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          avatar?: string | null;
          phone?: string | null;
          bio?: string | null;
          job_title?: string | null;
          company?: string | null;
          skills?: string[];
          interests?: string[];
          seeking_work?: boolean;
          looking_for_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          avatar?: string | null;
          phone?: string | null;
          bio?: string | null;
          job_title?: string | null;
          company?: string | null;
          skills?: string[];
          interests?: string[];
          seeking_work?: boolean;
          looking_for_groups?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: []
      };
      assets: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          owner_id: string;
          name: string;
          category: string;
          description: string | null;
          availability: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          owner_id: string;
          name: string;
          category: string;
          description?: string | null;
          availability?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          owner_id?: string;
          name?: string;
          category?: string;
          description?: string | null;
          availability?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assets_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'assets_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      meal_trains: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          recipient_name: string;
          recipient_situation: string;
          recipient_dietary: string | null;
          recipient_address: string | null;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          recipient_name: string;
          recipient_situation: string;
          recipient_dietary?: string | null;
          recipient_address?: string | null;
          start_date: string;
          end_date: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          recipient_name?: string;
          recipient_situation?: string;
          recipient_dietary?: string | null;
          recipient_address?: string | null;
          start_date?: string;
          end_date?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_trains_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'meal_trains_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      meal_signups: {
        Row: {
          id: string;
          meal_train_id: string;
          user_id: string;
          user_name: string;
          date: string;
          meal_type: string;
          status: MealSignupStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          meal_train_id: string;
          user_id: string;
          user_name: string;
          date: string;
          meal_type: string;
          status?: MealSignupStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          meal_train_id?: string;
          user_id?: string;
          user_name?: string;
          date?: string;
          meal_type?: string;
          status?: MealSignupStatus;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_signups_meal_train_id_fkey',
            columns: ['meal_train_id'],
            isOneToOne: false,
            referencedRelation: 'meal_trains',
            referencedColumns: ['id'],
          },
        ]
      };
      needs: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          title: string;
          description: string;
          category: NeedCategory;
          urgency: NeedUrgency;
          status: NeedStatus;
          posted_by: string;
          posted_by_name: string;
          deadline: string | null;
          volunteers_needed: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          title: string;
          description: string;
          category: NeedCategory;
          urgency?: NeedUrgency;
          status?: NeedStatus;
          posted_by: string;
          posted_by_name: string;
          deadline?: string | null;
          volunteers_needed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          title?: string;
          description?: string;
          category?: NeedCategory;
          urgency?: NeedUrgency;
          status?: NeedStatus;
          posted_by?: string;
          posted_by_name?: string;
          deadline?: string | null;
          volunteers_needed?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'needs_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'needs_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      need_volunteers: {
        Row: {
          id: string;
          need_id: string;
          user_id: string;
          user_name: string;
          message: string | null;
          status: VolunteerStatus;
          volunteered_at: string;
        };
        Insert: {
          id?: string;
          need_id: string;
          user_id: string;
          user_name: string;
          message?: string | null;
          status?: VolunteerStatus;
          volunteered_at?: string;
        };
        Update: {
          id?: string;
          need_id?: string;
          user_id?: string;
          user_name?: string;
          message?: string | null;
          status?: VolunteerStatus;
          volunteered_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'need_volunteers_need_id_fkey',
            columns: ['need_id'],
            isOneToOne: false,
            referencedRelation: 'needs',
            referencedColumns: ['id'],
          },
        ]
      };
      join_requests: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          user_id: string;
          user_name: string;
          user_email: string;
          user_photo: string | null;
          status: JoinRequestStatus;
          personal_note: string | null;
          created_at: string;
          updated_at: string;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_note: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          user_id: string;
          user_name: string;
          user_email: string;
          user_photo?: string | null;
          status?: JoinRequestStatus;
          personal_note?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          user_id?: string;
          user_name?: string;
          user_email?: string;
          user_photo?: string | null;
          status?: JoinRequestStatus;
          personal_note?: string | null;
          created_at?: string;
          updated_at?: string;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          review_note?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'join_requests_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'join_requests_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      church_questionnaires: {
        Row: {
          id: string;
          church_id: string;
          question: string;
          is_required: boolean;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          question: string;
          is_required?: boolean;
          display_order: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          question?: string;
          is_required?: boolean;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'church_questionnaires_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
        ]
      };
      join_request_responses: {
        Row: {
          id: string;
          join_request_id: string;
          questionnaire_id: string;
          answer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          join_request_id: string;
          questionnaire_id: string;
          answer: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          join_request_id?: string;
          questionnaire_id?: string;
          answer?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'join_request_responses_join_request_id_fkey',
            columns: ['join_request_id'],
            isOneToOne: false,
            referencedRelation: 'join_requests',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'join_request_responses_questionnaire_id_fkey',
            columns: ['questionnaire_id'],
            isOneToOne: false,
            referencedRelation: 'church_questionnaires',
            referencedColumns: ['id'],
          },
        ]
      };
      join_request_denials: {
        Row: {
          id: string;
          church_id: string;
          user_id: string;
          denied_at: string;
          denied_by: string;
          reason: string | null;
        };
        Insert: {
          id?: string;
          church_id: string;
          user_id: string;
          denied_at?: string;
          denied_by: string;
          reason?: string | null;
        };
        Update: {
          id?: string;
          church_id?: string;
          user_id?: string;
          denied_at?: string;
          denied_by?: string;
          reason?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'join_request_denials_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
        ]
      };
      member_departures: {
        Row: {
          id: string;
          church_id: string;
          user_id: string;
          user_name: string;
          role: ChurchRole;
          reason: string | null;
          departed_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          user_id: string;
          user_name: string;
          role: ChurchRole;
          reason?: string | null;
          departed_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          user_id?: string;
          user_name?: string;
          role?: ChurchRole;
          reason?: string | null;
          departed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'member_departures_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
        ]
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          church_id: string | null;
          category: SupportTicketCategory;
          subject: string;
          description: string;
          status: SupportTicketStatus;
          priority: SupportTicketPriority;
          assigned_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          church_id?: string | null;
          category: SupportTicketCategory;
          subject: string;
          description: string;
          status?: SupportTicketStatus;
          priority?: SupportTicketPriority;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          church_id?: string | null;
          category?: SupportTicketCategory;
          subject?: string;
          description?: string;
          status?: SupportTicketStatus;
          priority?: SupportTicketPriority;
          assigned_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'support_tickets_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
        ]
      };
      offers: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          title: string;
          description: string;
          category: OfferCategory;
          availability: OfferAvailability;
          availability_note: string | null;
          provided_by: string;
          provided_by_name: string;
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          title: string;
          description: string;
          category?: OfferCategory;
          availability?: OfferAvailability;
          availability_note?: string | null;
          provided_by: string;
          provided_by_name: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          title?: string;
          description?: string;
          category?: OfferCategory;
          availability?: OfferAvailability;
          availability_note?: string | null;
          provided_by?: string;
          provided_by_name?: string;
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'offers_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'offers_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      bible_study_groups: {
        Row: {
          id: string;
          church_id: string;
          campus_id: string | null;
          name: string;
          description: string;
          leader_id: string;
          leader_name: string;
          leader_email: string | null;
          leader_phone: string | null;
          schedule: string | null;
          location: string | null;
          current_book: string | null;
          current_chapter: string | null;
          next_study_date: string | null;
          max_members: number | null;
          is_open: boolean;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          campus_id?: string | null;
          name: string;
          description?: string;
          leader_id: string;
          leader_name: string;
          leader_email?: string | null;
          leader_phone?: string | null;
          schedule?: string | null;
          location?: string | null;
          current_book?: string | null;
          current_chapter?: string | null;
          next_study_date?: string | null;
          max_members?: number | null;
          is_open?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          campus_id?: string | null;
          name?: string;
          description?: string;
          leader_id?: string;
          leader_name?: string;
          leader_email?: string | null;
          leader_phone?: string | null;
          schedule?: string | null;
          location?: string | null;
          current_book?: string | null;
          current_chapter?: string | null;
          next_study_date?: string | null;
          max_members?: number | null;
          is_open?: boolean;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bible_study_groups_church_id_fkey',
            columns: ['church_id'],
            isOneToOne: false,
            referencedRelation: 'churches',
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'bible_study_groups_campus_id_fkey',
            columns: ['campus_id'],
            isOneToOne: false,
            referencedRelation: 'campuses',
            referencedColumns: ['id'],
          },
        ]
      };
      bible_study_signups: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          user_name: string;
          signed_up_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          user_name: string;
          signed_up_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          user_name?: string;
          signed_up_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bible_study_signups_group_id_fkey',
            columns: ['group_id'],
            isOneToOne: false,
            referencedRelation: 'bible_study_groups',
            referencedColumns: ['id'],
          },
        ]
      };
      bible_study_sessions: {
        Row: {
          id: string;
          group_id: string;
          session_date: string;
          topic: string;
          notes: string | null;
          attendance: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          session_date: string;
          topic: string;
          notes?: string | null;
          attendance?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          session_date?: string;
          topic?: string;
          notes?: string | null;
          attendance?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bible_study_sessions_group_id_fkey',
            columns: ['group_id'],
            isOneToOne: false,
            referencedRelation: 'bible_study_groups',
            referencedColumns: ['id'],
          },
        ]
      };
      bible_study_posts: {
        Row: {
          id: string;
          group_id: string;
          author_id: string;
          author_name: string;
          content: string;
          likes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          author_id: string;
          author_name: string;
          content: string;
          likes?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          author_id?: string;
          author_name?: string;
          content?: string;
          likes?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bible_study_posts_group_id_fkey',
            columns: ['group_id'],
            isOneToOne: false,
            referencedRelation: 'bible_study_groups',
            referencedColumns: ['id'],
          },
        ]
      };
      kudos: {
        Row: {
          id: string;
          church_id: string;
          to_member_id: string;
          from_user_id: string;
          from_name: string;
          amount: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          to_member_id: string;
          from_user_id: string;
          from_name?: string;
          amount?: number;
          reason?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          to_member_id?: string;
          from_user_id?: string;
          from_name?: string;
          amount?: number;
          reason?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'kudos_church_id_fkey';
            columns: ['church_id'];
            isOneToOne: false;
            referencedRelation: 'churches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kudos_to_member_id_fkey';
            columns: ['to_member_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
        ]
      };
      life_events: {
        Row: {
          id: string;
          church_id: string;
          created_by_user_id: string;
          created_by_name: string;
          to_member_id: string | null;
          event_type: string;
          title: string;
          description: string;
          event_date: string;
          campus_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          church_id: string;
          created_by_user_id: string;
          created_by_name?: string;
          to_member_id?: string | null;
          event_type: string;
          title: string;
          description?: string;
          event_date: string;
          campus_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          church_id?: string;
          created_by_user_id?: string;
          created_by_name?: string;
          to_member_id?: string | null;
          event_type?: string;
          title?: string;
          description?: string;
          event_date?: string;
          campus_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'life_events_church_id_fkey';
            columns: ['church_id'];
            isOneToOne: false;
            referencedRelation: 'churches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'life_events_to_member_id_fkey';
            columns: ['to_member_id'];
            isOneToOne: false;
            referencedRelation: 'members';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'life_events_campus_id_fkey';
            columns: ['campus_id'];
            isOneToOne: false;
            referencedRelation: 'campuses';
            referencedColumns: ['id'];
          },
        ];
      };
      life_event_comments: {
        Row: {
          id: string;
          life_event_id: string;
          author_user_id: string;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          life_event_id: string;
          author_user_id: string;
          author_name?: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          life_event_id?: string;
          author_user_id?: string;
          author_name?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'life_event_comments_life_event_id_fkey';
            columns: ['life_event_id'];
            isOneToOne: false;
            referencedRelation: 'life_events';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      church_role: ChurchRole;
      join_request_status: JoinRequestStatus;
      need_urgency: NeedUrgency;
      need_status: NeedStatus;
      meal_signup_status: MealSignupStatus;
      volunteer_status: VolunteerStatus;
    };
  };
}

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

export type NeedCategory = 'practical' | 'spiritual' | 'financial' | 'emotional' | 'other';
export type NeedUrgency = 'low' | 'medium' | 'high';
export type NeedStatus = 'open' | 'in_progress' | 'fulfilled' | 'cancelled';
export type MealSignupStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled';
export type VolunteerStatus = 'pending' | 'accepted' | 'completed' | 'declined';

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
      need_category: NeedCategory;
      need_urgency: NeedUrgency;
      need_status: NeedStatus;
      meal_signup_status: MealSignupStatus;
      volunteer_status: VolunteerStatus;
    };
  };
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabaseUrl: string;
  private readonly supabaseAnonKey: string;
  private readonly supabaseServiceRoleKey: string;

  constructor() {
    // Kinukuha natin ang keys mula sa .env file
    this.supabaseUrl = process.env.SUPABASE_URL || '';
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
    this.supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  }

  // 🔴 ADMIN CLIENT: Gamit ito para maka-bypass ng RLS (Row Level Security).
  // Ginagamit ito kapag gagawa ng account (Sign Up) o mag-a-update ng password via admin API.
  createAdminClient(): SupabaseClient {
    if (!this.supabaseUrl || !this.supabaseServiceRoleKey) {
      throw new InternalServerErrorException('Supabase Admin configuration is missing in .env');
    }
    return createClient(this.supabaseUrl, this.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // 🟢 SERVER (ANON) CLIENT: Standard connection.
  // Ginagamit ito para sa normal na login (signInWithPassword).
  createServerClient(): SupabaseClient {
     if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new InternalServerErrorException('Supabase Anon configuration is missing in .env');
    }
    return createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // 📝 ACTIVITY LOGGER: Ginamit ito sa AuthService ng mga devs mo
  async logActivity(userId: string, actionType: string, entityType: string, entityId: string, descriptionFn: (name: string) => string) {
    try {
      const admin = this.createAdminClient();
      
      // Kunin ang pangalan ng user sa profiles table
      const { data } = await admin.schema("account").from("profiles").select("full_name").eq("id", userId).single();
      const fullName = data?.full_name || "Unknown User";

      // I-save sa audit_logs table
      await admin.schema("public").from("audit_logs").insert({
        user_id: userId,
        action: actionType,
        entity_type: entityType,
        entity_id: entityId,
        description: descriptionFn(fullName)
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Hindi natin inilalagay sa throw error para hindi maantala ang main logic (e.g. login) kung pumalya lang ang logger
    }
  }
}
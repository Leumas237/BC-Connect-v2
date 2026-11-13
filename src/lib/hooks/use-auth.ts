'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { Profile } from '@/lib/supabase/types';

export type AuthProfile = Profile & {
  academic_programs?: { name: string } | null;
  academic_levels?: { name: string } | null;
  profile_photos?: { url: string; is_primary: boolean }[];
};

interface AuthContextType {
  user: User | null;
  profile: AuthProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, data: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<AuthProfile | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  const supabase = createClient();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch { setProfile(null); }
  };

  const signUp = async (email: string, password: string, data: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({ email, password, options: { data } });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setSession(null);
  };

  const refreshProfile = async () => { if (user) await fetchProfile(user.id); };

  return (
    React.createElement(AuthContext.Provider, {
      value: { user, profile, session, loading, signUp, signIn, signOut, refreshProfile }
    }, children)
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
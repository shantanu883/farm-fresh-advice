import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profileChecked: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false);

  // Check if user has a profile in the database
  const checkUserProfile = async (userId: string) => {
    try {
      console.log("Checking profile for user:", userId);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error checking profile:', error);
      }
      
      if (profile) {
        console.log("Profile found, marking onboarding complete");
        // User has a profile, mark onboarding as complete
        localStorage.setItem('onboardingComplete', 'true');
      } else {
        console.log("No profile found for user");
        // Make sure to clear it if no profile exists
        localStorage.removeItem('onboardingComplete');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setProfileChecked(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Reset profile checked state on auth change
        if (event === 'SIGNED_OUT') {
          setProfileChecked(true);
          setLoading(false);
          return;
        }
        
        // Check for existing profile after sign in
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(async () => {
            await checkUserProfile(session.user.id);
            setLoading(false);
          }, 0);
        } else if (!session?.user) {
          setProfileChecked(true);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Also check profile on initial load
      if (session?.user) {
        await checkUserProfile(session.user.id);
      } else {
        setProfileChecked(true);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Clear local storage on logout
    localStorage.removeItem("farmerProfile");
    localStorage.removeItem("onboardingComplete");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profileChecked, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

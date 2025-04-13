'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { type User, type Session } from '@supabase/supabase-js';
import { useErrorLogging } from '@/hooks/use-error-logging';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

// Create the authentication context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
});

/**
 * Custom hook to use the authentication context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

/**
 * AuthProvider component to manage authentication state
 * This component listens for auth state changes and provides the current user and session
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const { logError } = useErrorLogging();
    const supabase = createClient();

    useEffect(() => {
        // Initial session check
        const initializeAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (session) {
                    setSession(session);
                    setUser(session.user);
                    setIsAuthenticated(true);
                } else {
                    // Make sure to set authenticated status to false if no session
                    setIsAuthenticated(false);
                    setUser(null);
                    setSession(null);
                }
            } catch (error) {
                logError(error, { action: 'initializeAuth' });
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    setSession(session);
                    setUser(session?.user || null);
                    setIsAuthenticated(!!session);

                    if (event === 'SIGNED_IN') {
                        // Force a router refresh to update server components
                        router.refresh();
                    } else if (event === 'SIGNED_OUT') {
                        // Clear auth state and refresh
                        setIsAuthenticated(false);
                        setUser(null);
                        setSession(null);
                        router.refresh();
                    }
                } catch (error) {
                    logError(error, { action: 'authStateChange', event });
                    setIsAuthenticated(false);
                } finally {
                    setIsLoading(false);
                }
            }
        );

        // Clean up the subscription when the component unmounts
        return () => {
            subscription.unsubscribe();
        };
    }, [supabase.auth, router, logError]);

    return (
        <AuthContext.Provider value={{
            user,
            session,
            isLoading,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
}
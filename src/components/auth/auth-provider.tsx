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
}

// Create the authentication context
const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
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
                }
            } catch (error) {
                logError(error, { action: 'initializeAuth' });
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

                    if (event === 'SIGNED_IN') {
                        // Force a router refresh to update server components
                        router.refresh();
                    } else if (event === 'SIGNED_OUT') {
                        // Force a router refresh to update server components
                        router.refresh();
                    }
                } catch (error) {
                    logError(error, { action: 'authStateChange', event });
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
        <AuthContext.Provider value={{ user, session, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
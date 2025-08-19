'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getCurrentUser,
    signIn as awsSignIn,
    signOut as awsSignOut,
    signUp as awsSignUp,
    confirmSignUp as awsConfirmSignUp,
    AuthUser
} from 'aws-amplify/auth';

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (username: string, password: string, email: string) => Promise<void>;
    confirmSignUp: (username: string, code: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthState();
    }, []);

    const checkAuthState = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Sign in with email (works because email alias is enabled)
    const handleSignIn = async (email: string, password: string) => {
        try {
            await awsSignIn({ username: email, password });
            await checkAuthState();
        } catch (error) {
            throw error;
        }
    };

    // Sign up with username + email
    const handleSignUp = async (username: string, password: string, email: string) => {
        try {
            await awsSignUp({
                username,
                password,
                options: {
                    userAttributes: {
                        email, // required because email alias is enabled
                    },
                },
            });
        } catch (error) {
            throw error;
        }
    };

    const handleConfirmSignUp = async (username: string, code: string) => {
        try {
            await awsConfirmSignUp({ username, confirmationCode: code });
        } catch (error) {
            throw error;
        }
    };

    const handleSignOut = async () => {
        try {
            await awsSignOut();
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        confirmSignUp: handleConfirmSignUp,
        signOut: handleSignOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import type { Session, User } from '@supabase/supabase-js';
import { supabase } from "../services/supabase";

let currentUser: User | null = null;
// @ts-ignore
let currentSession: Session | null = null;

export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        throw error;
    }
    currentUser = data.user;
    currentSession = data.session;
    return data.user;
}

export async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    currentSession = null;
}

export function isAuthenticated() {
    return currentUser != null;
}

export function getCurrentUser() {
    return currentUser;
}

export async function restoreSession() {
    const { data } = await supabase.auth.getSession();

    if (data.session) {
        currentSession = data.session;
        currentUser = data.session.user;
    }
}

supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session ?? null;
    currentUser = session?.user ?? null;
});

export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_e, session) => callback(session));
}

export async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
}

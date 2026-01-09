import supabase from '@/helper/supabaseClient';

/**
 * Authentication Service
 * Handles user authentication, registration, and profile management
 */

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName: string, role: 'admin' | 'staff' | 'mechanic' | 'viewer' = 'viewer') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current user session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Get current user profile (with role and additional data)
   */
  async getCurrentProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: {
    full_name?: string;
    phone?: string;
  }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update user password
   */
  async updatePassword(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Check if user has required role
   */
  async hasRole(requiredRole: 'admin' | 'staff' | 'mechanic' | 'viewer') {
    const profile = await this.getCurrentProfile();
    if (!profile) return false;

    const roleHierarchy: Record<'viewer' | 'mechanic' | 'staff' | 'admin', number> = {
      viewer: 0,
      mechanic: 1,
      staff: 2,
      admin: 3,
    };

    return roleHierarchy[profile.role as keyof typeof roleHierarchy] >= roleHierarchy[requiredRole];
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Reset password (send reset email)
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  },

  /**
   * Update password with reset token
   */
  async updatePasswordWithToken(newPassword: string) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return data;
  },
};

/**
 * Example Usage:
 *
 * // Sign up
 * await authService.signUp('user@example.com', 'password123', 'John Doe', 'staff');
 *
 * // Sign in
 * await authService.signIn('user@example.com', 'password123');
 *
 * // Get current profile
 * const profile = await authService.getCurrentProfile();
 * console.log(profile.role); // 'admin', 'staff', 'mechanic', or 'viewer'
 *
 * // Check permissions
 * const isAdmin = await authService.hasRole('admin');
 *
 * // Sign out
 * await authService.signOut();
 *
 * // Listen to auth changes
 * authService.onAuthStateChange((event, session) => {
 *   if (event === 'SIGNED_IN') console.log('User signed in');
 *   if (event === 'SIGNED_OUT') console.log('User signed out');
 * });
 */

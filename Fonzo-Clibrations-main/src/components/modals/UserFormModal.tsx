import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { profilesApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Shield, ToggleLeft, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  user?: Profile | null;
}

export function UserFormModal({ open, onOpenChange, onSuccess, user }: UserFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Strength Helper
  const getStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'text-gray-400', width: '0%' };
    if (pass.length < 6) return { label: 'Too Short', color: 'text-red-500', width: '25%' };
    
    let score = 0;
    if (/[A-Z]/.test(pass)) score++; 
    if (/[0-9]/.test(pass)) score++; 
    if (/[^A-Za-z0-9]/.test(pass)) score++; 

    if (score === 0) return { label: 'Weak', color: 'text-orange-500', width: '50%' };
    if (score <= 2) return { label: 'Moderate', color: 'text-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'text-green-500', width: '100%' };
  };

  const strength = getStrength(password);

  const [formData, setFormData] = useState<ProfileInsert>({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'staff',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        full_name: user.full_name,
        email: user.email || '',
        phone: user.phone || '',
        role: user.role,
        is_active: user.is_active,
      });
      setPassword('');
      setConfirmPassword('');
    } else {
      // Generate a new UUID for new users
      const newId = crypto.randomUUID();
      setFormData({
        id: newId,
        full_name: '',
        email: '',
        phone: '',
        role: 'staff',
        is_active: true,
      });
      setPassword('');
      setConfirmPassword('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords for new users
    if (!user) {
      if (!password) {
        toast.error('Password is required for new users');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (!formData.email) {
        toast.error('Email is required to create a login account');
        return;
      }
    }

    setLoading(true);

    try {
      if (user) {
        await profilesApi.update(user.id, formData);
        toast.success('User updated successfully');
      } else {
        await profilesApi.create({ ...formData, password });
        toast.success('User created successfully with login credentials');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save user';
      toast.error(message);
      console.error('Error saving user:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={user ? 'Edit User' : 'Create New User'}
        onClose={() => onOpenChange(false)}
      >
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-5">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <User className="h-4 w-4" />
                <span>Personal Information</span>
              </div>

              <div className="space-y-4 pl-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="h-3.5 w-3.5 text-gray-500" />
                      Email {!user && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="email"
                      required={!user}
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="Enter email address"
                    />
                    {!user && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        Required for login authentication
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="h-3.5 w-3.5 text-gray-500" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Section (Only for New Users) */}
            {!user && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <Lock className="h-4 w-4" />
                  <span>Login Credentials</span>
                </div>

                <div className="pl-6 space-y-4">
                  <div className="group">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      {/* Password Strength Indicator Label */}
                      {password && (
                        <span className={`text-[10px] uppercase font-bold ${strength.color} flex items-center gap-1`}>
                          {strength.label === 'Strong' ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                          {strength.label}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 
                          ${password && strength.label === 'Strong' ? 'border-green-300 focus:ring-green-500' : 'border-gray-300 focus:ring-blue-500'}`}
                        placeholder="Enter password (min. 6 characters)"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Visual Strength Bar */}
                    {password && (
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${strength.color.replace('text', 'bg')}`}
                          style={{ width: strength.width }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 
                        ${confirmPassword && password !== confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                      placeholder="Re-enter password"
                      minLength={6}
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-600">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Role & Access Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Shield className="h-4 w-4" />
                <span>Role & Access</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' | 'mechanic' | 'viewer' })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="admin">Admin - Full system access</option>
                    <option value="staff">Staff - Manage customers and orders</option>
                    <option value="mechanic">Mechanic - View and update work assignments</option>
                    <option value="viewer">Viewer - Read-only access</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ToggleLeft className="h-4 w-4" />
                <span>Account Status</span>
              </div>

              <div className="pl-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Account
                  </label>
                </div>
              </div>
            </div>

            {/* User ID (Hidden for New Users, Shown for Editing) */}
            {user && (
              <div className="space-y-4 pt-2">
                <div className="pl-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={formData.id}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                  />
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 shadow-sm hover:shadow cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
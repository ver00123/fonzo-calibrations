import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { profilesApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import { User, Phone, Mail, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}

export function UserDetailsModal({ open, onOpenChange, userId }: UserDetailsModalProps) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      loadUser();
    }
  }, [open, userId]);

  const loadUser = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const data = await profilesApi.getById(userId);
      setUser(data);
    } catch (err) {
      console.error('Error loading user:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'staff':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'mechanic':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'viewer':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access including user management';
      case 'staff':
        return 'Can manage customers, job orders, and appointments';
      case 'mechanic':
        return 'Can view and update assigned work';
      case 'viewer':
        return 'Read-only access to view data';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent title="User Details" onClose={() => onOpenChange(false)}>
          <DialogBody>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading user details...</div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent title="User Details" onClose={() => onOpenChange(false)}>
          <DialogBody>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">User not found</div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="User Details" onClose={() => onOpenChange(false)}>
        <DialogBody className="space-y-5">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <User className="h-4 w-4" />
              <span>Personal Information</span>
            </div>

            <div className="pl-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {user.full_name}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Mail className="h-3.5 w-3.5 text-gray-500" />
                    Email
                  </label>
                  <p className="text-base text-gray-900">
                    {user.email || 'Not provided'}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                    <Phone className="h-3.5 w-3.5 text-gray-500" />
                    Phone Number
                  </label>
                  <p className="text-base text-gray-900">
                    {user.phone || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role & Access Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Shield className="h-4 w-4" />
              <span>Role & Access</span>
            </div>

            <div className="pl-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="flex items-start gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {getRoleDescription(user.role)}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <div className="flex items-center gap-2">
                  {user.is_active ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-base text-gray-900 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-base text-gray-900 font-medium">Inactive</span>
                    </>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-gray-600">
                  {user.is_active
                    ? 'This user can log in and access the system'
                    : 'This user cannot log in to the system'}
                </p>
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="h-4 w-4" />
              <span>Account Information</span>
            </div>

            <div className="pl-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono break-all">
                    {user.id}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-base text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-base text-gray-900">
                  {new Date(user.updated_at).toLocaleString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg cursor-pointer"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

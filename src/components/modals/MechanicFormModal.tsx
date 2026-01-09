import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { mechanicsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { UserCog, Briefcase, Wrench, ToggleLeft } from 'lucide-react';

type Mechanic = Database['public']['Tables']['mechanics']['Row'];
type MechanicInsert = Database['public']['Tables']['mechanics']['Insert'];

interface MechanicFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  mechanic?: Mechanic | null;
}

export function MechanicFormModal({ open, onOpenChange, onSuccess, mechanic }: MechanicFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<MechanicInsert>>({
    full_name: '',
    role: '',
    specialization: '',
    is_active: true,
  });

  useEffect(() => {
    if (mechanic) {
      setFormData({
        full_name: mechanic.full_name,
        role: mechanic.role,
        specialization: mechanic.specialization || '',
        is_active: mechanic.is_active,
      });
    } else {
      setFormData({
        full_name: '',
        role: '',
        specialization: '',
        is_active: true,
      });
    }
  }, [mechanic, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mechanic) {
        await mechanicsApi.update(mechanic.id, formData);
        toast.success('Mechanic updated successfully');
      } else {
        // Generate mechanic_id for new mechanics
        const newMechanicData: MechanicInsert = {
          mechanic_id: `MECH${Date.now()}`,
          full_name: formData.full_name || '',
          role: formData.role || '',
          specialization: formData.specialization || null,
          is_active: formData.is_active ?? true,
        };
        await mechanicsApi.create(newMechanicData);
        toast.success('Mechanic created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save mechanic';
      toast.error(message);
      console.error('Error saving mechanic:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={mechanic ? 'Edit Mechanic' : 'Add New Mechanic'}
        onClose={() => onOpenChange(false)}
      >
        <form onSubmit={handleSubmit}>
          <DialogBody className="space-y-5">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <UserCog className="h-4 w-4" />
                <span>Personal Information</span>
              </div>

              <div className="pl-6 space-y-4">
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
                      <Briefcase className="h-3.5 w-3.5 text-gray-500" />
                      Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., Senior Mechanic, Apprentice"
                    />
                  </div>

                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Wrench className="h-3.5 w-3.5 text-gray-500" />
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., Engine, Transmission, Electrical"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <ToggleLeft className="h-4 w-4" />
                <span>Status</span>
              </div>

              <div className="pl-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                    Active Status
                    <div className="text-xs text-gray-500 font-normal mt-0.5">
                      Enable this mechanic to receive job assignments
                    </div>
                  </label>
                </div>
              </div>
            </div>
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
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                mechanic ? 'Update Mechanic' : 'Add Mechanic'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

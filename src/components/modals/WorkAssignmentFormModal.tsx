import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { workAssignmentsApi, jobOrdersApi, mechanicsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { Briefcase, User, Calendar, FileText } from 'lucide-react';

type WorkAssignment = Database['public']['Tables']['work_assignments']['Row'];
type WorkAssignmentInsert = Partial<Database['public']['Tables']['work_assignments']['Insert']>;
type JobOrder = Database['public']['Tables']['job_orders']['Row'];
type Mechanic = Database['public']['Tables']['mechanics']['Row'];

interface WorkAssignmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  workAssignment?: WorkAssignment | null;
}

export function WorkAssignmentFormModal({ open, onOpenChange, onSuccess, workAssignment }: WorkAssignmentFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [jobOrders, setJobOrders] = useState<JobOrder[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);

  const [formData, setFormData] = useState<WorkAssignmentInsert>({
    job_order_id: '',
    mechanic_id: '',
    deadline: '',
    status: 'Diagnosing',
    issue_encountered: '',
    problem_notes: '',
  });

  useEffect(() => {
    if (open) {
      loadJobOrders();
      loadMechanics();
    }
  }, [open]);

  useEffect(() => {
    if (workAssignment) {
      setFormData({
        job_order_id: workAssignment.job_order_id,
        mechanic_id: workAssignment.mechanic_id || '',
        deadline: workAssignment.deadline || '',
        status: workAssignment.status,
        issue_encountered: workAssignment.issue_encountered || '',
        problem_notes: workAssignment.problem_notes || '',
      });
    } else {
      setFormData({
        job_order_id: '',
        mechanic_id: '',
        deadline: '',
        status: 'Diagnosing',
        issue_encountered: '',
        problem_notes: '',
      });
    }
  }, [workAssignment, open]);

  const loadJobOrders = async () => {
    try {
      const data = await jobOrdersApi.getAll();
      // Filter to only show pending/in-progress orders (case-insensitive)
      const availableOrders = data.filter(order => {
        const status = order.status?.toLowerCase();
        return status === 'pending' || status === 'in progress';
      });
      setJobOrders(availableOrders);
    } catch (err) {
      console.error('Error loading job orders:', err);
    }
  };

  const loadMechanics = async () => {
    try {
      const data = await mechanicsApi.getAll();
      setMechanics(data);
    } catch (err) {
      console.error('Error loading mechanics:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (workAssignment) {
        await workAssignmentsApi.update(workAssignment.id, formData);
        toast.success('Work assignment updated successfully');
      } else {
        // Find the selected job order and mechanic
        const selectedJobOrder = jobOrders.find(jo => jo.id === formData.job_order_id);
        const selectedMechanic = mechanics.find(m => m.id === formData.mechanic_id);

        const newAssignmentData: Database['public']['Tables']['work_assignments']['Insert'] = {
          work_id: `WORK${Date.now()}`,
          job_order_id: formData.job_order_id || '',
          vehicle: selectedJobOrder?.car_brand || 'Unknown',
          vehicle_id: selectedJobOrder?.vehicle_id || null,
          assigned_mechanic: selectedMechanic?.full_name || 'Unknown',
          mechanic_id: formData.mechanic_id || '',
          deadline: formData.deadline || new Date().toISOString(),
          status: formData.status || 'Diagnosing',
          issue_encountered: formData.issue_encountered || null,
          problem_notes: formData.problem_notes || null,
        };
        await workAssignmentsApi.create(newAssignmentData);
        toast.success('Work assignment created successfully');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save work assignment';
      toast.error(message);
      console.error('Error saving work assignment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={workAssignment ? 'Edit Work Assignment' : 'Assign New Job'}
        onClose={() => onOpenChange(false)}
      >
        <form onSubmit={handleSubmit}>
          <DialogBody className="max-h-[70vh] overflow-y-auto space-y-5">
            {/* Job Order Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Briefcase className="h-4 w-4" />
                <span>Job Order</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Job Order <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.job_order_id}
                    onChange={(e) => setFormData({ ...formData, job_order_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select a job order</option>
                    {jobOrders.map(order => (
                      <option key={order.id} value={order.id}>
                        {order.job_order_id} - {order.full_name} ({order.car_brand} {order.plate_number})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Mechanic Selection */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <User className="h-4 w-4" />
                <span>Assign Mechanic</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Mechanic <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.mechanic_id}
                    onChange={(e) => setFormData({ ...formData, mechanic_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select a mechanic</option>
                    {mechanics.map(mechanic => (
                      <option key={mechanic.id} value={mechanic.id}>
                        {mechanic.full_name} - {mechanic.role} (Current: {mechanic.current_jobs || 0} jobs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.deadline || ''}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    >
                      <option value="Diagnosing">Diagnosing</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Issues & Notes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="h-4 w-4" />
                <span>Issues & Notes</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issues Encountered
                  </label>
                  <textarea
                    value={formData.issue_encountered || ''}
                    onChange={(e) => setFormData({ ...formData, issue_encountered: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    placeholder="Describe any issues or problems encountered during the work..."
                    rows={3}
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Problem Notes
                  </label>
                  <textarea
                    value={formData.problem_notes || ''}
                    onChange={(e) => setFormData({ ...formData, problem_notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    placeholder="Additional notes, diagnostic findings, parts needed, etc..."
                    rows={3}
                  />
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
                workAssignment ? 'Update Assignment' : 'Assign Job'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

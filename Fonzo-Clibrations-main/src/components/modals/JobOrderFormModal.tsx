import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { jobOrdersApi, customersApi, vehiclesApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { Clipboard, User, Car, Calendar, DollarSign, FileText } from 'lucide-react';
import { notifyNewJobOrder, notifyJobOrderStatusChange, notifyJobOrderCompleted } from '@/helper/notificationHelper';

type JobOrder = Database['public']['Tables']['job_orders']['Row'];
type JobOrderInsert = Partial<Database['public']['Tables']['job_orders']['Insert']>;
type Customer = Database['public']['Tables']['customers']['Row'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface JobOrderFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  jobOrder?: JobOrder | null;
}

export function JobOrderFormModal({ open, onOpenChange, onSuccess, jobOrder }: JobOrderFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [formData, setFormData] = useState<JobOrderInsert>({
    job_order_id: `JO-${Date.now()}`,
    customer_id: '',
    vehicle_id: '',
    full_name: '',
    contact_no: '',
    car_brand: '',
    color: '',
    plate_number: '',
    service_date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    total_cost: 0,
    notes: '',
  });

  useEffect(() => {
    if (open) {
      loadCustomers();
    }
  }, [open]);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerVehicles(selectedCustomerId);
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer_id: customer.id,
          full_name: customer.full_name,
          contact_no: customer.contact_no,
        }));
      }
    }
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (jobOrder) {
      setFormData({
        job_order_id: jobOrder.job_order_id,
        customer_id: jobOrder.customer_id,
        vehicle_id: jobOrder.vehicle_id,
        full_name: jobOrder.full_name,
        contact_no: jobOrder.contact_no,
        car_brand: jobOrder.car_brand,
        color: jobOrder.color,
        plate_number: jobOrder.plate_number,
        service_date: jobOrder.service_date,
        status: jobOrder.status,
        total_cost: jobOrder.total_cost,
        notes: jobOrder.notes,
      });
      setSelectedCustomerId(jobOrder.customer_id);
    } else {
      setFormData({
        job_order_id: `JO-${Date.now()}`,
        customer_id: '',
        vehicle_id: '',
        full_name: '',
        contact_no: '',
        car_brand: '',
        color: '',
        plate_number: '',
        service_date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        total_cost: 0,
        notes: '',
      });
      setSelectedCustomerId('');
    }
  }, [jobOrder, open]);

  const loadCustomers = async () => {
    try {
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadCustomerVehicles = async (customerId: string) => {
    try {
      const data = await vehiclesApi.getByCustomerId(customerId);
      setVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicle_id: vehicle.id,
        car_brand: vehicle.car_brand || '',
        color: vehicle.color || '',
        plate_number: vehicle.plate_number,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (jobOrder) {
        await jobOrdersApi.update(jobOrder.id, formData as any);
        toast.success('Job order updated successfully');

        // Send notifications for status changes
        if (formData.status !== jobOrder.status) {
          if (formData.status === 'Completed') {
            await notifyJobOrderCompleted(formData.job_order_id || '', formData.full_name || '');
          } else {
            await notifyJobOrderStatusChange(formData.job_order_id || '', formData.status || '');
          }
        }
      } else {
        await jobOrdersApi.create(formData as any);
        toast.success('Job order created successfully');

        // Send notification for new job order
        await notifyNewJobOrder(formData.job_order_id || '', formData.full_name || '');
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save job order';
      toast.error(message);
      console.error('Error saving job order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={jobOrder ? 'Edit Job Order' : 'Create New Job Order'}
        onClose={() => onOpenChange(false)}
      >
        <form onSubmit={handleSubmit}>
          <DialogBody className="max-h-[70vh] overflow-y-auto space-y-5">
            {/* Job Order Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Clipboard className="h-4 w-4" />
                <span>Job Order Information</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Order ID
                  </label>
                  <input
                    type="text"
                    value={formData.job_order_id}
                    readOnly
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Customer Selection */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <User className="h-4 w-4" />
                <span>Customer Information</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                  >
                    <option value="">Select a customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.full_name} - {customer.contact_no}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Vehicle Selection */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Car className="h-4 w-4" />
                <span>Vehicle Information</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Vehicle <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => handleVehicleSelect(e.target.value)}
                    disabled={!selectedCustomerId}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 disabled:bg-gray-100"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.car_brand} {vehicle.vehicle_model} - {vehicle.plate_number}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.vehicle_id && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500">Brand</div>
                      <div className="text-sm font-medium">{formData.car_brand}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Color</div>
                      <div className="text-sm font-medium">{formData.color || 'N/A'}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Plate Number</div>
                      <div className="text-sm font-medium">{formData.plate_number}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="h-4 w-4" />
                <span>Service Details</span>
              </div>

              <div className="pl-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.service_date}
                      onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
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
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <DollarSign className="h-4 w-4" />
                <span>Pricing</span>
              </div>

              <div className="pl-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.total_cost === 0 ? '' : formData.total_cost || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, total_cost: val === '' ? 0 : parseFloat(val) });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <FileText className="h-4 w-4" />
                <span>Service Notes</span>
              </div>

              <div className="pl-6">
                <div className="group">
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                    placeholder="Enter service description, issues found, parts used, etc..."
                    rows={4}
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
                jobOrder ? 'Update Job Order' : 'Create Job Order'
              )}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { jobOrdersApi } from '@/services/api.service';
import toast from 'react-hot-toast';
import { User, Phone, Car, Calendar, DollarSign, FileText, Tag } from 'lucide-react';

interface JobOrderDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOrderId: string | null;
}

export function JobOrderDetailsModal({ open, onOpenChange, jobOrderId }: JobOrderDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [jobOrder, setJobOrder] = useState<any>(null);

  useEffect(() => {
    if (open && jobOrderId) {
      loadJobOrderDetails();
    }
  }, [open, jobOrderId]);

  const loadJobOrderDetails = async () => {
    if (!jobOrderId) return;

    try {
      setLoading(true);
      const data = await jobOrdersApi.getById(jobOrderId);
      setJobOrder(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load job order details';
      toast.error(message);
      console.error('Error loading job order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Job Order Details" onClose={() => onOpenChange(false)}>
        {loading ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">Loading job order details...</div>
            </div>
          </DialogBody>
        ) : !jobOrder ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">Failed to load job order details</div>
            </div>
          </DialogBody>
        ) : (
          <>
            <DialogBody className="space-y-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{jobOrder.job_order_id}</h3>
                <div className="text-sm text-gray-500 mt-1">ID: {jobOrder.id.slice(0, 8)}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(jobOrder.status)}`}>
                {jobOrder.status}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="text-sm text-gray-600 w-24">Name:</div>
                <div className="font-medium">{jobOrder.full_name}</div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                <div className="text-sm text-gray-600 w-24">Contact:</div>
                <div className="font-medium">{jobOrder.contact_no}</div>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Car className="h-4 w-4" />
              Vehicle Information
            </h4>
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="text-sm text-gray-600 w-24">Brand:</div>
                <div className="font-medium">{jobOrder.car_brand}</div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="text-sm text-gray-600 w-24">Color:</div>
                <div className="font-medium">{jobOrder.color || 'N/A'}</div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Tag className="h-3.5 w-3.5 text-gray-400" />
                <div className="text-sm text-gray-600 w-24">Plate:</div>
                <div className="font-medium">{jobOrder.plate_number}</div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Service Details
            </h4>
            <div className="pl-6 space-y-2">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="text-sm text-gray-600 w-24">Date:</div>
                <div className="font-medium">{new Date(jobOrder.service_date).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                <div className="text-sm text-gray-600 w-24">Total Cost:</div>
                <div className="font-medium text-lg text-green-600">${jobOrder.total_cost.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {jobOrder.notes && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Service Notes
              </h4>
              <div className="pl-6">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{jobOrder.notes}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Created</div>
                <div className="font-medium">{new Date(jobOrder.created_at).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Last Updated</div>
                <div className="font-medium">{new Date(jobOrder.updated_at).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </DialogFooter>
      </>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, ChevronDown } from "lucide-react";
import { jobOrdersApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { JobOrderFormModal } from '@/components/modals/JobOrderFormModal';
import { JobOrderDetailsModal } from '@/components/modals/JobOrderDetailsModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

type JobOrder = Database['public']['Tables']['job_orders']['Row'] & {
  customers?: { full_name: string; contact_no: string } | null;
  vehicles?: { car_brand: string; vehicle_model: string; color: string; plate_number: string } | null;
  mechanics?: { full_name: string } | null;
  notes?: string | null;
  job_order_id?: string;
};

export default function CustomerDataTable() {
  const [data, setData] = useState<JobOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrder | null>(null);
  const [selectedJobOrderId, setSelectedJobOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadJobOrders();
  }, []);

  const loadJobOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const orders = await jobOrdersApi.getAll();
      setData(orders as JobOrder[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load job orders';
      setError(message);
      toast.error(message);
      console.error('Error loading job orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(order => {
    const customerName = order.customers?.full_name || '';
    const customerContact = order.customers?.contact_no || '';
    const vehiclePlate = order.vehicles?.plate_number || '';
    const notes = order.notes || '';
    const jobOrderId = order.job_order_id || '';

    return customerName.toLowerCase().includes(filter.toLowerCase()) ||
      customerContact.includes(filter) ||
      vehiclePlate.toLowerCase().includes(filter.toLowerCase()) ||
      notes.toLowerCase().includes(filter.toLowerCase()) ||
      jobOrderId.toLowerCase().includes(filter.toLowerCase());
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const jobOrder = data.find(jo => jo.id === id);
      const oldStatus = jobOrder?.status;

      await jobOrdersApi.update(id, { status: newStatus });

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'update',
          entity_type: 'job_order',
          entity_id: id,
          entity_name: `Job Order - ${jobOrder?.customers?.full_name || 'Unknown'}`,
          description: `Changed job order status from ${oldStatus} to ${newStatus}`,
          old_values: { status: oldStatus },
          new_values: { status: newStatus }
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Status updated successfully');
      await loadJobOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteClick = (jobOrder: JobOrder) => {
    setSelectedJobOrder(jobOrder);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJobOrder) return;

    setDeleting(true);
    try {
      await jobOrdersApi.delete(selectedJobOrder.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'job_order',
          entity_id: selectedJobOrder.id,
          entity_name: `Job Order - ${selectedJobOrder.customers?.full_name || 'Unknown'}`,
          description: `Deleted job order for ${selectedJobOrder.customers?.full_name || 'Unknown'}`,
          old_values: selectedJobOrder
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Job order deleted successfully');
      setShowDeleteModal(false);
      setSelectedJobOrder(null);
      await loadJobOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete job order';
      toast.error(message);
      console.error('Error deleting job order:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (jobOrder: JobOrder) => {
    setSelectedJobOrderId(jobOrder.id);
    setShowDetailsModal(true);
  };

  const handleEdit = (jobOrder: JobOrder) => {
    setSelectedJobOrder(jobOrder);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadJobOrders();
    setSelectedJobOrder(null);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading job orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 md:px-6 lg:px-18">
        <section className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Job Orders</h1>
          <p className="text-muted-foreground">
            Manage customer job orders and track their status. Search and filter orders to find what you need.
          </p>
        </section>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            Add Order
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header with search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search by name, ID, or contact..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Car Brand</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Color</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Plate #</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length > 0 ? (
                filteredData.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{order.id.substring(0, 8)}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{order.customers?.full_name || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{order.customers?.contact_no || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.vehicles ? `${order.vehicles.car_brand || ''} ${order.vehicles.vehicle_model || ''}`.trim() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{order.vehicles?.color || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{order.vehicles?.plate_number || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                      ₱{(order.total_cost || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`appearance-none px-3 py-1.5 pr-8 rounded border ${
                            order.status === "Completed"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : order.status === "In Progress"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-yellow-50 border-yellow-200 text-yellow-700"
                          } text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                          title="Edit Job Order"
                        >
                          <Pencil className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order)}
                          className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                          title="Delete Job Order"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-sm text-gray-500">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredData.length} of {data.length} entries
          </div>
          <div className="text-sm font-semibold text-gray-900">
            Total Revenue: <span className="text-green-600">₱{data.filter(order => order.status !== 'Cancelled').reduce((sum, order) => sum + (order.total_cost || 0), 0).toLocaleString()}</span>
            <span className="text-xs text-gray-500 ml-2">(excluding cancelled)</span>
          </div>
        </div>

        {/* Modals */}
        <JobOrderFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <JobOrderFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          jobOrder={selectedJobOrder}
        />

        <JobOrderDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          jobOrderId={selectedJobOrderId}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Job Order"
          itemName={selectedJobOrder?.job_order_id || selectedJobOrder?.customers?.full_name}
          loading={deleting}
        />
    </div>
    </div>
  );
}

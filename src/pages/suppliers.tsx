import { useState, useEffect } from 'react';
import { Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ShoppingCart, UserPlus } from "lucide-react";
import { suppliersApi, purchaseOrdersApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { SupplierFormModal } from '@/components/modals/SupplierFormModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { PurchaseOrderModal } from '@/components/modals/PurchaseOrderModal';

type Supplier = Database['public']['Tables']['suppliers']['Row'];

export default function SuppliersTable() {
  const [data, setData] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPurchaseOrderModal, setShowPurchaseOrderModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadPurchaseOrders();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const suppliers = await suppliersApi.getAll();
      setData(suppliers);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load suppliers';
      setError(message);
      toast.error(message);
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseOrders = async () => {
    try {
      const orders = await purchaseOrdersApi.getAll();
      setPurchaseOrders(orders);
    } catch (err) {
      console.error('Error loading purchase orders:', err);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const supplier = data.find(s => s.id === id);
      const oldStatus = supplier?.status;

      await suppliersApi.update(id, { status: newStatus });

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'update',
          entity_type: 'supplier',
          entity_id: id,
          entity_name: supplier?.supplier_name || 'Unknown',
          description: `Changed supplier status from ${oldStatus} to ${newStatus}`,
          old_values: { status: oldStatus },
          new_values: { status: newStatus }
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Supplier status updated successfully');
      await loadSuppliers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
      console.error('Error updating status:', err);
    }
  };

  const handlePurchaseOrderStatusChange = async (id: string, newStatus: string) => {
    try {
      const order = purchaseOrders.find(o => o.id === id);
      const oldStatus = order?.status;

      await purchaseOrdersApi.update(id, { status: newStatus });

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'update',
          entity_type: 'purchase_order',
          entity_id: id,
          entity_name: order?.po_number || 'Unknown',
          description: `Changed purchase order status from ${oldStatus} to ${newStatus}`,
          old_values: { status: oldStatus },
          new_values: { status: newStatus }
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Purchase order status updated successfully');
      await loadPurchaseOrders();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update purchase order status';
      toast.error(message);
      console.error('Error updating purchase order status:', err);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSupplier) return;

    setDeleting(true);
    try {
      await suppliersApi.delete(selectedSupplier.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'supplier',
          entity_id: selectedSupplier.id,
          entity_name: selectedSupplier.supplier_name,
          description: `Deleted supplier: ${selectedSupplier.supplier_name}`,
          old_values: selectedSupplier
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Supplier deleted successfully');
      setShowDeleteModal(false);
      setSelectedSupplier(null);
      await loadSuppliers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete supplier';
      toast.error(message);
      console.error('Error deleting supplier:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadSuppliers();
    loadPurchaseOrders();
    setSelectedSupplier(null);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading suppliers...</div>
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
        {/* Header */}
        <section className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">
            Manage your supplier network. Track orders, contact information, and supplier status to maintain reliable partnerships.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'suppliers'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Suppliers ({data.length})
            {activeTab === 'suppliers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 text-sm font-medium transition-all relative ${
              activeTab === 'orders'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Purchase Orders ({purchaseOrders.length})
            {activeTab === 'orders' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
            )}
          </button>
        </div>

        <div className="flex justify-end gap-3 mb-6">
          <button
            onClick={() => setShowPurchaseOrderModal(true)}
            className="px-5 py-2.5 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all font-medium text-gray-900 flex items-center gap-2 shadow-sm"
          >
            <ShoppingCart className="h-4 w-4" />
            Create Purchase Order
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <UserPlus className="h-4 w-4" />
            Add Supplier
          </button>
        </div>

        {/* Suppliers Table */}
        {activeTab === 'suppliers' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Order</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentData.map((supplier, index) => (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.supplier_name}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.contact}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{supplier.address || 'N/A'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {supplier.last_order_date ? new Date(supplier.last_order_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="relative inline-block min-w-[120px]">
                          <select
                            value={supplier.status}
                            onChange={(e) => handleStatusChange(supplier.id, e.target.value)}
                            className="appearance-none w-full px-3 py-1.5 pr-8 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleEdit(supplier)}
                            className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                            title="Edit Supplier"
                          >
                            <Pencil className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(supplier)}
                            className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                            title="Delete Supplier"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 px-2">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronsRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Purchase Orders Table */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Order Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Expected Delivery</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseOrders.length > 0 ? (
                    purchaseOrders.map((order, index) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.po_number}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{order.suppliers?.supplier_name || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-green-600">
                          ₱{(order.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-4 text-sm">
                          <div className="relative inline-block min-w-[140px]">
                            <select
                              value={order.status}
                              onChange={(e) => handlePurchaseOrderStatusChange(order.id, e.target.value)}
                              className={`appearance-none w-full px-3 py-1.5 pr-8 rounded-full text-xs font-medium cursor-pointer border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                order.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200' :
                                order.status === 'Approved'
                                  ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' :
                                order.status === 'Ordered'
                                  ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' :
                                order.status === 'Received'
                                  ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' :
                                'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Approved">Approved</option>
                              <option value="Ordered">Ordered</option>
                              <option value="Received">Received</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center">
                        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No purchase orders yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Click "Create Purchase Order" to place a new order with your suppliers
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <SupplierFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <SupplierFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          supplier={selectedSupplier}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Supplier"
          itemName={selectedSupplier?.supplier_name}
          loading={deleting}
        />

        <PurchaseOrderModal
          open={showPurchaseOrderModal}
          onOpenChange={setShowPurchaseOrderModal}
          onSuccess={handleSuccess}
        />
    </div>
  )
}
import { useState, useEffect } from 'react';
import { Eye, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, FileText, Lightbulb, CheckCircle, User, MessageSquare } from "lucide-react";
import { customersApi, applicationsApi, activityLogsApi, jobOrdersApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { CustomerFormModal } from '@/components/modals/CustomerFormModal';
import { CustomerDetailsModal } from '@/components/modals/CustomerDetailsModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

type Customer = Database['public']['Tables']['customers']['Row'];
type JobOrder = Database['public']['Tables']['job_orders']['Row'];
type Application = Database['public']['Tables']['applications']['Row'] & {
  customers?: { full_name: string; email: string; contact_no: string } | null;
  vehicles?: { car_brand: string; vehicle_model: string } | null;
  mechanics?: { full_name: string } | null;
};

export default function Customers() {
  const [activeTab, setActiveTab] = useState<'customers' | 'applications'>('customers');

  // Customer states
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Application states
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationsError, setApplicationsError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [applicationsPerPage, setApplicationsPerPage] = useState(20);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Customer revenue state
  const [customerRevenue, setCustomerRevenue] = useState<Record<string, number>>({});

  // Load customers on mount
  useEffect(() => {
    loadCustomers();
    loadApplications();
    loadCustomerRevenue();
  }, []);

  const loadCustomers = async () => {
    try {
      setCustomersLoading(true);
      setCustomersError(null);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customers';
      setCustomersError(message);
      toast.error(message);
      console.error('Error loading customers:', err);
    } finally {
      setCustomersLoading(false);
    }
  };

  const loadCustomerRevenue = async () => {
    try {
      const jobOrders = await jobOrdersApi.getAll();

      // Calculate revenue per customer (excluding cancelled orders)
      const revenueMap: Record<string, number> = {};
      jobOrders.forEach((order: JobOrder) => {
        if (order.customer_id && order.status !== 'Cancelled') {
          revenueMap[order.customer_id] = (revenueMap[order.customer_id] || 0) + (order.total_cost || 0);
        }
      });

      setCustomerRevenue(revenueMap);
    } catch (err) {
      console.error('Error loading customer revenue:', err);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      setApplicationsError(null);
      const data = await applicationsApi.getAll();
      setApplications(data as Application[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load applications';
      setApplicationsError(message);
      toast.error(message);
      console.error('Error loading applications:', err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCustomer) return;

    setDeleting(true);
    try {
      await customersApi.delete(selectedCustomer.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'customer',
          entity_id: selectedCustomer.id,
          entity_name: selectedCustomer.full_name,
          description: `Deleted customer: ${selectedCustomer.full_name}`,
          old_values: selectedCustomer
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Customer deleted successfully');
      setShowDeleteModal(false);
      setSelectedCustomer(null);
      await loadCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete customer';
      toast.error(message);
      console.error('Error deleting customer:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setShowDetailsModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowEditModal(true);
  };

  const handleCreateSuccess = () => {
    loadCustomers();
  };

  const handleEditSuccess = () => {
    loadCustomers();
    setSelectedCustomer(null);
  };

  const handleSendEmail = (app: Application) => {
    const email = app.customers?.email || 'N/A';
    const name = app.customers?.full_name || app.name;
    const vehicle = app.vehicles
      ? `${app.vehicles.car_brand || ''} ${app.vehicles.vehicle_model || ''}`.trim()
      : app.vehicle || 'N/A';
    const date = app.preferred_date
      ? new Date(app.preferred_date).toLocaleDateString()
      : 'N/A';
    const time = app.preferred_time || 'N/A';

    const subject = encodeURIComponent(`Regarding Your Service Application`);
    const body = encodeURIComponent(
      `Dear ${name},\n\n` +
      `This is regarding your service application:\n\n` +
      `Preferred Date: ${date}\n` +
      `Preferred Time: ${time}\n` +
      `Vehicle: ${vehicle}\n` +
      `Problem: ${app.problem || 'N/A'}\n` +
      `Status: ${app.status}\n\n` +
      `Best regards,\n` +
      `Fonzo Calibration Team`
    );

    if (email && email !== 'N/A') {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      toast.error('No email address available for this customer');
    }
  };

  const filteredApplications = statusFilter
    ? applications.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase())
    : applications;

  const totalApplications = applications.length;
  const pendingCount = applications.filter(a => a.status === 'Pending').length;
  const approvedCount = applications.filter(a => a.status === 'Approved').length;
  const reviewCount = applications.filter(a => a.status === 'Under Review').length;

  if (customersLoading && applicationsLoading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (customersError && applicationsError) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-red-600">Error loading data</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 md:px-6 lg:px-18">
        <section className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and review repair service applications.
          </p>
        </section>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'customers'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Customer List
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'applications'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Applications / Requests
          </button>
        </div>

        {/* CUSTOMER LIST TAB */}
        {activeTab === 'customers' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
              >
                CREATE
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Jobs</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Revenue</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Visit</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.map((customer, index) => (
                      <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.full_name}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.contact_no}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.email || 'N/A'}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{customer.total_jobs}</td>
                        <td className="px-4 py-4 text-sm font-semibold text-green-600">
                          ₱{(customerRevenue[customer.id] || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleView(customer)}
                              className="p-2 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleEdit(customer)}
                              className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                              title="Edit Customer"
                            >
                              <Pencil className="h-4 w-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(customer)}
                              className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                              title="Delete Customer"
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

              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
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
                </select>
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
                  <span className="text-sm text-gray-700 px-2">{currentPage} of {totalPages}</span>
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
          </>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <>
            <div className="flex justify-end mb-4">
              <button className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium">
                Repair Requests
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Applications</p>
                    <h2 className="text-3xl font-bold text-gray-900">{totalApplications}</h2>
                  </div>
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <h2 className="text-3xl font-bold text-gray-900">{pendingCount}</h2>
                  </div>
                  <Lightbulb className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Approved</p>
                    <h2 className="text-3xl font-bold text-gray-900">{approvedCount}</h2>
                  </div>
                  <CheckCircle className="h-6 w-6 text-gray-400" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Under Review</p>
                    <h2 className="text-3xl font-bold text-gray-900">{reviewCount}</h2>
                  </div>
                  <User className="h-6 w-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Status</label>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="">All Status</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Per Page</label>
                  <div className="relative">
                    <select
                      value={applicationsPerPage}
                      onChange={(e) => setApplicationsPerPage(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Submitted After</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Submitted Before</label>
                  <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button
                onClick={loadApplications}
                className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
              >
                Refresh
              </button>
            </div>

            {/* Application Cards */}
            <div className="space-y-4">
              {filteredApplications.length > 0 ? (
                filteredApplications.slice(0, applicationsPerPage).map((app) => (
                  <div key={app.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {app.customers?.full_name || app.name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === 'Approved'
                            ? 'bg-green-600 text-white'
                            : app.status === 'Pending'
                            ? 'bg-yellow-600 text-white'
                            : app.status === 'Under Review'
                            ? 'bg-blue-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm">
                          View
                        </button>
                        <button
                          onClick={() => handleSendEmail(app)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                        <p className="text-sm text-gray-900">
                          {app.vehicles
                            ? `${app.vehicles.car_brand || ''} ${app.vehicles.vehicle_model || ''}`.trim()
                            : app.vehicle || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                        <p className="text-sm text-gray-900">
                          {app.preferred_date ? new Date(app.preferred_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Contact</p>
                        <p className="text-sm text-gray-900">{app.customers?.contact_no || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Problem</p>
                        <p className="text-sm text-gray-900">{app.problem || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mechanic</p>
                        <p className="text-sm text-gray-900">{app.mechanics?.full_name || app.assigned_mechanic || 'Not assigned'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">No applications found.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modals */}
        <CustomerFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleCreateSuccess}
        />

        <CustomerFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleEditSuccess}
          customer={selectedCustomer}
        />

        <CustomerDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          customerId={selectedCustomerId}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Customer"
          itemName={selectedCustomer?.full_name}
          loading={deleting}
        />
    </div>
  );
}

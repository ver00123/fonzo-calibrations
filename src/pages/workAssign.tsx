import { useState, useEffect } from 'react';
import { Eye, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil } from "lucide-react";
import { workAssignmentsApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { WorkAssignmentFormModal } from '@/components/modals/WorkAssignmentFormModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

type WorkAssignment = Database['public']['Tables']['work_assignments']['Row'] & {
  job_orders?: {
    id: string;
    service_description: string;
    vehicles?: { car_brand: string; vehicle_model: string } | null;
  } | null;
  mechanics?: { full_name: string } | null;
};

export default function WorkAssignment() {
  const [data, setData] = useState<WorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<WorkAssignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadWorkAssignments();
  }, []);

  const loadWorkAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const assignments = await workAssignmentsApi.getAll();
      setData(assignments as WorkAssignment[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load work assignments';
      setError(message);
      toast.error(message);
      console.error('Error loading work assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleEdit = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadWorkAssignments();
    setSelectedAssignment(null);
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const assignment = data.find(a => a.id === id);
      const oldStatus = assignment?.status;

      await workAssignmentsApi.update(id, { status: newStatus });

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'update',
          entity_type: 'work_assignment',
          entity_id: id,
          entity_name: `Work Assignment - ${assignment?.mechanics?.full_name || 'Unassigned'}`,
          description: `Changed work assignment status from ${oldStatus} to ${newStatus}`,
          old_values: { status: oldStatus },
          new_values: { status: newStatus }
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Status updated successfully');
      await loadWorkAssignments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
      console.error('Error updating status:', err);
    }
  };

  const handleDeleteClick = (assignment: WorkAssignment) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAssignment) return;

    setDeleting(true);
    try {
      await workAssignmentsApi.delete(selectedAssignment.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'work_assignment',
          entity_id: selectedAssignment.id,
          entity_name: `Work Assignment - ${selectedAssignment.mechanics?.full_name || 'Unassigned'}`,
          description: `Deleted work assignment for ${selectedAssignment.mechanics?.full_name || 'Unassigned'}`,
          old_values: selectedAssignment
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Work assignment deleted successfully');
      setShowDeleteModal(false);
      setSelectedAssignment(null);
      await loadWorkAssignments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete work assignment';
      toast.error(message);
      console.error('Error deleting work assignment:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading work assignments...</div>
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
          <h1 className="text-3xl font-bold">Work Assignment</h1>
          <p className="text-muted-foreground">
            Assign and track work orders for your mechanic team. Monitor deadlines, status updates, and job progress.
          </p>
        </section>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            ASSIGN JOB
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Work ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Assigned Mechanic</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deadline</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{item.id.substring(0, 8)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.job_orders?.vehicles
                          ? `${item.job_orders.vehicles.car_brand || ''} ${item.job_orders.vehicles.vehicle_model || ''}`.trim()
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.mechanics?.full_name || 'Unassigned'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {item.deadline ? new Date(item.deadline).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        <div className="relative inline-block min-w-[140px]">
                          <select
                            value={item.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(item.id, e.target.value);
                            }}
                            className="appearance-none w-full px-3 py-1.5 pr-8 rounded border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            <option value="Diagnosing">Diagnosing</option>
                            <option value="In Progress">In Progress</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 rounded bg-blue-100 hover:bg-blue-200 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                            title="Edit Assignment"
                          >
                            <Pencil className="h-4 w-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                      No work assignments found.
                    </td>
                  </tr>
                )}
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

        {/* Modals */}
        <WorkAssignmentFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <WorkAssignmentFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          workAssignment={selectedAssignment}
        />

        {/* View Modal */}
        {showViewModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Work Assignment Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                {/* Assignment ID */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Assignment Information</span>
                  </div>

                  <div className="pl-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment ID
                      </label>
                      <p className="text-base text-gray-900 font-mono">
                        {selectedAssignment.id.substring(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Order Details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Job Order</span>
                  </div>

                  <div className="pl-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle
                      </label>
                      <p className="text-base text-gray-900">
                        {selectedAssignment.job_orders?.vehicles
                          ? `${selectedAssignment.job_orders.vehicles.car_brand || ''} ${selectedAssignment.job_orders.vehicles.vehicle_model || ''}`.trim()
                          : 'No vehicle information'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mechanic Details */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Assigned Mechanic</span>
                  </div>

                  <div className="pl-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mechanic Name
                      </label>
                      <p className="text-base text-gray-900 font-medium">
                        {selectedAssignment.mechanics?.full_name || 'Not assigned'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Schedule</span>
                  </div>

                  <div className="pl-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Created Date
                        </label>
                        <p className="text-base text-gray-900">
                          {selectedAssignment.created_at
                            ? new Date(selectedAssignment.created_at).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'N/A'}
                        </p>
                      </div>

                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deadline
                        </label>
                        <p className="text-base text-gray-900">
                          {selectedAssignment.deadline
                            ? new Date(selectedAssignment.deadline).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'No deadline set'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          selectedAssignment.status === 'Completed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : selectedAssignment.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : selectedAssignment.status === 'Diagnosing'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : selectedAssignment.status === 'On Hold'
                            ? 'bg-orange-100 text-orange-800 border border-orange-200'
                            : selectedAssignment.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {selectedAssignment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issues & Notes */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Issues & Notes</span>
                  </div>

                  <div className="pl-6 space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Issues Encountered
                      </label>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedAssignment.issue_encountered || 'No issues reported.'}
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Problem Notes
                      </label>
                      <p className="text-base text-gray-900 whitespace-pre-wrap">
                        {selectedAssignment.problem_notes || 'No additional notes.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setShowEditModal(true);
                    }}
                    className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                  >
                    Edit Assignment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Work Assignment"
          description="Are you sure you want to delete this work assignment? All associated data will be permanently removed."
          loading={deleting}
        />
    </div>
  );
}
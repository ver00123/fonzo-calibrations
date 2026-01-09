import { useState, useEffect } from 'react';
import {  Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { mechanicsApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { MechanicFormModal } from '@/components/modals/MechanicFormModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { MechanicPerformanceModal } from '@/components/modals/MechanicPerformanceModal';

type Mechanic = Database['public']['Tables']['mechanics']['Row'];

export default function MechanicsTable() {
  const [data, setData] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadMechanics();
  }, []);

  const loadMechanics = async () => {
    try {
      setLoading(true);
      setError(null);
      const mechanics = await mechanicsApi.getAll();
      setData(mechanics);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mechanics';
      setError(message);
      toast.error(message);
      console.error('Error loading mechanics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const handleDeleteClick = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMechanic) return;

    setDeleting(true);
    try {
      await mechanicsApi.delete(selectedMechanic.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'mechanic',
          entity_id: selectedMechanic.id,
          entity_name: selectedMechanic.full_name,
          description: `Deleted mechanic: ${selectedMechanic.full_name}`,
          old_values: selectedMechanic
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Mechanic deleted successfully');
      setShowDeleteModal(false);
      setSelectedMechanic(null);
      await loadMechanics();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete mechanic';
      toast.error(message);
      console.error('Error deleting mechanic:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (mechanic: Mechanic) => {
    setSelectedMechanic(mechanic);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadMechanics();
    setSelectedMechanic(null);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading mechanics...</div>
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
          <h1 className="text-3xl font-bold">Mechanics</h1>
          <p className="text-muted-foreground">
            Manage your mechanic team. View performance metrics, job assignments, and efficiency ratings.
          </p>
        </section>

        <div className="flex justify-end gap-3 mb-4">
          <button 
            onClick={() => setShowPerformanceModal(true)}
            className="px-6 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-gray-900"
          >
            VIEW PERFORMANCE
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium"
          >
            CREATE
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jobs Completed</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Current Jobs</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Efficiency</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((mechanic, index) => (
                  <tr key={mechanic.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.mechanic_id}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.full_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.role}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.jobs_completed}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.current_jobs}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{mechanic.efficiency_rating}%</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(mechanic)}
                          className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                          title="Edit Mechanic"
                        >
                          <Pencil className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(mechanic)}
                          className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                          title="Delete Mechanic"
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

        {/* Modals */}
        <MechanicPerformanceModal
          open={showPerformanceModal}
          onOpenChange={setShowPerformanceModal}
          data={data}
        />

        <MechanicFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <MechanicFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          mechanic={selectedMechanic}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Mechanic"
          itemName={selectedMechanic?.full_name}
          loading={deleting}
        />
    </div>
  );
}
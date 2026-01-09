import { useState, useEffect } from 'react';
import { Pencil, Trash2, Mail } from "lucide-react";
import { appointmentsApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { AppointmentFormModal } from '@/components/modals/AppointmentFormModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  customers?: { full_name: string; email: string; contact_no: string } | null;
  vehicles?: { car_brand: string; vehicle_model: string } | null;
};

export default function AppointmentScheduling() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsApi.getAll();
      setAppointments(data as Appointment[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load appointments';
      setError(message);
      toast.error(message);
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppointment) return;

    setDeleting(true);
    try {
      await appointmentsApi.delete(selectedAppointment.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'appointment',
          entity_id: selectedAppointment.id,
          entity_name: selectedAppointment.customers?.full_name || selectedAppointment.name,
          description: `Deleted appointment for ${selectedAppointment.customers?.full_name || selectedAppointment.name}`,
          old_values: selectedAppointment
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Appointment deleted successfully');
      setShowDeleteModal(false);
      setSelectedAppointment(null);
      await loadAppointments();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(message);
      console.error('Error deleting appointment:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadAppointments();
    setSelectedAppointment(null);
  };

  const handleSendEmail = (appointment: Appointment) => {
    const email = appointment.customers?.email || appointment.email;
    const name = appointment.customers?.full_name || appointment.name;
    const vehicle = appointment.vehicles
      ? `${appointment.vehicles.car_brand || ''} ${appointment.vehicles.vehicle_model || ''}`.trim()
      : appointment.vehicle || 'N/A';
    const date = appointment.appointment_date
      ? new Date(appointment.appointment_date).toLocaleDateString()
      : 'N/A';
    const time = appointment.appointment_time || 'N/A';

    const subject = encodeURIComponent(`Regarding Your Appointment - ${date}`);
    const body = encodeURIComponent(
      `Dear ${name},\n\n` +
      `This is regarding your appointment scheduled for:\n\n` +
      `Date: ${date}\n` +
      `Time: ${time}\n` +
      `Vehicle: ${vehicle}\n` +
      `Status: ${appointment.status}\n\n` +
      `Best regards,\n` +
      `Fonzo Calibration Team`
    );

    if (email) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      toast.error('No email address available for this customer');
    }
  };

  const filteredAppointments = statusFilter === 'All'
    ? appointments
    : statusFilter === 'Upcoming'
    ? appointments.filter(a => a.status === 'Scheduled')
    : statusFilter === 'Past'
    ? appointments.filter(a => ['Completed', 'Cancelled'].includes(a.status))
    : statusFilter === 'Pending'
    ? appointments.filter(a => a.status === 'Confirmed')
    : appointments;

  const getStatusCount = (filter: string) => {
    if (filter === 'All') return appointments.length;
    if (filter === 'Upcoming') return appointments.filter(a => a.status === 'Scheduled').length;
    if (filter === 'Past') return appointments.filter(a => ['Completed', 'Cancelled'].includes(a.status)).length;
    if (filter === 'Pending') return appointments.filter(a => a.status === 'Confirmed').length;
    return 0;
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading appointments...</div>
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
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Schedule and manage customer appointments. View upcoming, past, and pending appointments all in one place.
          </p>
        </section>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setStatusFilter('Upcoming')}
            className={`px-4 py-2 border rounded-md transition-colors text-sm ${
              statusFilter === 'Upcoming'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Upcoming (Scheduled) <span className="ml-2 text-gray-500">{getStatusCount('Upcoming')}</span>
          </button>
          <button
            onClick={() => setStatusFilter('Past')}
            className={`px-4 py-2 border rounded-md transition-colors text-sm ${
              statusFilter === 'Past'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Past (Canceled/Complete) <span className="ml-2 text-gray-500">{getStatusCount('Past')}</span>
          </button>
          <button
            onClick={() => setStatusFilter('Pending')}
            className={`px-4 py-2 border rounded-md transition-colors text-sm ${
              statusFilter === 'Pending'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            Pending (Confirmed) <span className="ml-2 text-gray-500">{getStatusCount('Pending')}</span>
          </button>
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-4 py-2 border rounded-md transition-colors text-sm ${
              statusFilter === 'All'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
          >
            All <span className="ml-2 text-gray-500">{getStatusCount('All')}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium ml-auto"
          >
            Add
          </button>
        </div>

        {/* Appointment Cards */}
        <div className="space-y-4">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.customers?.full_name || appointment.name}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.customers?.email || appointment.email}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'Completed'
                      ? 'bg-green-600 text-white'
                      : appointment.status === 'Scheduled'
                      ? 'bg-blue-600 text-white'
                      : appointment.status === 'Confirmed'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date and Time</p>
                    <p className="text-sm text-gray-900">
                      {appointment.appointment_date
                        ? `${new Date(appointment.appointment_date).toLocaleDateString()} ${appointment.appointment_time || ''}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Vehicle</p>
                    <p className="text-sm text-gray-900">
                      {appointment.vehicles
                        ? `${appointment.vehicles.car_brand || ''} ${appointment.vehicles.vehicle_model || ''}`.trim()
                        : appointment.vehicle || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Badge</p>
                    <p className="text-sm text-gray-900">{appointment.badge || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleSendEmail(appointment)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    Message
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(appointment)}
                      className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors"
                      title="Edit Appointment"
                    >
                      <Pencil className="h-4 w-4 text-green-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(appointment)}
                      className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                      title="Delete Appointment"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No appointments found.</p>
            </div>
          )}
        </div>

        {/* Modals */}
        <AppointmentFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <AppointmentFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          appointment={selectedAppointment}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Appointment"
          itemName={selectedAppointment?.customers?.full_name || selectedAppointment?.name}
          loading={deleting}
        />
    </div>
  );
}

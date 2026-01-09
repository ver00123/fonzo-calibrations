import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { customersApi, vehiclesApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { Car, Mail, Phone, MapPin, FileText, Calendar } from 'lucide-react';

type Customer = Database['public']['Tables']['customers']['Row'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];

interface CustomerDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

export function CustomerDetailsModal({ open, onOpenChange, customerId }: CustomerDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    if (open && customerId) {
      loadCustomerDetails();
    }
  }, [open, customerId]);

  const loadCustomerDetails = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      const [customerData, vehiclesData] = await Promise.all([
        customersApi.getById(customerId),
        vehiclesApi.getByCustomerId(customerId),
      ]);
      setCustomer(customerData);
      setVehicles(vehiclesData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load customer details';
      toast.error(message);
      console.error('Error loading customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Customer Details" onClose={() => onOpenChange(false)}>
        {loading ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">Loading customer details...</div>
            </div>
          </DialogBody>
        ) : !customer ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">Failed to load customer details</div>
            </div>
          </DialogBody>
        ) : (
          <>
            <DialogBody className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      {customer.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{customer.full_name}</div>
                      <div className="text-sm text-gray-500">Customer ID: {customer.id.slice(0, 8)}</div>
                    </div>
                  </div>

                  {customer.contact_no && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.contact_no}</span>
                    </div>
                  )}

                  {customer.email && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{customer.email}</span>
                    </div>
                  )}

                  {customer.address && (
                    <div className="flex items-center gap-3 text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{customer.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>
                      Last Visit: {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>Total Jobs: {customer.total_jobs}</span>
                  </div>

                  {customer.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm font-medium text-gray-700 mb-1">Notes:</div>
                      <div className="text-sm text-gray-600">{customer.notes}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicles ({vehicles.length})
                </h3>
                {vehicles.length > 0 ? (
                  <div className="space-y-3">
                    {vehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {vehicle.car_brand} {vehicle.vehicle_model}
                              {vehicle.is_primary && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              Plate: {vehicle.plate_number}
                              {vehicle.year && ` • Year: ${vehicle.year}`}
                              {vehicle.color && ` • Color: ${vehicle.color}`}
                            </div>
                            {vehicle.vin && (
                              <div className="text-xs text-gray-500 mt-1">VIN: {vehicle.vin}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                    No vehicles registered yet
                  </div>
                )}
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

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { inventoryApi } from '@/services/api.service';
import toast from 'react-hot-toast';
import { Package, Tag, DollarSign, MapPin, FileText, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';

interface InventoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string | null;
}

export function InventoryDetailsModal({ open, onOpenChange, itemId }: InventoryDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    if (open && itemId) {
      loadItemDetails();
    }
  }, [open, itemId]);

  const loadItemDetails = async () => {
    if (!itemId) return;

    try {
      setLoading(true);
      const data = await inventoryApi.getById(itemId);
      setItem(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load item details';
      toast.error(message);
      console.error('Error loading item details:', err);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = item ? item.quantity <= item.minimum_stock : false;
  const stockPercentage = item ? (item.quantity / (item.minimum_stock * 2)) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Inventory Item Details" onClose={() => onOpenChange(false)}>
        {loading ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-600">Loading item details...</div>
            </div>
          </DialogBody>
        ) : !item ? (
          <DialogBody>
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">Failed to load item details</div>
            </div>
          </DialogBody>
        ) : (
          <>
            <DialogBody className="space-y-6">
          {/* Item Header */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{item.parts_name}</h3>
                <div className="text-sm text-gray-500 mt-1">ID: {item.id.slice(0, 8)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'Active'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'Inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Status Alert */}
          {isLowStock && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-orange-900">Low Stock Alert</div>
                <div className="text-sm text-orange-700 mt-1">
                  Current stock ({item.quantity} {item.unit}) is at or below the minimum stock level ({item.minimum_stock} {item.unit})
                </div>
              </div>
            </div>
          )}

          {/* Stock Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Stock Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Current Quantity</div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.quantity} <span className="text-base font-normal text-gray-600">{item.unit}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Minimum Stock</div>
                <div className="text-2xl font-bold text-gray-900">
                  {item.minimum_stock} <span className="text-base font-normal text-gray-600">{item.unit}</span>
                </div>
              </div>
            </div>

            {/* Stock Level Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Stock Level</span>
                <span className={isLowStock ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
                  {isLowStock ? 'Low' : 'Good'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isLowStock ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-3">
            {item.categories && (
              <div className="flex items-center gap-3 text-gray-700">
                <Tag className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Category: </span>
                  <span className="font-medium">{item.categories.name}</span>
                </div>
              </div>
            )}

            {item.suppliers && (
              <div className="flex items-center gap-3 text-gray-700">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Supplier: </span>
                  <span className="font-medium">{item.suppliers.supplier_name}</span>
                </div>
              </div>
            )}

            {item.unit_price !== null && (
              <div className="flex items-center gap-3 text-gray-700">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Unit Price: </span>
                  <span className="font-medium">${item.unit_price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    (Total Value: ${(item.unit_price * item.quantity).toFixed(2)})
                  </span>
                </div>
              </div>
            )}

            {item.location && (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm text-gray-600">Location: </span>
                  <span className="font-medium">{item.location}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-600">Created: </span>
                <span className="font-medium">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-sm text-gray-600">Last Updated: </span>
                <span className="font-medium">{new Date(item.updated_at).toLocaleDateString()}</span>
              </div>
            </div>

            {item.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <FileText className="h-4 w-4 text-gray-400" />
                  Notes:
                </div>
                <div className="text-sm text-gray-600 ml-6">{item.notes}</div>
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

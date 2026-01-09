import { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Calendar, FileText, ShoppingCart, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { purchaseOrdersApi, suppliersApi, inventoryApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

interface PurchaseOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface OrderItem {
  inventory_item_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
}

export function PurchaseOrderModal({ open, onOpenChange, onSuccess }: PurchaseOrderModalProps) {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [currentItem, setCurrentItem] = useState({
    inventory_item_id: '',
    quantity: 1,
    unit_price: 0,
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    try {
      const [suppliersData, inventoryData] = await Promise.all([
        suppliersApi.getAll(),
        inventoryApi.getAll(),
      ]);
      setSuppliers(suppliersData.filter(s => s.status === 'Active'));
      setInventoryItems(inventoryData);
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load data');
    }
  };

  const generatePONumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PO-${year}${month}-${random}`;
  };

  const handleAddItem = () => {
    if (!formData.supplier_id || !formData.order_date) {
      return;
    }

    if (!currentItem.inventory_item_id || currentItem.quantity <= 0 || currentItem.unit_price <= 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const selectedItem = inventoryItems.find(item => item.id === currentItem.inventory_item_id);
    if (!selectedItem) return;

    const newItem: OrderItem = {
      inventory_item_id: currentItem.inventory_item_id,
      item_name: selectedItem.parts_name,
      quantity: currentItem.quantity,
      unit_price: currentItem.unit_price,
    };

    setOrderItems([...orderItems, newItem]);
    setCurrentItem({
      inventory_item_id: '',
      quantity: 1,
      unit_price: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier_id) {
      toast.error('Please select a supplier');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      const poNumber = generatePONumber();
      const selectedSupplier = suppliers.find(s => s.id === formData.supplier_id);

      await purchaseOrdersApi.create({
        po_number: poNumber,
        supplier_id: formData.supplier_id,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        total_amount: totalAmount,
        notes: formData.notes || null,
        status: 'Pending',
      });

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'create',
          entity_type: 'purchase_order',
          entity_id: poNumber,
          entity_name: poNumber,
          description: `Created purchase order ${poNumber} for supplier: ${selectedSupplier?.supplier_name || 'Unknown'}`,
          new_values: {
            po_number: poNumber,
            supplier: selectedSupplier?.supplier_name,
            total_amount: totalAmount,
            items_count: orderItems.length
          }
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Purchase order created successfully');
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating purchase order:', err);
      toast.error('Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      supplier_id: '',
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
    });
    setOrderItems([]);
    setCurrentItem({
      inventory_item_id: '',
      quantity: 1,
      unit_price: 0,
    });
    onOpenChange(false);
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-gray-700" />
            Create Purchase Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Creating a New Purchase Order</p>
              <p className="text-blue-700">Select a supplier, add items from inventory, and submit for approval. The order will start in "Pending" status.</p>
            </div>
          </div>

          {/* Section 1: Supplier & Order Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Order Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </select>
                {suppliers.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">No active suppliers available</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Order Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Expected Delivery
                </label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                  min={formData.order_date}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                <span className="text-sm text-gray-500">({orderItems.length} items)</span>
              </div>
            </div>

            {/* Add Item Form */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inventory Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={currentItem.inventory_item_id}
                    onChange={(e) => {
                      const item = inventoryItems.find(i => i.id === e.target.value);
                      setCurrentItem({
                        ...currentItem,
                        inventory_item_id: e.target.value,
                        unit_price: item?.unit_price || 0,
                      });
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all"
                  >
                    <option value="">Select an item</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.parts_name} - ₱{item.unit_price?.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={currentItem.quantity === 0 ? '' : currentItem.quantity}
                    onChange={(e) => {
                        const val = e.target.value;
                        setCurrentItem({ 
                          ...currentItem, 
                          quantity: val === '' ? 0 : parseInt(val) 
                        });
                      }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="1"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.unit_price === 0 ? '' : currentItem.unit_price}
                    onChange={(e) => {
                        const val = e.target.value;
                        setCurrentItem({ 
                          ...currentItem, 
                          unit_price: val === '' ? 0 : parseFloat(val) 
                        });
                      }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!formData.supplier_id || !formData.order_date}
                    className={`w-full px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium shadow-sm 
                        ${(!formData.supplier_id || !formData.order_date) 
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                          : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md cursor-pointer'
                        }`}
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items List */}
            {orderItems.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Item Name</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Unit Price</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Subtotal</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Remove</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orderItems.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.item_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-center">
                            <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-gray-100 rounded-md">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right">₱{item.unit_price.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ₱{(item.quantity * item.unit_price).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-2 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-green-200">
                      <tr>
                        <td colSpan={3} className="px-4 py-4 text-right">
                          <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-xl font-bold text-green-700">
                            ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No items added yet</p>
                <p className="text-sm text-gray-500 mt-1">Select an item from inventory and click "Add" to build your purchase order</p>
              </div>
            )}
          </div>

          {/* Section 3: Additional Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes or Special Instructions
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Add delivery instructions, payment terms, or other relevant information..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-gray-700 hover:border-gray-400 cursor-pointer"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
              disabled={loading || orderItems.length === 0}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Create Purchase Order
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { Settings, ShoppingCart, Clock, Home, Filter, Plus, Eye, Pencil, Trash2, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { inventoryApi, categoriesApi, activityLogsApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';
import toast from 'react-hot-toast';
import { InventoryFormModal } from '@/components/modals/InventoryFormModal';
import { InventoryDetailsModal } from '@/components/modals/InventoryDetailsModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'] & {
  categories?: { name: string } | null;
  suppliers?: { supplier_name: string } | null;
};
type Category = Database['public']['Tables']['categories']['Row'];

export default function InventorySupplies() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadInventory();
    loadCategories();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await inventoryApi.getAll();
      setData(items as InventoryItem[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load inventory';
      setError(message);
      toast.error(message);
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await categoriesApi.getAll();
      setCategories(cats as Category[]);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  const filteredData = selectedCategory === "All Categories"
    ? data
    : data.filter(item => item.categories?.name === selectedCategory);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setDeleting(true);
    try {
      await inventoryApi.delete(selectedItem.id);

      // Log activity
      try {
        await activityLogsApi.log({
          action: 'delete',
          entity_type: 'inventory',
          entity_id: selectedItem.id,
          entity_name: selectedItem.parts_name,
          description: `Deleted inventory item: ${selectedItem.parts_name}`,
          old_values: selectedItem
        });
      } catch (logErr) {
        console.error('Failed to log activity:', logErr);
      }

      toast.success('Item deleted successfully');
      setShowDeleteModal(false);
      setSelectedItem(null);
      await loadInventory();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(message);
      console.error('Error deleting item:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setShowCategoryDropdown(false);
  };

  const handleView = (item: InventoryItem) => {
    setSelectedItemId(item.id);
    setShowDetailsModal(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleSuccess = () => {
    loadInventory();
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading inventory...</div>
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
          <h1 className="text-3xl font-bold">Inventory & Supplies</h1>
          <p className="text-muted-foreground">
            Track and manage your auto parts inventory. Monitor stock levels, suppliers, and categories to ensure availability.
          </p>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Parts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Parts</p>
                <h2 className="text-3xl font-bold text-gray-900">{data.length}</h2>
              </div>
              <div className="flex gap-1">
                <Settings className="h-6 w-6 text-gray-400" />
                <Settings className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Total Inventory Value */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Inventory Value</p>
                <h2 className="text-3xl font-bold text-green-600">
                  ₱{data.reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0).toLocaleString()}
                </h2>
              </div>
              <ShoppingCart className="h-6 w-6 text-green-500" />
            </div>
          </div>

          {/* Low Stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Low Stock</p>
                <h2 className="text-3xl font-bold text-orange-600">
                  {data.filter(item => item.quantity <= item.minimum_stock).length}
                </h2>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </div>

          {/* Total Quantity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Quantity Available</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  {data.reduce((sum, item) => sum + item.quantity, 0)}
                </h2>
              </div>
              <Home className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Filter and Add Button */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="relative inline-block">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">{selectedCategory}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => handleCategorySelect("All Categories")}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      selectedCategory === "All Categories" ? 'bg-gray-50 font-medium' : ''
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedCategory === category.name ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parts Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Value</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Minimum Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Supplier</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">{startIndex + index + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.parts_name}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      ₱{(item.unit_price || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-blue-600">
                      ₱{((item.unit_price || 0) * item.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.minimum_stock} stock</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.categories?.name || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.suppliers?.supplier_name || 'N/A'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{item.status}</td>
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
                          title="Edit Item"
                        >
                          <Pencil className="h-4 w-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors"
                          title="Delete Item"
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
                {currentPage} of {totalPages || 1}
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
        <InventoryFormModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={handleSuccess}
        />

        <InventoryFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSuccess={handleSuccess}
          item={selectedItem}
        />

        <InventoryDetailsModal
          open={showDetailsModal}
          onOpenChange={setShowDetailsModal}
          itemId={selectedItemId}
        />

        <DeleteConfirmationModal
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={handleDeleteConfirm}
          title="Delete Inventory Item"
          itemName={selectedItem?.parts_name}
          loading={deleting}
        />
    </div>
  );
}

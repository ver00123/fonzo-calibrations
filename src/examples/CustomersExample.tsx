import { useState, useEffect } from 'react';
import { customersApi } from '@/services/api.service';
import type { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];

/**
 * Example component showing how to integrate the API
 * Replace the hardcoded data in your pages with this pattern
 */
export default function CustomersExample() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers on component mount
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersApi.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customersApi.delete(id);
      // Refresh the list after deletion
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      console.error('Error deleting customer:', err);
    }
  };

  const handleCreate = async () => {
    try {
      await customersApi.create({
        full_name: 'New Customer',
        contact_no: '09123456789',
        email: 'newcustomer@example.com',
      });
      // Refresh the list
      await loadCustomers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      console.error('Error creating customer:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <section className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">Customers (API Example)</h1>
          <p className="text-muted-foreground">
            This example shows how to fetch and display data from the database
          </p>
        </section>

        <div className="flex justify-end mb-4">
          <button
            onClick={handleCreate}
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Full Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Contact No.
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Total Jobs
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Last Visit
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer, index) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.full_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.contact_no}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.email || 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.total_jobs}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {customer.last_visit
                        ? new Date(customer.last_visit).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2 justify-center">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No customers found. Click CREATE to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * HOW TO INTEGRATE INTO YOUR EXISTING PAGES:
 *
 * 1. Replace hardcoded data with API calls:
 *    const [data, setData] = useState<Customer[]>([]);
 *
 * 2. Add useEffect to fetch data:
 *    useEffect(() => {
 *      loadData();
 *    }, []);
 *
 * 3. Create load function:
 *    const loadData = async () => {
 *      try {
 *        setLoading(true);
 *        const data = await customersApi.getAll();
 *        setData(data);
 *      } catch (err) {
 *        console.error(err);
 *      } finally {
 *        setLoading(false);
 *      }
 *    };
 *
 * 4. Update handlers to call API:
 *    const handleDelete = async (id: string) => {
 *      await customersApi.delete(id);
 *      await loadData(); // Refresh
 *    };
 *
 * 5. Add loading and error states:
 *    if (loading) return <div>Loading...</div>;
 *    if (error) return <div>Error: {error}</div>;
 */

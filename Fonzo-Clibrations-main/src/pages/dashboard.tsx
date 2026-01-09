import { useState, useEffect } from "react";
import { useAuthChecker } from "@/hooks/useAuthChecker";
import { ChartAreaInteractive } from "../components/charts/areaChart";
import { ChartBarInteractive } from "../components/charts/barChart";
import { jobOrdersApi, customersApi, appointmentsApi, inventoryApi, mechanicsApi } from "@/services/api.service";
import { Users, Wrench, Package, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { isAuthenticated } = useAuthChecker();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalJobOrders: 0,
    pendingJobs: 0,
    completedJobs: 0,
    inProgressJobs: 0,
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    activeMechanics: 0,
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [customers, jobOrders, appointments, inventory, mechanics] = await Promise.all([
        customersApi.getAll(),
        jobOrdersApi.getAll(),
        appointmentsApi.getAll(),
        inventoryApi.getAll(),
        mechanicsApi.getAll(),
      ]);

      // Calculate statistics
      const pendingJobs = jobOrders.filter((jo) => jo.status === 'Pending').length;
      const inProgressJobs = jobOrders.filter((jo) => jo.status === 'In Progress').length;
      const completedJobs = jobOrders.filter((jo) => jo.status === 'Completed').length;
      const upcomingAppointments = appointments.filter((apt) => apt.status === 'Scheduled').length;
      const totalRevenue = jobOrders.filter((jo) => jo.status !== 'Cancelled').reduce((sum: number, jo) => sum + (jo.total_cost || 0), 0);
      const lowStockItems = inventory.filter((item) => item.quantity <= item.minimum_stock).length;
      const activeMechanics = mechanics.filter((m) => m.is_active).length;

      setStats({
        totalCustomers: customers.length,
        totalJobOrders: jobOrders.length,
        pendingJobs,
        completedJobs,
        inProgressJobs,
        totalAppointments: appointments.length,
        upcomingAppointments,
        totalRevenue,
        lowStockItems,
        activeMechanics,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 md:px-6 lg:px-18">
        <div className="py-2 mb-6">
          <h1 className="text-3xl font-bold">Welcome to the Dashboard!</h1>
          <p className="text-muted-foreground">
            Overview of your auto repair shop's performance and key metrics.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Customers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</h2>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          {/* Total Job Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Job Orders</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.totalJobOrders}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.inProgressJobs} in progress
                </p>
              </div>
              <Wrench className="h-8 w-8 text-green-500" />
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Appointments</p>
                <h2 className="text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.totalAppointments} total
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  ₱{stats.totalRevenue.toLocaleString()}
                </h2>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Job Status Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-medium text-yellow-600">{stats.pendingJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">In Progress</span>
                <span className="text-sm font-medium text-blue-600">{stats.inProgressJobs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Completed</span>
                <span className="text-sm font-medium text-green-600">{stats.completedJobs}</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Inventory Alert</h3>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
              <p className="text-xs text-gray-500 mt-1">Items below minimum stock</p>
            </div>
          </div>

          {/* Active Mechanics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Active Mechanics</h3>
              <Package className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeMechanics}</p>
              <p className="text-xs text-gray-500 mt-1">Currently working</p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 py-2">
          <ChartAreaInteractive />
          <ChartBarInteractive />
        </div>
    </div>
  );
}

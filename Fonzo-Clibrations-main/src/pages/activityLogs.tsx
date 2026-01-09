import { useState, useEffect, useCallback } from 'react';
import { Activity, Filter, Search, ChevronLeft, ChevronRight, User, Calendar, Tag } from 'lucide-react';
import { activityLogsApi } from '@/services/api.service';
import { useAuthChecker } from '@/hooks/useAuthChecker';
import toast from 'react-hot-toast';

type ActivityLog = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  action: 'create' | 'update' | 'delete' | 'view';
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  created_at: string;
};

export default function ActivityLogs() {
  const { isAuthenticated } = useAuthChecker();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterEntityType, setFilterEntityType] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);

  useEffect(() => {
    if (isAuthenticated) {
      loadActivityLogs();
    }
  }, [isAuthenticated]);

  const applyFilters = useCallback(() => {
    let filtered = [...logs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.user_name?.toLowerCase().includes(term) ||
          log.entity_name?.toLowerCase().includes(term) ||
          log.description.toLowerCase().includes(term) ||
          log.entity_type.toLowerCase().includes(term)
      );
    }

    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter((log) => log.action === filterAction);
    }

    // Entity type filter
    if (filterEntityType !== 'all') {
      filtered = filtered.filter((log) => log.entity_type === filterEntityType);
    }

    // Role filter
    if (filterRole !== 'all') {
      filtered = filtered.filter((log) => log.user_role === filterRole);
    }

    setFilteredLogs(filtered);
    setCurrentPage(1);
  }, [logs, searchTerm, filterAction, filterEntityType, filterRole]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const data = await activityLogsApi.getAll();
      setLogs(data);
    } catch (err) {
      console.error('Error loading activity logs:', err);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const styles = {
      create: 'bg-green-100 text-green-700 border-green-200',
      update: 'bg-blue-100 text-blue-700 border-blue-200',
      delete: 'bg-red-100 text-red-700 border-red-200',
      view: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[action as keyof typeof styles]}`}>
        {action.toUpperCase()}
      </span>
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <span className="text-gray-400">-</span>;

    const styles = {
      admin: 'bg-purple-100 text-purple-700',
      staff: 'bg-blue-100 text-blue-700',
      mechanic: 'bg-orange-100 text-orange-700',
      viewer: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  const getEntityIcon = (entityType: string) => {
    const icons: Record<string, string> = {
      customer: '👤',
      job_order: '🔧',
      supplier: '📦',
      inventory: '📊',
      mechanic: '👨‍🔧',
      appointment: '📅',
      vehicle: '🚗',
      purchase_order: '🛒',
      profile: '👥',
    };

    return icons[entityType] || '📄';
  };

  // Get unique entity types and roles for filters
  const entityTypes = Array.from(new Set(logs.map((log) => log.entity_type)));
  const roles = Array.from(new Set(logs.map((log) => log.user_role).filter(Boolean)));

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="w-full min-h-screen p-6 flex items-center justify-center">
        <div className="text-lg">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="py-4 px-2 md:px-6 lg:px-18">
        {/* Header */}
        <section className="flex flex-col gap-2 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Activity Logs</h1>
          </div>
          <p className="text-muted-foreground">
            Track all user actions across the system. Monitor who did what and when for complete audit trail.
          </p>
        </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Creates</p>
                <p className="text-2xl font-bold text-green-600">
                  {logs.filter((l) => l.action === 'create').length}
                </p>
              </div>
              <span className="text-3xl">✨</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Updates</p>
                <p className="text-2xl font-bold text-blue-600">
                  {logs.filter((l) => l.action === 'update').length}
                </p>
              </div>
              <span className="text-3xl">✏️</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deletions</p>
                <p className="text-2xl font-bold text-red-600">
                  {logs.filter((l) => l.action === 'delete').length}
                </p>
              </div>
              <span className="text-3xl">🗑️</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="view">View</option>
              </select>
            </div>

            {/* Entity Type Filter */}
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterEntityType}
                onChange={(e) => setFilterEntityType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {entityTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role!}>
                    {role!.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {log.user_name || 'System'}
                      </td>
                      <td className="px-4 py-3 text-sm">{getRoleBadge(log.user_role)}</td>
                      <td className="px-4 py-3 text-sm">{getActionBadge(log.action)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{getEntityIcon(log.entity_type)}</span>
                          <span className="text-gray-700 font-medium">
                            {log.entity_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{log.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">No activity logs found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchTerm || filterAction !== 'all' || filterEntityType !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Activities will appear here as users interact with the system'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredLogs.length > itemsPerPage && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-700 px-2">
                  {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

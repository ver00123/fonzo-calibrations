import supabase from '@/helper/supabaseClient';
import type { Database } from '@/types/database.types';

// Type aliases for easier use
type Tables = Database['public']['Tables'];
type Customer = Tables['customers']['Row'];
type CustomerInsert = Tables['customers']['Insert'];
type CustomerUpdate = Tables['customers']['Update'];

type Vehicle = Tables['vehicles']['Row'];
type VehicleInsert = Tables['vehicles']['Insert'];
type VehicleUpdate = Tables['vehicles']['Update'];

type Mechanic = Tables['mechanics']['Row'];
type MechanicInsert = Tables['mechanics']['Insert'];
type MechanicUpdate = Tables['mechanics']['Update'];

type Supplier = Tables['suppliers']['Row'];
type SupplierInsert = Tables['suppliers']['Insert'];
type SupplierUpdate = Tables['suppliers']['Update'];

type InventoryItem = Tables['inventory_items']['Row'];
type InventoryItemInsert = Tables['inventory_items']['Insert'];
type InventoryItemUpdate = Tables['inventory_items']['Update'];

type Booking = Tables['bookings']['Row'];
type BookingInsert = Tables['bookings']['Insert'];
type BookingUpdate = Tables['bookings']['Update'];

type Appointment = Tables['appointments']['Row'];
type AppointmentInsert = Tables['appointments']['Insert'];
type AppointmentUpdate = Tables['appointments']['Update'];

type JobOrder = Tables['job_orders']['Row'];
type JobOrderInsert = Tables['job_orders']['Insert'];
type JobOrderUpdate = Tables['job_orders']['Update'];

type Application = Tables['applications']['Row'];
type ApplicationInsert = Tables['applications']['Insert'];
type ApplicationUpdate = Tables['applications']['Update'];

type WorkAssignment = Tables['work_assignments']['Row'];
type WorkAssignmentInsert = Tables['work_assignments']['Insert'];
type WorkAssignmentUpdate = Tables['work_assignments']['Update'];

type Profile = Tables['profiles']['Row'];
type ProfileInsert = Tables['profiles']['Insert'];
type ProfileUpdate = Tables['profiles']['Update'];

// =====================================================
// PROFILES API (User Management)
// =====================================================

export const profilesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Profile[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async create(profile: ProfileInsert & { password?: string }) {
    // If email and password are provided, create an auth user
    if (profile.email && profile.password) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: profile.email,
        password: profile.password,
        options: {
          data: {
            full_name: profile.full_name,
            phone: profile.phone,
            role: profile.role,
          },
          emailRedirectTo: undefined, // Don't send confirmation email for admin-created users
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create authentication user');

      // Wait a moment for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));

      // Use upsert to ensure the profile is created/updated with all data
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone || null, // Convert empty string to null
          role: profile.role,
          is_active: profile.is_active ?? true,
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Profile upsert error:', error);
        throw new Error(`Failed to create profile: ${error.message}`);
      }

      return data as Profile;
    } else {
      // Fallback: Just create profile without auth (not recommended for login users)
      const { data, error } = await supabase
        .from('profiles')
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data as Profile;
    }
  },

  async update(id: string, updates: ProfileUpdate) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Profile;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by role
  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', role)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  },

  // Get active users
  async getActive() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  },
};

// =====================================================
// CUSTOMERS API
// =====================================================

export const customersApi = {
  // Get all customers
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Customer[];
  },

  // Get single customer by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // Create new customer
  async create(customer: CustomerInsert) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // Update customer
  async update(id: string, updates: CustomerUpdate) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  },

  // Delete customer
  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get customer with vehicles
  async getWithVehicles(id: string) {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};

// =====================================================
// VEHICLES API
// =====================================================

export const vehiclesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers (*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*, customers (*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getByCustomerId(customerId: string) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return data as Vehicle[];
  },

  async create(vehicle: VehicleInsert) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert(vehicle)
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  async update(id: string, updates: VehicleUpdate) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Vehicle;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// MECHANICS API
// =====================================================

export const mechanicsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('mechanics')
      .select('*')
      .order('mechanic_id', { ascending: true });

    if (error) throw error;
    return data as Mechanic[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('mechanics')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async create(mechanic: MechanicInsert) {
    const { data, error } = await supabase
      .from('mechanics')
      .insert(mechanic)
      .select()
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async update(id: string, updates: MechanicUpdate) {
    const { data, error } = await supabase
      .from('mechanics')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Mechanic;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('mechanics')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get mechanic performance view
  async getPerformance() {
    const { data, error } = await supabase
      .from('mechanic_performance')
      .select('*')
      .order('efficiency_rating', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// SUPPLIERS API
// =====================================================

export const suppliersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_name', { ascending: true });

    if (error) throw error;
    return data as Supplier[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Supplier;
  },

  async create(supplier: SupplierInsert) {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();

    if (error) throw error;
    return data as Supplier;
  },

  async update(id: string, updates: SupplierUpdate) {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Supplier;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// =====================================================
// INVENTORY API
// =====================================================

export const inventoryApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        categories (*),
        suppliers (*)
      `)
      .order('parts_name', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        categories (*),
        suppliers (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(item: InventoryItemInsert) {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async update(id: string, updates: InventoryItemUpdate) {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as InventoryItem;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get low stock items
  async getLowStock() {
    const { data, error } = await supabase
      .from('low_stock_inventory')
      .select('*');

    if (error) throw error;
    return data;
  },

  // Get by category
  async getByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        categories (*),
        suppliers (*)
      `)
      .eq('category_id', categoryId)
      .order('parts_name', { ascending: true });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// BOOKINGS API (Landing Page)
// =====================================================

export const bookingsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Booking[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async create(booking: BookingInsert) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async update(id: string, updates: BookingUpdate) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get booking counts by date
  async getDateCounts() {
    const { data, error } = await supabase
      .from('booking_date_counts')
      .select('*');

    if (error) throw error;
    return data;
  },
};

// =====================================================
// APPOINTMENTS API
// =====================================================

export const appointmentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        customers (*),
        vehicles (*)
      `)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data as Appointment[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async create(appointment: AppointmentInsert) {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async update(id: string, updates: AppointmentUpdate) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', status)
      .order('appointment_date', { ascending: true });

    if (error) throw error;
    return data as Appointment[];
  },
};

// =====================================================
// JOB ORDERS API
// =====================================================

export const jobOrdersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('job_orders')
      .select(`
        *,
        customers (*),
        vehicles (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('job_orders')
      .select(`
        *,
        customers (*),
        vehicles (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(jobOrder: JobOrderInsert) {
    const { data, error } = await supabase
      .from('job_orders')
      .insert(jobOrder)
      .select()
      .single();

    if (error) throw error;
    return data as JobOrder;
  },

  async update(id: string, updates: JobOrderUpdate) {
    const { data, error } = await supabase
      .from('job_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as JobOrder;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('job_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('job_orders')
      .select(`
        *,
        customers (*),
        vehicles (*)
      `)
      .eq('status', status)
      .order('service_date', { ascending: true });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// APPLICATIONS API
// =====================================================

export const applicationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        customers (*),
        vehicles (*),
        mechanics (*)
      `)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data as Application[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Application;
  },

  async create(application: ApplicationInsert) {
    const { data, error } = await supabase
      .from('applications')
      .insert(application)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async update(id: string, updates: ApplicationUpdate) {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', status)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data as Application[];
  },
};

// =====================================================
// WORK ASSIGNMENTS API
// =====================================================

export const workAssignmentsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('work_assignments')
      .select(`
        *,
        job_orders (
          *,
          vehicles (*)
        ),
        mechanics (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('work_assignments')
      .select(`
        *,
        job_orders (
          *,
          vehicles (*)
        ),
        mechanics (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(workAssignment: WorkAssignmentInsert) {
    const { data, error } = await supabase
      .from('work_assignments')
      .insert(workAssignment)
      .select()
      .single();

    if (error) throw error;
    return data as WorkAssignment;
  },

  async update(id: string, updates: WorkAssignmentUpdate) {
    const { data, error } = await supabase
      .from('work_assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as WorkAssignment;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('work_assignments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by mechanic
  async getByMechanic(mechanicId: string) {
    const { data, error } = await supabase
      .from('work_assignments')
      .select(`
        *,
        job_orders (
          *,
          vehicles (*)
        ),
        mechanics (*)
      `)
      .eq('mechanic_id', mechanicId)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('work_assignments')
      .select(`
        *,
        job_orders (
          *,
          vehicles (*)
        ),
        mechanics (*)
      `)
      .eq('status', status)
      .order('deadline', { ascending: true });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// PURCHASE ORDERS API
// =====================================================

type PurchaseOrder = Database['public']['Tables']['purchase_orders']['Row'];
type PurchaseOrderInsert = Database['public']['Tables']['purchase_orders']['Insert'];
type PurchaseOrderUpdate = Database['public']['Tables']['purchase_orders']['Update'];

export const purchaseOrdersApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async create(purchaseOrder: PurchaseOrderInsert) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(purchaseOrder)
      .select()
      .single();

    if (error) throw error;
    return data as PurchaseOrder;
  },

  async update(id: string, updates: PurchaseOrderUpdate) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as PurchaseOrder;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('purchase_orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get by supplier
  async getBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (*)
      `)
      .eq('supplier_id', supplierId)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get by status
  async getByStatus(status: string) {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers (*)
      `)
      .eq('status', status)
      .order('order_date', { ascending: false });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// ACTIVITY LOGS API
// =====================================================

export const activityLogsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByEntity(entityType: string, entityId: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getByAction(action: string) {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('action', action)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async log(logData: {
    action: 'create' | 'update' | 'delete' | 'view';
    entity_type: string;
    entity_id: string;
    entity_name: string;
    description: string;
    old_values?: any;
    new_values?: any;
  }) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user profile 
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .maybeSingle(); 

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          user_name: profile?.full_name || user.email,
          user_role: profile?.role || 'unknown',
          action: logData.action,
          entity_type: logData.entity_type,
          entity_id: logData.entity_id,
          entity_name: logData.entity_name,
          description: logData.description,
          old_values: logData.old_values || null,
          new_values: logData.new_values || null,
        })
        .select()
        .maybeSingle(); 

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error logging activity:', err);
      // Don't throw - we don't want logging failures to break the app
    }
  },
};

// =====================================================
// CATEGORIES API
// =====================================================

export const categoriesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },
};

// =====================================================
// NOTIFICATIONS API
// =====================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'appointment' | 'job_order' | 'inventory' | 'customer' | 'system';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export const notificationsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data as Notification[];
  },

  async getUnread() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Notification[];
  },

  async getUnreadCount() {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(id: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  },

  async create(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Notification;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteAll() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) throw error;
  },
};

// =====================================================
// SETTINGS API
// =====================================================

export interface WorkshopSettings {
  id?: string;
  workshop_name: string;
  address: string;
  contact_info: string;
  email?: string;
  notifications_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

export const settingsApi = {
  async get() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data as WorkshopSettings | null;
  },

  async upsert(settings: Partial<WorkshopSettings>) {
    // First try to get existing settings
    const existing = await this.get();

    if (existing?.id) {
      // Update existing
      const { data, error } = await supabase
        .from('settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as WorkshopSettings;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('settings')
        .insert({
          ...settings,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as WorkshopSettings;
    }
  },
};

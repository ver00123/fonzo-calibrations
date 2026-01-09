// Database Types - Auto-generated from Supabase Schema
// These types match the database schema exactly

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string;
          role: 'admin' | 'staff' | 'mechanic' | 'viewer';
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name: string;
          role?: 'admin' | 'staff' | 'mechanic' | 'viewer';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          role?: 'admin' | 'staff' | 'mechanic' | 'viewer';
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          contact_no: string;
          email: string | null;
          address: string | null;
          total_jobs: number;
          last_visit: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          contact_no: string;
          email?: string | null;
          address?: string | null;
          total_jobs?: number;
          last_visit?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          contact_no?: string;
          email?: string | null;
          address?: string | null;
          total_jobs?: number;
          last_visit?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicles: {
        Row: {
          id: string;
          customer_id: string;
          vehicle_model: string;
          car_brand: string | null;
          color: string | null;
          plate_number: string;
          year: string | null;
          vin: string | null;
          is_primary: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          vehicle_model: string;
          car_brand?: string | null;
          color?: string | null;
          plate_number: string;
          year?: string | null;
          vin?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          vehicle_model?: string;
          car_brand?: string | null;
          color?: string | null;
          plate_number?: string;
          year?: string | null;
          vin?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mechanics: {
        Row: {
          id: string;
          mechanic_id: string;
          profile_id: string | null;
          full_name: string;
          role: string;
          jobs_completed: number;
          current_jobs: number;
          efficiency_rating: number;
          specialization: string | null;
          hire_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mechanic_id: string;
          profile_id?: string | null;
          full_name: string;
          role?: string;
          jobs_completed?: number;
          current_jobs?: number;
          efficiency_rating?: number;
          specialization?: string | null;
          hire_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mechanic_id?: string;
          profile_id?: string | null;
          full_name?: string;
          role?: string;
          jobs_completed?: number;
          current_jobs?: number;
          efficiency_rating?: number;
          specialization?: string | null;
          hire_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      suppliers: {
        Row: {
          id: string;
          supplier_name: string;
          contact: string;
          email: string | null;
          address: string | null;
          last_order_date: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_name: string;
          contact: string;
          email?: string | null;
          address?: string | null;
          last_order_date?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_name?: string;
          contact?: string;
          email?: string | null;
          address?: string | null;
          last_order_date?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_items: {
        Row: {
          id: string;
          parts_name: string;
          category_id: string | null;
          supplier_id: string | null;
          quantity: number;
          unit: string;
          minimum_stock: number;
          unit_price: number | null;
          status: string;
          location: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parts_name: string;
          category_id?: string | null;
          supplier_id?: string | null;
          quantity?: number;
          unit?: string;
          minimum_stock?: number;
          unit_price?: number | null;
          status?: string;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parts_name?: string;
          category_id?: string | null;
          supplier_id?: string | null;
          quantity?: number;
          unit?: string;
          minimum_stock?: number;
          unit_price?: number | null;
          status?: string;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string;
          vehicle_model: string;
          service_type: string;
          preferred_date: string;
          preferred_time: string;
          message: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email: string;
          phone: string;
          vehicle_model: string;
          service_type: string;
          preferred_date: string;
          preferred_time: string;
          message?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          vehicle_model?: string;
          service_type?: string;
          preferred_date?: string;
          preferred_time?: string;
          message?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          customer_id: string | null;
          booking_id: string | null;
          name: string;
          email: string;
          appointment_date: string;
          appointment_time: string;
          vehicle: string;
          vehicle_id: string | null;
          status: string;
          badge: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          booking_id?: string | null;
          name: string;
          email: string;
          appointment_date: string;
          appointment_time: string;
          vehicle: string;
          vehicle_id?: string | null;
          status?: string;
          badge?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          booking_id?: string | null;
          name?: string;
          email?: string;
          appointment_date?: string;
          appointment_time?: string;
          vehicle?: string;
          vehicle_id?: string | null;
          status?: string;
          badge?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_orders: {
        Row: {
          id: string;
          job_order_id: string;
          customer_id: string;
          vehicle_id: string;
          appointment_id: string | null;
          full_name: string;
          contact_no: string;
          car_brand: string;
          color: string | null;
          plate_number: string;
          service_date: string;
          status: string;
          total_cost: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_order_id: string;
          customer_id: string;
          vehicle_id: string;
          appointment_id?: string | null;
          full_name: string;
          contact_no: string;
          car_brand: string;
          color?: string | null;
          plate_number: string;
          service_date: string;
          status?: string;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_order_id?: string;
          customer_id?: string;
          vehicle_id?: string;
          appointment_id?: string | null;
          full_name?: string;
          contact_no?: string;
          car_brand?: string;
          color?: string | null;
          plate_number?: string;
          service_date?: string;
          status?: string;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          customer_id: string | null;
          name: string;
          vehicle: string;
          vehicle_id: string | null;
          preferred_date: string;
          preferred_time: string;
          problem: string;
          assigned_mechanic: string | null;
          mechanic_id: string | null;
          status: string;
          submitted_at: string;
          reviewed_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id?: string | null;
          name: string;
          vehicle: string;
          vehicle_id?: string | null;
          preferred_date: string;
          preferred_time: string;
          problem: string;
          assigned_mechanic?: string | null;
          mechanic_id?: string | null;
          status?: string;
          submitted_at?: string;
          reviewed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string | null;
          name?: string;
          vehicle?: string;
          vehicle_id?: string | null;
          preferred_date?: string;
          preferred_time?: string;
          problem?: string;
          assigned_mechanic?: string | null;
          mechanic_id?: string | null;
          status?: string;
          submitted_at?: string;
          reviewed_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      work_assignments: {
        Row: {
          id: string;
          work_id: string;
          job_order_id: string;
          vehicle: string;
          vehicle_id: string | null;
          assigned_mechanic: string;
          mechanic_id: string;
          deadline: string;
          status: string;
          issue_encountered: string | null;
          problem_notes: string | null;
          started_at: string | null;
          completed_at: string | null;
          estimated_hours: number | null;
          actual_hours: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          work_id: string;
          job_order_id: string;
          vehicle: string;
          vehicle_id?: string | null;
          assigned_mechanic: string;
          mechanic_id: string;
          deadline: string;
          status?: string;
          issue_encountered?: string | null;
          problem_notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          work_id?: string;
          job_order_id?: string;
          vehicle?: string;
          vehicle_id?: string | null;
          assigned_mechanic?: string;
          mechanic_id?: string;
          deadline?: string;
          status?: string;
          issue_encountered?: string | null;
          problem_notes?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      purchase_orders: {
        Row: {
          id: string;
          po_number: string;
          supplier_id: string;
          order_date: string;
          expected_delivery_date: string | null;
          status: string;
          total_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          po_number: string;
          supplier_id: string;
          order_date: string;
          expected_delivery_date?: string | null;
          status?: string;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          po_number?: string;
          supplier_id?: string;
          order_date?: string;
          expected_delivery_date?: string | null;
          status?: string;
          total_amount?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      booking_date_counts: {
        Row: {
          preferred_date: string;
          booking_count: number;
        };
      };
      low_stock_inventory: {
        Row: {
          id: string;
          parts_name: string;
          quantity: number;
          minimum_stock: number;
          unit: string;
          category_name: string | null;
          supplier_name: string | null;
        };
      };
      mechanic_performance: {
        Row: {
          id: string;
          mechanic_id: string;
          full_name: string;
          jobs_completed: number;
          current_jobs: number;
          efficiency_rating: number;
          active_assignments: number;
        };
      };
      customer_history: {
        Row: {
          id: string;
          full_name: string;
          contact_no: string;
          email: string | null;
          total_jobs: number;
          last_visit: string | null;
          total_vehicles: number;
          total_orders: number;
        };
      };
    };
  };
};

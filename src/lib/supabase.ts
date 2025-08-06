import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  delivery_type: 'pickup' | 'delivery';
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    phone: string;
    notes?: string;
  };
  shipping_cost: number;
  payment_method?: 'mercadopago' | 'cash';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  mercadopago_payment_id?: string;
  notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  profiles?: {
    full_name: string;
    email: string;
  };
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  created_at: string;
}
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  region: string;
  created_at: string;
}

export interface SalesRecord {
  id: string;
  user_id: string;
  date: string;
  customer: string;
  product: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  region: string;
  status: 'completed' | 'pending' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topProduct: string;
  topRegion: string;
  growthRate: number;
  completionRate: number;
}

class DatabaseManager {
  // Get all users
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Get sales data for a specific user
  async getSalesData(userId: string): Promise<SalesRecord[]> {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Add new sales record
  async addSalesRecord(record: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SalesRecord> {
    const { data, error } = await supabase
      .from('sales_records')
      .insert([record])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update sales record
  async updateSalesRecord(id: string, updates: Partial<SalesRecord>): Promise<SalesRecord> {
    const { data, error } = await supabase
      .from('sales_records')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Delete sales record
  async deleteSalesRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('sales_records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Calculate metrics for a user
  async getMetrics(userId: string): Promise<SalesMetrics> {
    const salesData = await this.getSalesData(userId);
    const completedOrders = salesData.filter(record => record.status === 'completed');
    
    const totalRevenue = completedOrders.reduce((sum, record) => sum + record.total_amount, 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalRevenue / (completedOrders.length || 1);

    // Find top product by revenue
    const productRevenue = completedOrders.reduce((acc, record) => {
      acc[record.product] = (acc[record.product] || 0) + record.total_amount;
      return acc;
    }, {} as Record<string, number>);
    const topProduct = Object.entries(productRevenue).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Find top region by revenue
    const regionRevenue = completedOrders.reduce((acc, record) => {
      acc[record.region] = (acc[record.region] || 0) + record.total_amount;
      return acc;
    }, {} as Record<string, number>);
    const topRegion = Object.entries(regionRevenue).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate growth rate (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentRevenue = completedOrders
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .reduce((sum, record) => sum + record.total_amount, 0);

    const previousRevenue = completedOrders
      .filter(record => new Date(record.date) >= sixtyDaysAgo && new Date(record.date) < thirtyDaysAgo)
      .reduce((sum, record) => sum + record.total_amount, 0);

    const growthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const completionRate = (completedOrders.length / totalOrders) * 100;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      topProduct,
      topRegion,
      growthRate,
      completionRate
    };
  }

  // Get revenue by month for a user
  async getRevenueByMonth(userId: string): Promise<{ labels: string[], values: number[] }> {
    const salesData = await this.getSalesData(userId);
    const monthlyRevenue = salesData
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + record.total_amount;
        return acc;
      }, {} as Record<string, number>);

    const sortedEntries = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6);

    return {
      labels: sortedEntries.map(([month]) => month),
      values: sortedEntries.map(([, revenue]) => Math.round(revenue))
    };
  }

  // Get revenue by region for a user
  async getRevenueByRegion(userId: string): Promise<{ labels: string[], values: number[] }> {
    const salesData = await this.getSalesData(userId);
    const regionRevenue = salesData
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        acc[record.region] = (acc[record.region] || 0) + record.total_amount;
        return acc;
      }, {} as Record<string, number>);

    const sortedEntries = Object.entries(regionRevenue)
      .sort(([,a], [,b]) => b - a);

    return {
      labels: sortedEntries.map(([region]) => region),
      values: sortedEntries.map(([, revenue]) => Math.round(revenue))
    };
  }

  // Get top products for a user
  async getTopProducts(userId: string, limit: number = 5): Promise<{ product: string, revenue: number, orders: number }[]> {
    const salesData = await this.getSalesData(userId);
    const productStats = salesData
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        if (!acc[record.product]) {
          acc[record.product] = { revenue: 0, orders: 0 };
        }
        acc[record.product].revenue += record.total_amount;
        acc[record.product].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number, orders: number }>);

    return Object.entries(productStats)
      .map(([product, stats]) => ({ product, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  // Get recent orders for a user
  async getRecentOrders(userId: string, limit: number = 10): Promise<SalesRecord[]> {
    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
}

export const databaseManager = new DatabaseManager();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('https://');

// Only create Supabase client if properly configured
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured. Running in mock data mode. To use database features, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

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
    if (!supabase) {
      return this.getMockUsers();
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    
    if (error) {
      console.warn('Database error, falling back to mock data:', error);
      return this.getMockUsers();
    }
    return data || [];
  }

  // Get sales data for a specific user
  async getSalesData(userId: string): Promise<SalesRecord[]> {
    if (!supabase) {
      return this.getMockSalesData(userId);
    }

    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    
    if (error) {
      console.warn('Database error, falling back to mock data:', error);
      return this.getMockSalesData(userId);
    }
    return data || [];
  }

  // Add new sales record
  async addSalesRecord(record: Omit<SalesRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SalesRecord> {
    if (!supabase) {
      // In mock mode, simulate adding a record
      const newRecord: SalesRecord = {
        id: `mock-${record.user_id}-${Date.now()}`,
        ...record,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return newRecord;
    }

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
    if (!supabase) {
      // In mock mode, simulate updating a record
      const updatedRecord: SalesRecord = {
        id,
        user_id: updates.user_id || '',
        date: updates.date || new Date().toISOString().split('T')[0],
        customer: updates.customer || '',
        product: updates.product || '',
        category: updates.category || '',
        quantity: updates.quantity || 1,
        unit_price: updates.unit_price || 0,
        total_amount: updates.total_amount || 0,
        region: updates.region || '',
        status: updates.status || 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return updatedRecord;
    }

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
    if (!supabase) {
      // In mock mode, simulate deletion (no-op)
      return;
    }

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
    if (!supabase) {
      return this.getMockSalesData(userId).slice(0, limit);
    }

    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.warn('Database error, falling back to mock data:', error);
      return this.getMockSalesData(userId).slice(0, limit);
    }
    return data || [];
  }

  // Mock data methods for when Supabase is not configured
  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@company.com',
        department: 'Sales',
        region: 'North America',
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Sales',
        region: 'Europe',
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Mike Davis',
        email: 'mike.davis@company.com',
        department: 'Marketing',
        region: 'North America',
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Emily Chen',
        email: 'emily.chen@company.com',
        department: 'Sales',
        region: 'Asia Pacific',
        created_at: new Date().toISOString()
      },
      {
        id: '5',
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        department: 'Operations',
        region: 'Europe',
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        name: 'Lisa Brown',
        email: 'lisa.brown@company.com',
        department: 'Sales',
        region: 'Latin America',
        created_at: new Date().toISOString()
      },
      {
        id: '7',
        name: 'Robert Taylor',
        email: 'robert.taylor@company.com',
        department: 'Marketing',
        region: 'North America',
        created_at: new Date().toISOString()
      },
      {
        id: '8',
        name: 'Jennifer Lee',
        email: 'jennifer.lee@company.com',
        department: 'Sales',
        region: 'Asia Pacific',
        created_at: new Date().toISOString()
      },
      {
        id: '9',
        name: 'Michael Garcia',
        email: 'michael.garcia@company.com',
        department: 'Operations',
        region: 'Latin America',
        created_at: new Date().toISOString()
      },
      {
        id: '10',
        name: 'Amanda White',
        email: 'amanda.white@company.com',
        department: 'Sales',
        region: 'Europe',
        created_at: new Date().toISOString()
      }
    ];
  }

  private getMockSalesData(userId: string): SalesRecord[] {
    const mockData: SalesRecord[] = [];
    const customers = [
      'Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 
      'Future Systems', 'Digital Dynamics', 'Smart Solutions', 'NextGen Tech',
      'CloudFirst Inc', 'DataFlow Systems', 'SecureNet Ltd', 'WebScale Co'
    ];
    const products = [
      'Pro Software License', 'Enterprise Suite', 'Mobile App', 'Cloud Storage',
      'Analytics Platform', 'Security Package', 'API Access', 'Premium Support',
      'Data Backup Service', 'Monitoring Tools', 'Integration Platform', 'AI Assistant'
    ];
    const categories = ['Software', 'Services', 'Hardware', 'Consulting'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    const statuses: ('completed' | 'pending' | 'cancelled')[] = ['completed', 'pending', 'cancelled'];
    
    // Generate 25-35 records per user for more realistic data
    const recordCount = Math.floor(Math.random() * 11) + 25; // 25-35 records
    
    for (let i = 0; i < recordCount; i++) {
      const quantity = Math.floor(Math.random() * 8) + 1;
      const unitPrice = Math.floor(Math.random() * 800) + 50;
      const daysAgo = Math.floor(Math.random() * 120); // Last 4 months
      
      mockData.push({
        id: `mock-${userId}-${i}`,
        user_id: userId,
        date: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customer: customers[Math.floor(Math.random() * customers.length)],
        product: products[Math.floor(Math.random() * products.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        quantity,
        unit_price: unitPrice,
        total_amount: quantity * unitPrice,
        region: regions[Math.floor(Math.random() * regions.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Sort by date (newest first)
    return mockData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
}

export const databaseManager = new DatabaseManager();
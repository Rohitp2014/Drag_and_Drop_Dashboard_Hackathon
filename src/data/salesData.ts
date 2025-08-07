export interface SalesRecord {
  id: string;
  date: string;
  customer: string;
  product: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  salesRep: string;
  region: string;
  status: 'completed' | 'pending' | 'cancelled';
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

class SalesDataManager {
  private data: SalesRecord[] = [];
  private listeners: (() => void)[] = [];

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    const customers = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Future Systems', 'Digital Dynamics', 'Smart Solutions', 'NextGen Tech'];
    const products = ['Pro Software License', 'Enterprise Suite', 'Mobile App', 'Cloud Storage', 'Analytics Platform', 'Security Package', 'API Access', 'Premium Support'];
    const categories = ['Software', 'Services', 'Hardware', 'Consulting'];
    const salesReps = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Chen', 'David Wilson', 'Lisa Brown'];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    const statuses: ('completed' | 'pending' | 'cancelled')[] = ['completed', 'pending', 'cancelled'];

    // Generate initial dataset
    for (let i = 0; i < 150; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
      
      const quantity = Math.floor(Math.random() * 10) + 1;
      const unitPrice = Math.floor(Math.random() * 500) + 50;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      this.data.push({
        id: `ORD-${String(i + 1).padStart(4, '0')}`,
        date: date.toISOString().split('T')[0],
        customer: customers[Math.floor(Math.random() * customers.length)],
        product: products[Math.floor(Math.random() * products.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        quantity,
        unitPrice,
        totalAmount: quantity * unitPrice,
        salesRep: salesReps[Math.floor(Math.random() * salesReps.length)],
        region: regions[Math.floor(Math.random() * regions.length)],
        status
      });
    }

    // Sort by date (newest first)
    this.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getData(): SalesRecord[] {
    return [...this.data];
  }

  getMetrics(): SalesMetrics {
    const completedOrders = this.data.filter(record => record.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, record) => sum + record.totalAmount, 0);
    const totalOrders = this.data.length;
    const averageOrderValue = totalRevenue / (completedOrders.length || 1);

    // Find top product by revenue
    const productRevenue = completedOrders.reduce((acc, record) => {
      acc[record.product] = (acc[record.product] || 0) + record.totalAmount;
      return acc;
    }, {} as Record<string, number>);
    const topProduct = Object.entries(productRevenue).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Find top region by revenue
    const regionRevenue = completedOrders.reduce((acc, record) => {
      acc[record.region] = (acc[record.region] || 0) + record.totalAmount;
      return acc;
    }, {} as Record<string, number>);
    const topRegion = Object.entries(regionRevenue).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A';

    // Calculate growth rate (comparing last 30 days vs previous 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentRevenue = completedOrders
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .reduce((sum, record) => sum + record.totalAmount, 0);

    const previousRevenue = completedOrders
      .filter(record => new Date(record.date) >= sixtyDaysAgo && new Date(record.date) < thirtyDaysAgo)
      .reduce((sum, record) => sum + record.totalAmount, 0);

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

  getRevenueByMonth(): { labels: string[], values: number[] } {
    const monthlyRevenue = this.data
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + record.totalAmount;
        return acc;
      }, {} as Record<string, number>);

    const sortedEntries = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6); // Last 6 months

    return {
      labels: sortedEntries.map(([month]) => month),
      values: sortedEntries.map(([, revenue]) => Math.round(revenue))
    };
  }

  getRevenueByRegion(): { labels: string[], values: number[] } {
    const regionRevenue = this.data
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        acc[record.region] = (acc[record.region] || 0) + record.totalAmount;
        return acc;
      }, {} as Record<string, number>);

    const sortedEntries = Object.entries(regionRevenue)
      .sort(([,a], [,b]) => b - a);

    return {
      labels: sortedEntries.map(([region]) => region),
      values: sortedEntries.map(([, revenue]) => Math.round(revenue))
    };
  }

  getTopProducts(limit: number = 5): { product: string, revenue: number, orders: number }[] {
    const productStats = this.data
      .filter(record => record.status === 'completed')
      .reduce((acc, record) => {
        if (!acc[record.product]) {
          acc[record.product] = { revenue: 0, orders: 0 };
        }
        acc[record.product].revenue += record.totalAmount;
        acc[record.product].orders += 1;
        return acc;
      }, {} as Record<string, { revenue: number, orders: number }>);

    return Object.entries(productStats)
      .map(([product, stats]) => ({ product, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  getRecentOrders(limit: number = 10): SalesRecord[] {
    return this.data.slice(0, limit);
  }

  addSalesRecord(record: Omit<SalesRecord, 'id'>): void {
    const newRecord: SalesRecord = {
      ...record,
      id: `ORD-${String(this.data.length + 1).padStart(4, '0')}`
    };
    
    this.data.unshift(newRecord);
    this.notifyListeners();
  }

  updateSalesRecord(id: string, updates: Partial<SalesRecord>): void {
    const index = this.data.findIndex(record => record.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updates };
      this.notifyListeners();
    }
  }

  deleteSalesRecord(id: string): void {
    this.data = this.data.filter(record => record.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Simulate real-time data updates
  startRealTimeUpdates(): void {
    setInterval(() => {
      // Randomly add new sales records
      if (Math.random() < 0.3) { // 30% chance every interval
        const customers = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs'];
        const products = ['Pro Software License', 'Enterprise Suite', 'Mobile App', 'Cloud Storage'];
        const categories = ['Software', 'Services', 'Hardware', 'Consulting'];
        const salesReps = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Chen'];
        const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
        
        const quantity = Math.floor(Math.random() * 5) + 1;
        const unitPrice = Math.floor(Math.random() * 300) + 100;
        
        this.addSalesRecord({
          date: new Date().toISOString().split('T')[0],
          customer: customers[Math.floor(Math.random() * customers.length)],
          product: products[Math.floor(Math.random() * products.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          quantity,
          unitPrice,
          totalAmount: quantity * unitPrice,
          salesRep: salesReps[Math.floor(Math.random() * salesReps.length)],
          region: regions[Math.floor(Math.random() * regions.length)],
          status: Math.random() > 0.1 ? 'completed' : 'pending'
        });
      }
    }, 10000); // Every 10 seconds
  }
}

export const salesDataManager = new SalesDataManager();
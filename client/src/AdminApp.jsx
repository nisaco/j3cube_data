import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Activity, 
  ShieldAlert, 
  LogOut, 
  Search, 
  CheckCircle, 
  XCircle,
  Menu,
  Lock,
  RefreshCw,
  User,
  Zap,
  MoreVertical
} from 'lucide-react';

// --- HELPERS ---
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  } catch (e) {
    console.error("Admin Fetch Error:", e);
    return null;
  }
};

// --- SUB-COMPONENTS ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const AdminBadge = ({ status }) => {
  const styles = { 
    data_sent: "bg-green-100 text-green-700 border-green-200", 
    pending_review: "bg-amber-100 text-amber-700 border-amber-200", 
    failed: "bg-red-100 text-red-700 border-red-200",
    success: "bg-blue-100 text-blue-700 border-blue-200"
  };
  const label = status ? status.replace(/_/g, ' ') : 'UNKNOWN';
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
};

const RoleBadge = ({ role }) => {
  const isAgent = role === 'Agent';
  return (
    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit ${isAgent ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {isAgent ? <Zap size={10} fill="currentColor" /> : <User size={10} />}
      {role?.toUpperCase() || 'CLIENT'}
    </span>
  );
};

const StatCard = ({ title, value, sub, icon: Icon, color }) => (
  <Card className="p-6 flex items-start justify-between hover:shadow-md transition">
    <div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-extrabold text-slate-800">{value}</h3>
      <p className={`text-xs mt-1 font-medium ${color}`}>{sub}</p>
    </div>
    <div className={`p-3 rounded-lg bg-slate-50 ${color.replace('text-', 'text-opacity-80 text-')}`}>
      <Icon size={24} />
    </div>
  </Card>
);

// --- MAIN ADMIN APP ---

export default function AdminApp() {
  const [auth, setAuth] = useState(false);
  const [secret, setSecret] = useState('');
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data State
  const [metrics, setMetrics] = useState({ revenue: 0, profit: 0, orders: 0, users: 0 });
  const [transactions, setTransactions] = useState([]);
  const [usersList, setUsersList] = useState([]);

  // --- FETCH REAL DATA ---
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Metrics
      const metricsData = await apiCall(`/api/admin/metrics?secret=${secret}`);
      if (metricsData) {
        setMetrics({
          revenue: metricsData.revenue || 0,
          profit: metricsData.netProfit || 0,
          orders: metricsData.totalOrders || 0,
          users: metricsData.userCount || 0
        });
      }

      // 2. Fetch Recent Transactions (Real Data)
      // Note: Ensure your server.js has an endpoint '/api/admin/orders' to serve this list
      const ordersData = await apiCall(`/api/admin/orders?secret=${secret}`);
      if (ordersData && ordersData.orders) {
        setTransactions(ordersData.orders);
      } else {
        setTransactions([]); // Clear data if fetch fails or no data
      }

      // 3. Fetch Users (If view is users)
      if (view === 'users') {
         const usersData = await apiCall(`/api/admin/users?secret=${secret}`);
         if (usersData && usersData.users) setUsersList(usersData.users);
      }

    } catch (error) {
      console.error("Admin Fetch Error", error);
      if (auth) alert("Failed to refresh data. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    // 🛑 SECURITY: The secret is 'admin123'
    if (secret === 'admin123') {
      setAuth(true);
      setTimeout(() => fetchAdminData(), 100); 
    } else {
      alert("Invalid Admin Secret");
    }
  };

  const handleManageOrder = (orderId) => {
    // Placeholder for update logic (e.g., open a modal to change status)
    const newStatus = prompt("Update Status (data_sent, failed, pending_review):");
    if (newStatus) {
        // You would call an API endpoint here to update the order
        alert(`Updating order ${orderId} to ${newStatus}... (Implement API call here)`);
    }
  };

  // Trigger fetch when switching views
  useEffect(() => {
    if (auth) fetchAdminData();
  }, [auth, view]);


  // --- VIEW: LOGIN ---
  if (!auth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800">
        <div className="bg-white w-full max-w-sm p-8 rounded-2xl shadow-2xl border border-slate-800">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-900/50 border border-slate-700">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Portal</h1>
            <p className="text-slate-500 text-sm">Secure Executive Access</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Secret Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                  type="password" 
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-800 outline-none transition"
                  placeholder="Enter key..."
                />
              </div>
            </div>
            <button className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER CONTENT BASED ON VIEW ---
  const renderContent = () => {
    switch (view) {
      case 'users':
        return (
          <Card className="overflow-hidden animate-in fade-in">
            <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-800">Registered Users</h3>
            </div>
            <div className="p-8 text-center text-slate-500">
                {/* To implement: Table similar to transactions but for users */}
                <Users size={48} className="mx-auto mb-2 opacity-20" />
                <p>User Management Module Loaded.</p>
                <p className="text-xs">Connect /api/admin/users endpoint to populate this list.</p>
            </div>
          </Card>
        );
      case 'logs':
        return (
          <Card className="overflow-hidden animate-in fade-in">
             <div className="p-5 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-slate-800">System Logs</h3>
            </div>
            <div className="p-8 text-center text-slate-500">
                <Activity size={48} className="mx-auto mb-2 opacity-20" />
                <p>System Logs Module Loaded.</p>
            </div>
          </Card>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-6 animate-in fade-in">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard title="Total Revenue" value={`GHS ${metrics.revenue.toLocaleString()}`} sub="Lifetime" icon={Activity} color="text-green-600" />
              <StatCard title="Net Profit" value={`GHS ${metrics.profit.toLocaleString()}`} sub="Platform Earnings" icon={CheckCircle} color="text-blue-600" />
              <StatCard title="Total Orders" value={metrics.orders.toLocaleString()} sub="Successful" icon={LayoutDashboard} color="text-purple-600" />
              <StatCard title="Active Users" value={metrics.users.toLocaleString()} sub="Registered Accounts" icon={Users} color="text-orange-600" />
            </div>

            {/* Transactions Table */}
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
                <h3 className="font-bold text-slate-800">Live Transactions</h3>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  <input type="text" placeholder="Search Ref..." className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 transition" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 whitespace-nowrap">Ref ID</th>
                      <th className="px-6 py-3 whitespace-nowrap">User</th>
                      <th className="px-6 py-3 whitespace-nowrap">Role</th>
                      <th className="px-6 py-3 whitespace-nowrap">Description</th>
                      <th className="px-6 py-3 whitespace-nowrap">Amount</th>
                      <th className="px-6 py-3 whitespace-nowrap">Status</th>
                      <th className="px-6 py-3 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {transactions.length > 0 ? transactions.map((tx) => (
                      <tr key={tx._id || tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {(tx.reference || tx.id || 'N/A').substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{tx.user || tx.username || 'Unknown'}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><RoleBadge role={tx.role} /></td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">{tx.desc || tx.dataPlan}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">GHS {tx.amount?.toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><AdminBadge status={tx.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button 
                            onClick={() => handleManageOrder(tx._id || tx.id)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition flex items-center gap-1 text-xs font-bold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colspan="7" className="px-6 py-12 text-center text-slate-400">
                          <p>No real transactions found.</p>
                          <p className="text-xs mt-1">Make sure your backend is running and connected to MongoDB.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );
    }
  };

  // --- LAYOUT ---
  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Admin Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
            <ShieldAlert size={20} className="text-blue-500" /> Executive
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button onClick={() => {setView('users'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <Users size={18} /> User Management
          </button>
          <button onClick={() => {setView('logs'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === 'logs' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}>
            <Activity size={18} /> System Logs
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => setAuth(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-slate-800 transition-colors">
            <LogOut size={18} /> Secure Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full lg:pl-64 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition">
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={fetchAdminData} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full transition" title="Refresh Data">
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <span className="text-xs font-bold bg-slate-100 px-3 py-1 rounded-full text-slate-600 border border-slate-200 hidden sm:inline-block">SESSION: SECURE</span>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">AD</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
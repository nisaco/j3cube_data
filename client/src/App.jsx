import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wifi, History, LogOut, Menu, X, Wallet, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, 
  Loader2, User, Eye, EyeOff, ShieldCheck, Box,
  TrendingUp, Users, CreditCard, Activity, Lock, Check, AlertCircle, RefreshCw, Landmark
} from 'lucide-react';

// --- Global Styles ---
const globalStyles = `
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    background-color: #f8fafc;
    overflow-x: hidden;
  }
`;

// --- CONFIGURATION ---
const API_BASE_URL = 'https://j3cube-data.onrender.com/api';
const PAYSTACK_KEY = "pk_live_62dc43eeea153c81c216b75e3967f8a44ee94fc3"; 
const FAVICON_URL = 'apple-touch-icon.png'; // J3Cube Logo

const NETWORK_LOGOS = {
  'MTN': 'mtn_logo.png',
  'AirtelTigo': 'at_logo.png',
  'Telecel': 'telecel_logo.png'
};

// --- API HELPER ---
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const fetchOptions = {
    ...options,
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Server Error (${response.status})`);
      } else {
        const text = await response.text();
        console.error("Raw Server Error:", text);
        throw new Error(`Critical Server Error (${response.status}). Check backend logs.`);
      }
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    return { success: true }; 
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error;
  }
};

// --- SUB-COMPONENTS ---

const Button = ({ children, onClick, disabled = false, fullWidth = false, variant = 'primary', size = 'default' }) => {
  const base = `rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-3'}`;
  const variants = {
    primary: "bg-[#009879] text-white hover:bg-[#007a63] shadow-lg shadow-emerald-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-[#009879] hover:text-[#009879]",
    dark: "bg-slate-800 text-white hover:bg-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
  };
  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}>{children}</button>;
};

const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon, isPassword = false }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-3.5 text-slate-400" size={18} />}
        <input 
          type={isPassword ? (show ? "text" : "password") : type} 
          value={value} 
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009879] outline-none transition font-medium text-slate-800`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- VIEWS ---

const Dashboard = ({ user, transactions, setView, onTopUp }) => (
  <div className="space-y-6 animate-in fade-in duration-500 pb-20">
    {/* Wallet Card */}
    <div className="bg-gradient-to-br from-[#009879] to-[#006d5b] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-emerald-100 font-medium mb-1 text-sm md:text-base">Wallet Balance</p>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">GHS {(user.walletBalance / 100).toFixed(2)}</h1>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">
            {user.role === 'Agent' ? '⚡ AGENT' : (user.role === 'Admin' ? '🛡️ ADMIN' : '👤 CLIENT')}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-8">
          <button onClick={onTopUp} className="bg-white text-[#009879] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-sm">
            <Wallet size={18} /> Fund Wallet
          </button>
          <button onClick={() => setView('history')} className="bg-emerald-900/30 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-900/50 transition border border-white/20 backdrop-blur-md">
            View History
          </button>
        </div>
      </div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button onClick={() => setView('purchase')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover:shadow-md transition group">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#009879] flex items-center justify-center group-hover:scale-110 transition-transform"><Wifi size={28} /></div>
        <div><h3 className="font-bold text-slate-800 text-lg">Buy Data</h3><p className="text-slate-500 text-sm">Instant Delivery</p></div>
        <ChevronRight className="ml-auto text-slate-300" />
      </button>
      <button className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left opacity-70 cursor-not-allowed">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Smartphone size={28} /></div>
        <div><h3 className="font-bold text-slate-800 text-lg">Airtime</h3><p className="text-slate-500 text-sm">Coming Soon</p></div>
      </button>
    </div>

    {/* Transactions */}
    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
          <div key={tx._id} className="p-4 border-b border-slate-50 flex items-center justify-between last:border-0">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'data_sent' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                {tx.status === 'data_sent' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div><p className="font-bold text-slate-700 text-sm">{tx.dataPlan || 'Transaction'}</p><p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p></div>
            </div>
            <p className="font-bold text-sm text-slate-800">GHS {tx.amount?.toFixed(2)}</p>
          </div>
        )) : <div className="p-8 text-center text-slate-400 text-sm">No recent transactions</div>}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); 

  const fetchData = async () => {
    setLoading(true);
    try {
      const mRes = await apiCall('/admin/metrics');
      if (mRes) setMetrics(mRes);

      const oRes = await apiCall('/admin/all-orders');
      if (oRes && oRes.orders) setAllOrders(oRes.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if(!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      const res = await apiCall('/admin/update-order', {
        method: 'POST',
        body: JSON.stringify({ id: orderId, status: newStatus })
      });
      if (res && res.success) {
        alert("Status Updated");
        fetchData(); 
      } else {
        alert("Update Failed: " + (res?.error || "Unknown"));
      }
    } catch(e) { alert("Network Error"); }
  };

  if (loading && !metrics) return <div className="min-h-screen flex items-center justify-center text-[#009879]"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl"><Lock size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>Overview</button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'orders' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>Manage Orders</button>
        </div>
      </div>
      
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. SALES REVENUE */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><TrendingUp size={16} /> Sales Revenue</div>
                <div className="text-3xl font-bold text-[#009879]">GHS {(metrics?.revenue || 0).toFixed(2)}</div>
            </div>
            
            {/* 2. TOTAL DEPOSITS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Landmark size={16} /> Total Deposits</div>
                <div className="text-3xl font-bold text-blue-600">GHS {(metrics?.totalDeposits || 0).toFixed(2)}</div>
            </div>

            {/* 3. TOTAL USERS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Users size={16} /> Total Users</div>
                <div className="text-3xl font-bold text-slate-800">{metrics?.userCount || 0}</div>
            </div>

            {/* 4. TOTAL ORDERS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Activity size={16} /> Orders</div>
                <div className="text-3xl font-bold text-slate-800">{metrics?.totalOrders || 0}</div>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Recent Orders (Last 50)</h3>
                <button onClick={fetchData} className="p-2 text-slate-500 hover:bg-white rounded-full"><RefreshCw size={16} /></button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-3">Time</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Plan</th>
                            <th className="px-4 py-3">Phone</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allOrders.map(order => (
                            <tr key={order._id} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">{order.userId?.username || 'Unknown'}</td>
                                <td className="px-4 py-3">{order.dataPlan} ({order.network})</td>
                                <td className="px-4 py-3">{order.phoneNumber}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase 
                                        ${order.status === 'data_sent' ? 'bg-green-100 text-green-700' : 
                                          order.status === 'topup_successful' ? 'bg-blue-100 text-blue-700' :
                                          order.status === 'failed' || order.status === 'data_failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {order.status === 'topup_successful' ? 'Wallet Deposit' : order.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                    {order.status !== 'data_sent' && order.status !== 'data_failed' && order.status !== 'topup_successful' && (
                                        <>
                                            <Button size="sm" variant="success" onClick={() => handleStatusUpdate(order._id, 'data_sent')}>
                                                <Check size={14} /> Send
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order._id, 'data_failed')}>
                                                <X size={14} /> Fail
                                            </Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {allOrders.length === 0 && <div className="p-8 text-center text-slate-400">No orders found (or backend not updated).</div>}
            </div>
        </div>
      )}
    </div>
  );
};

const Purchase = ({ refreshUser }) => {
  const [plans, setPlans] = useState({ MTN: [], AirtelTigo: [], Telecel: [] });
  const [network, setNetwork] = useState('MTN');
  const [planId, setPlanId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiCall('/data-plans')
      .then(data => { if(data && data.plans) setPlans(data.plans); })
      .catch(err => console.log("Plan fetch error:", err));
  }, []);

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!planId || phone.length < 10) return;
    setLoading(true);
    setError('');
    
    try {
      const res = await apiCall('/purchase', {
        method: 'POST', 
        body: JSON.stringify({ network, planId, phone })
      });
      
      if (res && res.status === 'success') {
        alert("Order Successful!"); 
        setPhone(''); 
        refreshUser(); 
      } else {
        throw new Error(res?.message || "Transaction Failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentPlans = plans[network] || [];
  const selectedPlan = currentPlans.find(p => p.id === planId);

  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Buy Data Bundle</h2>
        
        {error && <div className="p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold">{error}</div>}

        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.keys(plans).length > 0 ? Object.keys(plans).map((net) => (
            <button key={net} onClick={() => { setNetwork(net); setPlanId(''); }} className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${network === net ? 'border-[#009879] bg-emerald-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <img src={NETWORK_LOGOS[net]} alt={net} className="h-12 w-auto object-contain" />
            </button>
          )) : <div className="col-span-3 text-center py-4 text-slate-400">Loading plans...</div>}
        </div>

        <form onSubmit={handleBuy} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-800" required>
              <option value="" disabled>Select a bundle...</option>
              {currentPlans.map(p => <option key={p.id} value={p.id}>{p.name} - GHS {p.price.toFixed(2)}</option>)}
            </select>
          </div>
          <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="054 123 4567" icon={Smartphone} />
          
          <Button fullWidth disabled={loading || !selectedPlan} onClick={handleBuy}>
            {loading ? <Loader2 className="animate-spin" /> : `Pay GHS ${selectedPlan?.price.toFixed(2) || '0.00'}`}
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- AUTH COMPONENT WITH STEALTH ADMIN ---
const Auth = ({ onLogin, mode, setMode }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [roleSelection, setRoleSelection] = useState('Client'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stealth Admin Mode
  const [stealthClicks, setStealthClicks] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleStealthClick = () => {
    if (stealthClicks + 1 >= 5) {
      setIsAdminMode(true);
      setStealthClicks(0);
      alert("Admin Portal Accessed");
    } else {
      setStealthClicks(prev => prev + 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // CLEAN DATA
    const cleanData = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password
    };
    
    if (mode === 'signup' && roleSelection === 'Agent') {
      handleAgentUpgrade(cleanData);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/login' : '/signup';
      const res = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      
      if (res) {
        // SECURITY CHECK FOR ADMIN LOGIN
        if (isAdminMode && res.role !== 'Admin') {
            await apiCall('/logout'); // Kick them out
            setError("Access Denied: You are not an Admin.");
        } else {
            onLogin();
        }
      }
    } catch (err) {
      if (err.message.includes('Critical Server Error')) {
        setError("Backend Crash: Please check your Render Logs. The server is not responding correctly.");
      } else if (err.message.includes('500') && mode === 'signup') {
        setError("Error: This Username or Email might already be taken.");
      } else {
        setError(err.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAgentUpgrade = async (cleanData) => {
    try {
      // Safety check: Ensure script loaded
      if (!window.PaystackPop) {
        alert("Payment System loading... Please wait 3 seconds and try again.");
        setLoading(false); // Reset loading state
        return;
      }

      const signupRes = await apiCall('/signup', {
        method: 'POST', body: JSON.stringify(cleanData)
      });
      if (!signupRes) throw new Error("Signup failed");
      
      await apiCall('/login', { 
        method: 'POST', body: JSON.stringify({ username: cleanData.username, password: cleanData.password }) 
      });

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: cleanData.email,
        amount: 1500, // 15 GHS
        currency: 'GHS',
        callback: async (response) => {
          const verifyRes = await apiCall('/upgrade-agent', {
            method: 'POST', body: JSON.stringify({ reference: response.reference })
          });
          if (verifyRes && verifyRes.success) {
            alert("Upgrade Successful! Welcome Agent.");
            onLogin();
          } else { 
            alert("Verification Failed."); 
            onLogin(); 
          }
        },
        onClose: () => {
          alert("Agent payment cancelled. Account created as Client.");
          onLogin();
        }
      });
      
      handler.openIframe();

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div 
             onClick={handleStealthClick}
             className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-200 cursor-default select-none ${isAdminMode ? 'bg-red-600' : 'bg-[#009879]'}`}
          >
            {isAdminMode ? <Lock size={32} /> : (mode === 'login' ? <User size={32} /> : <ShieldCheck size={32} />)}
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            {isAdminMode ? 'Admin Portal' : (mode === 'login' ? 'Welcome Back' : 'Join J3Cube')}
          </h1>
          <p className="text-slate-500 mt-2">
            {isAdminMode ? 'Restricted Access' : 'Premium Data Vending Platform'}
          </p>
        </div>

        {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-lg text-sm text-center font-bold">{error}</div>}

        {!isAdminMode && mode === 'signup' && (
          <div className="flex bg-slate-50 p-1 rounded-xl mb-6 border border-slate-200">
            <button type="button" onClick={() => setRoleSelection('Client')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Client' ? 'bg-white shadow text-[#009879]' : 'text-slate-500'}`}>
              Client (Free)
            </button>
            <button type="button" onClick={() => setRoleSelection('Agent')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Agent' ? 'bg-[#009879] text-white shadow' : 'text-slate-500'}`}>
              Agent (15 GHS)
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" />
          
          {/* Only show Email for signup OR Admin mode (Admin usually just needs username, but keeping consistency) */}
          {(mode === 'signup' && !isAdminMode) && <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />}
          
          <Input label="Password" isPassword value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          
          <Button fullWidth disabled={loading} variant={isAdminMode ? 'danger' : 'primary'}>
            {loading ? <Loader2 className="animate-spin" /> : (isAdminMode ? 'Authenticate Admin' : (mode === 'login' ? 'Log In' : (roleSelection === 'Agent' ? 'Pay 15 GHS & Register' : 'Register Free')))}
          </Button>
        </form>

        {!isAdminMode && (
          <p className="text-center mt-6 text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-[#009879] font-bold hover:underline">
              {mode === 'login' ? 'Register' : 'Log In'}
            </button>
          </p>
        )}
        
        {isAdminMode && (
            <p className="text-center mt-6 text-sm text-slate-400">
                <button onClick={() => { setIsAdminMode(false); setError(''); }} className="text-slate-500 hover:text-slate-700">
                    Return to User Login
                </button>
            </p>
        )}
      </div>
    </div>
  );
};

const TopUpModal = ({ isOpen, onClose, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fee = amount ? (parseFloat(amount) * 0.02) : 0;
  const totalCharge = amount ? (parseFloat(amount) + fee) : 0;

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || amount < 1) return;
    
    // Safety check: Ensure script loaded
    if (!window.PaystackPop) {
        alert("Payment System loading... Please wait 3 seconds and try again.");
        return;
    }
    
    setProcessing(true);
    
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: "user@example.com", 
      amount: Math.ceil(totalCharge * 100),
      currency: 'GHS',
      callback: (response) => {
        onConfirm(amount, response.reference); 
        setProcessing(false);
        setAmount('');
      },
      onClose: () => {
        alert("Transaction cancelled.");
        setProcessing(false);
      }
    });
    
    handler.openIframe();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fund Your Wallet">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Amount to Fund (GHS)</label>
          <input 
            type="number" 
            placeholder="e.g. 50.00" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009879] outline-none text-lg font-bold" 
          />
        </div>
        
        {amount > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm space-y-2">
                <div className="flex justify-between text-slate-600">
                    <span>Wallet Credit:</span> 
                    <span className="font-bold">GHS {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                    <span>Processing Fee (2%):</span> 
                    <span>+ GHS {fee.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-800">You Pay:</span>
                    <span className="font-bold text-lg text-[#009879]">GHS {totalCharge.toFixed(2)}</span>
                </div>
            </div>
        )}

        <Button fullWidth onClick={handleSubmit} disabled={processing || !amount || amount < 1}>
          {processing ? 'Connecting Paystack...' : `Pay GHS ${totalCharge.toFixed(2)}`}
        </Button>
      </div>
    </Modal>
  );
};

// --- MAIN APP ---

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [transactions, setTransactions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Initial Data Fetch & Scripts
  useEffect(() => { 
    // 1. Force Load Paystack Script
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    // 2. Set Favicon dynamically
    const link = document.querySelector("link[rel~='icon']");
    if (!link) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = FAVICON_URL;
      document.head.appendChild(newLink);
    } else {
      link.href = FAVICON_URL;
    }
    document.title = 'J3Cube';

    // 3. Check Session
    const init = async () => {
      try {
        const uRes = await apiCall('/user-info');
        if (uRes) {
          setUser(uRes);
          const oRes = await apiCall('/my-orders');
          if (oRes) setTransactions(oRes.orders || []);
          if (uRes.role === 'Admin') setView('admin');
          else setView('dashboard');
        }
      } catch (e) {
        console.log("Initialization error:", e);
      } finally {
        setInitLoading(false);
      }
    };
    init();

    return () => {
        if(document.body.contains(script)) document.body.removeChild(script);
    }
  }, []);

  const fetchData = async () => {
    try {
      const uRes = await apiCall('/user-info');
      if (uRes) setUser(uRes);
      const oRes = await apiCall('/my-orders');
      if (oRes) setTransactions(oRes.orders || []);
    } catch (e) { console.error(e); }
  };

  const handleLogout = async () => {
    try {
      await apiCall('/logout');
    } catch (e) {}
    setUser(null);
    setView('login');
  };

  const handleTopUpConfirm = async (amount, reference) => {
    try {
      const res = await apiCall('/verify-topup', {
          method: 'POST',
          body: JSON.stringify({ amount, reference })
      });
      
      if (res && res.success) {
          alert("Wallet Funded Successfully!");
          setShowTopUp(false);
          fetchData(); 
      } else {
          alert("Verification Failed: " + (res?.message || "Unknown error"));
      }
    } catch (e) {
      alert("Error verifying payment");
    }
  };

  if (initLoading) {
    return <div className="min-h-screen flex items-center justify-center text-[#009879]"><Loader2 className="animate-spin" size={40} /></div>;
  }

  if (!user) return (
    <>
      <style>{globalStyles}</style>
      <Auth onLogin={fetchData} mode={view === 'signup' ? 'signup' : 'login'} setMode={setView} />
    </>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
        
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b flex items-center gap-3">
            <div className="w-10 h-10 bg-[#009879] rounded-xl flex items-center justify-center text-white font-bold"><img src={FAVICON_URL} alt="J3Cube" className="h-8 w-8 object-contain" /></div>
            <div><h2 className="font-bold text-lg">J3Cube</h2><p className="text-xs text-slate-400">v2.0 Premium</p></div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            
            {/* --- MENU ITEMS --- */}
            <button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'dashboard' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={20}/> Dashboard</button>
            
            {/* --- ADMIN BUTTON (Only shows if role is Admin) --- */}
            {user.role === 'Admin' && (
              <button onClick={() => {setView('admin'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-red-600 hover:bg-red-50'}`}>
                <Lock size={20}/> Admin Panel
              </button>
            )}

            <button onClick={() => {setView('purchase'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'purchase' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Wifi size={20}/> Buy Data</button>
            <button onClick={() => {setView('history'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'history' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><History size={20}/> History</button>
          </div>
          <div className="p-4 border-t"><button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold p-2 hover:bg-red-50 w-full rounded-lg transition"><LogOut size={20} /> Sign Out</button></div>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative lg:ml-72">
          <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500"><Menu /></button>
            <div className="flex items-center gap-3 ml-auto">
              <div className="text-right hidden sm:block leading-tight">
                <p className="text-sm font-bold text-slate-700">{user.username}</p>
                <p className="text-[10px] uppercase font-bold text-[#009879]">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 text-[#009879] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">{user.username[0].toUpperCase()}</div>
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto w-full">
              {/* --- VIEW ROUTER --- */}
              {view === 'dashboard' && <Dashboard user={user} transactions={transactions} setView={setView} onTopUp={() => setShowTopUp(true)} />}
              {view === 'admin' && user.role === 'Admin' && <AdminDashboard />}
              {view === 'purchase' && <Purchase refreshUser={fetchData} />}
              {view === 'history' && <div className="bg-white rounded-2xl p-6 shadow-sm"><h2 className="font-bold mb-4">History</h2>{transactions.map(t => <div key={t._id} className="p-3 border-b flex justify-between last:border-0"><span>{t.dataPlan}</span><b>GHS {t.amount}</b></div>)}</div>}
            </div>
          </div>
        </main>

        <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} onConfirm={handleTopUpConfirm} />
      </div>
    </>
  );
}

import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  LayoutDashboard, Wifi, History, LogOut, Menu, X, Wallet, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, 
  Loader2, User, Eye, EyeOff, ShieldCheck, Box,
  TrendingUp, Users, CreditCard, Activity, Lock, Check, 
  AlertCircle, RefreshCw, Landmark, Palette
} from 'lucide-react';

// --- THEME CONFIGURATION ---
const THEMES = {
  light: {
    id: 'light',
    name: 'Light Mode',
    appBg: 'bg-slate-50',
    cardBg: 'bg-white',
    textMain: 'text-slate-800',
    textSub: 'text-slate-500',
    border: 'border-slate-200',
    inputBg: 'bg-slate-50',
    hover: 'hover:bg-slate-50',
    sidebar: 'bg-white border-r border-slate-200',
    activeNav: 'bg-[#009879] text-white shadow-md',
    inactiveNav: 'text-slate-500 hover:bg-slate-50',
    accent: 'text-[#009879]',
    accentBg: 'bg-[#009879]',
    successBadge: 'bg-green-100 text-green-700',
    failedBadge: 'bg-red-100 text-red-700'
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    appBg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    textMain: 'text-slate-100',
    textSub: 'text-slate-400',
    border: 'border-slate-800',
    inputBg: 'bg-slate-800',
    hover: 'hover:bg-slate-800',
    sidebar: 'bg-slate-900 border-r border-slate-800',
    activeNav: 'bg-[#009879] text-white shadow-md shadow-emerald-900/20',
    inactiveNav: 'text-slate-400 hover:bg-slate-800',
    accent: 'text-[#009879]',
    accentBg: 'bg-[#009879]',
    successBadge: 'bg-emerald-900/30 text-emerald-400 border border-emerald-800',
    failedBadge: 'bg-red-900/30 text-red-400 border border-red-800'
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Gradient',
    appBg: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950',
    cardBg: 'bg-slate-900/80 backdrop-blur-md',
    textMain: 'text-white',
    textSub: 'text-indigo-200',
    border: 'border-white/10',
    inputBg: 'bg-white/5',
    hover: 'hover:bg-white/10',
    sidebar: 'bg-slate-900/50 backdrop-blur-xl border-r border-white/10',
    activeNav: 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30',
    inactiveNav: 'text-indigo-200 hover:bg-white/10',
    accent: 'text-indigo-400',
    accentBg: 'bg-indigo-500',
    successBadge: 'bg-green-500/20 text-green-300 border border-green-500/30',
    failedBadge: 'bg-red-500/20 text-red-300 border border-red-500/30'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Gradient',
    appBg: 'bg-gradient-to-br from-orange-50 via-rose-50 to-amber-50',
    cardBg: 'bg-white/90 backdrop-blur-sm',
    textMain: 'text-slate-800',
    textSub: 'text-slate-600',
    border: 'border-orange-100',
    inputBg: 'bg-white/60',
    hover: 'hover:bg-orange-50',
    sidebar: 'bg-white/80 backdrop-blur-md border-r border-orange-100',
    activeNav: 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md',
    inactiveNav: 'text-slate-600 hover:bg-orange-50',
    accent: 'text-orange-600',
    accentBg: 'bg-orange-500',
    successBadge: 'bg-green-100 text-green-700',
    failedBadge: 'bg-red-100 text-red-700'
  }
};

const ThemeContext = createContext(null);

// --- Global Styles ---
const globalStyles = `
  html, body, #root {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
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
  const { theme } = useContext(ThemeContext);
  
  const base = `rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-3'}`;
  
  const variants = {
    primary: `${theme.accentBg} text-white hover:opacity-90 shadow-lg shadow-emerald-100/20`,
    outline: `border-2 ${theme.border} ${theme.textSub} hover:border-current hover:${theme.accent}`,
    dark: "bg-slate-800 text-white hover:bg-slate-900",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-500 text-white hover:bg-green-600"
  };
  
  if (theme.id === 'dark' || theme.id === 'midnight') {
      variants.outline = `border ${theme.border} ${theme.textMain} hover:bg-white/5`;
      variants.danger = "bg-red-600/80 text-white hover:bg-red-600";
  }

  return <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}>{children}</button>;
};

const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon, isPassword = false }) => {
  const { theme } = useContext(ThemeContext);
  const [show, setShow] = useState(false);
  
  return (
    <div className="mb-4">
      <label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={`absolute left-3 top-3.5 ${theme.textSub}`} size={18} />}
        <input 
          type={isPassword ? (show ? "text" : "password") : type} 
          value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 ${theme.inputBg} border ${theme.border} rounded-xl focus:ring-2 focus:ring-opacity-50 focus:ring-emerald-500 outline-none transition font-medium ${theme.textMain} placeholder:text-slate-400/50`}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className={`absolute right-3 top-3.5 ${theme.textSub} hover:${theme.textMain}`}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

const ThemePicker = ({ isOpen, onClose }) => {
  const { currentThemeId, setTheme } = useContext(ThemeContext);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h3>
          <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {Object.values(THEMES).map(t => (
            <button 
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                currentThemeId === t.id 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500' 
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-10 h-10 rounded-full shadow-sm flex-shrink-0 ${t.id === 'light' ? 'bg-white border border-slate-200' : t.id === 'dark' ? 'bg-slate-900' : t.id === 'midnight' ? 'bg-indigo-950' : 'bg-gradient-to-br from-orange-100 to-rose-100'}`}></div>
              <span className={`font-medium ${currentThemeId === t.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>{t.name}</span>
              {currentThemeId === t.id && <Check size={18} className="ml-auto text-emerald-500" />}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold">Done</button>
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

const Dashboard = ({ user, transactions, setView, onTopUp }) => {
  const { theme } = useContext(ThemeContext);
  return (
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
        <button onClick={() => setView('purchase')} className={`${theme.cardBg} p-5 rounded-2xl border ${theme.border} shadow-sm flex items-center gap-4 text-left hover:shadow-md transition group`}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#009879] flex items-center justify-center group-hover:scale-110 transition-transform"><Wifi size={28} /></div>
          <div><h3 className={`font-bold ${theme.textMain} text-lg`}>Buy Data</h3><p className={`${theme.textSub} text-sm`}>Instant Delivery</p></div>
          <ChevronRight className={`ml-auto ${theme.textSub} opacity-50`} />
        </button>
        <button className={`${theme.cardBg} p-5 rounded-2xl border ${theme.border} shadow-sm flex items-center gap-4 text-left opacity-70 cursor-not-allowed`}>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Smartphone size={28} /></div>
          <div><h3 className={`font-bold ${theme.textMain} text-lg`}>Airtime</h3><p className={`${theme.textSub} text-sm`}>Coming Soon</p></div>
        </button>
      </div>

      {/* Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-bold ${theme.textMain}`}>Recent Transactions</h3></div>
        <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
          {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
            <div key={tx._id} className={`p-4 border-b ${theme.border} flex items-center justify-between last:border-0`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'data_sent' ? theme.successBadge : theme.inputBg}`}>
                  {tx.status === 'data_sent' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div><p className={`font-bold ${theme.textMain} text-sm`}>{tx.dataPlan || 'Transaction'}</p><p className={`text-xs ${theme.textSub}`}>{new Date(tx.createdAt).toLocaleDateString()}</p></div>
              </div>
              <p className={`font-bold text-sm ${theme.textMain}`}>GHS {tx.amount?.toFixed(2)}</p>
            </div>
          )) : <div className={`p-8 text-center ${theme.textSub} text-sm`}>No recent transactions</div>}
        </div>
      </div>
    </div>
  );
};

const Purchase = ({ refreshUser }) => {
  const { theme } = useContext(ThemeContext);
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const currentPlans = plans[network] || [];
  const selectedPlan = currentPlans.find(p => p.id === planId);

  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className={`${theme.cardBg} p-6 md:p-8 rounded-3xl shadow-lg border ${theme.border}`}>
        <h2 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Buy Data Bundle</h2>
        {error && <div className={`p-3 mb-4 rounded-lg text-sm font-bold ${theme.failedBadge}`}>{error}</div>}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.keys(plans).length > 0 ? Object.keys(plans).map((net) => (
            <button key={net} onClick={() => { setNetwork(net); setPlanId(''); }} className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${network === net ? `border-current ${theme.accent} bg-opacity-10` : `${theme.border} hover:opacity-80`}`}>
              <img src={NETWORK_LOGOS[net]} alt={net} className="h-12 w-auto object-contain" />
            </button>
          )) : <div className={`col-span-3 text-center py-4 ${theme.textSub}`}>Loading plans...</div>}
        </div>
        <form onSubmit={handleBuy} className="space-y-5">
          <div>
            <label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Select Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={`w-full p-4 ${theme.inputBg} border ${theme.border} rounded-xl outline-none font-medium ${theme.textMain}`} required>
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

const AdminDashboard = () => {
  const { theme } = useContext(ThemeContext);
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if(!window.confirm(`Change status to ${newStatus}?`)) return;
    try {
      const res = await apiCall('/admin/update-order', { method: 'POST', body: JSON.stringify({ id: orderId, status: newStatus }) });
      if (res && res.success) { alert("Updated"); fetchData(); } else alert("Failed");
    } catch(e) { alert("Network Error"); }
  };

  if (loading && !metrics) return <div className="min-h-screen flex items-center justify-center text-[#009879]"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="p-3 bg-red-100 text-red-600 rounded-xl"><Lock size={24} /></div><h2 className={`text-2xl font-bold ${theme.textMain}`}>Admin Dashboard</h2></div>
        <div className={`${theme.cardBg} flex p-1 rounded-lg border ${theme.border}`}>
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'overview' ? `${theme.inputBg} ${theme.textMain}` : theme.textSub}`}>Overview</button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'orders' ? `${theme.inputBg} ${theme.textMain}` : theme.textSub}`}>Manage Orders</button>
        </div>
      </div>
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><TrendingUp size={16} /> Sales Revenue</div><div className="text-3xl font-bold text-[#009879]">GHS {(metrics?.revenue || 0).toFixed(2)}</div></div>
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><Landmark size={16} /> Total Deposits</div><div className="text-3xl font-bold text-blue-600">GHS {(metrics?.totalDeposits || 0).toFixed(2)}</div></div>
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><Users size={16} /> Total Users</div><div className={`text-3xl font-bold ${theme.textMain}`}>{metrics?.userCount || 0}</div></div>
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><Activity size={16} /> Orders</div><div className={`text-3xl font-bold ${theme.textMain}`}>{metrics?.totalOrders || 0}</div></div>
        </div>
      ) : (
        <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
            <div className={`p-4 border-b ${theme.border} flex justify-between items-center`}><h3 className={`font-bold ${theme.textMain}`}>Recent Orders</h3><button onClick={fetchData} className={`p-2 ${theme.textSub} hover:opacity-70 rounded-full`}><RefreshCw size={16} /></button></div>
            <div className="overflow-x-auto">
                <table className={`w-full text-sm text-left ${theme.textMain}`}>
                    <thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                    <tbody>
                        {allOrders.map(order => (
                            <tr key={order._id} className={`border-b ${theme.border} ${theme.hover}`}>
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">{order.userId?.username || 'Unknown'}</td>
                                <td className="px-4 py-3">{order.dataPlan}</td>
                                <td className="px-4 py-3">{order.phoneNumber}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'data_sent' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{order.status}</span></td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">{order.status !== 'data_sent' && order.status !== 'data_failed' && (<><Button size="sm" variant="success" onClick={() => handleStatusUpdate(order._id, 'data_sent')}><Check size={14} /></Button><Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order._id, 'data_failed')}><X size={14} /></Button></>)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

const Auth = ({ onLogin, mode, setMode }) => {
  const { theme } = useContext(ThemeContext);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [roleSelection, setRoleSelection] = useState('Client'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stealthClicks, setStealthClicks] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleStealthClick = () => {
    if (stealthClicks + 1 >= 5) { setIsAdminMode(true); setStealthClicks(0); alert("Admin Portal Accessed"); } else { setStealthClicks(prev => prev + 1); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    
    if (mode === 'signup' && !termsAccepted) {
        setError("You must agree to the Terms and Conditions to sign up.");
        setLoading(false);
        return;
    }

    const cleanData = { username: formData.username.trim(), email: formData.email.trim(), password: formData.password };
    if (mode === 'signup' && roleSelection === 'Agent') { handleAgentUpgrade(cleanData); return; }
    try {
      const endpoint = mode === 'login' ? '/login' : '/signup';
      const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(cleanData) });
      if (res) {
        if (isAdminMode && res.role !== 'Admin') { await apiCall('/logout'); setError("Access Denied"); } else { onLogin(); }
      }
    } catch (err) { setError(err.message || "Authentication failed"); } finally { setLoading(false); }
  };

  const handleAgentUpgrade = async (cleanData) => {
    try {
      if (!window.PaystackPop) { alert("Payment System loading..."); setLoading(false); return; }
      const signupRes = await apiCall('/signup', { method: 'POST', body: JSON.stringify(cleanData) });
      if (!signupRes) throw new Error("Signup failed");
      await apiCall('/login', { method: 'POST', body: JSON.stringify({ username: cleanData.username, password: cleanData.password }) });
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_KEY, email: cleanData.email, amount: 1500, currency: 'GHS',
        callback: async (response) => {
          const verifyRes = await apiCall('/upgrade-agent', { method: 'POST', body: JSON.stringify({ reference: response.reference }) });
          if (verifyRes && verifyRes.success) { alert("Upgrade Successful!"); onLogin(); } else { alert("Verification Failed."); onLogin(); }
        }, onClose: () => { alert("Cancelled."); onLogin(); }
      });
      handler.openIframe();
    } catch (err) { setError(err.message); setLoading(false); }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.appBg} p-4`}>
      <div className={`${theme.cardBg} w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border ${theme.border}`}>
        <div className="text-center mb-8">
          <div onClick={handleStealthClick} className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-200 cursor-default select-none ${isAdminMode ? 'bg-red-600' : 'bg-[#009879]'}`}>
            {isAdminMode ? <Lock size={32} /> : (mode === 'login' ? <User size={32} /> : <ShieldCheck size={32} />)}
          </div>
          <h1 className={`text-3xl font-bold ${theme.textMain}`}>{isAdminMode ? 'Admin Portal' : (mode === 'login' ? 'Welcome Back' : 'Join J3Cube')}</h1>
          <p className={`mt-2 ${theme.textSub}`}>
            {isAdminMode ? 'Restricted Access' : 'Premium Data Vending Platform'}
          </p>
        </div>
        {error && <div className={`p-3 mb-6 rounded-lg text-sm text-center font-bold ${theme.failedBadge}`}>{error}</div>}
        {!isAdminMode && mode === 'signup' && (
          <div className={`flex ${theme.inputBg} p-1 rounded-xl mb-6 border ${theme.border}`}>
            <button type="button" onClick={() => setRoleSelection('Client')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Client' ? `${theme.cardBg} shadow ${theme.accent}` : theme.textSub}`}>Client (Free)</button>
            <button type="button" onClick={() => setRoleSelection('Agent')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Agent' ? `${theme.accentBg} text-white shadow` : theme.textSub}`}>Agent (15 GHS)</button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" />
          {(mode === 'signup' && !isAdminMode) && <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />}
          <Input label="Password" isPassword value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          
          {mode === 'signup' && (
              <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 text-[#009879] rounded border-gray-300 focus:ring-[#009879]" />
                  <label htmlFor="terms" className={`text-xs ${theme.textSub} leading-tight`}>I agree to the <a href="#" className={`${theme.accent} underline`}>Terms and Conditions</a> and <a href="#" className={`${theme.accent} underline`}>Privacy Policy</a> of J3Cube.</label>
              </div>
          )}

          <Button fullWidth disabled={loading || (mode === 'signup' && !termsAccepted)} variant={isAdminMode ? 'danger' : 'primary'}>
            {loading ? <Loader2 className="animate-spin" /> : (isAdminMode ? 'Authenticate Admin' : (mode === 'login' ? 'Log In' : (roleSelection === 'Agent' ? 'Pay 15 GHS & Register' : 'Register Free')))}
          </Button>
        </form>
        {!isAdminMode && <p className={`text-center mt-6 text-sm ${theme.textSub}`}><button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setTermsAccepted(false); }} className={`${theme.accent} font-bold hover:underline`}>{mode === 'login' ? 'Register' : 'Log In'}</button></p>}
        {isAdminMode && <p className={`text-center mt-6 text-sm ${theme.textSub}`}><button onClick={() => { setIsAdminMode(false); setError(''); }} className="hover:opacity-80">Return to User Login</button></p>}
      </div>
    </div>
  );
};

const TopUpModal = ({ isOpen, onClose, onConfirm }) => {
  const { theme } = useContext(ThemeContext);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const fee = amount ? (parseFloat(amount) * 0.02) : 0;
  const totalCharge = amount ? (parseFloat(amount) + fee) : 0;

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || amount < 1) return;
    if (!window.PaystackPop) { alert("Payment System loading..."); return; }
    setProcessing(true);
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_KEY, email: "user@example.com", amount: Math.ceil(parseFloat(amount) * 1.02 * 100), currency: 'GHS',
      callback: (response) => { onConfirm(amount, response.reference); setProcessing(false); setAmount(''); },
      onClose: () => { alert("Transaction cancelled."); setProcessing(false); }
    });
    handler.openIframe();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`${theme.cardBg} rounded-3xl w-full max-w-sm p-6 border ${theme.border}`}>
        <h3 className={`text-xl font-bold mb-4 ${theme.textMain}`}>Fund Wallet</h3>
        <input type="number" placeholder="Amount (GHS)" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full border ${theme.border} p-3 rounded-xl mb-4 text-lg font-bold ${theme.inputBg} ${theme.textMain}`} />
        
        {amount > 0 && (
            <div className={`${theme.inputBg} p-4 rounded-xl border ${theme.border} text-sm space-y-2 mb-4`}>
                <div className={`flex justify-between ${theme.textSub}`}>
                    <span>Wallet Credit:</span> 
                    <span className="font-bold">GHS {parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className={`flex justify-between ${theme.textSub} text-xs`}>
                    <span>Processing Fee (2%):</span> 
                    <span>+ GHS {fee.toFixed(2)}</span>
                </div>
                <div className={`border-t ${theme.border} pt-2 flex justify-between items-center`}>
                    <span className={`font-bold ${theme.textMain}`}>You Pay:</span>
                    <span className={`font-bold text-lg ${theme.accent}`}>GHS {totalCharge.toFixed(2)}</span>
                </div>
            </div>
        )}

        <Button fullWidth onClick={handleSubmit} disabled={processing || !amount || amount < 1}>
          {processing ? 'Connecting...' : `Pay GHS ${totalCharge.toFixed(2)}`}
        </Button>
        <button onClick={onClose} className={`mt-4 text-sm ${theme.textSub} w-full`}>Cancel</button>
      </div>
    </div>
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
  const [showThemePicker, setShowThemePicker] = useState(false);

  // THEME STATE
  const [currentThemeId, setCurrentThemeId] = useState(localStorage.getItem('aj_theme') || 'light');

  // Initial Data Fetch & Scripts
  useEffect(() => { 
    localStorage.setItem('aj_theme', currentThemeId);
    const script = document.createElement('script'); script.src = "https://js.paystack.co/v1/inline.js"; script.async = true; document.body.appendChild(script);
    const link = document.querySelector("link[rel~='icon']"); if (!link) { const newLink = document.createElement('link'); newLink.rel = 'icon'; newLink.href = FAVICON_URL; document.head.appendChild(newLink); } else { link.href = FAVICON_URL; } document.title = 'J3Cube';

    const init = async () => {
      try {
        const uRes = await apiCall('/user-info');
        if (uRes) {
          setUser(uRes);
          const oRes = await apiCall('/my-orders');
          if (oRes) setTransactions(oRes.orders || []);
          if (uRes.role === 'Admin') setView('admin'); else setView('dashboard');
        }
      } catch (e) { console.log("Init:", e); } finally { setInitLoading(false); }
    };
    init();

    return () => { if(document.body.contains(script)) document.body.removeChild(script); }
  }, [currentThemeId]);

  const fetchData = async () => {
    try {
        const uRes = await apiCall('/user-info');
        if (uRes) setUser(uRes);
        const oRes = await apiCall('/my-orders');
        if (oRes) setTransactions(oRes.orders || []);
    } catch (e) {}
  };

  const handleLogout = async () => { try { await apiCall('/logout'); } catch (e) {} setUser(null); setView('login'); };
  const handleTopUpConfirm = async (amount, reference) => { try { const res = await apiCall('/verify-topup', { method: 'POST', body: JSON.stringify({ amount, reference }) }); if (res && res.success) { alert("Funded!"); setShowTopUp(false); fetchData(); } else alert("Failed"); } catch (e) { alert("Error"); } };

  // THEME CONTEXT VALUE
  const themeContextValue = {
    currentThemeId,
    theme: THEMES[currentThemeId],
    setTheme: setCurrentThemeId
  };
  
  const theme = THEMES[currentThemeId];

  if (initLoading) return <div className={`min-h-screen flex items-center justify-center ${theme.appBg} ${theme.accent}`}><Loader2 className="animate-spin" size={40} /></div>;

  if (!user) return (
    <ThemeContext.Provider value={themeContextValue}>
        <>
          <style>{globalStyles}</style>
          <Auth onLogin={fetchData} mode={view === 'signup' ? 'signup' : 'login'} setMode={setView} />
        </>
    </ThemeContext.Provider>
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <>
        <style>{globalStyles}</style>
        <div className={`flex h-screen ${theme.appBg} font-sans ${theme.textMain} overflow-hidden`}>
          {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className={`p-6 border-b ${theme.border} flex items-center gap-3`}>
              <div className="w-10 h-10 bg-[#009879] rounded-xl flex items-center justify-center text-white font-bold"><img src={FAVICON_URL} alt="J3Cube" className="h-8 w-8 object-contain" /></div>
              <div><h2 className="font-bold text-lg">J3Cube</h2><p className={`text-xs ${theme.textSub}`}>v2.0 Premium</p></div>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'dashboard' ? theme.activeNav : theme.inactiveNav}`}><LayoutDashboard size={20}/> Dashboard</button>
              {user.role === 'Admin' && <button onClick={() => {setView('admin'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'admin' ? 'bg-red-600 text-white shadow-md' : 'text-red-600 hover:bg-red-50/10'}`}><Lock size={20}/> Admin Panel</button>}
              <button onClick={() => {setView('purchase'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'purchase' ? theme.activeNav : theme.inactiveNav}`}><Wifi size={20}/> Buy Data</button>
              <button onClick={() => {setView('history'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'history' ? theme.activeNav : theme.inactiveNav}`}><History size={20}/> History</button>
              
              <div className={`pt-4 mt-4 border-t ${theme.border}`}>
                  <button onClick={() => setShowThemePicker(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${theme.inactiveNav}`}><Palette size={20}/> Appearance</button>
              </div>
            </div>
            <div className={`p-4 border-t ${theme.border}`}><button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold p-2 hover:bg-red-50/10 w-full rounded-lg transition"><LogOut size={20} /> Sign Out</button></div>
          </aside>
          <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative lg:ml-72">
            <header className={`h-16 ${theme.sidebar} flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0`}>
              <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 ${theme.textSub}`}><Menu /></button>
              <div className="flex items-center gap-3 ml-auto">
                <div className="text-right hidden sm:block leading-tight"><p className={`text-sm font-bold ${theme.textMain}`}>{user.username}</p><p className={`text-[10px] uppercase font-bold ${theme.accent}`}>{user.role}</p></div>
                <div className="w-10 h-10 bg-emerald-100 text-[#009879] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">{user.username[0].toUpperCase()}</div>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 lg:p-8">
              <div className="max-w-7xl mx-auto w-full">
                {view === 'dashboard' && <Dashboard user={user} transactions={transactions} setView={setView} onTopUp={() => setShowTopUp(true)} />}
                {view === 'admin' && user.role === 'Admin' && <AdminDashboard />}
                {view === 'purchase' && <Purchase refreshUser={fetchData} />}
                {view === 'history' && (
                  <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
                    <div className={`p-6 border-b ${theme.border}`}><h2 className={`text-xl font-bold ${theme.textMain}`}>Transaction History</h2></div>
                    <div className="overflow-x-auto"><table className={`w-full text-sm text-left ${theme.textMain}`}><thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Recipient</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Amount</th></tr></thead><tbody>{transactions.map(t => (<tr key={t._id} className={`border-b ${theme.border} ${theme.hover}`}><td className="px-6 py-4">{new Date(t.createdAt).toLocaleDateString()}</td><td className="px-6 py-4">{t.dataPlan}</td><td className="px-6 py-4">{t.phoneNumber}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'data_sent' ? theme.successBadge : `${theme.inputBg} ${theme.textSub}`}`}>{t.status}</span></td><td className="px-6 py-4 text-right font-bold">GHS {t.amount.toFixed(2)}</td></tr>))}</tbody></table></div>
                  </div>
                )}
              </div>
            </div>
          </main>
          <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} onConfirm={handleTopUpConfirm} />
          <ThemePicker isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />
        </div>
      </>
    </ThemeContext.Provider>
  );
}

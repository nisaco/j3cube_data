import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wifi, History, LogOut, Menu, X, Wallet, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, 
  Loader2, User, Eye, EyeOff, ShieldCheck, Box
} from 'lucide-react';

// --- Global Styles for 100% Full Screen ---
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

// --- API HELPER ---
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // MERGE options with defaults
  const fetchOptions = {
    ...options,
    // CRITICAL: This allows cookies (sessions) to be sent/received
    credentials: 'include', 
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401 silently (User just needs to log in)
    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server Error (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.message);
    throw error; // Re-throw so components can handle specific errors
  }
};

// --- SUB-COMPONENTS ---

const Button = ({ children, onClick, disabled = false, fullWidth = false, variant = 'primary' }) => {
  const base = "px-4 py-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-[#009879] text-white hover:bg-[#007a63] shadow-lg shadow-emerald-100",
    outline: "border-2 border-slate-200 text-slate-600 hover:border-[#009879] hover:text-[#009879]",
    dark: "bg-slate-800 text-white hover:bg-slate-900"
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
            {user.role === 'Agent' ? '⚡ AGENT' : '👤 CLIENT'}
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

const Purchase = ({ refreshUser }) => {
  const [plans, setPlans] = useState({ MTN: [], AirtelTigo: [], Telecel: [] });
  const [network, setNetwork] = useState('MTN');
  const [planId, setPlanId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch plans - Use .catch to prevent unhandled promise rejections
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
              <span className={`font-bold text-xs ${network === net ? 'text-[#009879]' : 'text-slate-500'}`}>{net}</span>
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

const Auth = ({ onLogin, mode, setMode }) => {
  // Use 'username' NOT 'name' to match backend schema
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [roleSelection, setRoleSelection] = useState('Client'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (mode === 'signup' && roleSelection === 'Agent') {
      handleAgentUpgrade();
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/login' : '/signup';
      const res = await apiCall(endpoint, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (res) {
        onLogin();
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAgentUpgrade = async () => {
    try {
      // 1. Signup
      const signupRes = await apiCall('/signup', {
        method: 'POST', body: JSON.stringify(formData)
      });
      if (!signupRes) throw new Error("Signup failed");
      
      // 2. Login to get session
      await apiCall('/login', { 
        method: 'POST', body: JSON.stringify({ username: formData.username, password: formData.password }) 
      });

      // 3. Paystack
      const handler = window.PaystackPop && window.PaystackPop.setup({
        key: PAYSTACK_KEY,
        email: formData.email,
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
            onLogin(); // Log in as client anyway
          }
        },
        onClose: () => {
          alert("Agent payment cancelled. Account created as Client.");
          onLogin();
        }
      });
      
      if(handler) handler.openIframe();
      else alert("Paystack SDK not loaded. Check internet.");

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#009879] rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-200">
            {mode === 'login' ? <User size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{mode === 'login' ? 'Welcome Back' : 'Join AJEnterprise'}</h1>
          <p className="text-slate-500 mt-2">Premium Data Vending Platform</p>
        </div>

        {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-lg text-sm text-center font-bold">{error}</div>}

        {mode === 'signup' && (
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
          {mode === 'signup' && <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="name@example.com" />}
          <Input label="Password" isPassword value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          
          <Button fullWidth disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Log In' : (roleSelection === 'Agent' ? 'Pay 15 GHS & Register' : 'Register Free'))}
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }} className="text-[#009879] font-bold hover:underline">
            {mode === 'login' ? 'Register' : 'Log In'}
          </button>
        </p>
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
    setProcessing(true);
    
    const handler = window.PaystackPop && window.PaystackPop.setup({
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
    
    if (handler) handler.openIframe();
    else {
      alert("Paystack SDK not loaded.");
      setProcessing(false);
    }
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

  // Initial Data Fetch
  useEffect(() => { 
    const init = async () => {
      try {
        // Try fetching user info. If 401, it returns null.
        const uRes = await apiCall('/user-info');
        if (uRes) {
          setUser(uRes);
          // Only fetch orders if we have a user
          const oRes = await apiCall('/my-orders');
          if (oRes) setTransactions(oRes.orders || []);
        }
      } catch (e) {
        console.log("Initialization error (likely network or CORS):", e);
      } finally {
        setInitLoading(false);
      }
    };
    init();
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
            <div className="w-10 h-10 bg-[#009879] rounded-xl flex items-center justify-center text-white font-bold"><Box size={24} /></div>
            <div><h2 className="font-bold text-lg">AJEnterprise</h2><p className="text-xs text-slate-400">v2.0 Premium</p></div>
          </div>
          <div className="flex-1 p-4 space-y-2">
            <button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'dashboard' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => {setView('purchase'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'purchase' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Wifi size={20}/> Buy Data</button>
            <button onClick={() => {setView('history'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${view === 'history' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><History size={20}/> History</button>
          </div>
          <div className="p-4 border-t"><button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold p-2 hover:bg-red-50 w-full rounded-lg transition"><LogOut size={20} /> Sign Out</button></div>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
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
              {view === 'dashboard' && <Dashboard user={user} transactions={transactions} setView={setView} onTopUp={() => setShowTopUp(true)} />}
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

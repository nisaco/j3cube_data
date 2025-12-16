import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Wifi, History, LogOut, Menu, X, Wallet, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, 
  Loader2, User, Eye, EyeOff, ShieldCheck, Box,
  TrendingUp, Users, CreditCard, Activity, Lock, Check, AlertCircle, RefreshCw, Landmark,
  Code, Terminal, Copy, Globe, FileJson, Server, BookOpen
} from 'lucide-react';

// --- Global Styles ---
const globalStyles = `
  html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; background-color: #f8fafc; overflow-x: hidden; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
  .hover-scale { transition: transform 0.2s ease; }
  .hover-scale:hover { transform: scale(1.02); }
  .btn-press:active { transform: scale(0.95); }
  
  /* Custom Scrollbar for Code Blocks */
  .code-scroll::-webkit-scrollbar { height: 8px; }
  .code-scroll::-webkit-scrollbar-track { background: #1e293b; }
  .code-scroll::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
`;

// --- CONFIGURATION ---
const API_BASE_URL = 'https://j3cube-data.onrender.com/api'; 
const PAYSTACK_KEY = "pk_live_62dc43eeea153c81c216b75e3967f8a44ee94fc3"; 
const FAVICON_URL = 'apple-touch-icon.png';
const NETWORK_LOGOS = { 'MTN': 'mtn_logo.png', 'AirtelTigo': 'at_logo.jpg', 'Telecel': 'telecel_logo.png' };

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } };
  try {
    const response = await fetch(url, fetchOptions);
    if (response.status === 401) return null;
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Server Error (${response.status})`);
        }
        throw new Error(`Critical Server Error (${response.status})`);
    }
    return contentType && contentType.includes("application/json") ? await response.json() : { success: true };
  } catch (error) { console.error(`API Error:`, error.message); throw error; }
};

// --- COMPONENTS ---
const Button = ({ children, onClick, disabled = false, fullWidth = false, variant = 'primary', size = 'default' }) => {
  const base = `rounded-xl font-bold transition-all btn-press flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-3'}`;
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
          value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#009879] outline-none transition font-medium text-slate-800`}
        />
        {isPassword && <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
      </div>
    </div>
  );
};

const CodeBlock = ({ label, code, language = "json" }) => {
    const copy = () => { navigator.clipboard.writeText(code); alert("Copied!"); };
    return (
        <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 my-4 shadow-lg">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                <span className="text-xs font-bold text-slate-400 uppercase">{label || language}</span>
                <button onClick={copy} className="text-slate-400 hover:text-white transition"><Copy size={14}/></button>
            </div>
            <div className="p-4 overflow-x-auto code-scroll">
                <pre className="text-xs md:text-sm font-mono text-emerald-400 whitespace-pre">{code}</pre>
            </div>
        </div>
    );
};

// --- VIEWS ---

const Dashboard = ({ user, transactions, setView, onTopUp }) => (
  <div className="space-y-6 animate-fade-in pb-20">
    <div className="bg-gradient-to-br from-[#009879] to-[#006d5b] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden hover-scale">
      <div className="relative z-10">
        <div className="flex justify-between items-start">
          <div><p className="text-emerald-100 font-medium mb-1 text-sm md:text-base">Wallet Balance</p><h1 className="text-3xl md:text-5xl font-bold tracking-tight">GHS {(user.walletBalance / 100).toFixed(2)}</h1></div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">{user.role}</div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 mt-8">
          <button onClick={onTopUp} className="bg-white text-[#009879] px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-sm"><Wallet size={18} /> Fund Wallet</button>
          <button onClick={() => setView('history')} className="bg-emerald-900/30 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-900/50 transition border border-white/20 backdrop-blur-md">View History</button>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button onClick={() => setView('purchase')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover-scale group">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#009879] flex items-center justify-center group-hover:scale-110 transition-transform"><Wifi size={28} /></div>
        <div><h3 className="font-bold text-slate-800 text-lg">Buy Data</h3><p className="text-slate-500 text-sm">Instant Delivery</p></div>
        <ChevronRight className="ml-auto text-slate-300" />
      </button>
      <button onClick={() => setView('console')} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 text-left hover-scale group">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Code size={28} /></div>
        <div><h3 className="font-bold text-slate-800 text-lg">Developer API</h3><p className="text-slate-500 text-sm">Connect your App</p></div>
        <ChevronRight className="ml-auto text-slate-300" />
      </button>
    </div>

    <div>
      <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3></div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
          <div key={tx._id} className="p-4 border-b border-slate-50 flex items-center justify-between last:border-0 hover:bg-slate-50 transition">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'data_sent' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {tx.status === 'data_sent' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
              </div>
              <div><p className="font-bold text-slate-700 text-sm">{tx.dataPlan || 'Transaction'}</p><p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString()}</p></div>
            </div>
            <div className="text-right">
                <p className="font-bold text-sm text-slate-800">GHS {tx.amount?.toFixed(2)}</p>
                <p className={`text-[10px] uppercase font-bold ${tx.status === 'data_sent' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {tx.status === 'data_sent' ? 'Completed' : (tx.status === 'pending_review' ? 'Processing' : tx.status)}
                </p>
            </div>
          </div>
        )) : <div className="p-8 text-center text-slate-400 text-sm">No recent transactions</div>}
      </div>
    </div>
  </div>
);

// ✅ NEW: PROFESSIONAL DEVELOPER CONSOLE
const DeveloperConsole = ({ user }) => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, endpoints, errors

  useEffect(() => { apiCall('/get-key').then(res => { if(res && res.apiKey) setApiKey(res.apiKey); }); }, []);

  const generateKey = async () => {
    if(!window.confirm("Generating a new key will stop your old one. Continue?")) return;
    setLoading(true);
    try {
      const res = await apiCall('/generate-key', { method: 'POST' });
      if(res && res.success) setApiKey(res.apiKey);
    } catch(e) { alert(e.message); } finally { setLoading(false); }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(apiKey); alert("API Key Copied!"); };

  const phpCode = `
$curl = curl_init();
curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://j3cube-data.onrender.com/api/v1/purchase',
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_POSTFIELDS =>'{
    "network": "MTN",
    "planId": "1GB",
    "phone": "054xxxxxxx",
    "reference": "REF-${Math.floor(Math.random()*10000)}"
  }',
  CURLOPT_HTTPHEADER => array(
    'Content-Type: application/json',
    'x-api-key: YOUR_API_KEY'
  ),
));
$response = curl_exec($curl);
curl_close($curl);
echo $response;`;

  const nodeCode = `
const axios = require('axios');
const data = JSON.stringify({
  "network": "MTN",
  "planId": "1GB",
  "phone": "054xxxxxxx",
  "reference": "unique_ref_123"
});

const config = {
  method: 'post',
  url: 'https://j3cube-data.onrender.com/api/v1/purchase',
  headers: { 
    'Content-Type': 'application/json', 
    'x-api-key': 'YOUR_API_KEY'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});`;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* HEADER CARD */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Terminal className="text-green-400" /> Developer Console</h1>
            <p className="text-slate-400 mb-6">Build your own data business using our robust API.</p>
            
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="overflow-hidden w-full">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1">Your Live API Key</p>
                    <code className="text-green-400 font-mono text-lg block truncate bg-slate-900/50 p-2 rounded border border-slate-700">
                        {apiKey || "No API Key Generated"}
                    </code>
                </div>
                <div className="flex gap-2 shrink-0 w-full md:w-auto">
                    {apiKey && <button onClick={copyToClipboard} className="flex-1 md:flex-none p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-slate-300 flex justify-center"><Copy size={20} /></button>}
                    <button onClick={generateKey} disabled={loading} className="flex-1 md:flex-none p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-bold text-sm px-6">
                        {loading ? 'Generating...' : (apiKey ? 'Regenerate Key' : 'Generate Key')}
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* DOCUMENTATION TABS */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
            <button onClick={()=>setActiveTab('overview')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition ${activeTab === 'overview' ? 'border-[#009879] text-[#009879]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Overview & Auth</button>
            <button onClick={()=>setActiveTab('endpoints')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition ${activeTab === 'endpoints' ? 'border-[#009879] text-[#009879]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Endpoints</button>
            <button onClick={()=>setActiveTab('errors')} className={`flex-1 py-4 text-sm font-bold border-b-2 transition ${activeTab === 'errors' ? 'border-[#009879] text-[#009879]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>Errors & Codes</button>
        </div>

        <div className="p-6 md:p-8">
            {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Authentication</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                            All API requests must be authenticated using your unique API Key. 
                            Pass this key in the request header <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono">x-api-key</code>.
                        </p>
                        <CodeBlock label="Header Example" code={`Authorization: Bearer YOUR_API_KEY\n-- OR --\nx-api-key: YOUR_API_KEY`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Base URL</h3>
                        <p className="text-slate-500 text-sm mb-2">All requests should be made to:</p>
                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 font-mono text-sm text-slate-600">
                            https://j3cube-data.onrender.com/api/v1
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'endpoints' && (
                <div className="space-y-10 animate-fade-in">
                    {/* BALANCE ENDPOINT */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold text-xs">GET</span>
                            <h3 className="text-lg font-bold text-slate-800">/balance</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Retrieve your current wallet balance.</p>
                        <CodeBlock label="Response Example" code={`{\n  "success": true,\n  "balance": 450.00,\n  "currency": "GHS",\n  "role": "Agent"\n}`} />
                    </div>

                    <hr className="border-slate-100" />

                    {/* PURCHASE ENDPOINT */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold text-xs">POST</span>
                            <h3 className="text-lg font-bold text-slate-800">/purchase</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">Purchase a data bundle for a specific number.</p>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">Body Parameters</h4>
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead><tr className="border-b"><th className="py-2">Field</th><th className="py-2">Type</th><th className="py-2">Description</th></tr></thead>
                                    <tbody className="text-slate-600">
                                        <tr className="border-b"><td className="py-2 font-mono text-indigo-600">network</td><td>String</td><td>See Network Codes below</td></tr>
                                        <tr className="border-b"><td className="py-2 font-mono text-indigo-600">planId</td><td>String</td><td>e.g. "1GB", "2GB"</td></tr>
                                        <tr className="border-b"><td className="py-2 font-mono text-indigo-600">phone</td><td>String</td><td>Recipient number (054...)</td></tr>
                                        <tr className="border-b"><td className="py-2 font-mono text-indigo-600">reference</td><td>String</td><td>Unique ID for tracking</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* ✅ NEW: ACCEPTED VALUES TABLE */}
                            <div>
                                <h4 className="font-bold text-sm text-slate-700 mb-2">Accepted Network Codes</h4>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                                  <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-500 font-bold uppercase text-xs">
                                      <tr><th className="px-4 py-2">Network Name</th><th className="px-4 py-2">Code to Send</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      <tr><td className="px-4 py-2">MTN</td><td className="px-4 py-2 font-mono text-indigo-600">"MTN"</td></tr>
                                      <tr><td className="px-4 py-2">AirtelTigo</td><td className="px-4 py-2 font-mono text-indigo-600">"AirtelTigo"</td></tr>
                                      <tr><td className="px-4 py-2">Telecel</td><td className="px-4 py-2 font-mono text-indigo-600">"Telecel"</td></tr>
                                    </tbody>
                                  </table>
                                </div>
                                <div className="mt-4 text-xs text-slate-500">
                                    <p className="mb-2"><strong>Phone Numbers:</strong> Must be 10 digits starting with '0' (e.g. 0541234567)</p>
                                    <p><strong>Plan IDs:</strong> Format as capacity + GB (e.g., "1GB", "2GB", "10GB")</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-bold text-sm text-slate-700 mb-2">Code Examples</h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <CodeBlock language="PHP (cURL)" label="PHP Integration" code={phpCode} />
                                <CodeBlock language="Node.js" label="Node.js Integration" code={nodeCode} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'errors' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-slate-800">Status Codes</h3>
                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Meaning</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr><td className="px-4 py-3 font-mono font-bold text-green-600">200</td><td className="px-4 py-3">Request Successful. Order placed.</td></tr>
                                <tr><td className="px-4 py-3 font-mono font-bold text-red-500">400</td><td className="px-4 py-3">Bad Request. Missing fields or Invalid Phone (must start with 0).</td></tr>
                                <tr><td className="px-4 py-3 font-mono font-bold text-red-500">401</td><td className="px-4 py-3">Unauthorized. Invalid or missing API Key.</td></tr>
                                <tr><td className="px-4 py-3 font-mono font-bold text-red-500">402</td><td className="px-4 py-3">Insufficient Balance. Fund your wallet.</td></tr>
                                <tr><td className="px-4 py-3 font-mono font-bold text-red-500">409</td><td className="px-4 py-3">Duplicate Reference. You already used this ID.</td></tr>
                                <tr><td className="px-4 py-3 font-mono font-bold text-red-500">500</td><td className="px-4 py-3">Server Error. Please contact support.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </div>
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
        alert("Order Successful! Processing..."); 
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
    <div className="max-w-xl mx-auto animate-in fade-in duration-500 pb-20">
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
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if(!window.confirm(`Force Change Status to: ${newStatus}?`)) return;
    try {
      const res = await apiCall('/admin/update-order', { method: 'POST', body: JSON.stringify({ id: orderId, status: newStatus }) });
      if (res && res.success) { alert("Status Updated Successfully!"); fetchData(); } else { alert("Update Failed: " + (res?.error || "Unknown")); }
    } catch(e) { alert("Network Error"); }
  };
  if (loading && !metrics) return <div className="min-h-screen flex items-center justify-center text-[#009879]"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="p-3 bg-red-100 text-red-600 rounded-xl"><Lock size={24} /></div><h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2></div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'overview' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>Overview</button>
            <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'orders' ? 'bg-slate-100 text-slate-900' : 'text-slate-500'}`}>Manage Orders</button>
        </div>
      </div>
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><TrendingUp size={16} /> Sales Revenue</div><div className="text-3xl font-bold text-[#009879]">GHS {(metrics?.revenue || 0).toFixed(2)}</div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Landmark size={16} /> Total Deposits</div><div className="text-3xl font-bold text-blue-600">GHS {(metrics?.totalDeposits || 0).toFixed(2)}</div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Users size={16} /> Total Users</div><div className="text-3xl font-bold text-slate-800">{metrics?.userCount || 0}</div></div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"><div className="flex items-center gap-3 mb-2 text-slate-500 text-sm font-bold uppercase"><Activity size={16} /> Orders</div><div className="text-3xl font-bold text-slate-800">{metrics?.totalOrders || 0}</div></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700">Recent Orders (Last 50)</h3><button onClick={fetchData} className="p-2 text-slate-500 hover:bg-white rounded-full"><RefreshCw size={16} /></button></div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b"><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                    <tbody>
                        {allOrders.map(order => (
                            <tr key={order._id} className="border-b hover:bg-slate-50">
                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-4 py-3 font-medium">{order.userId?.username || 'Unknown'}</td>
                                <td className="px-4 py-3">{order.dataPlan} ({order.network})</td>
                                <td className="px-4 py-3">{order.phoneNumber}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'data_sent' ? 'bg-green-100 text-green-700' : order.status === 'topup_successful' ? 'bg-blue-100 text-blue-700' : order.status === 'failed' || order.status === 'data_failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.status === 'data_sent' ? 'Completed' : (order.status === 'pending_review' ? 'Processing' : order.status)}
                                </span></td>
                                <td className="px-4 py-3 text-right flex justify-end gap-2">
                                  {/* ✅ UNLOCKED BUTTONS: Always Visible */}
                                  <Button size="sm" variant="success" onClick={() => handleStatusUpdate(order._id, 'data_sent')}><Check size={14} /> Send</Button>
                                  <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order._id, 'data_failed')}><X size={14} /> Fail</Button>
                                </td>
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
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stealthClicks, setStealthClicks] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await apiCall(mode === 'login' ? '/login' : '/signup', { method: 'POST', body: JSON.stringify(formData) });
      if (res) { if (isAdminMode && res.role !== 'Admin') { setError("Access Denied"); } else { onLogin(); } }
    } catch (err) { setError(err.message || "Authentication failed"); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl hover-scale">
        <div className="text-center mb-8">
          <div onClick={() => { if(stealthClicks+1>=5) { setIsAdminMode(true); setStealthClicks(0); } else { setStealthClicks(p=>p+1); } }} 
             className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg cursor-pointer ${isAdminMode ? 'bg-red-600' : 'bg-[#009879]'}`}>
            {isAdminMode ? <Lock size={32} /> : <User size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-slate-800">{isAdminMode ? 'Admin Portal' : (mode === 'login' ? 'Welcome Back' : 'Join J3Cube')}</h1>
        </div>
        {error && <div className="p-3 mb-6 bg-red-50 text-red-600 rounded-lg text-sm text-center font-bold">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Username" />
          {(mode === 'signup' && !isAdminMode) && <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email" />}
          <Input label="Password" isPassword value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          <Button fullWidth disabled={loading} variant={isAdminMode ? 'danger' : 'primary'}>{loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? 'Log In' : 'Register Free')}</Button>
        </form>
        {!isAdminMode && <p className="text-center mt-6 text-sm text-slate-500">{mode === 'login' ? "New here? " : "Has account? "} <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[#009879] font-bold hover:underline">{mode === 'login' ? 'Register' : 'Log In'}</button></p>}
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

  useEffect(() => { 
    const script = document.createElement('script'); script.src = "https://js.paystack.co/v1/inline.js"; script.async = true; document.body.appendChild(script);
    const link = document.querySelector("link[rel~='icon']") || document.createElement('link'); link.rel = 'icon'; link.href = FAVICON_URL; document.head.appendChild(link);
    const init = async () => {
      try { const uRes = await apiCall('/user-info'); if (uRes) { setUser(uRes); const oRes = await apiCall('/my-orders'); setTransactions(oRes?.orders || []); setView('dashboard'); } } catch (e) {} finally { setInitLoading(false); }
    };
    init();
  }, []);

  const fetchData = async () => { try { const uRes = await apiCall('/user-info'); if (uRes) setUser(uRes); const oRes = await apiCall('/my-orders'); if (oRes) setTransactions(oRes.orders || []); } catch (e) { console.error(e); } };
  const handleLogout = async () => { try { await apiCall('/logout'); } catch (e) {} setUser(null); setView('login'); };

  const handleTopUpConfirm = async (amount, reference) => {
    try { const res = await apiCall('/verify-topup', { method: 'POST', body: JSON.stringify({ amount, reference }) }); 
    if (res && res.success) { alert("Wallet Funded!"); setShowTopUp(false); fetchData(); } else { alert("Verification Failed"); } } catch (e) { alert("Error"); }
  };
  
  const TopUpModal = ({ isOpen, onClose }) => {
    const [amount, setAmount] = useState('');
    const fee = amount ? (parseFloat(amount) * 0.02) : 0;
    const total = amount ? (parseFloat(amount) + fee) : 0;
    const pay = () => {
        if(!window.PaystackPop) return alert("Loading payment...");
        const handler = window.PaystackPop.setup({ key: PAYSTACK_KEY, email: user.email, amount: Math.ceil(total*100), currency: 'GHS', callback: (res) => handleTopUpConfirm(amount, res.reference) });
        handler.openIframe();
    };
    if(!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-6 rounded-3xl w-80 shadow-2xl">
                <h3 className="font-bold mb-4">Fund Wallet</h3>
                <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount (GHS)" className="w-full p-3 border rounded-xl mb-4 font-bold text-lg"/>
                <p className="text-xs text-slate-500 mb-4 flex justify-between"><span>Fee (2%):</span><span>{fee.toFixed(2)}</span></p>
                <div className="flex gap-2"><Button fullWidth onClick={pay} disabled={!amount}>Pay {total.toFixed(2)}</Button><Button fullWidth variant="outline" onClick={onClose}>Cancel</Button></div>
            </div>
        </div>
    );
  };

  if (initLoading) return <div className="min-h-screen flex items-center justify-center text-[#009879]"><Loader2 className="animate-spin" size={40} /></div>;
  if (!user) return <><style>{globalStyles}</style><Auth onLogin={fetchData} mode={view === 'signup' ? 'signup' : 'login'} setMode={setView} /></>;

  return (
    <>
      <style>{globalStyles}</style>
      <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-6 border-b flex items-center gap-3"><div className="w-10 h-10 bg-[#009879] rounded-xl flex items-center justify-center text-white font-bold text-xl">J3</div><div><h2 className="font-bold text-lg">J3Cube</h2><p className="text-xs text-slate-400">Pro Console</p></div></div>
          <div className="flex-1 p-4 space-y-2">
            <button onClick={() => {setView('dashboard'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition hover-scale ${view === 'dashboard' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><LayoutDashboard size={20}/> Dashboard</button>
            <button onClick={() => {setView('purchase'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition hover-scale ${view === 'purchase' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Wifi size={20}/> Buy Data</button>
            <button onClick={() => {setView('console'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition hover-scale ${view === 'console' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><Code size={20}/> Developer API</button>
            <button onClick={() => {setView('history'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition hover-scale ${view === 'history' ? 'bg-[#009879] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}><History size={20}/> History</button>
            {user.role === 'Admin' && <button onClick={() => {setView('admin'); setSidebarOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50`}><Lock size={20}/> Admin Panel</button>}
          </div>
          <div className="p-4 border-t"><button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-bold p-2 hover:bg-red-50 w-full rounded-lg transition"><LogOut size={20} /> Sign Out</button></div>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative lg:ml-72">
          <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500"><Menu /></button>
            <div className="flex items-center gap-3 ml-auto"><div className="w-10 h-10 bg-emerald-100 text-[#009879] rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">{user.username[0].toUpperCase()}</div></div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
            <div className="max-w-7xl mx-auto w-full">
              {view === 'dashboard' && <Dashboard user={user} transactions={transactions} setView={setView} onTopUp={() => setShowTopUp(true)} />}
              {view === 'console' && <DeveloperConsole user={user} />}
              {view === 'admin' && user.role === 'Admin' && <AdminDashboard />}
              {view === 'purchase' && <Purchase refreshUser={fetchData} />}
              {view === 'history' && <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-in"><h2 className="font-bold mb-4">History</h2>{transactions.map(t => <div key={t._id} className="p-3 border-b flex justify-between last:border-0"><span>{t.dataPlan}</span><b>GHS {t.amount}</b></div>)}</div>}
            </div>
          </div>
        </main>
        <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
      </div>
    </>
  );
}

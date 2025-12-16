import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { 
  LayoutDashboard, Wifi, History, LogOut, Menu, X, Wallet, 
  ChevronRight, ArrowUpRight, ArrowDownLeft, Smartphone, 
  Loader2, User, Eye, EyeOff, ShieldCheck, Box,
  TrendingUp, Users, CreditCard, Activity, Lock, Check, 
  AlertCircle, RefreshCw, Landmark, Palette, Store, Share2, DollarSign, CheckCircle, Download, Mail, PlusCircle,
  Moon, Sun, CheckSquare, HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, Reply, Phone, FileText, Settings as SettingsIcon, Copy, Search, Calendar
} from 'lucide-react';

// --- THEME CONFIGURATION ---
const DEFAULT_COLOR = '#009879'; 
const PRESET_COLORS = [
  { name: 'Emerald', value: '#009879' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Cyan', value: '#0891b2' },
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Black', value: '#0f172a' },
];

const ThemeContext = createContext(null);
const globalStyles = `html, body, #root { height: 100%; width: 100%; margin: 0; padding: 0; overflow-x: hidden; } .no-scrollbar::-webkit-scrollbar { display: none; }`;

// --- CONFIGURATION ---
const API_BASE_URL = 'https://ajenterprise-datastore.onrender.com/api'; 
const PAYSTACK_KEY = "pk_live_3be2ebebc6edd6fa9f5f9a7303c80a55ee9e0be1"; 
const NETWORK_LOGOS = { 'MTN': 'mtn_logo.png', 'AirtelTigo': 'at_logo.png', 'Telecel': 'telecel_logo.png' };

const FAQS = [
    { q: "How long does data delivery take?", a: "Data is sent instantly via our automated system. In rare cases of network congestion, it may take up to 5 minutes." },
    { q: "My transaction failed but money was deducted?", a: "Do not panic. If the system fails to deliver data, your wallet is automatically refunded instantly. Please check your Wallet Balance." },
    { q: "How do I fund my wallet?", a: "Click the 'Fund Wallet' button on the dashboard. You can pay via Mobile Money or Card. The funds are added immediately after payment." },
    { q: "Can I resell data?", a: "Yes! Upgrade to an 'Agent' account for 30 GHS. You will get access to wholesale prices and can set your own selling prices." },
];

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const fetchOptions = { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...options.headers } };
  try {
    const response = await fetch(url, fetchOptions);
    if (response.status === 401) return null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) return await response.json();
    return { success: true }; 
  } catch (error) { console.error(error); throw error; }
};

// --- HELPER HOOKS ---
const usePreventLeave = (isProcessing) => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isProcessing) { e.preventDefault(); e.returnValue = "Transaction in progress. Are you sure you want to leave?"; return e.returnValue; }
    };
    if (isProcessing) { window.addEventListener('beforeunload', handleBeforeUnload); }
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessing]);
};

// --- HELPER: Time Ago ---
const timeAgo = (date) => {
    if (!date) return 'Never';
    try {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "Just now";
    } catch (e) { return 'Unknown'; }
};

// ✅ HELPER: Safe Date Format (Prevents Blank Page Crash)
const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', { 
            day: 'numeric', month: 'short', 
            hour: 'numeric', minute: 'numeric', hour12: true 
        });
    } catch (e) { return 'N/A'; }
};

// --- THEME GENERATOR ---
const generateTheme = (mode, accentColor) => {
  const isDark = mode === 'dark';
  return {
    mode, accentColor,
    appBg: isDark ? 'bg-slate-950' : 'bg-slate-50', cardBg: isDark ? 'bg-slate-900' : 'bg-white',
    textMain: isDark ? 'text-slate-100' : 'text-slate-800', textSub: isDark ? 'text-slate-400' : 'text-slate-500',
    border: isDark ? 'border-slate-800' : 'border-slate-200', inputBg: isDark ? 'bg-slate-800' : 'bg-slate-50',
    hover: isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50', sidebar: isDark ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200',
    inactiveNav: isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50',
    successBadge: 'bg-green-100 text-green-700', failedBadge: 'bg-red-100 text-red-700'
  };
};

// --- HELPERS FOR CARDS ---
const SourceBadge = ({ method, theme }) => {
    const isApi = method === 'api_wallet';
    const bgClass = isApi ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : `${theme.inputBg} ${theme.textSub}`;
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${theme.border} ${bgClass}`}>{isApi ? 'API' : 'WEB'}</span>;
};

const StatusBadge = ({ status }) => {
    let colorClass = 'bg-gray-100 text-gray-600'; let label = status;
    if (status === 'data_sent' || status === 'success') { colorClass = 'bg-green-100 text-green-700'; label = 'Completed'; }
    else if (status === 'pending_review' || status === 'processing') { colorClass = 'bg-yellow-100 text-yellow-700'; label = 'Processing'; }
    else if (status === 'data_failed' || status === 'failed') { colorClass = 'bg-red-100 text-red-700'; label = 'Failed'; }
    else if (status === 'topup_successful') { colorClass = 'bg-blue-100 text-blue-700'; label = 'Deposit'; }
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${colorClass}`}>{label}</span>;
};

// ✅ NEW: TICKET STYLE CARD (Integrated with Main App Theme)
const TransactionCard = ({ tx }) => {
    const { theme } = useContext(ThemeContext);
    const isDeposit = tx.status === 'topup_successful';
    
    // Network Colors
    let netColor = 'bg-slate-300';
    const planUpper = (tx.dataPlan || '').toUpperCase();
    const netUpper = (tx.network || '').toUpperCase();
    if (netUpper.includes('MTN') || planUpper.includes('MTN')) netColor = 'bg-yellow-400';
    if (netUpper.includes('TELECEL') || planUpper.includes('TELECEL')) netColor = 'bg-red-500';
    if (netUpper.includes('AIRTEL') || planUpper.includes('AIRTEL')) netColor = 'bg-blue-600';
    if (isDeposit) netColor = 'bg-emerald-500';

    // Safe Date Parsing
    let dateStr = 'N/A', timeStr = '';
    try {
        const dateObj = new Date(tx.createdAt);
        dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch(e) {}

    return (
      <div className={`${theme.cardBg} rounded-2xl shadow-sm border ${theme.border} relative overflow-hidden hover:scale-[1.01] transition-transform mb-3`}>
        {/* Color Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${netColor}`}></div>
        
        <div className="p-4 pl-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className={`font-bold ${theme.textMain} text-lg flex items-center gap-2`}>
                        {isDeposit ? 'Wallet Deposit' : (tx.network || 'Data Bundle')}
                        {!isDeposit && <span className={`text-xs font-normal ${theme.textSub} px-1.5 py-0.5 ${theme.inputBg} rounded border ${theme.border}`}>{tx.dataPlan}</span>}
                    </h4>
                    <p className={`text-[10px] ${theme.textSub} font-mono mt-0.5 opacity-70`}>ID: {tx.reference}</p>
                </div>
                <div className="text-right">
                    <p className={`font-bold text-xl ${isDeposit ? 'text-blue-500' : theme.textMain}`}>
                        {isDeposit ? '+' : '-'}GHS {tx.amount?.toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Details Grid */}
            {!isDeposit && (
                <div className={`grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-4 border-t ${theme.border} pt-3`}>
                    <div>
                        <p className={`text-xs ${theme.textSub} mb-0.5 flex items-center gap-1 opacity-70`}><Smartphone size={12}/> Phone Number</p>
                        <p className={`font-mono font-medium ${theme.textMain} tracking-wide`}>{tx.phoneNumber}</p>
                    </div>
                    <div className="text-right">
                        <p className={`text-xs ${theme.textSub} mb-0.5 flex items-center justify-end gap-1 opacity-70`}><Calendar size={12}/> Date & Time</p>
                        <p className={`font-medium ${theme.textMain}`}>{dateStr} <span className="text-[10px] opacity-70">{timeStr}</span></p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className={`flex justify-between items-center ${isDeposit ? 'mt-1' : 'pt-1'}`}>
                <StatusBadge status={tx.status} />
                <SourceBadge method={tx.paymentMethod} theme={theme} />
            </div>
        </div>
      </div>
    );
};

// --- COMPONENTS ---
const Button = ({ children, onClick, disabled = false, fullWidth = false, variant = 'primary', size = 'default' }) => {
  const { theme } = useContext(ThemeContext);
  const base = `rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-3'}`;
  const primaryStyle = variant === 'primary' ? { backgroundColor: theme.accentColor, color: 'white', boxShadow: `0 4px 14px 0 ${theme.accentColor}40` } : {};
  const variants = { primary: `hover:opacity-90`, outline: `border-2 ${theme.border} ${theme.textSub} hover:border-current`, dark: "bg-slate-800 text-white hover:bg-slate-900", danger: "bg-red-500 text-white hover:bg-red-600", success: "bg-green-500 text-white hover:bg-green-600" };
  return <button onClick={onClick} disabled={disabled} style={variant === 'primary' ? primaryStyle : {}} className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}>{children}</button>;
};

const Input = ({ label, type = "text", value, onChange, placeholder, icon: Icon, isPassword = false, isTextArea = false }) => {
  const { theme } = useContext(ThemeContext);
  const [show, setShow] = useState(false);
  return (
    <div className="mb-4">
      <label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>{label}</label>
      <div className="relative">
        {Icon && <Icon className={`absolute left-3 top-3.5 ${theme.textSub}`} size={18} />}
        {isTextArea ? (
             <textarea value={value} onChange={onChange} placeholder={placeholder} rows={4} className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 ${theme.inputBg} border ${theme.border} rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition font-medium ${theme.textMain} placeholder:text-slate-400/50`} style={{ '--tw-ring-color': theme.accentColor }} />
        ) : (
            <>
                <input type={isPassword ? (show ? "text" : "password") : type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 ${theme.inputBg} border ${theme.border} rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition font-medium ${theme.textMain} placeholder:text-slate-400/50`} style={{ '--tw-ring-color': theme.accentColor }} />
                {isPassword && <button type="button" onClick={() => setShow(!show)} className={`absolute right-3 top-3.5 ${theme.textSub} hover:${theme.textMain}`}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
            </>
        )}
      </div>
    </div>
  );
};

const ThemePickerModal = ({ isOpen, onClose }) => {
  const { theme, setMode, setAccentColor, mode, accentColor } = useContext(ThemeContext);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className={`${theme.cardBg} w-full max-w-sm p-6 rounded-3xl border ${theme.border} shadow-2xl relative`}>
        <button onClick={onClose} className={`absolute top-4 right-4 ${theme.textSub} hover:${theme.textMain}`}><X size={20}/></button>
        <h3 className={`text-xl font-bold mb-6 ${theme.textMain} flex items-center gap-2`}><Palette size={20}/> Appearance</h3>
        <div className="mb-6"><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-3`}>Display Mode</label><div className={`flex ${theme.inputBg} p-1 rounded-xl border ${theme.border}`}><button onClick={() => setMode('light')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'light' ? 'bg-white text-black shadow-sm' : theme.textSub}`}><Sun size={16}/> Light</button><button onClick={() => setMode('dark')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'dark' ? 'bg-slate-700 text-white shadow-sm' : theme.textSub}`}><Moon size={16}/> Dark</button></div></div>
        <div><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-3`}>Accent Color</label><div className="grid grid-cols-4 gap-3 mb-4">{PRESET_COLORS.map((c) => (<button key={c.value} onClick={() => setAccentColor(c.value)} className={`h-10 rounded-full transition-transform active:scale-90 flex items-center justify-center ring-2 ring-offset-2 ${theme.mode === 'dark' ? 'ring-offset-slate-900' : 'ring-offset-white'}`} style={{ backgroundColor: c.value, borderColor: c.value, ringColor: accentColor === c.value ? c.value : 'transparent' }}>{accentColor === c.value && <Check size={16} className="text-white"/>}</button>))}</div><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Custom Hex Code</label><div className="flex gap-2"><div className="h-10 w-10 rounded-lg border-2" style={{ backgroundColor: accentColor, borderColor: theme.border }}></div><input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className={`flex-1 ${theme.inputBg} ${theme.textMain} border ${theme.border} rounded-lg px-3 font-mono text-sm uppercase`} /></div></div>
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"><Button fullWidth onClick={onClose}>Done</Button></div>
      </div>
    </div>
  );
};

const Settings = ({ user, refreshUser }) => {
  const { theme } = useContext(ThemeContext);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiCall('/user/update-profile', { method: 'POST', body: JSON.stringify({ newUsername }) });
      if (res && res.success) { alert("Username updated successfully!"); refreshUser(); }
      else { alert(res?.message || "Failed to update profile"); }
    } catch(e) { alert("Network Error"); }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert("New passwords do not match");
    if (passwords.new.length < 6) return alert("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await apiCall('/user/change-password', { 
          method: 'POST', body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }) 
      });
      if (res && res.success) { 
          alert("Password changed successfully!"); setPasswords({ current: '', new: '', confirm: '' }); 
      } else { alert(res?.message || "Failed to change password"); }
    } catch(e) { alert("Network Error"); }
    setLoading(false);
  };

  return (
     <div className="max-w-2xl mx-auto pb-20 animate-in fade-in space-y-6">
        <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}>
           <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><User size={24}/></div>
               <h3 className={`font-bold ${theme.textMain} text-lg`}>Profile Settings</h3>
           </div>
           <form onSubmit={handleUpdateProfile}>
              <Input label="Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
              <Button fullWidth disabled={loading || newUsername === user?.username}>Update Username</Button>
           </form>
        </div>
        <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}>
           <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Lock size={24}/></div>
               <h3 className={`font-bold ${theme.textMain} text-lg`}>Security</h3>
           </div>
           <form onSubmit={handleUpdatePassword}>
              <Input label="Current Password" isPassword value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
              <Input label="New Password" isPassword value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
              <Input label="Confirm New Password" isPassword value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
              <Button fullWidth variant="dark" disabled={loading || !passwords.current || !passwords.new}>Change Password</Button>
           </form>
        </div>
     </div>
  );
};

const PrivacyPolicy = () => {
    const { theme } = useContext(ThemeContext);
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in space-y-6">
            <div className={`${theme.cardBg} p-8 rounded-3xl border ${theme.border} shadow-sm`}>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><ShieldCheck size={32}/></div>
                    <div><h1 className={`text-2xl font-bold ${theme.textMain}`}>Privacy Policy</h1><p className={`text-sm ${theme.textSub}`}>Last Updated: {new Date().toLocaleDateString()}</p></div>
                </div>
                <div className={`space-y-6 ${theme.textMain} leading-relaxed`}>
                    <section>
                        <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
                        <p className={`text-sm ${theme.textSub} mb-2`}>To provide our data vending services, we collect minimal personal information:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li><strong>Account Information:</strong> Username and Email address for account management.</li>
                            <li><strong>Transaction Data:</strong> Phone numbers (for data delivery) and order history.</li>
                            <li><strong>Usage Data:</strong> Login times ("Last Seen") to ensure account security.</li>
                        </ul>
                    </section>
                    <section>
                        <h2 className="text-lg font-bold mb-2">2. How We Use Your Data</h2>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                            <li>To process instant data bundle transfers to your specified phone numbers.</li>
                            <li>To manage your Wallet balance and provide a history of your transactions.</li>
                            <li>To provide customer support and resolve transaction issues.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

const HelpCenter = () => {
    const { theme } = useContext(ThemeContext);
    const [openIndex, setOpenIndex] = useState(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const toggleFaq = (index) => setOpenIndex(openIndex === index ? null : index);
    const handleSendMessage = (e) => {
        e.preventDefault();
        const myPhoneNumber = "233572992838"; 
        const whatsappMessage = `*New Support Request* 🚨%0a*Subject:* ${subject}%0a%0a*Message:*%0a${message}`;
        window.open(`https://wa.me/${myPhoneNumber}?text=${whatsappMessage}`, "_blank");
        setSubject(''); setMessage('');
    };
    return (
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in space-y-8">
            <div className={`${theme.cardBg} p-8 rounded-3xl border ${theme.border} text-center shadow-sm`}>
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white" style={{ backgroundColor: theme.accentColor }}><HelpCircle size={32}/></div>
                <h1 className={`text-2xl font-bold ${theme.textMain} mb-2`}>Help & Support</h1>
                <p className={theme.textSub}>Chat with us directly on WhatsApp for instant support.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} h-fit`}>
                    <h3 className={`font-bold ${theme.textMain} text-lg mb-4 flex items-center gap-2`}><Phone size={18}/> Contact Admin</h3>
                    <form onSubmit={handleSendMessage}>
                        <Input label="Subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Transaction Issue" />
                        <Input label="Message" isTextArea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." />
                        <Button fullWidth variant="success"><Send size={18}/> Chat on WhatsApp</Button>
                    </form>
                </div>
                <div className="space-y-3">
                    <h3 className={`font-bold ${theme.textMain} text-lg flex items-center gap-2 mb-2`}><MessageSquare size={18}/> Frequently Asked Questions</h3>
                    {FAQS.map((faq, idx) => ( <div key={idx} className={`${theme.cardBg} border ${theme.border} rounded-xl overflow-hidden`}><button onClick={() => toggleFaq(idx)} className={`w-full p-4 text-left flex justify-between items-center font-bold text-sm ${theme.textMain} hover:bg-black/5 dark:hover:bg-white/5`}>{faq.q}{openIndex === idx ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}</button>{openIndex === idx && <div className={`p-4 pt-0 text-sm ${theme.textSub} leading-relaxed`}>{faq.a}</div>}</div> ))}
                </div>
            </div>
        </div>
    );
};

const PublicShop = () => {
  const { theme } = useContext(ThemeContext);
  const [shopData, setShopData] = useState(null);
  const [plans, setPlans] = useState({ MTN: [], AirtelTigo: [], Telecel: [] });
  const [network, setNetwork] = useState('MTN');
  const [planId, setPlanId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false); 
  const [fetching, setFetching] = useState(true);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  usePreventLeave(loading);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shopId = params.get('shop');
    if (!shopId) { setErrorMsg("No Shop ID provided in link."); setFetching(false); return; }
    apiCall(`/shop-details/${shopId}`).then(res => {
        if (res && res.shopName) {
          setShopData(res);
          const newPlans = {};
          if (res.basePrices) {
              Object.keys(res.basePrices).forEach(net => {
                newPlans[net] = res.basePrices[net].map(p => ({
                  ...p,
                  price: res.customPrices && res.customPrices[p.id] ? parseFloat(res.customPrices[p.id]) : p.price
                }));
              });
              setPlans(newPlans);
          }
        } else { setErrorMsg("Shop not found. The Agent may not have set it up yet."); }
      }).catch(err => { console.error(err); setErrorMsg("Could not load shop. Please check your internet."); })
      .finally(() => setFetching(false));
  }, []);

  const currentPlans = plans[network] || []; 
  const selectedPlan = currentPlans.find(p => p.id === planId);
  const feeRate = 0.02; 
  const basePrice = selectedPlan?.price || 0;
  const feeAmount = basePrice > 0 ? (basePrice * feeRate) : 0;
  const totalCharge = basePrice + feeAmount; 

  const handlePaystack = async (e) => {
    e.preventDefault(); 
    if (!planId || phone.length < 10 || totalCharge <= 0) return; 
    if (!window.PaystackPop) { alert("Payment system loading... Please wait a moment."); return; }
    const handler = window.PaystackPop.setup({ 
        key: PAYSTACK_KEY, email: "customer@ajenterprise.com", amount: Math.ceil(totalCharge * 100), currency: 'GHS', 
        callback: function(response) { 
            setLoading(true); 
            (async () => { 
                const params = new URLSearchParams(window.location.search);
                const shopId = params.get('shop');
                try { 
                    const res = await apiCall('/purchase-direct', { 
                        method: 'POST', body: JSON.stringify({ network, planId, phone, reference: response.reference, shopId, customerFee: feeAmount }) 
                    }); 
                    if (res.status === 'success') { 
                        setPurchaseSuccess({ reference: response.reference, plan: selectedPlan.name, amount: totalCharge, phone: phone, date: new Date().toLocaleString() }); 
                    } else { alert("Payment received but delivery failed: " + res.message); } 
                } catch(e) { alert("Error sending data. Contact Admin."); } 
                setLoading(false); 
            })(); 
        }, onClose: () => alert("Transaction Cancelled") 
    }); 
    handler.openIframe();
  };

  if (fetching) return <div className={`min-h-screen flex flex-col items-center justify-center ${theme.appBg} ${theme.textMain}`}><Loader2 className="animate-spin mb-4" size={40} style={{ color: theme.accentColor }} /><h2 className="text-xl font-bold">Loading Shop...</h2></div>;
  if (errorMsg) return <div className={`min-h-screen flex items-center justify-center ${theme.appBg} ${theme.textMain}`}><div className="text-center p-8 bg-white/5 rounded-3xl border border-red-200"><AlertCircle size={48} className="mx-auto mb-4 text-red-500"/><h2 className="text-xl font-bold mb-2">{errorMsg}</h2><p className="text-sm opacity-70">Check the link and try again.</p></div></div>;

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.appBg} p-4 transition-colors duration-300`}>
      <button onClick={() => setShowThemeModal(true)} className={`absolute top-4 right-4 p-3 rounded-full ${theme.cardBg} shadow-lg ${theme.textMain} border ${theme.border}`}><Palette size={20}/></button>
      <ThemePickerModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
      {purchaseSuccess ? ( 
        <div className={`${theme.cardBg} w-full max-w-md p-8 rounded-3xl shadow-xl border ${theme.border} text-center`}>
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
            <h2 className={`text-2xl font-bold ${theme.textMain} mb-2`}>Order Successful!</h2>
            <div className={`${theme.inputBg} p-4 rounded-xl text-left space-y-3 mb-6 border ${theme.border}`}>
                <div className="flex justify-between text-sm"><span className={theme.textSub}>Bundle:</span><span className={`font-bold ${theme.textMain}`}>{purchaseSuccess.plan}</span></div>
                <div className="flex justify-between text-sm"><span className={theme.textSub}>Recipient:</span><span className={`font-bold ${theme.textMain}`}>{purchaseSuccess.phone}</span></div>
                <div className="flex justify-between text-sm"><span className={theme.textSub}>Paid:</span><span className={`font-bold ${theme.textMain}`}>GHS {purchaseSuccess.amount.toFixed(2)}</span></div>
            </div>
            <Button fullWidth onClick={() => { setPurchaseSuccess(null); setPhone(''); setPlanId(''); }}>Buy Another Bundle</Button>
        </div> 
      ) : ( 
        <div className={`${theme.cardBg} w-full max-w-md p-6 md:p-8 rounded-3xl shadow-xl border ${theme.border}`}>
            <div className="text-center mb-8"><img src="apple-touch-icon.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 object-contain rounded-xl" /><h1 className={`text-2xl font-bold ${theme.textMain}`}>{shopData.shopName}</h1><p className={theme.textSub}>Instant Data Delivery</p></div>
            <div className="grid grid-cols-3 gap-3 mb-6">{Object.keys(plans).map((net) => ( <button key={net} onClick={() => { setNetwork(net); setPlanId(''); }} className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${network === net ? `border-current bg-opacity-10` : `${theme.border} hover:opacity-80`}`} style={network === net ? { borderColor: theme.accentColor, color: theme.accentColor } : {}}> <img src={NETWORK_LOGOS[net]} alt={net} className="h-10 w-auto object-contain" /> </button> ))}</div>
            <form onSubmit={handlePaystack} className="space-y-5">
                <div><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Select Plan</label><select value={planId} onChange={(e) => setPlanId(e.target.value)} className={`w-full p-4 ${theme.inputBg} border ${theme.border} rounded-xl outline-none font-medium ${theme.textMain}`} required><option value="" disabled>Select a bundle...</option>{currentPlans.map(p => <option key={p.id} value={p.id}>{p.name} - GHS {p.price.toFixed(2)}</option>)}</select></div>
                <Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="054 123 4567" icon={Smartphone} />
                {selectedPlan && (<div className={`${theme.inputBg} p-4 rounded-xl border ${theme.border} text-sm space-y-2`}><div className={`flex justify-between ${theme.textSub}`}><span>Bundle Price:</span><span className="font-bold">GHS {basePrice.toFixed(2)}</span></div><div className={`flex justify-between ${theme.textSub} text-xs`}><span>Transaction Fee (2%):</span><span>+ GHS {feeAmount.toFixed(2)}</span></div><div className={`border-t ${theme.border} pt-2 flex justify-between items-center`}><span className={`font-bold ${theme.textMain}`}>Total Payment:</span><span className={`font-bold text-lg`} style={{ color: theme.accentColor }}>GHS {totalCharge.toFixed(2)}</span></div></div>)}
                <Button fullWidth disabled={loading || !selectedPlan} onClick={handlePaystack}>{loading ? <Loader2 className="animate-spin" /> : `Pay GHS ${totalCharge.toFixed(2)}`}</Button>
            </form>
            <div className="mt-4 text-center text-xs text-gray-300">Powered by AJEnterprise</div>
        </div> 
      )}
    </div>
  );
};

const Dashboard = ({ user, transactions, setView, onTopUp, refreshUser }) => {
  const { theme } = useContext(ThemeContext);
  const handleUpgrade = () => { if (!window.PaystackPop) { alert("Payment system initializing."); return; } const handler = window.PaystackPop.setup({ key: PAYSTACK_KEY, email: user.email || "upgrade@ajenterprise.com", amount: 30 * 100, currency: 'GHS', callback: function(response) { (async () => { const apiRes = await apiCall('/upgrade-agent', { method: 'POST', body: JSON.stringify({ reference: response.reference }) }); if(apiRes && apiRes.success) { alert("Upgrade Successful!"); refreshUser(); window.location.reload(); } })(); }, onClose: function() { alert("Transaction Cancelled"); } }); handler.openIframe(); };

  // --- SAFE ACCESS TO PREVENT BLANK SCREEN ---
  const balance = user?.walletBalance || 0;
  const role = user?.role || 'Client';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: theme.accentColor }}>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div><p className="opacity-80 font-medium mb-1 text-sm md:text-base">Wallet Balance</p><h1 className="text-3xl md:text-5xl font-bold tracking-tight">GHS {(balance / 100).toFixed(2)}</h1></div>
            <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold border border-white/30">{role === 'Agent' ? '⚡ AGENT' : (role === 'Admin' ? '🛡️ ADMIN' : '👤 CLIENT')}</div>
          </div>
          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <button onClick={onTopUp} className="bg-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition shadow-sm" style={{ color: theme.accentColor }}><Wallet size={18} /> Fund Wallet</button>
            <button onClick={() => setView('history')} className="bg-black/20 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black/30 transition border border-white/20 backdrop-blur-md">History</button>
            {role === 'Client' && (<button onClick={handleUpgrade} className="bg-black/20 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black/30 transition border border-white/20 backdrop-blur-md">Become Agent (30 GHS)</button>)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => setView('purchase')} className={`${theme.cardBg} p-5 rounded-2xl border ${theme.border} shadow-sm flex items-center gap-4 text-left hover:shadow-md transition group`}><div className="w-14 h-14 rounded-2xl bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: `${theme.accentColor}20`, color: theme.accentColor }}><Wifi size={28} /></div><div><h3 className={`font-bold ${theme.textMain} text-lg`}>Buy Data</h3><p className={`${theme.textSub} text-sm`}>Use Wallet Balance</p></div><ChevronRight className={`ml-auto ${theme.textSub} opacity-50`} /></button>
        {role === 'Agent' && (<button onClick={() => setView('shop')} className={`${theme.cardBg} p-5 rounded-2xl border ${theme.border} shadow-sm flex items-center gap-4 text-left hover:shadow-md transition group`}><div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Store size={28} /></div><div><h3 className={`font-bold ${theme.textMain} text-lg`}>My Shop</h3><p className={`${theme.textSub} text-sm`}>Manage Prices</p></div><ChevronRight className={`ml-auto ${theme.textSub} opacity-50`} /></button>)}
      </div>
      <div>
        <div className="flex justify-between items-center mb-4"><h3 className={`text-lg font-bold ${theme.textMain}`}>Recent Transactions</h3></div>
        
        {/* ✅ MOBILE: CARDS */}
        <div className="space-y-1 md:hidden">
            {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                <TransactionCard key={tx._id} tx={tx} />
            )) : <div className={`p-8 text-center ${theme.textSub} text-sm ${theme.cardBg} rounded-xl border ${theme.border}`}>No recent transactions</div>}
        </div>

        {/* ✅ DESKTOP: TABLE */}
        <div className={`hidden md:block ${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}>
          {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (<div key={tx._id} className={`p-4 border-b ${theme.border} flex items-center justify-between last:border-0`}><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.status === 'data_sent' ? theme.successBadge : theme.inputBg}`}>{tx.status === 'data_sent' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}</div><div><p className={`font-bold ${theme.textMain} text-sm`}>{tx.dataPlan || 'Transaction'}</p><p className={`text-xs ${theme.textSub}`}>{formatDateTime(tx.createdAt)}</p></div></div><p className={`font-bold text-sm ${theme.textMain}`}>GHS {tx.amount?.toFixed(2)}</p></div>)) : <div className={`p-8 text-center ${theme.textSub} text-sm`}>No recent transactions</div>}
        </div>
      </div>
    </div>
  );
};

const Purchase = ({ refreshUser }) => {
  const { theme } = useContext(ThemeContext);
  const [plans, setPlans] = useState({ MTN: [], AirtelTigo: [], Telecel: [] });
  const [network, setNetwork] = useState('MTN'); const [planId, setPlanId] = useState(''); const [phone, setPhone] = useState(''); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  usePreventLeave(loading);
  useEffect(() => { apiCall('/data-plans').then(data => { if(data && data.plans) setPlans(data.plans); }).catch(err => console.log("Plan fetch error:", err)); }, []);
  const handleBuy = async (e) => { e.preventDefault(); if (!planId || phone.length < 10) return; setLoading(true); setError(''); try { const res = await apiCall('/purchase', { method: 'POST', body: JSON.stringify({ network, planId, phone }) }); if (res && res.status === 'success') { alert("Order Successful!"); setPhone(''); refreshUser(); } else { throw new Error(res?.message || "Transaction Failed"); } } catch (err) { setError(err.message); } finally { setLoading(false); } };
  const currentPlans = plans[network] || []; const selectedPlan = currentPlans.find(p => p.id === planId);
  return (
    <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className={`${theme.cardBg} p-6 md:p-8 rounded-3xl shadow-lg border ${theme.border}`}><h2 className={`text-2xl font-bold mb-6 ${theme.textMain}`}>Buy Data Bundle</h2>{error && <div className={`p-3 mb-4 rounded-lg text-sm font-bold ${theme.failedBadge}`}>{error}</div>}<div className="grid grid-cols-3 gap-3 mb-6">{Object.keys(plans).length > 0 ? Object.keys(plans).map((net) => ( <button key={net} onClick={() => { setNetwork(net); setPlanId(''); }} className={`h-24 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${network === net ? `border-current bg-opacity-10` : `${theme.border} hover:opacity-80`}`} style={network === net ? { borderColor: theme.accentColor, color: theme.accentColor } : {}}> <img src={NETWORK_LOGOS[net]} alt={net} className="h-12 w-auto object-contain" /> </button> )) : <div className={`col-span-3 text-center py-4 ${theme.textSub}`}>Loading plans...</div>}</div><form onSubmit={handleBuy} className="space-y-5"><div><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Select Plan</label><select value={planId} onChange={(e) => setPlanId(e.target.value)} className={`w-full p-4 ${theme.inputBg} border ${theme.border} rounded-xl outline-none font-medium ${theme.textMain}`} required><option value="" disabled>Select a bundle...</option>{currentPlans.map(p => <option key={p.id} value={p.id}>{p.name} - GHS {p.price.toFixed(2)}</option>)}</select></div><Input label="Phone Number" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="054 123 4567" icon={Smartphone} /><Button fullWidth disabled={loading || !selectedPlan} onClick={handleBuy}>{loading ? <Loader2 className="animate-spin" /> : `Pay GHS ${selectedPlan?.price.toFixed(2) || '0.00'}`}</Button></form></div>
    </div>
  );
};

const AgentShopManager = ({ user, refreshUser }) => {
  const { theme } = useContext(ThemeContext); const [shopName, setShopName] = useState(''); const [shopId, setShopId] = useState(user?.shopId || ''); const [prices, setPrices] = useState({}); const [basePrices, setBasePrices] = useState({}); const [loading, setLoading] = useState(false); const [withdrawAmount, setWithdrawAmount] = useState(''); const [momoDetails, setMomoDetails] = useState({ number: '', name: '', network: 'MTN' });
  useEffect(() => { if (user?.shopId) { apiCall(`/shop-details/${user.shopId}`).then(res => { if(res) { setShopName(res.shopName); setPrices(res.customPrices || {}); setBasePrices(res.basePrices || {}); } }); } else { apiCall('/data-plans').then(res => setBasePrices(res.plans || {})); } }, [user?.shopId]);
  const handleSaveShop = async () => { if (!shopId) return alert("Please enter a Shop ID"); setLoading(true); const cleanShopId = shopId.toLowerCase().replace(/\s+/g, '-'); await apiCall('/agent/setup-shop', { method: 'POST', body: JSON.stringify({ shopName, shopId: cleanShopId, customPrices: prices }) }); alert(`Shop Saved! Your link is: ajenterprise.onrender.com/?shop=${cleanShopId}`); setShopId(cleanShopId); refreshUser(); setLoading(false); };
  
  const handleWithdraw = async (e) => { 
      e.preventDefault(); 
      const balance = (user?.payoutWalletBalance || 0) / 100;
      if(balance < 30) return alert("Balance must be at least 30 GHS to withdraw.");
      if(parseFloat(withdrawAmount) < 30) return alert("Minimum withdrawal amount is 30 GHS");
      if(parseFloat(withdrawAmount) > balance) return alert("Insufficient funds"); 

      await apiCall('/withdraw', { method: 'POST', body: JSON.stringify({ amount: withdrawAmount, accountNumber: momoDetails.number, accountName: momoDetails.name, network: momoDetails.network }) }); 
      alert("Request Sent!"); 
      refreshUser(); 
  };
  
  const copyLink = () => { navigator.clipboard.writeText(`${window.location.origin}/?shop=${shopId}`); alert("Link Copied!"); };
  const handleShopIdChange = (e) => { const val = e.target.value.toLowerCase().replace(/\s+/g, '-'); setShopId(val); };

  return (
    <div className="pb-20 space-y-6 animate-in fade-in">
       <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-6 text-white shadow-xl">
           <p className="text-purple-200 text-sm">Payout Commission Wallet</p>
           <h1 className="text-4xl font-bold mt-1">GHS {((user?.payoutWalletBalance || 0) / 100).toFixed(2)}</h1>
           <div className="mt-6 bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20">
               <h3 className="font-bold mb-3 text-sm flex items-center gap-2"><DollarSign size={16}/> Withdraw Funds (Min 30 GHS)</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                   <input placeholder="Amount" type="number" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} className="p-2 rounded bg-white/20 border border-white/30 text-white placeholder:text-white/50 outline-none focus:bg-white/30 transition" />
                   <input placeholder="Momo Number" value={momoDetails.number} onChange={e=>setMomoDetails({...momoDetails, number: e.target.value})} className="p-2 rounded bg-white/20 border border-white/30 text-white placeholder:text-white/50 outline-none focus:bg-white/30 transition" />
               </div>
               <Button size="sm" fullWidth onClick={handleWithdraw}>Withdraw Now</Button>
           </div>
       </div>
       
       <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border}`}>
           <h2 className={`text-xl font-bold mb-4 ${theme.textMain}`}>Shop Settings</h2>
           <Input label="Shop Name" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="My Data Shop" />
           <div className="mb-4"><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Shop ID (Link Slug)</label><input type="text" value={shopId} onChange={handleShopIdChange} placeholder="unique-shop-name" className={`w-full pl-4 pr-10 py-3 ${theme.inputBg} border ${theme.border} rounded-xl focus:ring-2 focus:ring-opacity-50 outline-none transition font-medium ${theme.textMain} placeholder:text-slate-400/50`} style={{ '--tw-ring-color': theme.accentColor }} /><p className="text-xs mt-1 text-blue-500">Your link: {window.location.origin}/?shop={shopId || '...'}</p></div>{user?.shopId && (<div className="flex gap-2 mb-6 items-center bg-slate-100 p-2 rounded-xl dark:bg-slate-800"><input disabled value={`${window.location.origin}/?shop=${shopId}`} className={`flex-1 bg-transparent ${theme.textSub} text-xs px-2`} /><Button size="sm" onClick={copyLink}><Share2 size={16}/></Button></div>)}<h3 className={`font-bold mt-6 mb-4 ${theme.textMain}`}>Price Management</h3><div className="space-y-4">{Object.keys(basePrices).map(net => (<div key={net}><h4 className={`text-xs font-bold uppercase ${theme.textSub} mb-2`}>{net}</h4><div className="grid grid-cols-2 gap-3">{basePrices[net].map(plan => (<div key={plan.id} className={`p-3 border ${theme.border} rounded-xl flex flex-col gap-1`}><div className="flex justify-between"><span className={`font-bold text-sm ${theme.textMain}`}>{plan.name}</span><span className="text-xs text-emerald-600">Cost: {plan.price}</span></div><input type="number" placeholder="Selling Price" value={prices[plan.id] || ''} onChange={(e) => setPrices({ ...prices, [plan.id]: e.target.value })} className={`w-full p-2 text-right border ${theme.border} rounded ${theme.inputBg} ${theme.textMain} text-sm`} /></div>))}</div></div>))}</div><div className="mt-6"><Button fullWidth onClick={handleSaveShop} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button></div></div>
    </div>
  );
};

// --- UPDATED ADMIN DASHBOARD ---
// Includes Time Formatting and Recipient Phone Number
const AdminDashboard = () => {
  const { theme } = useContext(ThemeContext);
  const [metrics, setMetrics] = useState(null); 
  const [allOrders, setAllOrders] = useState([]); 
  const [withdrawals, setWithdrawals] = useState([]); 
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState('overview'); 
  const [searchTerm, setSearchTerm] = useState(''); 

  // ✅ Auto Refresh Function
  const fetchData = async () => { try { const mRes = await apiCall('/admin/metrics'); if (mRes) setMetrics(mRes); const oRes = await apiCall('/admin/all-orders'); if (oRes) setAllOrders(oRes.orders); const wRes = await apiCall('/admin/withdrawals'); if (wRes) setWithdrawals(wRes.withdrawals); const uRes = await apiCall('/admin/users'); if (uRes) setUsers(uRes.users); } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { 
      fetchData();
      const interval = setInterval(fetchData, 10000); // 10s auto-refresh
      return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => { if(!window.confirm(`Change status to ${newStatus}?`)) return; try { const res = await apiCall('/admin/update-order', { method: 'POST', body: JSON.stringify({ id: orderId, status: newStatus }) }); if (res && res.success) { alert("Updated"); fetchData(); } } catch(e) {} };
  const handlePayWithdrawal = async (id) => { if(!confirm("Mark as Paid?")) return; await apiCall('/admin/approve-withdrawal', { method: 'POST', body: JSON.stringify({ id }) }); alert("Approved"); fetchData(); };
  
  const handleManualFund = async (userId) => { 
      const amount = prompt("Enter amount to fund (GHS):"); 
      if (!amount) return; 
      const adminSecret = prompt("Enter Admin Secret Key:");
      if (!adminSecret) return alert("Secret Key Required!");
      try { 
          const res = await apiCall('/admin/credit-wallet', { method: 'POST', body: JSON.stringify({ userId, amount, adminSecret }) }); 
          if(res && res.success) { alert("Wallet Credited!"); fetchData(); } else { alert("Funding Failed: " + (res?.message || 'Error')); }
      } catch(e) { alert("Network Error"); } 
  };

  const filteredUsers = users.filter(u => u?.username && u.username.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredOrders = allOrders.filter(o => (o?.reference && o.reference.toLowerCase().includes(searchTerm.toLowerCase())) || (o?.userId?.username && o.userId.username.toLowerCase().includes(searchTerm.toLowerCase())));
  
  if (loading && !metrics) return <div className="min-h-screen flex items-center justify-center" style={{ color: theme.accentColor }}><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3"><div className="p-3 bg-red-100 text-red-600 rounded-xl"><Lock size={24} /></div><h2 className={`text-2xl font-bold ${theme.textMain}`}>Admin Dashboard</h2></div>
        {(activeTab === 'users' || activeTab === 'orders') && (
            <div className={`relative flex-1 max-w-md`}>
                <Search className={`absolute left-3 top-2.5 ${theme.textSub}`} size={18}/>
                <input placeholder={activeTab === 'users' ? "Search users..." : "Search orders..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme.border} ${theme.inputBg} ${theme.textMain} outline-none focus:ring-2`} style={{ '--tw-ring-color': theme.accentColor }} />
            </div>
        )}
        <div className={`${theme.cardBg} flex p-1 rounded-lg border ${theme.border} overflow-x-auto`}>
            {['overview', 'orders', 'withdrawals', 'users'].map(tab => ( <button key={tab} onClick={() => { setActiveTab(tab); setSearchTerm(''); }} className={`px-4 py-2 text-sm font-bold rounded-md transition capitalize whitespace-nowrap ${activeTab === tab ? `${theme.inputBg} ${theme.textMain}` : theme.textSub}`}>{tab}</button> ))}
        </div>
      </div>
      
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><TrendingUp size={16} /> Revenue</div><div className="text-3xl font-bold" style={{ color: theme.accentColor }}>GHS {(metrics?.revenue || 0).toFixed(2)}</div></div>
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><Users size={16} /> Users</div><div className={`text-3xl font-bold ${theme.textMain}`}>{metrics?.userCount || 0}</div></div>
            <div className={`${theme.cardBg} p-6 rounded-2xl border ${theme.border} shadow-sm`}><div className={`flex items-center gap-3 mb-2 ${theme.textSub} text-sm font-bold uppercase`}><Activity size={16} /> Orders</div><div className={`text-3xl font-bold ${theme.textMain}`}>{metrics?.totalOrders || 0}</div></div>
        </div>
      )}

      {/* ✅ UPDATED ORDER TABLE: Shows Time & Recipient Phone */}
      {activeTab === 'orders' && ( <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-sm overflow-hidden`}><div className={`p-4 border-b ${theme.border} flex justify-between items-center`}><h3 className={`font-bold ${theme.textMain}`}>Recent Orders</h3><button onClick={fetchData} className={`p-2 ${theme.textSub} hover:opacity-70 rounded-full`}><RefreshCw size={16} /></button></div><div className="overflow-x-auto"><table className={`w-full text-sm text-left ${theme.textMain}`}><thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}><tr><th className="px-4 py-3">Time</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Ref</th><th className="px-4 py-3">Recipient</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody>{filteredOrders.map(order => ( <tr key={order._id} className={`border-b ${theme.border} ${theme.hover}`}><td className="px-4 py-3 whitespace-nowrap">{formatDateTime(order.createdAt)}</td><td className="px-4 py-3 font-medium">{order.userId?.username || 'Guest'}</td><td className="px-4 py-3 font-mono text-xs">{order.reference}</td><td className="px-4 py-3 font-mono text-xs">{order.phoneNumber}</td><td className="px-4 py-3">{order.dataPlan}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'data_sent' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>{order.status}</span></td><td className="px-4 py-3 text-right flex justify-end gap-2">{order.status !== 'data_sent' && order.status !== 'data_failed' && (<><Button size="sm" variant="success" onClick={() => handleStatusUpdate(order._id, 'data_sent')}><Check size={14} /></Button><Button size="sm" variant="danger" onClick={() => handleStatusUpdate(order._id, 'data_failed')}><X size={14} /></Button></>)}</td></tr> ))}</tbody></table></div></div> )}
      
      {activeTab === 'withdrawals' && ( <div className={`${theme.cardBg} rounded-2xl border ${theme.border} overflow-hidden`}><div className={`p-4 border-b ${theme.border}`}><h3 className={`font-bold ${theme.textMain}`}>Withdrawal Requests</h3></div><table className={`w-full text-sm text-left ${theme.textMain}`}><thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}><tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Momo</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{withdrawals.map(r => ( <tr key={r._id} className={`border-b ${theme.border}`}><td className="px-4 py-3">{r.userId?.username}</td><td className="px-4 py-3 font-bold">GHS {r.amount}</td><td className="px-4 py-3">{r.accountNumber} ({r.network})</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${r.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span></td><td className="px-4 py-3">{r.status === 'Pending' && <Button size="sm" onClick={() => handlePayWithdrawal(r._id)}>Pay</Button>}</td></tr> ))}</tbody></table></div> )}
      {activeTab === 'users' && ( 
        <div className={`${theme.cardBg} rounded-2xl border ${theme.border} overflow-hidden`}>
            <div className={`p-4 border-b ${theme.border}`}><h3 className={`font-bold ${theme.textMain}`}>User Management</h3></div>
            <table className={`w-full text-sm text-left ${theme.textMain}`}>
                <thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}>
                    <tr>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Last Seen</th> 
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Balance</th>
                        <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(u => ( 
                        <tr key={u._id} className={`border-b ${theme.border}`}>
                            <td className="px-4 py-3 font-medium">{u?.username || 'Unknown'}</td>
                            <td className="px-4 py-3 text-xs opacity-70">{timeAgo(u?.lastLogin)}</td> 
                            <td className="px-4 py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs text-black">{u?.role || 'Client'}</span></td>
                            <td className="px-4 py-3 font-bold">GHS {((u?.walletBalance || 0)/100).toFixed(2)}</td>
                            <td className="px-4 py-3 text-right"><Button size="sm" onClick={() => handleManualFund(u._id)}><PlusCircle size={14}/> Fund</Button></td>
                        </tr> 
                    ))}
                </tbody>
            </table>
        </div> 
      )}
    </div>
  );
};

const Auth = ({ onLogin, mode, setMode }) => {
  const { theme } = useContext(ThemeContext); const [formData, setFormData] = useState({ username: '', email: '', password: '' }); const [loading, setLoading] = useState(false); const [isAdminMode, setIsAdminMode] = useState(false); const [stealthClicks, setStealthClicks] = useState(0); const [roleSelection, setRoleSelection] = useState('Client'); const [termsAccepted, setTermsAccepted] = useState(false); const [error, setError] = useState('');
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); setError(''); if (mode === 'signup' && !termsAccepted) { setError("You must agree to the Terms and Conditions."); setLoading(false); return; } const cleanData = { username: formData.username.trim(), email: formData.email.trim(), password: formData.password }; if (mode === 'signup' && roleSelection === 'Agent') { handleAgentUpgrade(cleanData); return; } try { const endpoint = mode === 'login' ? '/login' : '/signup'; const res = await apiCall(endpoint, { method: 'POST', body: JSON.stringify(cleanData) }); if (res) { if (isAdminMode && res.role !== 'Admin') { await apiCall('/logout'); alert("Access Denied"); } else { onLogin(); } } } catch (err) { setError(err.message || "Authentication failed"); } finally { setLoading(false); } };
  const handleAgentUpgrade = async (cleanData) => { try { if (!window.PaystackPop) { alert("Payment System loading..."); setLoading(false); return; } const signupRes = await apiCall('/signup', { method: 'POST', body: JSON.stringify(cleanData) }); if (!signupRes) throw new Error("Signup failed"); await apiCall('/login', { method: 'POST', body: JSON.stringify({ username: cleanData.username, password: cleanData.password }) }); const handler = window.PaystackPop.setup({ key: PAYSTACK_KEY, email: cleanData.email, amount: 30 * 100, currency: 'GHS', callback: function(response) { (async () => { const verifyRes = await apiCall('/upgrade-agent', { method: 'POST', body: JSON.stringify({ reference: response.reference }) }); if (verifyRes && verifyRes.success) { alert("Upgrade Successful!"); onLogin(); } else { alert("Verification Failed."); onLogin(); } })(); }, onClose: () => { alert("Cancelled."); onLogin(); } }); handler.openIframe(); } catch (err) { setError(err.message); setLoading(false); } };
  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.appBg} p-4`}>
       <div className={`${theme.cardBg} w-full max-w-md p-8 rounded-3xl shadow-xl border ${theme.border}`}>
          <div onClick={() => { if(stealthClicks+1 >= 5) setIsAdminMode(true); else setStealthClicks(s=>s+1); }} className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white cursor-pointer select-none" style={{ backgroundColor: theme.accentColor }}><User size={32}/></div>
          <h1 className={`text-center text-2xl font-bold ${theme.textMain} mb-6`}>{isAdminMode ? 'Admin Portal' : (mode === 'login' ? 'Welcome Back' : 'Create Account')}</h1>
          {error && <div className={`p-3 mb-6 rounded-lg text-sm text-center font-bold ${theme.failedBadge}`}>{error}</div>}
          {!isAdminMode && mode === 'signup' && (<div className={`flex ${theme.inputBg} p-1 rounded-xl mb-6 border ${theme.border}`}><button type="button" onClick={() => setRoleSelection('Client')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Client' ? `${theme.cardBg} shadow` : theme.textSub}`} style={roleSelection === 'Client' ? { color: theme.accentColor } : {}}>Client (Free)</button><button type="button" onClick={() => setRoleSelection('Agent')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${roleSelection === 'Agent' ? 'text-white shadow' : theme.textSub}`} style={roleSelection === 'Agent' ? { backgroundColor: theme.accentColor } : {}}>Agent (30 GHS)</button></div>)}
          <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />{mode === 'signup' && !isAdminMode && <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />}<Input label="Password" isPassword value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              {mode === 'login' && (<div className="text-right"><a href="https://wa.me/233572992838?text=Hello Admin, I forgot my AJEnterprise password. My username is..." target="_blank" rel="noreferrer" className={`text-xs font-bold hover:underline`} style={{ color: theme.accentColor }}>Forgot Password?</a></div>)}
              {mode === 'signup' && (<div className="flex items-start gap-2 pt-2"><input type="checkbox" id="terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 w-4 h-4 rounded border-gray-300" style={{ accentColor: theme.accentColor }} /><label htmlFor="terms" className={`text-xs ${theme.textSub} leading-tight`}>I agree to the Terms and Conditions.</label></div>)}<Button fullWidth disabled={loading}>{loading ? 'Loading...' : (mode === 'login' ? 'Login' : 'Sign Up')}</Button></form>
          {!isAdminMode && (<div className="mt-4 text-center text-sm"><button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ color: theme.accentColor }}>{mode === 'login' ? 'Create Account' : 'Back to Login'}</button></div>)}
       </div>
    </div>
  );
};

const TopUpModal = ({ user, isOpen, onClose, onConfirm }) => {
  const { theme } = useContext(ThemeContext); const [amount, setAmount] = useState(''); const [email, setEmail] = useState(user?.email || "user@example.com"); const [processing, setProcessing] = useState(false); const fee = amount ? (parseFloat(amount) * 0.02) : 0; const totalCharge = amount ? (parseFloat(amount) + fee) : 0;
  useEffect(() => { if(user?.email) setEmail(user.email); }, [user]); usePreventLeave(processing);
  const handleSubmit = () => { if (!amount || isNaN(amount) || amount < 1) return; 
      if (parseFloat(amount) < 10) { alert("Minimum Top Up amount is 10 GHS"); return; }
      if (!window.PaystackPop) { alert("Payment System loading..."); return; } 
      setProcessing(true); const handler = window.PaystackPop.setup({ key: PAYSTACK_KEY, email: email, amount: Math.ceil(parseFloat(amount) * 1.02 * 100), currency: 'GHS', callback: function(response) { (async () => { await onConfirm(amount, response.reference); setProcessing(false); setAmount(''); })(); }, onClose: function() { alert("Transaction cancelled."); setProcessing(false); } }); handler.openIframe(); };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"><div className={`${theme.cardBg} rounded-3xl w-full max-w-sm p-6 border ${theme.border}`}><h3 className={`text-xl font-bold mb-4 ${theme.textMain}`}>Fund Wallet</h3><label className={`block text-xs font-bold ${theme.textSub} uppercase mb-2`}>Amount (Min 10 GHS)</label><input type="number" placeholder="Amount (GHS)" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full border ${theme.border} p-3 rounded-xl mb-4 text-lg font-bold ${theme.inputBg} ${theme.textMain}`} />{amount > 0 && (<div className={`${theme.inputBg} p-4 rounded-xl border ${theme.border} text-sm space-y-2 mb-4`}><div className={`flex justify-between ${theme.textSub}`}><span>Wallet Credit:</span><span className="font-bold">GHS {parseFloat(amount).toFixed(2)}</span></div><div className={`flex justify-between ${theme.textSub} text-xs`}><span>Fee (2%):</span><span>+ GHS {fee.toFixed(2)}</span></div><div className={`border-t ${theme.border} pt-2 flex justify-between items-center`}><span className={`font-bold ${theme.textMain}`}>You Pay:</span><span className={`font-bold text-lg`} style={{ color: theme.accentColor }}>GHS {totalCharge.toFixed(2)}</span></div></div>)}<Button fullWidth onClick={handleSubmit} disabled={processing || !amount || amount < 10}>{processing ? 'Processing...' : `Pay GHS ${totalCharge.toFixed(2)}`}</Button><button onClick={onClose} className={`mt-4 text-sm ${theme.textSub} w-full`}>Cancel</button></div></div>
  );
};

export default function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('home'); 
  const [transactions, setTransactions] = useState([]); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [showTopUp, setShowTopUp] = useState(false); 
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [mode, setMode] = useState(localStorage.getItem('aj_mode') || 'light'); 
  const [accentColor, setAccentColor] = useState(localStorage.getItem('aj_color') || DEFAULT_COLOR);
  
  const theme = generateTheme(mode, accentColor); 
  const themeContextValue = { theme, mode, setMode, accentColor, setAccentColor };

  useEffect(() => { 
      try {
          localStorage.setItem('aj_mode', mode); 
          localStorage.setItem('aj_color', accentColor); 
      } catch (e) { console.warn("Local storage blocked"); }

      document.title = 'AJEnterprise'; 
      const script = document.createElement('script'); 
      script.src = "https://js.paystack.co/v1/inline.js"; 
      document.body.appendChild(script); 
      
      apiCall('/user-info').then(u => { 
          if(u && u.username) { 
              setUser(u); 
              const params = new URLSearchParams(window.location.search); 
              if(params.get('shop')) setView('purchase'); 
              else setView(u.role === 'Admin' ? 'admin' : 'dashboard'); 
              fetchTx(); 
          } 
      }).catch(err => {
          console.error("Login check failed:", err);
      });
  }, [mode, accentColor]);

  const fetchTx = () => apiCall('/my-orders').then(res => setTransactions(res?.orders || [])); 
  const refreshUser = () => apiCall('/user-info').then(u => { if(u && u.username) { setUser(u); fetchTx(); } }); 
  const handleTopUpConfirm = async (amount, reference) => { try { const res = await apiCall('/wallet/fund', { method: 'POST', body: JSON.stringify({ reference, amount }) }); if (res && res.success) { alert("Wallet Funded Successfully!"); setShowTopUp(false); await refreshUser(); } else { alert("Funding failed: " + (res?.message || "Unknown error")); } } catch (e) { alert("Error funding wallet"); } };
  
  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      alert("Order Reference Copied: " + text);
  };

  // ✅ NEW: Search State and Logic
  const [searchTerm, setSearchTerm] = useState('');
  const filteredTransactions = transactions.filter(tx => {
      const search = searchTerm.toLowerCase();
      return (
          (tx.phoneNumber && tx.phoneNumber.includes(search)) ||
          (tx.network && tx.network.toLowerCase().includes(search)) ||
          (tx.reference && tx.reference.toLowerCase().includes(search)) ||
          (tx.dataPlan && tx.dataPlan.toLowerCase().includes(search))
      );
  });

  const params = new URLSearchParams(window.location.search); 
  if (params.get('shop')) return <ThemeContext.Provider value={themeContextValue}><style>{globalStyles}</style><PublicShop /></ThemeContext.Provider>; 
  if (!user) return <ThemeContext.Provider value={themeContextValue}><style>{globalStyles}</style><Auth onLogin={() => window.location.reload()} mode={view === 'home' ? 'login' : view} setMode={setView} /></ThemeContext.Provider>;

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <style>{globalStyles}</style>
      <div className={`flex h-screen ${theme.appBg} font-sans ${theme.textMain} overflow-hidden transition-colors duration-300`}>
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 ${theme.sidebar} flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className={`p-6 border-b ${theme.border} flex items-center gap-3`}><img src="apple-touch-icon.png" alt="AJ" className="w-10 h-10 rounded-xl object-contain bg-black" /><div><h2 className="font-bold text-lg">AJEnterprise</h2><p className={`text-xs ${theme.textSub}`}>v2.1</p></div></div>
           <div className="flex-1 p-4 space-y-2">
              <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'dashboard' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'dashboard' ? { backgroundColor: theme.accentColor } : {}}><LayoutDashboard size={20}/> Dashboard</button>
              <button onClick={() => setView('purchase')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'purchase' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'purchase' ? { backgroundColor: theme.accentColor } : {}}><Wifi size={20}/> Buy Data</button>
              {user?.role === 'Agent' && <button onClick={() => setView('shop')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'shop' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'shop' ? { backgroundColor: theme.accentColor } : {}}><Store size={20}/> My Shop</button>}
              <button onClick={() => setView('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'history' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'history' ? { backgroundColor: theme.accentColor } : {}}><History size={20}/> History</button>
              <button onClick={() => setView('help')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'help' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'help' ? { backgroundColor: theme.accentColor } : {}}><HelpCircle size={20}/> Help & Support</button>
              {user?.role === 'Admin' && <button onClick={() => setView('admin')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${view === 'admin' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'admin' ? { backgroundColor: theme.accentColor } : {}}><Lock size={20}/> Admin</button>}
           </div>
           <div className={`p-4 border-t ${theme.border} space-y-2`}>
              <button onClick={() => setView('settings')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold ${view === 'settings' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'settings' ? { backgroundColor: theme.accentColor } : {}}><SettingsIcon size={20}/> Settings</button>
              <button onClick={() => setView('policy')} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold ${view === 'policy' ? `text-white shadow-md` : theme.inactiveNav}`} style={view === 'policy' ? { backgroundColor: theme.accentColor } : {}}><FileText size={20}/> Privacy Policy</button>
              <button onClick={() => setShowThemeModal(true)} className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold ${theme.inactiveNav}`}><Palette size={20}/> Appearance</button>
              <button onClick={async () => { await apiCall('/logout'); window.location.reload(); }} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-bold text-red-500 hover:bg-red-50"><LogOut size={20} /> Sign Out</button>
           </div>
        </aside>
        <main className="flex-1 flex flex-col h-full overflow-hidden w-full relative lg:ml-72">
           <header className={`h-16 ${theme.sidebar} flex items-center justify-between px-4 sticky top-0 z-30`}><button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu/></button><div className="ml-auto font-bold">{user?.username}</div></header>
           <div className="flex-1 overflow-y-auto p-4 lg:p-8">
              <div className="max-w-7xl mx-auto w-full">
                  {view === 'dashboard' && <Dashboard user={user} transactions={transactions} setView={setView} onTopUp={() => setShowTopUp(true)} refreshUser={refreshUser} />}
                  {view === 'purchase' && <Purchase refreshUser={refreshUser} />} 
                  {view === 'shop' && <AgentShopManager user={user} refreshUser={refreshUser} />}
                  {view === 'help' && <HelpCenter />}
                  {view === 'admin' && <AdminDashboard />}
                  {view === 'settings' && <Settings user={user} refreshUser={refreshUser} />} 
                  {view === 'policy' && <PrivacyPolicy />} 
                  {view === 'history' && (
                      <div className={`${theme.cardBg} md:rounded-2xl md:p-6 md:shadow-sm md:border ${theme.border}`}>
                          {/* Header with Search */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                              <h2 className={`font-bold text-lg md:text-xl hidden md:block ${theme.textMain}`}>Transaction History</h2>
                              <div className="w-full md:w-64 relative">
                                  <Search className={`absolute left-3 top-3.5 ${theme.textSub}`} size={18}/>
                                  <input 
                                    placeholder="Search phone, ref..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className={`w-full pl-10 pr-4 py-3 rounded-xl border ${theme.border} ${theme.inputBg} ${theme.textMain} outline-none focus:ring-2`} 
                                    style={{ '--tw-ring-color': theme.accentColor }} 
                                  />
                              </div>
                          </div>

                          {/* ✅ MOBILE CARDS */}
                          <div className="space-y-1 md:hidden">
                              {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                                  <TransactionCard key={tx._id} tx={tx} theme={theme} />
                              )) : <div className={`p-8 text-center ${theme.textSub} text-sm ${theme.cardBg} rounded-xl border ${theme.border}`}>No transactions found</div>}
                          </div>

                          {/* DESKTOP LIST */}
                          <div className="hidden md:block overflow-x-auto">
                              <table className={`w-full text-sm text-left ${theme.textMain}`}>
                                  <thead className={`text-xs ${theme.textSub} uppercase border-b ${theme.border}`}><tr><th className="px-6 py-3">Date</th><th className="px-6 py-3">Description</th><th className="px-6 py-3">Ref</th><th className="px-6 py-3">Recipient</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Amount</th></tr></thead>
                                  <tbody>
                                      {filteredTransactions.map(t => (
                                          <tr key={t._id} className={`border-b ${theme.border} ${theme.hover}`}>
                                              <td className="px-6 py-4 whitespace-nowrap">{formatDateTime(t.createdAt)}</td>
                                              <td className="px-6 py-4">{t.dataPlan}</td>
                                              <td className="px-6 py-4">
                                                  <button onClick={() => copyToClipboard(t.reference)} className={`flex items-center gap-1 font-mono text-xs opacity-70 hover:opacity-100 hover:text-blue-500`}><Copy size={12}/> {t.reference.substring(0,8)}...</button>
                                              </td>
                                              <td className="px-6 py-4">{t.phoneNumber}</td>
                                              <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${t.status === 'data_sent' ? theme.successBadge : `${theme.inputBg} ${theme.textSub}`}`}>{t.status}</span></td>
                                              <td className="px-6 py-4 text-right font-bold">GHS {t.amount.toFixed(2)}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  )}
              </div>
           </div>
        </main>
        <TopUpModal user={user} isOpen={showTopUp} onClose={() => setShowTopUp(false)} onConfirm={handleTopUpConfirm} />
        <ThemePickerModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
      </div>
    </ThemeContext.Provider>
  );
}

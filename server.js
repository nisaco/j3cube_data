// --- 1. SETUP & IMPORTS ---
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');
const MongoStore = require('connect-mongo');
const cors = require('cors'); 
const { User, Order, AgentShop, Withdrawal, mongoose } = require('./database.js'); 

const app = express();
const PORT = process.env.PORT || 10000;

// --- CONFIGURATION ---
const AGENT_FEE_GHS = 15.00;
const CK_BASE_URL = 'https://console.ckgodsway.com/api'; 
const NETWORK_MAP = { 'MTN': 'MTN_PRO', 'AirtelTigo': 'AT_PREMIUM', 'Telecel': 'TELECEL' };

const PRICING = {
    RETAIL: { 
        "MTN": [
            { id: '1GB', name: '1GB', price: 6.00 }, { id: '2GB', name: '2GB', price: 11.00 },
            { id: '3GB', name: '3GB', price: 18.00 }, { id: '4GB', name: '4GB', price: 23.00 }, { id: '5GB', name: '5GB', price: 30.00 },
            { id: '6GB', name: '6GB', price: 36.00 }, { id: '7GB', name: '7GB', price: 39.00 }, { id: '8GB', name: '8GB', price: 43.00 },
            { id: '10GB', name: '10GB', price: 49.00 }, { id: '15GB', name: '15GB', price: 75.00 }, { id: '20GB', name: '20GB', price: 100.00 }, 
            { id: '25GB', name: '25GB', price: 128.00 }, { id: '30GB', name: '30GB', price: 150.00 }, { id: '40GB', name: '40GB', price: 195.00 },
            { id: '50GB', name: '50GB', price: 248.00 }
        ],
        "AirtelTigo": [
            { id: '1GB', name: '1GB', price: 6.00 }, { id: '2GB', name: '2GB', price: 10.00 }, { id: '3GB', name: '3GB', price: 14.00 },  
            { id: '4GB', name: '4GB', price: 22.00 }, { id: '5GB', name: '5GB', price: 26.00 }, { id: '6GB', name: '6GB', price: 30.00 },  
            { id: '7GB', name: '7GB', price: 34.00 }, { id: '8GB', name: '8GB', price: 38.00 }, { id: '9GB', name: '9GB', price: 40.00 },  
            { id: '10GB', name: '10GB', price: 49.00 }, { id: '12GB', name: '12GB', price: 53.00 }, { id: '15GB', name: '15GB', price: 61.00 },
            { id: '20GB', name: '20GB', price: 85.00 }
        ],
        "Telecel": [
            { id: '5GB', name: '5GB', price: 29.00 }, { id: '10GB', name: '10GB', price: 49.20 }, { id: '15GB', name: '15GB', price: 80.00 }, 
            { id: '20GB', name: '20GB', price: 100.00 }, { id: '25GB', name: '25GB', price: 120.00 }, { id: '30GB', name: '30GB', price: 137.00 },
            { id: '40GB', name: '40GB', price: 175.50 }, { id: '50GB', name: '50GB', price: 205.00 }, { id: '100GB', name: '100GB', price: 400.00}
        ]
    },
    WHOLESALE: { 
        "MTN": [
            { id: '1GB', name: '1GB', price: 4.90 }, { id: '2GB', name: '2GB', price: 9.90 }, { id: '3GB', name: '3GB', price: 14.70 }, 
            { id: '4GB', name: '4GB', price: 20.00 }, { id: '5GB', name: '5GB', price: 24.60 }, { id: '6GB', name: '6GB', price: 28.00 }, 
            { id: '8GB', name: '8GB', price: 36.00 }, { id: '10GB', name: '10GB', price: 43.80 }, { id: '15GB', name: '15GB', price: 64.00 },
            { id: '20GB', name: '20GB', price: 85.00 }, { id: '25GB', name: '25GB', price: 105.00 }, { id: '30GB', name: '30GB', price: 124.50 },
            { id: '40GB', name: '40GB', price: 165.00 }, { id: '50GB', name: '50GB', price: 198.00 }
        ],
        "AirtelTigo": [
            { id: '1GB', name: '1GB', price: 4.00 }, { id: '2GB', name: '2GB', price: 8.00 }, { id: '3GB', name: '3GB', price: 12.00 },  
            { id: '4GB', name: '4GB', price: 16.00 }, { id: '5GB', name: '5GB', price: 20.00 }, { id: '6GB', name: '6GB', price: 24.00 },  
            { id: '7GB', name: '7GB', price: 27.90 }, { id: '8GB', name: '8GB', price: 32.00 }, { id: '9GB', name: '9GB', price: 36.00 },  
            { id: '10GB', name: '10GB', price: 42.00 }, { id: '12GB', name: '12GB', price: 50.00 }, { id: '15GB', name: '15GB', price: 61.30 },
            { id: '20GB', name: '20GB', price: 82.10 }
        ],
        "Telecel": [
            { id: '5GB', name: '5GB', price: 23.00 }, { id: '10GB', name: '10GB', price: 43.00 }, { id: '15GB', name: '15GB', price: 62.20 }, 
            { id: '20GB', name: '20GB', price: 83.00 }, { id: '25GB', name: '25GB', price: 103.00 }, { id: '30GB', name: '30GB', price: 123.00 },
            { id: '40GB', name: '40GB', price: 155.00 }, { id: '50GB', name: '50GB', price: 195.00 }, { id: '100GB', name: '100GB', price: 400.00}
        ]
    }
};

// --- 2. MIDDLEWARE ---
app.set('trust proxy', 1); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, ttl: 24 * 60 * 60 }),
    cookie: { secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 1000 * 60 * 60 * 24 } 
}));

app.use(express.static(path.join(__dirname, 'client/dist')));

// --- 3. ROUTES ---

// AUTH
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
        const exists = await User.findOne({ $or: [{ username }, { email }] });
        if (exists) return res.status(409).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword, role: 'Client', lastLogin: new Date() });

        req.session.user = { id: newUser._id, username, role: 'Client' };
        res.status(201).json({ message: 'Account created!', user: req.session.user });
    } catch (e) { res.status(500).json({ message: `Server Error: ${e.message}` }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
        
        user.lastLogin = new Date(); 
        await user.save();
        
        req.session.user = { id: user._id, username: user.username, role: user.role };
        res.json({ message: 'Logged in', role: user.role, user: req.session.user });
    } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/user-info', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'No session' });
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.lastLogin = new Date(); 
        await user.save();
        res.json({ username: user.username, walletBalance: user.walletBalance, role: user.role });
    } catch (e) { res.status(500).json({ error: 'Db error' }); }
});

// UPGRADE TO AGENT
app.post('/api/upgrade-agent', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    const { reference } = req.body;
    try {
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        const data = paystackRes.data.data;
        if (data.status === 'success' && data.amount >= (AGENT_FEE_GHS * 100)) {
            await User.findByIdAndUpdate(req.session.user.id, { role: 'Agent' });
            req.session.user.role = 'Agent'; 
            res.json({ success: true, message: 'Upgraded to Agent successfully!' });
        } else { res.status(400).json({ message: 'Payment verification failed.' }); }
    } catch (e) { res.status(500).json({ message: 'Verification error' }); }
});

// VERIFY TOPUP (BROWSER)
app.post('/api/verify-topup', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    const { reference, amount } = req.body; 
    try {
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        const data = paystackRes.data.data;
        const expectedTotal = amount * 1.02; 
        const paidAmount = data.amount / 100;

        if (data.status === 'success' && Math.abs(paidAmount - expectedTotal) < 0.5) {
            const exists = await Order.findOne({ reference });
            if (exists) return res.status(400).json({ message: 'Transaction already processed' });

            const user = await User.findById(req.session.user.id);
            user.walletBalance += (amount * 100); 
            await user.save();
            
            await Order.create({
                userId: user._id, reference: reference, phoneNumber: 'Wallet', network: 'WALLET',
                dataPlan: 'Wallet Funding', amount: amount, status: 'topup_successful', paymentMethod: 'paystack', role: user.role
            });
            res.json({ success: true, message: 'Wallet funded!', newBalance: user.walletBalance });
        } else { res.status(400).json({ message: 'Payment verification failed.' }); }
    } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// PURCHASE (BROWSER) - ✅ UPDATED: Automatic Send, Manual Status
app.post('/api/purchase', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    const { network, planId, phone } = req.body;
    const userId = req.session.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const priceList = (user.role === 'Agent' || user.role === 'Admin') ? PRICING.WHOLESALE : PRICING.RETAIL;
        const plan = priceList[network]?.find(p => p.id === planId);
        if (!plan) return res.status(400).json({ message: 'Invalid plan' });

        const costPesewas = Math.round(plan.price * 100);
        if (user.walletBalance < costPesewas) return res.status(400).json({ message: 'Insufficient wallet balance' });

        // 1. Create Order as PROCESSING
        const newOrder = await Order.create({
            userId: user._id, reference: `PENDING-${Date.now()}`, phoneNumber: phone,
            network: network, dataPlan: plan.name, amount: plan.price, 
            status: 'PROCESSING', paymentMethod: 'wallet', role: user.role
        });

        // 2. Deduct Money
        user.walletBalance -= costPesewas;
        await user.save();

        // 3. AUTOMATICALLY SEND DATA
        try {
            const ckNetworkKey = NETWORK_MAP[network]; 
            const cleanCapacity = planId.replace(/[A-Za-z]/g, '');

            const apiResponse = await axios.post(`${CK_BASE_URL}/data-purchase`, { 
                networkKey: ckNetworkKey, recipient: phone, capacity: cleanCapacity
            }, { headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CK_API_KEY } });
            
            const result = apiResponse.data;
            if (result.success === true) { 
                // ✅ SILENT MODE: Data sent, but we mark it as "Pending Review" (Processing)
                // so the Admin (You) can manually mark it as "Completed" later.
                newOrder.status = 'pending_review'; 
                
                newOrder.reference = result.data?.reference || `ORD-${Date.now()}`;
                await newOrder.save();
                res.json({ status: 'success', message: 'Order Placed. Processing...' });
            } else { throw new Error(result.error || "API failure"); }
        } catch (apiError) {
            console.error("API Call Failed:", apiError.message);
            user.walletBalance += costPesewas; // Auto Refund
            await user.save();
            newOrder.status = 'data_failed'; 
            await newOrder.save();
            res.status(500).json({ message: "Transaction Failed. Wallet Refunded." });
        }
    } catch (error) { res.status(500).json({ message: 'System error.' }); }
});

app.get('/api/data-plans', async (req, res) => {
    let role = 'Client';
    if (req.session.user) { try { const user = await User.findById(req.session.user.id); if (user) role = user.role; } catch (e) {} }
    const prices = (role === 'Agent' || role === 'Admin') ? PRICING.WHOLESALE : PRICING.RETAIL;
    res.json({ plans: prices, role: role });
});

app.get('/api/my-orders', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Order.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
});

app.get('/api/logout', (req, res) => req.session.destroy(() => res.json({ message: 'Logged out' })));

// ==========================================
// 🚀 CONSOLE API (For External Developers)
// ==========================================

const verifyApiKey = async (req, res, next) => {
    const key = req.headers['x-api-key'] || req.headers['authorization']; 
    if (!key) return res.status(401).json({ success: false, message: 'API Key missing' });
    const cleanKey = key.replace('Bearer ', '').trim();
    try {
        const user = await User.findOne({ apiKey: cleanKey });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid API Key' });
        req.user = user; 
        next();
    } catch (e) { res.status(500).json({ success: false, message: 'Auth Error' }); }
};

app.post('/api/generate-key', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    try {
        const newKey = `j3_live_${Math.random().toString(36).substr(2, 9)}${Date.now().toString(36)}`;
        await User.findByIdAndUpdate(req.session.user.id, { apiKey: newKey });
        res.json({ success: true, apiKey: newKey });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/get-key', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    try {
        const user = await User.findById(req.session.user.id);
        res.json({ success: true, apiKey: user.apiKey });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// EXTERNAL PURCHASE - ✅ UPDATED: Automatic Send, Manual Status
app.post('/api/v1/purchase', verifyApiKey, async (req, res) => {
    const { network, planId, phone, reference } = req.body;
    const user = req.user; 
    try {
        if (!network || !planId || !phone || !reference) return res.status(400).json({ success: false, message: 'Missing parameters' });
        const exists = await Order.findOne({ reference });
        if (exists) return res.status(409).json({ success: false, message: 'Duplicate reference' });

        const plan = PRICING.WHOLESALE[network]?.find(p => p.id === planId);
        if (!plan) return res.status(400).json({ success: false, message: 'Invalid Plan ID' });

        let finalPrice = plan.price;
        if (user.customApiPricing && user.customApiPricing[planId]) {
            finalPrice = parseFloat(user.customApiPricing[planId]);
        }
        const costPesewas = Math.round(finalPrice * 100);
        
        if (user.walletBalance < costPesewas) return res.status(402).json({ success: false, message: 'Insufficient Balance' });

        const newOrder = await Order.create({
            userId: user._id, reference: reference, phoneNumber: phone, network: network,
            dataPlan: plan.name, amount: finalPrice, status: 'PROCESSING',
            paymentMethod: 'api_wallet', role: 'API_Dev'
        });

        user.walletBalance -= costPesewas;
        await user.save();

        const ckNetworkKey = NETWORK_MAP[network]; 
        const cleanCapacity = planId.replace(/[A-Za-z]/g, '');
        const apiResponse = await axios.post(`${CK_BASE_URL}/data-purchase`, {
            networkKey: ckNetworkKey, recipient: phone, capacity: cleanCapacity
        }, { headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CK_API_KEY } });

        const result = apiResponse.data;
        if (result.success === true) {
            // ✅ SILENT MODE
            newOrder.status = 'pending_review'; 
            if(result.data?.reference) newOrder.reference = result.data.reference; 
            await newOrder.save();
            return res.json({ success: true, message: 'Order Placed. Processing...', status: 'processing', balance: user.walletBalance/100 });
        } else { throw new Error(result.error || "Provider Failed"); }
    } catch (e) {
        console.error("API Error:", e.message);
        user.walletBalance += (PRICING.WHOLESALE[network]?.find(p => p.id === planId)?.price * 100) || 0;
        await user.save();
        const failedOrder = await Order.findOne({ reference });
        if(failedOrder) { failedOrder.status = 'data_failed'; await failedOrder.save(); }
        res.status(500).json({ success: false, message: 'Transaction Failed', error: e.message });
    }
});

app.get('/api/v1/balance', verifyApiKey, async (req, res) => {
    res.json({ success: true, balance: req.user.walletBalance / 100, currency: 'GHS', role: req.user.role });
});

app.post('/api/admin/set-custom-price', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    const { targetUsername, planId, newPrice } = req.body;
    try {
        const user = await User.findOne({ username: targetUsername });
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (!user.customApiPricing) user.customApiPricing = {};
        user.customApiPricing[planId] = parseFloat(newPrice);
        user.markModified('customApiPricing');
        await user.save();
        res.json({ success: true, message: `Updated ${planId} to ${newPrice} GHS for ${targetUsername}` });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// ADMIN METRICS
app.get('/api/admin/metrics', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const totalOrders = await Order.countDocuments({});
        const userCount = await User.countDocuments({});
        const revenueResult = await Order.aggregate([ { $match: { status: { $in: ['data_sent', 'pending_review'] } } }, { $group: { _id: null, total: { $sum: "$amount" } } } ]);
        const revenue = revenueResult[0]?.total || 0;
        res.json({ revenue, totalDeposits: 0, netProfit: revenue * 0.15, totalOrders, userCount });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/all-orders', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    const orders = await Order.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'username');
    res.json({ orders });
});

app.post('/api/admin/update-order', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    const { id, status } = req.body;
    await Order.findByIdAndUpdate(id, { status });
    res.json({ success: true });
});

app.post('/api/paystack-webhook', async (req, res) => {
    res.sendStatus(200); 
    const event = req.body;
    if (event.event === 'charge.success') {
        const reference = event.data.reference;
        const totalAmountPaid = event.data.amount; 
        const email = event.data.customer.email;
        try {
            const existingOrder = await Order.findOne({ reference: reference });
            if (existingOrder) return; 

            const user = await User.findOne({ email: email });
            if (user) {
                const amountToCredit = Math.round(totalAmountPaid / 1.02);
                user.walletBalance += amountToCredit;
                await user.save();
                
                await Order.create({
                    userId: user._id, reference: reference, phoneNumber: 'Wallet', network: 'WALLET',
                    dataPlan: 'Wallet Funding (Auto)', amount: amountToCredit / 100, 
                    status: 'topup_successful', paymentMethod: 'paystack_auto'
                });
            }
        } catch (err) { console.error("Webhook Error:", err); }
    }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/dist', 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

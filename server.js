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
const { User, Order, mongoose } = require('./database.js'); 

const app = express();
const PORT = process.env.PORT || 10000;

// --- CONFIGURATION ---
const AGENT_FEE_GHS = 15.00;

// ✅ CORRECTED BASE URL (Based on Documentation)
const CK_BASE_URL = 'https://console.ckgodsway.com/api'; 

// ✅ CORRECTED NETWORK KEYS (Based on Documentation)
const NETWORK_MAP = {
    'MTN': 'YELLO',         
    'AirtelTigo': 'AT_PREMIUM',  
    'Telecel': 'TELECEL'      
};

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
            { id: '40GB', name: '40GB', price: 175.50 }, { id: '50GB', name: '50GB', price: 205.00 }, { id: '100GB', name: '100GB', price: 420.00}
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
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        maxAge: 1000 * 60 * 60 * 24 
    } 
}));

app.use(express.static(path.join(__dirname, 'client/dist')));

// --- 3. ROUTES ---

// AUTH
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
        if (mongoose.connection.readyState !== 1) throw new Error("Database not connected");

        const exists = await User.findOne({ $or: [{ username }, { email }] });
        if (exists) return res.status(409).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, email, password: hashedPassword, walletBalance: 0, role: 'Client' });

        req.session.user = { id: newUser._id, username, role: 'Client' };
        res.status(201).json({ message: 'Account created!', user: req.session.user });
    } catch (e) { res.status(500).json({ message: `Server Error: ${e.message}` }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
        
        req.session.user = { id: user._id, username: user.username, role: user.role };
        res.json({ message: 'Logged in', role: user.role, user: req.session.user });
    } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/user-info', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'No session' });
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (req.session.user.role !== user.role) req.session.user.role = user.role;
        res.json({ username: user.username, walletBalance: user.walletBalance, role: user.role });
    } catch (e) { res.status(500).json({ error: 'Db error' }); }
});

// AGENT & TOPUP
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

// --- SAFE PURCHASE ROUTE (With Auto-Refund & Corrected Payload) ---
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

        // --- STEP 1: CREATE "PROCESSING" RECORD FIRST ---
        // This guarantees you have a receipt even if the API crashes next.
        const newOrder = await Order.create({
            userId: user._id, 
            reference: `PENDING-${Date.now()}`, 
            phoneNumber: phone,
            network: network, 
            dataPlan: plan.name, 
            amount: plan.price, 
            status: 'PROCESSING', 
            paymentMethod: 'wallet', 
            role: user.role
        });

        // --- STEP 2: DEDUCT MONEY ---
        user.walletBalance -= costPesewas;
        await user.save();

        // --- STEP 3: CALL API ---
        try {
            // MAPPING: Updated based on CK Godsway Documentation
            const ckNetworkKey = NETWORK_MAP[network]; 
            // Docs require just the number string for capacity (e.g., '1GB' -> '1')
            const cleanCapacity = planId.replace(/[A-Za-z]/g, '');

            const payload = { 
                networkKey: ckNetworkKey, // Must be 'YELLO', 'AT_PREMIUM', or 'TELECEL'
                recipient: phone,
                capacity: cleanCapacity   // Must be '1', '2', etc.
            };
            
            console.log("Sending to DataHub:", payload);

            const apiResponse = await axios.post(`${CK_BASE_URL}/data-purchase`, payload, {
                headers: { 
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.CK_API_KEY // Correct Header
                }
            });
            const result = apiResponse.data;

            // Docs say: { "success": true, ... }
            if (result.success === true) { 
                // Success! Update Order
                newOrder.status = 'data_sent';
                // Use reference from API response if available, else standard fallback
                newOrder.reference = result.data?.reference || `ORD-${Date.now()}`;
                await newOrder.save();
                res.json({ status: 'success', message: 'Data sent successfully!' });
            } else {
                throw new Error(result.error || result.message || "API returned failure");
            }
        } catch (apiError) {
            console.error("API Call Failed:", apiError.response ? apiError.response.data : apiError.message);
            
            // --- STEP 4: AUTO-REFUND ON FAILURE ---
            user.walletBalance += costPesewas;
            await user.save();
            
            newOrder.status = 'data_failed'; 
            await newOrder.save();
            
            res.status(500).json({ 
                message: `Transaction Failed. Wallet Refunded. Provider Error: ${apiError.response?.data?.error || apiError.message}` 
            });
        }

    } catch (error) { 
        console.error("System Error:", error);
        res.status(500).json({ message: 'System error. Try again.' }); 
    }
});

// GET PLANS
app.get('/api/data-plans', async (req, res) => {
    let role = 'Client';
    if (req.session.user) {
        try { const user = await User.findById(req.session.user.id); if (user) role = user.role; } catch (e) {}
    }
    const prices = (role === 'Agent' || role === 'Admin') ? PRICING.WHOLESALE : PRICING.RETAIL;
    res.json({ plans: prices, role: role });
});

// HISTORY
app.get('/api/my-orders', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Order.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
});

// ADMIN METRICS (No Secret Check, just Role Check)
app.get('/api/admin/metrics', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const totalOrders = await Order.countDocuments({});
        const userCount = await User.countDocuments({});
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['data_sent', 'success'] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const depositResult = await Order.aggregate([
            { $match: { status: 'topup_successful' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const revenue = revenueResult[0]?.total || 0;
        const totalDeposits = depositResult[0]?.total || 0;
        res.json({ revenue, totalDeposits, netProfit: revenue * 0.15, totalOrders, userCount });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/admin/all-orders', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'username');
        res.json({ orders });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/admin/update-order', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'Admin') return res.status(403).json({ error: 'Unauthorized' });
    const { id, status } = req.body;
    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (status === 'data_failed' && order.status !== 'data_failed') {
            const user = await User.findById(order.userId);
            if (user) {
                user.walletBalance += (order.amount * 100); 
                await user.save();
            }
        }
        order.status = status;
        await order.save();
        res.json({ success: true, message: 'Order updated' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/logout', (req, res) => req.session.destroy(() => res.json({ message: 'Logged out' })));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/dist', 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

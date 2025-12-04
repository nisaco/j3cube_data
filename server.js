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
const { User, Order, AgentShop, mongoose } = require('./database.js'); 

const app = express();
const PORT = process.env.PORT || 10000;

// --- CONFIGURATION ---
const AGENT_FEE_GHS = 15.00;
const CK_BASE_URL = 'https://console.ckgodsway.com/api'; // Example Provider URL
const NETWORK_MAP = {
    'MTN': 'YELLO',
    'AirtelTigo': 'AT_PREMIUM', 
    'Telecel': 'TELECEL'
};

const PRICING = {
    RETAIL: { 
        "MTN": [
            { id: '1', name: '1GB', price: 6.00 }, { id: '2', name: '2GB', price: 11.00 },
            { id: '3', name: '3GB', price: 18.00 }, { id: '4', name: '4GB', price: 23.00 }, { id: '5', name: '5GB', price: 30.00 },
            { id: '6', name: '6GB', price: 36.00 }, { id: '7', name: '7GB', price: 39.00 }, { id: '8', name: '8GB', price: 43.00 },
            { id: '10', name: '10GB', price: 49.00 }, { id: '15', name: '15GB', price: 75.00 }, { id: '20', name: '20GB', price: 100.00 }, 
            { id: '25', name: '25GB', price: 128.00 }, { id: '30', name: '30GB', price: 150.00 }, { id: '40', name: '40GB', price: 195.00 },
            { id: '50', name: '50GB', price: 248.00 }
        ],
        "AirtelTigo": [
            { id: '1', name: '1GB', price: 6.00 }, { id: '2', name: '2GB', price: 10.00 }, { id: '3', name: '3GB', price: 14.00 },  
            { id: '4', name: '4GB', price: 22.00 }, { id: '5', name: '5GB', price: 26.00 }, { id: '6', name: '6GB', price: 30.00 },  
            { id: '7', name: '7GB', price: 34.00 }, { id: '8', name: '8GB', price: 38.00 }, { id: '9', name: '9GB', price: 40.00 },  
            { id: '10', name: '10GB', price: 49.00 }, { id: '12', name: '12GB', price: 53.00 }, { id: '15', name: '15GB', price: 61.00 },
            { id: '20', name: '20GB', price: 85.00 }
        ],
        "Telecel": [
            { id: '5', name: '5GB', price: 29.00 }, { id: '10', name: '10GB', price: 49.20 }, { id: '15', name: '15GB', price: 80.00 }, 
            { id: '20', name: '20GB', price: 100.00 }, { id: '25', name: '25GB', price: 120.00 }, { id: '30', name: '30GB', price: 137.00 },
            { id: '40', name: '40GB', price: 175.50 }, { id: '50', name: '50GB', price: 205.00 }, { id: '100', name: '100GB', price: 420.00}
        ]
    },
    WHOLESALE: { 
        "MTN": [
            { id: '1', name: '1GB', price: 4.90 }, { id: '2', name: '2GB', price: 9.90 }, { id: '3', name: '3GB', price: 14.70 }, 
            { id: '4', name: '4GB', price: 20.00 }, { id: '5', name: '5GB', price: 24.60 }, { id: '6', name: '6GB', price: 28.00 }, 
            { id: '8', name: '8GB', price: 36.00 }, { id: '10', name: '10GB', price: 43.80 }, { id: '15', name: '15GB', price: 64.00 },
            { id: '20', name: '20GB', price: 85.00 }, { id: '25', name: '25GB', price: 105.00 }, { id: '30', name: '30GB', price: 124.50 },
            { id: '40', name: '40GB', price: 165.00 }, { id: '50', name: '50GB', price: 198.00 }
        ],
        "AirtelTigo": [
            { id: '1', name: '1GB', price: 4.00 }, { id: '2', name: '2GB', price: 8.00 }, { id: '3', name: '3GB', price: 12.00 },  
            { id: '4', name: '4GB', price: 16.00 }, { id: '5', name: '5GB', price: 20.00 }, { id: '6', name: '6GB', price: 24.00 },  
            { id: '7', name: '7GB', price: 27.90 }, { id: '8', name: '8GB', price: 32.00 }, { id: '9', name: '9GB', price: 36.00 },  
            { id: '10', name: '10GB', price: 42.00 }, { id: '12', name: '12GB', price: 50.00 }, { id: '15', name: '15GB', price: 61.30 },
            { id: '20', name: '20GB', price: 82.10 }
        ],
        "Telecel": [
            { id: '5', name: '5GB', price: 23.00 }, { id: '10', name: '10GB', price: 43.00 }, { id: '15', name: '15GB', price: 62.20 }, 
            { id: '20', name: '20GB', price: 83.00 }, { id: '25', name: '25GB', price: 103.00 }, { id: '30', name: '30GB', price: 123.00 },
            { id: '40', name: '40GB', price: 155.00 }, { id: '50', name: '50GB', price: 195.00 }, { id: '100', name: '100GB', price: 400.00}
        ]
    }
};

// --- 2. MIDDLEWARE ---
app.set('trust proxy', 1); 

// Allow JSON body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration 
app.use(cors({
    origin: true, 
    credentials: true
}));

// Session Setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-123',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60 // 1 Day
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        maxAge: 1000 * 60 * 60 * 24 
    } 
}));

// Serve React App
app.use(express.static(path.join(__dirname, 'client/dist')));

// --- 3. ROUTES ---

// --- AUTH: SIGNUP ---
app.post('/api/signup', async (req, res) => {
    try {
        console.log("Signup Attempt:", req.body); 
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Missing fields: username, email, or password.' });
        }

        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected");
        }

        const exists = await User.findOne({ $or: [{ username }, { email }] });
        if (exists) {
            return res.status(409).json({ message: 'User already exists with this email or username.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username, 
            email, 
            password: hashedPassword, 
            walletBalance: 0, 
            role: 'Client'
        });

        req.session.user = { id: newUser._id, username, role: 'Client' };
        res.status(201).json({ message: 'Account created!', user: req.session.user });

    } catch (e) {
        console.error("SIGNUP ERROR:", e);
        res.status(500).json({ message: `Server Error: ${e.message}` });
    }
});

// --- AUTH: LOGIN ---
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        req.session.user = { id: user._id, username: user.username, role: user.role };
        res.json({ message: 'Logged in', role: user.role, user: req.session.user });
    } catch (e) { 
        res.status(500).json({ message: 'Server error' }); 
    }
});

// --- AUTH: USER INFO ---
app.get('/api/user-info', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'No session' });
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // Refresh session role if db changed
        if (req.session.user.role !== user.role) {
            req.session.user.role = user.role;
        }
        
        res.json({ username: user.username, walletBalance: user.walletBalance, role: user.role });
    } catch (e) {
        res.status(500).json({ error: 'Db error' });
    }
});

// --- AGENT: UPGRADE ---
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
        } else {
            res.status(400).json({ message: 'Payment verification failed.' });
        }
    } catch (e) {
        res.status(500).json({ message: 'Verification error' });
    }
});

// --- WALLET: TOP UP ---
app.post('/api/verify-topup', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    const { reference, amount } = req.body; 

    try {
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        const data = paystackRes.data.data;

        // Verify if they paid Amount + 2%
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
        } else {
            res.status(400).json({ message: 'Payment verification failed.' });
        }
    } catch (e) { res.status(500).json({ message: 'Server error' }); }
});

// --- DATA: PURCHASE ---
app.post('/api/purchase', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ message: 'Login required' });
    
    const { network, planId, phone } = req.body;
    const userId = req.session.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const role = user.role;
        const priceList = (role === 'Agent' || role === 'Admin') ? PRICING.WHOLESALE : PRICING.RETAIL;
        const networkPlans = priceList[network];
        const plan = networkPlans.find(p => p.id === planId);

        if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });

        const costPesewas = Math.round(plan.price * 100);
        
        if (user.walletBalance < costPesewas) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        user.walletBalance -= costPesewas;
        await user.save();

        // --- CK GODSWAY INTEGRATION (Uncomment to use real API) ---
        // const ckNetworkKey = NETWORK_MAP[network];
        // const payload = { networkKey: ckNetworkKey, recipient: phone, capacity: planId };
        // const apiResponse = await axios.post(`${CK_BASE_URL}/data-purchase`, payload, {
        //     headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.CK_API_KEY }
        // });
        // const result = apiResponse.data;
        
        // --- MOCK SUCCESS (For now) ---
        const result = { success: true, data: { orderNumber: `ORD-${Date.now()}` } };

        if (result.success) {
            await Order.create({
                userId: user._id, reference: result.data.orderNumber, phoneNumber: phone,
                network: network, dataPlan: plan.name, amount: plan.price, status: 'data_sent',
                paymentMethod: 'wallet', role: role
            });
            res.json({ status: 'success', message: 'Data sent successfully!' });
        } else {
            // Refund on failure
            user.walletBalance += costPesewas;
            await user.save();
            res.status(500).json({ message: `Failed: ${result.error}. Wallet refunded.` });
        }
    } catch (error) {
        console.error("Purchase Error:", error.message);
        res.status(500).json({ message: 'System error. Contact support.' });
    }
});

// --- DATA: GET PLANS ---
app.get('/api/data-plans', async (req, res) => {
    let role = 'Client';
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user.id);
            if (user) role = user.role;
        } catch (e) {}
    }
    const prices = (role === 'Agent' || role === 'Admin') ? PRICING.WHOLESALE : PRICING.RETAIL;
    res.json({ plans: prices, role: role });
});

// --- USER: MY ORDERS ---
app.get('/api/my-orders', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    const orders = await Order.find({ userId: req.session.user.id }).sort({ createdAt: -1 });
    res.json({ orders });
});

// --- ADMIN: METRICS ---
app.get('/api/admin/metrics', async (req, res) => {
    if (req.query.secret !== (process.env.ADMIN_SECRET || 'admin123')) return res.status(403).json({ error: 'Unauthorized' });
    try {
        const totalOrders = await Order.countDocuments({});
        const userCount = await User.countDocuments({});
        const revenueResult = await Order.aggregate([
            { $match: { status: { $in: ['data_sent', 'success'] } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const revenue = revenueResult[0]?.total || 0;
        res.json({ revenue, netProfit: revenue * 0.15, totalOrders, userCount });
    } catch(e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN: GET ALL ORDERS ---
app.get('/api/admin/all-orders', async (req, res) => {
    if (req.query.secret !== (process.env.ADMIN_SECRET || 'admin123')) return res.status(403).json({ error: 'Unauthorized' });
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(50).populate('userId', 'username');
        res.json({ orders });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ADMIN: UPDATE ORDER ---
app.post('/api/admin/update-order', async (req, res) => {
    const { id, status, secret } = req.body;
    if (secret !== (process.env.ADMIN_SECRET || 'admin123')) return res.status(403).json({ error: 'Unauthorized' });

    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        // If refunding, give money back
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

// --- LOGOUT & FALLBACK ---
app.get('/api/logout', (req, res) => req.session.destroy(() => res.json({ message: 'Logged out' })));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'client/dist', 'index.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

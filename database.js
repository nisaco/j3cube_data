const mongoose = require('mongoose');

// --- SCHEMAS ---

// 1. User Schema (Updated for Console Features)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    walletBalance: { type: Number, default: 0, min: 0 },
    payoutWalletBalance: { type: Number, default: 0, min: 0 }, 
    role: { type: String, enum: ['Client', 'Agent', 'Admin'], default: 'Client' },
    shopId: { type: String, unique: true, sparse: true }, 
    
    // ✅ NEW: CONSOLE FEATURES
    lastLogin: { type: Date }, // Tracks "Just Now" vs "Never"
    apiKey: { type: String, unique: true, sparse: true }, // The Developer's Secret Key
    customApiPricing: { type: Object, default: {} },      // Special prices (e.g. {'1GB': 4.50})
    
    createdAt: { type: Date, default: Date.now }
});

// 2. Order Schema 
const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reference: { type: String, required: true, unique: true }, 
    phoneNumber: { type: String },
    network: { type: String, enum: ['MTN', 'AirtelTigo', 'Telecel', 'WALLET', 'Bank', null] },
    dataPlan: { type: String, required: true }, 
    amount: { type: Number, required: true },
    status: { type: String, enum: [
        'payment_success', 'payment_failed', 'data_sent', 'pending_review', 'data_failed', 
        'topup_successful', 'INITIATED', 'PROCESSING', 'SUCCESSFUL', 'FAILED', 'CANCELLED',
        'withdrawal_pending', 'withdrawal_sent'
    ], required: true },
    // ✅ ENSURE 'api_wallet' IS HERE
    paymentMethod: { type: String, enum: ['paystack', 'wallet', 'payout', 'paystack_auto', 'api_wallet'] }, 
    role: { type: String, default: 'Client' }, // Track who bought it
    createdAt: { type: Date, default: Date.now }
});

// 3. AgentShop Schema 
const agentShopSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    shopId: { type: String, required: true, unique: true },
    shopName: { type: String, required: true },
    customMarkups: { 
        type: Map, 
        of: { type: Object, default: {} }, 
        default: {} 
    },
    createdAt: { type: Date, default: Date.now }
});

// 4. Withdrawal Schema
const withdrawalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    accountNumber: { type: String, required: true },
    accountName: { type: String },
    network: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

// --- MODELS ---
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const AgentShop = mongoose.model('AgentShop', agentShopSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

// --- CONNECTION ---
const mongoUri = process.env.MONGO_URI;
if(mongoUri) {
    mongoose.connect(mongoUri)
        .then(() => console.log('✅ MongoDB Connected'))
        .catch(err => console.error('❌ MongoDB Error:', err));
}

module.exports = { User, Order, AgentShop, Withdrawal, mongoose };

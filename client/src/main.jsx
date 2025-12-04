import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';       // Your Client App
import AdminApp from './AdminApp'; // Your Admin App
import './index.css';          // Tailwind imports

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Secure Admin Route */}
        <Route path="/admin/*" element={<AdminApp />} />
        
        {/* Client Routes (Catch-all) */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
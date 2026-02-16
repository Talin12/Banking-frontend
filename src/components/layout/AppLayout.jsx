import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Send,
  CreditCard,
  History,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/operations', label: 'Transfer', icon: Send },
  { path: '/virtual-cards', label: 'Cards', icon: CreditCard },
  { path: '/transactions', label: 'Transactions', icon: History },
  { path: '/edit-profile', label: 'Profile', icon: User },
];

export function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-elite-black flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-elite-border bg-elite-bg/80 backdrop-blur-xl">
        <div className="p-6 border-b border-elite-border">
          <span className="text-xl font-display font-heading text-gold">NextGen</span>
          <span className="text-elite-text-muted font-body"> Bank</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gold/10 text-gold border border-gold/30 shadow-glow-subtle'
                    : 'text-elite-text-muted hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-elite-border">
          <Button
            variant="ghost"
            size="md"
            className="w-full justify-start"
            leftIcon={<LogOut size={18} />}
            onClick={() => logout().then(() => navigate('/login'))}
          >
            Log out
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="fixed left-0 top-0 bottom-0 w-72 bg-elite-bg border-r border-elite-border z-50 lg:hidden flex flex-col"
      >
        <div className="p-4 flex items-center justify-between border-b border-elite-border">
          <span className="font-display font-heading text-gold">NextGen Bank</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 text-elite-text-muted hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                location.pathname === item.path ? 'bg-gold/10 text-gold' : 'text-elite-text-muted'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4">
          <Button variant="ghost" leftIcon={<LogOut size={18} />} onClick={() => logout().then(() => navigate('/login'))}>
            Log out
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 lg:px-8 py-4 border-b border-elite-border bg-elite-bg/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-elite-text-muted hover:text-white hover:bg-white/5"
          >
            <Menu size={24} />
          </button>
          <div className="hidden sm:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-elite-text-muted" size={18} />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-elite-surface border border-elite-border text-sm text-white placeholder-elite-text-muted focus:border-gold focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl text-elite-text-muted hover:text-white hover:bg-white/5 relative">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3 pl-2 border-l border-elite-border">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/30 to-electric/30 flex items-center justify-center text-sm font-heading">
                {user?.first_name?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">{user?.first_name || 'User'}</p>
                <p className="text-xs text-elite-text-muted">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

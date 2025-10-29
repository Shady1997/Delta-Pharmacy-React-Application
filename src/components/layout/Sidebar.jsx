import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  MessageSquare, 
  MessageCircle, 
  Bell, 
  BarChart3, 
  Users,
  X,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/',
      icon: LayoutDashboard,
      label: 'Dashboard',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/products',
      icon: Package,
      label: 'Products',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/orders',
      icon: ShoppingCart,
      label: 'Orders',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/prescriptions',
      icon: FileText,
      label: 'Prescriptions',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/support',
      icon: MessageSquare,
      label: 'Support',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Chat',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/notifications',
      icon: Bell,
      label: 'Notifications',
      roles: ['ADMIN', 'PHARMACIST', 'CUSTOMER', 'USER']
    },
    {
      path: '/analytics',
      icon: BarChart3,
      label: 'Analytics',
      roles: ['ADMIN', 'PHARMACIST']
    },
    {
      path: '/users',
      icon: Users,
      label: 'Users',
      roles: ['ADMIN']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full bg-gray-900 text-white w-64 z-50 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold">Delta Pharmacy</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-gray-800 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.role || 'CUSTOMER'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
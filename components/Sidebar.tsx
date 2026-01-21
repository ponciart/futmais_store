import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'PDV (Vendas)', path: '/pos', icon: 'shopping_bag' },
    { name: 'Pedidos', path: '/orders', icon: 'list_alt' },
    { name: 'Estoque', path: '/inventory', icon: 'inventory_2' },
    { name: 'Logistics', path: '/logistics', icon: 'local_shipping' },
    { name: 'Clientes', path: '/customers', icon: 'group' },
    { name: 'Fornecedores', path: '/suppliers', icon: 'handshake' },
    { name: 'Financeiro', path: '/financial', icon: 'payments' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-background-dark border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-20 hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2 text-primary">
          <span className="material-symbols-outlined text-3xl">sports_soccer</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-main dark:text-white">Futmais Store</h1>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2 mt-4 overflow-y-auto">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors group ${isActive(link.path)
              ? 'bg-primary/10 text-primary'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            <span className={`material-symbols-outlined ${isActive(link.path) ? 'icon-filled' : ''}`}>
              {link.icon}
            </span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer group"
        >
          <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-sm">
            {user?.email?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {user?.email?.split('@')[0] || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Clique para sair</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
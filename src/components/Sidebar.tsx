import {
  Menu,
  Home,
  Utensils,
  BookOpen,
  DollarSign,
  PieChart,
  Calendar,
  LogOut,
  ShieldCheck,
  Building2,
  Settings,
  ShoppingBag
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const superadminLinks = [
    { name: 'Panel de Clientes', href: '/', icon: Building2 },
  ];

  const companyLinks = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Gestión de Pedidos', href: '/orders', icon: ShoppingBag },
    { name: 'Ingredientes', href: '/ingredients', icon: Utensils },
    { name: 'Viandas', href: '/dishes', icon: BookOpen },
    { name: 'Costos Fijos', href: '/fixed-costs', icon: DollarSign },
    { name: 'Simulaciones / Eventos', href: '/events', icon: Calendar },
    { name: 'Ingeniería de Menús', href: '/menu-engineering', icon: PieChart },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  const navigation = user?.role === 'superadmin' ? superadminLinks : companyLinks;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 lg:hidden ${
          isOpen ? 'block' : 'hidden'
        } transition-opacity duration-300`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none border-r border-slate-800`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-950/50 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${user?.role === 'superadmin' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
               {user?.role === 'superadmin' ? (
                 <ShieldCheck className="h-6 w-6 text-white" />
               ) : (
                 <Utensils className="h-6 w-6 text-white" />
               )}
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FoodCost Pro</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col p-4 overflow-y-auto mt-2">
          <p className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-[2px] mb-4">
            {user?.role === 'superadmin' ? 'Administración SaaS' : 'Gestión Gastronómica'}
          </p>
          <ul role="list" className="flex flex-1 flex-col gap-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 ${
                      isActive
                        ? (user?.role === 'superadmin' 
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                            : 'bg-blue-600 text-white shadow-md shadow-blue-900/20')
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* User Info & Logout Button at the bottom */}
          <div className="mt-auto pt-4 border-t border-slate-800 space-y-4">
            <div className="px-3">
              <p className="text-xs font-bold text-white truncate">{user?.email}</p>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
                {user?.role === 'superadmin' ? 'Super Usuario' : 'Admin de Empresa'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-400 hover:text-white hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 shrink-0 text-red-400 group-hover:text-white" aria-hidden="true" />
              Cerrar Sesión
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}

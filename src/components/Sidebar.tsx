import {
  Menu,
  Home,
  Utensils,
  BookOpen,
  DollarSign,
  PieChart,
  Calendar
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Ingredientes', href: '/ingredients', icon: Utensils },
  { name: 'Viandas', href: '/dishes', icon: BookOpen },
  { name: 'Costos Fijos', href: '/fixed-costs', icon: DollarSign },
  { name: 'Simulaciones / Eventos', href: '/events', icon: Calendar },
  { name: 'Ingeniería de Menús', href: '/menu-engineering', icon: PieChart },
];

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) {
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-40 lg:hidden ${
          isOpen ? 'block' : 'hidden'
        } transition-opacity duration-300`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500 rounded-lg">
               <Utensils className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">FoodCost Pro</span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsOpen(false)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex flex-1 flex-col p-4 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 mt-2">Menú Principal</p>
          <ul role="list" className="flex flex-1 flex-col gap-y-1.5">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center gap-x-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`h-5 w-5 shrink-0 transition-colors duration-200 ${
                          isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
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
        </nav>
      </div>
    </>
  );
}

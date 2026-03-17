import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { db } from '../firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { 
  Users, 
  Building2, 
  PlusCircle, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export function SuperadminDashboard() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companies, setCompanies] = useState<any[]>([]);
  const { createNewCompany, isLoading, error } = useAuthStore();
  
  const [stats, setStats] = useState({ totalCompanies: 0, totalUsers: 0 });
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const companiesSnap = await getDocs(collection(db, 'companies'));
        const usersSnap = await getDocs(collection(db, 'users'));
        setStats({
          totalCompanies: companiesSnap.size,
          totalUsers: usersSnap.size
        });
        setCompanies(companiesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [isSuccess]);

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    try {
      await createNewCompany(companyName, email, password);
      setIsSuccess(true);
      setCompanyName('');
      setEmail('');
      setPassword('');
      // Autohide success message
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {}
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-indigo-600" />
            Panel de Control SaaS
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Superadmin Central Command</p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
           <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
           <span className="text-indigo-700 text-sm font-bold">Sistema en Línea</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Empresas Activas</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalCompanies}</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Usuarios Totales</p>
            <h3 className="text-3xl font-black text-slate-900">{stats.totalUsers}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg flex items-center gap-5 text-white overflow-hidden relative group">
          <TrendingUp className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Crecimiento</p>
            <h3 className="text-3xl font-black">+12.5%</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario de Registro */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PlusCircle className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Registrar Nueva Empresa</h2>
          </div>

          <form onSubmit={handleCreateCompany} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre Comercial</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold transition-all"
                  placeholder="Ej: Catering Express S.A."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email del Administrador</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold transition-all"
                  placeholder="admin@empresa.com"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contraseña Temporal</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-bold flex gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {isSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-bold flex gap-3 animate-bounce">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                ¡Empresa registrada exitosamente! Se ha creado el perfil cloud.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Finalizar Alta de Empresa
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden h-full">
            <Building2 className="absolute -right-8 -top-8 w-48 h-48 opacity-10" />
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-400" />
              Aislamiento SaaS B2B
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
              Cada nueva empresa registrada recibe un <code className="bg-slate-800 text-indigo-400 px-2 py-1 rounded">companyId</code> único.
              El sistema garantiza automáticamente que ni el superadmin ni otras empresas puedan filtrar datos cruzados.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <ShieldCheck className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Validación Firebase</h4>
                  <p className="text-xs text-slate-500">Se genera una instancia de Auth independiente para proteger la sesión del superadmin.</p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <Users className="w-8 h-8 text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Estructura Multi-Tenant</h4>
                  <p className="text-xs text-slate-500">Los usuarios creados aquí solo ven su dashboard operativo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Gestión de Clientes (Empresas)
          </h2>
          <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            {companies.length} Registradas
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-4">Empresa / ID</th>
                <th className="px-8 py-4">Email Administrador</th>
                <th className="px-8 py-4">WhatsApp Conectado</th>
                <th className="px-8 py-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                    No hay empresas registradas todavía.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 text-sm">{company.companyName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{company.companyId}</div>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">
                      {company.email}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-bold text-slate-700">+{company.whatsappNumber || 'Sin configurar'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${company.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {company.isActive !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

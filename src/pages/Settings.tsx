import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { 
  Settings as SettingsIcon, 
  Save, 
  MessageSquare, 
  Building2, 
  Globe, 
  Smartphone,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export function Settings() {
  const { user } = useAuthStore();
  const { companyProfile, fetchCompanyProfile, updateCompanyProfile, isLoading } = useStore();
  const [companyName, setCompanyName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user?.companyId) {
      fetchCompanyProfile(user.companyId);
    }
  }, [user?.companyId, fetchCompanyProfile]);

  useEffect(() => {
    if (companyProfile) {
      setCompanyName(companyProfile.companyName || '');
      setWhatsappNumber(companyProfile.whatsappNumber || '');
    }
  }, [companyProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompanyProfile({
      companyName,
      whatsappNumber
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-indigo-600" />
            Configuración del Perfil
          </h1>
          <p className="text-slate-500 font-medium mt-1">Gestiona la identidad de tu empresa y canales de contacto.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Datos de la Empresa
              </h2>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Comercial</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all bg-slate-50/30"
                      placeholder="Ej: Sabores del Chef"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">WhatsApp para Pedidos (Formato Internacional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 font-bold transition-all bg-slate-50/30"
                      placeholder="5491122334455"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">
                    * Incluye código de país y área sin el signo "+". Este número recibirá los links de pedido directo.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                {showSuccess && (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-5 h-5" />
                    ¡Perfil actualizado!
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="ml-auto inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>

          <div className="bg-indigo-900 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl group">
            <Globe className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-indigo-400" />
              Vista de Cliente Final
            </h3>
            <p className="text-indigo-100/80 text-sm font-medium leading-relaxed mb-6">
              Tus clientes verán el nombre de tu empresa en el encabezado del menú público y los pedidos te llegarán al número configurado arriba. Asegúrate de que el número sea correcto para no perder ventas.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="font-black text-slate-900 mb-4 text-sm uppercase tracking-widest">Suscripción SaaS</h3>
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Estado Cuenta</p>
                <p className="text-emerald-900 font-black">Plan Premium</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

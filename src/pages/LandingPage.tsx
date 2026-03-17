import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShoppingBag, 
  Zap, 
  Clock, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  LayoutDashboard,
  ChefHat,
  Smartphone,
  Check,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { generateSalesWhatsAppLink } from '../utils/whatsappUtils';

export function LandingPage() {
  const whatsappLink = generateSalesWhatsAppLink();

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header / Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
               <ChefHat className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">Viandas<span className="text-indigo-600">Pro</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">Características</a>
            <a href="#problem" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-widest">El Problema</a>
            <Link to="/login" className="bg-slate-900 text-white px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6">
        <div className="absolute inset-0 -z-10">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] opacity-60 translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-50 rounded-full blur-[100px] opacity-50 -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-[1000ms]">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-4">
             <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
             <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">El Futuro de las Viandas</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.95]">
            Multiplicá tus ventas, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">dividí tu estrés.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            La plataforma SaaS que automatiza tus pedidos por WhatsApp y profesionaliza tu negocio gastronómico en minutos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a 
              href={whatsappLink}
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 transform hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Pedir Demo Gratuita
              <ArrowRight className="w-6 h-6" />
            </a>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">
               Sin compromiso • Trial de 14 días
            </p>
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section id="problem" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-6">
             <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Basta de <span className="text-red-500 line-through decoration-red-500/30">pedidos manuales</span> en chats infinitos.
             </h2>
             <p className="text-lg text-slate-500 font-medium">
                Gestionar un negocio de viandas no debería ser una pesadilla de excels, notas de voz y cuadernos perdidos.
             </p>
             
             <div className="space-y-4 pt-4">
                {[
                  "Errores en cantidades por audios de WhatsApp.",
                  "Perder tiempo respondiendo consultas de precios.",
                  "Olvidos en la entrega por falta de una lista clara.",
                  "Nulo control de tus costos reales y margen."
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-bold">
                     <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <span className="text-lg leading-none">×</span>
                     </div>
                     {item}
                  </div>
                ))}
             </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8">
                <div className="bg-emerald-500/10 text-emerald-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" />
                   La Alternativa Pro
                </div>
             </div>
             
             <div className="space-y-8 mt-10">
                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">Landing de Pedidos Propia</h4>
                      <p className="text-slate-500 font-medium">Tus clientes eligen su menú en una web premium, sin instalar apps.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">Panel de Control CRM</h4>
                      <p className="text-slate-500 font-medium">Todas tus ventas ordenadas por estado: Pagado, En tránsito, Entregado.</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Zap className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-900 mb-1">Automatización WhatsApp</h4>
                      <p className="text-slate-500 font-medium">El cliente te envía una captura del pedido con un solo click. Sin errores.</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight">Potencia Gastronómica.</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto italic">Herramientas diseñadas por y para cocineros.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center sm:text-left">
            <FeatureCard 
              icon={<Calendar className="w-6 h-6" />}
              title="Menú Semanal Inteligente"
              description="Planifica tus semanas, platos e insumos en segundos. Genera links públicos de venta instantáneos."
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
            <FeatureCard 
              icon={<ShoppingBag className="w-6 h-6" />}
              title="Pedidos Sin Fricción"
              description="Carrito de compras mobile-first. El cliente elige platos para toda la semana en una sola sesión de compra."
              color="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <FeatureCard 
              icon={<LayoutDashboard className="w-6 h-6" />}
              title="Gestión de Producción"
              description="Sabé exactamente cuántas porciones cocinar de cada plato. Listas de insumos automáticas para tu compra."
              color="text-sky-600"
              bgColor="bg-sky-50"
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="Marketing Directo"
              description="Base de datos de clientes exportable para tus campañas de fidelización y promociones vía WhatsApp."
              color="text-amber-600"
              bgColor="bg-amber-50"
            />
            <FeatureCard 
              icon={<Smartphone className="w-6 h-6" />}
              title="Checkout WhatsApp"
              description="El pedido aterriza directo en tu chat con todo el detalle de platos, cantidades y total a cobrar."
              color="text-rose-600"
              bgColor="bg-rose-50"
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Multi-Tenant SaaS"
              description="Seguridad bancaria para tus datos. Tu información comercial aislada, privada y siempre disponible."
              color="text-violet-600"
              bgColor="bg-violet-50"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900 rounded-[4rem] p-12 md:p-24 overflow-hidden relative shadow-[0_40px_100px_-20px_rgba(15,23,42,0.5)]">
             <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
             
             <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                  <h2 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight">
                    ¿Listo para llevar tu cocina al <span className="text-indigo-400 font-black">nivel profesional?</span>
                  </h2>
                  <div className="flex items-center gap-6">
                    <a 
                      href={whatsappLink}
                      className="bg-white text-slate-900 px-10 py-6 rounded-[2rem] text-lg font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                      Empezar Ahora
                      <ArrowRight className="w-6 h-6" />
                    </a>
                  </div>
                </div>

                <div className="space-y-6 md:pl-20">
                   {[
                     "Implementación en 24hs",
                     "Capacitación personalizada por WhatsApp",
                     "Sin costo de mantenimiento",
                     "Actualizaciones semanales gratuitas"
                   ].map((item, i) => (
                     <div key={i} className="flex items-center gap-4 text-white/70 font-bold">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                           <Check className="w-4 h-4" />
                        </div>
                        {item}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                 <ChefHat className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">Viandas<span className="text-indigo-600">Pro</span></span>
           </div>

           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
              © 2026 ViandasPro SaaS. Todos los derechos reservados. <br className="md:hidden" /> Desarrollado por Advanced Agentic Coding.
           </p>

           <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[2px] font-black text-[10px]">Privacidad</a>
              <a href="#" className="text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-[2px] font-black text-[10px]">Términos</a>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, color, bgColor }: { icon: React.ReactNode, title: string, description: string, color: string, bgColor: string }) {
  return (
    <div className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-indigo-100 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-50 hover:-translate-y-2">
       <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          {icon}
       </div>
       <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight leading-tight">{title}</h3>
       <p className="text-slate-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}

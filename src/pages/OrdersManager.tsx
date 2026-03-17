import React, { useState, useMemo } from 'react';
import { useStore, Order } from '../store/useStore';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Package, 
  User, 
  Phone, 
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Loader2,
  Calendar,
  MessageSquare
} from 'lucide-react';

export function OrdersManager() {
  const { orders, updateOrderStatus, isLoading, error } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'completed'>('all');

  const stats = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      approved: orders.filter(o => o.status === 'approved').length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0)
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    return orders.filter(o => o.status === filter);
  }, [orders, filter]);

  const groupedOrders = useMemo(() => {
    return {
      pending: orders.filter(o => o.status === 'pending'),
      approved: orders.filter(o => o.status === 'approved'),
      completed: orders.filter(o => o.status === 'completed')
    };
  }, [orders]);

  const handleUpdateStatus = async (orderId: string, status: 'approved' | 'completed') => {
    await updateOrderStatus(orderId, status);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="w-10 h-10 text-indigo-600" />
            Gestión de Pedidos
          </h1>
          <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-xs">Panel de Control de Órdenes</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pendientes</p>
             <p className="text-xl font-black text-amber-500">{stats.pending}</p>
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Aprobados</p>
             <p className="text-xl font-black text-blue-500">{stats.approved}</p>
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Completados</p>
             <p className="text-xl font-black text-emerald-500">{stats.completed}</p>
          </div>
          <div className="bg-indigo-600 px-4 py-3 rounded-2xl shadow-lg shadow-indigo-100">
             <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider">Ventas Totales</p>
             <p className="text-xl font-black text-white">${stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Sincronizando Pedidos Cloud...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Column: PENDING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Nuevos / Pendientes
              </h2>
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-[10px] font-black">{groupedOrders.pending.length}</span>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-slate-50/50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200">
              {groupedOrders.pending.length === 0 && (
                <div className="h-40 flex items-center justify-center text-slate-300 italic text-sm text-center px-8">
                   No hay pedidos nuevos por el momento.
                </div>
              )}
              {groupedOrders.pending.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAction={() => handleUpdateStatus(order.id, 'approved')}
                  actionLabel="Aprobar (Pago Recibido)"
                  actionColor="bg-emerald-600 hover:bg-emerald-700"
                />
              ))}
            </div>
          </div>

          {/* Column: APPROVED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                En Preparación / Aprobados
              </h2>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg text-[10px] font-black">{groupedOrders.approved.length}</span>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-slate-50/50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200">
              {groupedOrders.approved.length === 0 && (
                <div className="h-40 flex items-center justify-center text-slate-300 italic text-sm text-center px-8">
                   Nada en preparación actualmente.
                </div>
              )}
              {groupedOrders.approved.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onAction={() => handleUpdateStatus(order.id, 'completed')}
                  actionLabel="Marcar Entregado"
                  actionColor="bg-indigo-600 hover:bg-indigo-700"
                />
              ))}
            </div>
          </div>

          {/* Column: COMPLETED */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Historial / Completados
              </h2>
              <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-[10px] font-black">{groupedOrders.completed.length}</span>
            </div>
            
            <div className="space-y-4 min-h-[500px] bg-slate-50/50 p-4 rounded-[2rem] border-2 border-dashed border-slate-200">
              {groupedOrders.completed.length === 0 && (
                <div className="h-40 flex items-center justify-center text-slate-300 italic text-sm text-center px-8">
                   No hay pedidos completados recientemente.
                </div>
              )}
              {groupedOrders.completed.map(order => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  isReadOnly
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ 
  order, 
  onAction, 
  actionLabel, 
  actionColor, 
  isReadOnly 
}: { 
  order: Order, 
  onAction?: () => void, 
  actionLabel?: string, 
  actionColor?: string,
  isReadOnly?: boolean 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group items by day for cleaner display
  const itemsByDay = useMemo(() => {
    return order.items.reduce((acc, item) => {
      if (!acc[item.dayName]) acc[item.dayName] = [];
      acc[item.dayName].push(item);
      return acc;
    }, {} as Record<string, typeof order.items>);
  }, [order.items]);

  return (
    <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500 shadow-xl' : 'hover:shadow-md'}`}>
       <div className="p-6 space-y-4">
          {/* Customer Info */}
          <div className="flex items-start justify-between">
             <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                   <User className="w-5 h-5" />
                </div>
                <div>
                   <h4 className="font-black text-slate-900 leading-tight uppercase tracking-tight">{order.customer.name} {order.customer.lastName}</h4>
                   <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      {order.customer.phone}
                   </p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                <p className="text-lg font-black text-slate-900">${order.totalAmount.toFixed(2)}</p>
             </div>
          </div>

          {/* Quick Item List or Expanded Breakdown */}
          <div className="bg-slate-50/80 rounded-2xl p-4 space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] flex items-center gap-1">
                   <ShoppingBag className="w-3 h-3" />
                   {order.items.reduce((sum, i) => sum + i.quantity, 0)} Platos
                </span>
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest transition-colors"
                >
                  {isExpanded ? 'Ver Menos' : 'Ver Detalle'}
                </button>
             </div>

             {isExpanded ? (
               <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {Object.entries(itemsByDay).map(([day, items]) => (
                    <div key={day} className="space-y-1">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">{day}</p>
                       {items.map(item => (
                         <div key={item.id} className="flex justify-between text-xs py-1">
                            <span className="font-bold text-slate-700">{item.quantity}x {item.dishName}</span>
                            <span className="text-slate-400">${(item.quantity * item.priceAtOrder).toFixed(2)}</span>
                         </div>
                       ))}
                    </div>
                  ))}
                  {order.customer.notes && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                       <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <MessageSquare className="w-3 h-3" /> Notas
                       </p>
                       <p className="text-xs text-amber-900 font-medium italic">"{order.customer.notes}"</p>
                    </div>
                  )}
               </div>
             ) : (
               <div className="text-xs text-slate-500 font-medium line-clamp-1">
                  {order.items.map(i => `${i.quantity}x ${i.dishName}`).join(', ')}
               </div>
             )}
          </div>

          {/* Footer Actions */}
          {!isReadOnly && onAction && (
             <button 
               onClick={onAction}
               className={`w-full py-4 ${actionColor} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
             >
                <CheckCircle2 className="w-4 h-4" />
                {actionLabel}
             </button>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-[2px] bg-emerald-50 py-2 rounded-xl border border-emerald-100">
               <CheckCircle2 className="w-3 h-3" />
               Entregado / Completado
            </div>
          )}
          
          <div className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-widest">
             Ref: {order.id.slice(-8)} • {new Date(order.createdAt).toLocaleString()}
          </div>
       </div>
    </div>
  );
}

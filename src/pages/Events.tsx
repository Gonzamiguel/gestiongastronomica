import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Calendar, Plus, ChevronRight, Settings, ExternalLink, Trash2, TrendingUp, AlertTriangle, CheckCircle2, Info, DollarSign, PieChart as PieChartIcon, ShoppingBag, Utensils } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export function EventsList() {
  const { events, addEvent, deleteEvent, setActiveEvent } = useStore();
  const navigate = useNavigate();
  const [newEventName, setNewEventName] = useState('');

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;
    
    addEvent({
      name: newEventName,
      fixedSellingPrice: 0,
      isActive: events.length === 0, // El primero es activo por defecto
      items: [],
      useGlobalFixedCosts: true,
      customCosts: []
    });
    setNewEventName('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eventos y Ciclos de Menú</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-3xl">
            Gestiona tus menús semanales o eventos de catering. Cada evento tiene su propio pricing y selección de platos para evaluar rentabilidad de forma aislada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create new event */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
               <Calendar className="w-5 h-5 text-indigo-500" /> Nuevo Evento
            </h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Nombre del Ciclo/Evento</label>
                <div className="mt-2">
                  <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="Ej. Viandas Sem 12 / Casamiento Juan"
                    className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={!newEventName}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                Crear y Configurar
              </button>
            </form>
          </div>
        </div>

        {/* List of events */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900">Historial de Eventos</h3>
            </div>
            <div className="p-4 sm:p-6 bg-slate-50 min-h-[400px]">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-slate-300">
                  <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                  <span className="text-slate-600 font-medium">Aún no hay eventos.</span>
                  <span className="text-sm text-slate-400 mt-2 max-w-sm">
                    Crea tu primer ciclo de viandas o evento para empezar a costear y fijar precios.
                  </span>
                </div>
              ) : (
                <ul className="grid grid-cols-1 gap-4">
                  {events.map((evt) => (
                    <li key={evt.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-bold text-slate-900">{evt.name}</h4>
                          {evt.isActive && (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Activo (En Dashboard)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-4">
                           <span>{evt.items.length} Platos</span>
                           <span>Precio Fijo: ${evt.fixedSellingPrice.toFixed(2)}</span>
                           <span>{new Date(evt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                         {!evt.isActive && (
                           <button 
                             onClick={() => setActiveEvent(evt.id)}
                             className="text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                           >
                              Fijar Activo
                           </button>
                         )}
                         <Link 
                           to={`/events/${evt.id}`}
                           className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors"
                         >
                           <Settings className="w-4 h-4" /> Configurar Simulador
                         </Link>
                         <button 
                           onClick={() => deleteEvent(evt.id)}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                           title="Eliminar Evento"
                         >
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    events, 
    updateEvent, 
    dishes, 
    addEventItem, 
    updateEventItem, 
    removeEventItem,
    fixedCosts 
  } = useStore();

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="p-12 text-center max-w-3xl mx-auto space-y-6">
         <h1 className="text-2xl font-bold text-slate-900">Evento no encontrado</h1>
         <Link to="/events" className="inline-block text-indigo-600 font-medium hover:underline">← Volver a Eventos</Link>
      </div>
    );
  }

  // Calculate Metrics
  const totalMix = event.items.reduce((acc, item) => acc + item.expectedSalesPercentage, 0);
  
  const weightedAverageCost = event.items.reduce((acc, item) => {
    const dish = dishes.find(d => d.id === item.dishId);
    if (!dish) return acc;
    return acc + (dish.totalCost * (item.expectedSalesPercentage / 100));
  }, 0);

  const margin = event.fixedSellingPrice - weightedAverageCost;
  const marginPercentage = event.fixedSellingPrice > 0 ? (margin / event.fixedSellingPrice) * 100 : 0;
  
  const globalFixedCostsTotal = fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  const eventCustomCostsTotal = (event.customCosts || []).reduce((acc, cost) => acc + cost.amount, 0);
  const isCateringMode = event.useGlobalFixedCosts === false;
  const totalFixedCosts = (isCateringMode ? 0 : globalFixedCostsTotal) + eventCustomCostsTotal;
  
  const breakEvenPoint = margin > 0 ? totalFixedCosts / margin : 0;

  // Catering Mode calculations
  const guests = event.guestCount || 0;
  const totalRevenue = guests * event.fixedSellingPrice;
  const totalFoodCost = guests * weightedAverageCost;
  const netProfit = totalRevenue - totalFoodCost - eventCustomCostsTotal;

  const getMarginColor = (pct: number) => {
    if (pct >= 40) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 25) return 'text-blue-600 bg-blue-50';
    if (pct > 0) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const chartData = event.items
    .map(item => {
      const dish = dishes.find(d => d.id === item.dishId);
      return {
        name: dish?.name || 'Desconocido',
        value: item.expectedSalesPercentage
      };
    })
    .filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const unassignedDishes = dishes.filter(d => !event.items.some(i => i.dishId === d.id));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
           <Link to="/events" className="text-sm text-indigo-600 font-medium hover:underline mb-2 inline-block">← Volver a Eventos</Link>
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">{event.name}</h1>
             <Link 
               to={`/menu/${event.id}`}
               target="_blank"
               className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
             >
               Ver Vista Pública <ExternalLink className="w-3 h-3" />
             </Link>
           </div>
           <p className="mt-2 text-sm text-slate-500 max-w-3xl">
             Simula la rentabilidad aislando el "Sales Mix" y el Precio Único exclusivos de este Evento/Ciclo.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Editor de Mix y Platos */}
        <div className="xl:col-span-2 space-y-8">
           {/* Setting Price */}
           <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
             
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
               <DollarSign className="w-32 h-32" />
             </div>

             <div>
               <h2 className="text-lg font-bold text-slate-900">Precio Único de Venta</h2>
               <p className="text-sm text-slate-500 mt-1 max-w-md">Establece a cuánto cobrarás cada vianda (o el cubierto) en este evento en particular.</p>
             </div>
             <div className="relative w-full sm:w-64">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <span className="text-slate-500 font-medium text-lg">$</span>
                </div>
                <input
                  type="number"
                  value={event.fixedSellingPrice || ''}
                  onChange={(e) => updateEvent(event.id, { fixedSellingPrice: Number(e.target.value) })}
                  className="block w-full rounded-xl border-0 py-4 pl-10 pr-4 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl font-bold shadow-sm"
                  placeholder="0.00"
                />
             </div>
           </div>

           {/* Mix de Ventas */}
           <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
             <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-slate-900">Sales Mix (Mix de Ventas)</h3>
                  <p className="mt-1 text-sm text-slate-500">¿Qué porcentaje de los clientes elegirá cada plato en este evento?</p>
                </div>
                
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${totalMix === 100 ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'}`}>
                  {totalMix === 100 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  Mix Total: {totalMix}%
                </div>
             </div>

             <div className="p-6">
                <div className="space-y-4">
                  {event.items.map(item => {
                    const dish = dishes.find(d => d.id === item.dishId);
                    if (!dish) return null;
                    return (
                      <div key={item.dishId} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
                        <div className="flex-1 flex justify-between items-center sm:block">
                           <h4 className="font-bold text-slate-900 block truncate">{dish.name}</h4>
                           <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">Costo base: ${dish.totalCost.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2 sm:mt-0">
                           <div className="relative w-32 shrink-0">
                             <input
                               type="number"
                               value={item.expectedSalesPercentage || ''}
                               onChange={(e) => updateEventItem(event.id, item.dishId, Number(e.target.value))}
                               className={`block w-full rounded-lg border-0 py-2.5 pr-8 pl-4 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset text-center font-bold shadow-sm ${totalMix > 100 ? 'ring-red-300 focus:ring-red-600' : 'ring-slate-300 focus:ring-indigo-600'}`}
                             />
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                               <span className="text-slate-400 font-medium">%</span>
                             </div>
                           </div>
                           <button 
                             onClick={() => removeEventItem(event.id, item.dishId)}
                             className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Remover Plato de este Evento"
                           >
                              <Trash2 className="w-5 h-5" />
                           </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Agregar Nuevo Plato al Evento */}
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-900 mb-2">Añadir plato del catálogo a este Evento:</label>
                  <div className="flex gap-3">
                    <select 
                      id="add-dish-select"
                      className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      defaultValue=""
                    >
                       <option value="" disabled>Seleccionar Plato...</option>
                       {unassignedDishes.map(d => (
                         <option key={d.id} value={d.id}>{d.name} (${d.totalCost.toFixed(2)})</option>
                       ))}
                    </select>
                    <button 
                      type="button"
                      onClick={() => {
                        const select = document.getElementById('add-dish-select') as HTMLSelectElement;
                        if (select.value) {
                          addEventItem(event.id, select.value);
                          select.value = "";
                        }
                      }}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Añadir
                    </button>
                  </div>
                </div>
             </div>
           </div>
           {/* Gastos Directos del Evento */}
           <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden mt-8">
             <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold leading-6 text-slate-900">Costos Fijos y Gastos del Evento</h3>
                  <p className="mt-1 text-sm text-slate-500">Configura gastos directos y decide si este evento absorbe gastos generales.</p>
                </div>
                
                {/* Toggle Switch */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-700">Prorratear Costos Fijos Mensuales</span>
                  <button
                    type="button"
                    onClick={() => updateEvent(event.id, { useGlobalFixedCosts: event.useGlobalFixedCosts === false ? true : false })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${event.useGlobalFixedCosts !== false ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${event.useGlobalFixedCosts !== false ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                 </div>
             </div>

             <div className="p-6">
                {!event.useGlobalFixedCosts && (
                  <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                       <Utensils className="w-24 h-24 text-indigo-900" />
                     </div>
                     <h4 className="text-lg font-bold text-indigo-900 mb-2">Modo Evento Cerrado</h4>
                     <p className="text-sm text-indigo-700/80 mb-4 max-w-sm">No estás incluyendo los gastos mensuales globales. Estás simulando la rentabilidad absoluta de un catering o pedido grande.</p>
                     
                     <div className="relative max-w-xs">
                        <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">Cantidad de Personas / Cubiertos Totales</label>
                        <input
                          type="number"
                          value={event.guestCount || ''}
                          onChange={(e) => updateEvent(event.id, { guestCount: Number(e.target.value) })}
                          min="0"
                          className="block w-full rounded-xl border-0 py-3 px-4 text-indigo-900 ring-1 ring-inset ring-indigo-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-lg font-bold shadow-sm"
                          placeholder="0"
                        />
                     </div>
                  </div>
                )}

                <div className="space-y-4">
                   <h4 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">Gastos Directos (Fletes, Sillas extra, etc)</h4>
                   
                   {(!event.customCosts || event.customCosts.length === 0) ? (
                     <p className="text-sm text-slate-500 text-center py-4">No hay gastos directos exclusivos registrados.</p>
                   ) : (
                     <ul className="space-y-3">
                       {event.customCosts.map(cost => (
                         <li key={cost.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-slate-50">
                            <span className="font-medium text-slate-900">{cost.name}</span>
                            <div className="flex items-center gap-4">
                               <span className="font-bold text-slate-700">${cost.amount.toFixed(2)}</span>
                               <button 
                                 onClick={() => {
                                   const newCosts = event.customCosts.filter(c => c.id !== cost.id);
                                   updateEvent(event.id, { customCosts: newCosts });
                                 }}
                                 className="text-slate-400 hover:text-red-600 transition-colors"
                               >
                                  <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </li>
                       ))}
                     </ul>
                   )}

                   {/* Add Custom Cost */}
                   <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                     <input 
                       type="text"
                       placeholder="Nombre del Gasto (ej: Flete)"
                       id={`new-cost-name-${event.id}`}
                       className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                     />
                     <div className="relative w-48 shrink-0">
                       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                         <span className="text-slate-500 font-medium">$</span>
                       </div>
                       <input 
                         type="number"
                         placeholder="0.00"
                         id={`new-cost-amount-${event.id}`}
                         className="block w-full rounded-lg border-slate-300 py-2.5 pl-8 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                       />
                     </div>
                     <button 
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById(`new-cost-name-${event.id}`) as HTMLInputElement;
                          const amountInput = document.getElementById(`new-cost-amount-${event.id}`) as HTMLInputElement;
                          if (nameInput && amountInput && nameInput.value && amountInput.value) {
                             const newCost = {
                               id: crypto.randomUUID(),
                               name: nameInput.value,
                               amount: Number(amountInput.value)
                             };
                             updateEvent(event.id, { customCosts: [...(event.customCosts || []), newCost] });
                             nameInput.value = '';
                             amountInput.value = '';
                          }
                        }}
                        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors shadow-sm"
                     >
                        <Plus className="w-4 h-4" /> Agregar
                     </button>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Simulador Matemático (HUD) */}
        <div className="xl:col-span-1 space-y-6">
           <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
             
             {/* Abstract background graphics */}
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-5 pointer-events-none" />
             <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-white opacity-5 pointer-events-none" />

             <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-indigo-400" /> HUD: Rentabilidad del {isCateringMode ? 'Evento' : 'Ciclo'}
             </h3>

             <div className="space-y-6 relative z-10">
                {!isCateringMode ? (
                  // HUD: VIANDAS MODE 
                  <>
                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Costo Promedio Ponderado (WAC)</p>
                       <div className="flex items-end gap-2">
                         <span className="text-3xl font-black">${weightedAverageCost.toFixed(2)}</span>
                         <span className="text-xs text-slate-400 pb-1">/ unidad</span>
                       </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1 flex justify-between items-center">
                         Margen de Contribución
                         <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getMarginColor(marginPercentage)}`}>
                           {marginPercentage.toFixed(1)}%
                         </span>
                       </p>
                       <div className="flex items-end gap-2">
                         <span className="text-3xl font-black">${margin.toFixed(2)}</span>
                         <span className="text-xs text-slate-400 pb-1">ganancia neta / unidad</span>
                       </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Punto de Equilibrio (Break-even)</p>
                       <div className="flex items-end gap-2">
                         <span className="text-3xl font-black">{Math.ceil(breakEvenPoint)}</span>
                         <span className="text-xs text-slate-400 pb-1">ventas requeridas al mes</span>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                         Basado en Costos Fijos de <b>${totalFixedCosts.toFixed(2)}</b> divididos por el margen de este evento.
                       </p>
                    </div>
                  </>
                ) : (
                  // HUD: CATERING MODE
                  <>
                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Ingresos Totales (Revenue)</p>
                       <div className="flex items-end gap-2">
                         <span className="text-3xl font-black text-emerald-400">${totalRevenue.toFixed(2)}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                         Precio de venta (${event.fixedSellingPrice}) x {guests} personas
                       </p>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Food Cost Total</p>
                       <div className="flex items-end gap-2">
                         <span className="text-2xl font-bold text-slate-200">-${totalFoodCost.toFixed(2)}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                         WAC Unitario (${weightedAverageCost.toFixed(2)}) x {guests} personas
                       </p>
                    </div>

                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Gastos Directos del Evento</p>
                       <div className="flex items-end gap-2">
                         <span className="text-2xl font-bold text-slate-200">-${eventCustomCostsTotal.toFixed(2)}</span>
                       </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div>
                       <p className="text-sm text-slate-400 font-medium mb-1">Ganancia Neta del Evento</p>
                       <div className="flex items-end gap-2">
                         <span className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                           ${netProfit.toFixed(2)}
                         </span>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-2 leading-tight">
                         Rentabilidad final exclusiva de esta operación.
                       </p>
                    </div>
                  </>
                )}
             </div>
           </div>

           {/* Chart */}
           {chartData.length > 0 && totalMix > 0 && (
             <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Distribución del Mix (%)</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: any) => [`${value}%`, 'Expectativa']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

export function PublicMenu() {
  const { id } = useParams<{ id: string }>();
  const { events, dishes } = useStore();
  
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <h1 className="text-2xl font-bold text-slate-900 mb-2">Menú no encontrado</h1>
         <p className="text-slate-500">El evento que buscas no existe o ha expirado.</p>
      </div>
    );
  }

  // Filtrar platos que tienen > 0% de ventas estimadas para mostrarlos en el menú
  const menuItems = event.items
    .filter(i => i.expectedSalesPercentage > 0)
    .map(i => dishes.find(d => d.id === i.dishId))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#fafaf9] py-12 px-4 sm:px-6">
       <div className="max-w-2xl mx-auto">
          {/* Header minimalista */}
          <div className="text-center mb-16">
             <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-900 text-white mb-6">
                <ShoppingBag className="w-8 h-8" />
             </div>
             <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">{event.name}</h1>
             <div className="w-16 h-1 bg-indigo-600 mx-auto rounded-full"></div>
             <p className="mt-6 text-base text-slate-500">Selección especial de viandas para este ciclo.</p>
          </div>

          {/* Menú List */}
          {menuItems.length === 0 ? (
             <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-slate-100">
               <p className="text-slate-500">Aún no hay platos confirmados para este menú.</p>
             </div>
          ) : (
             <div className="grid gap-6">
                {menuItems.map(dish => (
                  <div key={dish?.id} className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow">
                     <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{dish?.name}</h3>
                        {/* En el futuro se puede añadir 'description' a Dish. Por ahora mostramos ingredientes */}
                        <p className="text-sm text-slate-500 leading-relaxed max-w-md">
                          Nuestros platos están elaborados con ingredientes de primera calidad para garantizar el mejor sabor.
                        </p>
                     </div>
                     <div className="shrink-0 text-left sm:text-right">
                        <span className="inline-block px-4 py-2 bg-slate-50 text-slate-900 font-bold rounded-xl border border-slate-200">
                          Incluido
                        </span>
                     </div>
                  </div>
                ))}
             </div>
          )}

          <div className="mt-16 text-center">
             <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold flex items-center justify-center gap-2">
               Powered by FoodCost Pro <Utensils className="w-3 h-3" />
             </p>
          </div>
       </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useStore, MenuEvent } from '../store/useStore';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Calendar, Plus, ChevronRight, Settings, ExternalLink, Trash2,
  TrendingUp, AlertTriangle, CheckCircle2, Info, DollarSign,
  PieChart as PieChartIcon, ShoppingBag, Utensils, CalendarDays,
  CloudUpload, Loader2, Save, Minus, X, User, Mail, Phone, ArrowRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { generateWhatsAppLink } from '../utils/whatsappUtils';
import { CompanyProfile, Order, OrderItem } from '../store/useStore';

export function EventsList() {
  const {
    events, addEvent, deleteEvent, setActiveEvent,
    fetchEvents, isLoading, error, deleteEventFirestore
  } = useStore();
  const navigate = useNavigate();
  const [newEventName, setNewEventName] = useState('');

  // Sincronización con la nube al montar
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim()) return;

    addEvent({
      name: newEventName,
      fixedSellingPrice: 0,
      isActive: events.length === 0,
      useGlobalFixedCosts: true,
      customCosts: [],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]
    });
    setNewEventName('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este evento de la nube?')) {
      await deleteEventFirestore(id);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Eventos y Ciclos de Menú</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-3xl">
            Gestiona tus menús semanales o eventos de catering. Los datos se sincronizan automáticamente con Firestore.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full text-sm font-medium animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Sincronizando...
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <span>Error de conexión: {error}</span>
        </div>
      )}

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
                disabled={!newEventName || isLoading}
                className="w-full rounded-lg bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                Crear Localmente
              </button>
            </form>
          </div>
        </div>

        {/* List of events */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900">Historial de Eventos (Firestore)</h3>
            </div>
            <div className="p-4 sm:p-6 bg-slate-50 min-h-[400px]">
              {events.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-slate-300">
                  <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                  <span className="text-slate-600 font-medium">Aún no hay eventos en la nube.</span>
                  <span className="text-sm text-slate-400 mt-2 max-w-sm">
                    Crea un evento y entra a su simulador para guardarlo en Firestore.
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
                              Activo
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 mt-1 flex flex-wrap gap-4">
                          <span>{evt.dailyMenus.length} Días</span>
                          <span>Precio Fijo: ${evt.fixedSellingPrice.toFixed(2)}</span>
                          <span>{new Date(evt.startDate).toLocaleDateString()} al {new Date(evt.endDate).toLocaleDateString()}</span>
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
                          onClick={() => handleDelete(evt.id)}
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
    generateDailyMenus,
    fixedCosts,
    saveEvent,
    isLoading,
    error
  } = useStore();

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const event = events.find(e => e.id === id);

  useEffect(() => {
    if (event && event.dailyMenus.length > 0 && !activeTabId) {
      setActiveTabId(event.dailyMenus[0].id);
    }
  }, [event?.dailyMenus]);

  if (!event) {
    return (
      <div className="p-12 text-center max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Evento no encontrado</h1>
        <Link to="/events" className="inline-block text-indigo-600 font-medium hover:underline">← Volver a Eventos</Link>
      </div>
    );
  }

  const handleSaveToCloud = async () => {
    try {
      await saveEvent(event);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateDays = () => {
    if (event.startDate && event.endDate) {
      generateDailyMenus(event.id, event.startDate, event.endDate);
      setActiveTabId(null);
    }
  };

  const activeDay = event.dailyMenus.find(d => d.id === activeTabId);

  // --- MATEMATICA HUB SEMANAL ---
  let totalWacSum = 0;
  let activeDaysCount = 0;

  event.dailyMenus.forEach(day => {
    const dayMix = day.items.reduce((acc, item) => acc + item.expectedSalesPercentage, 0);
    if (dayMix > 0) {
      const dayWac = day.items.reduce((acc, item) => {
        const dish = dishes.find(d => d.id === item.dishId);
        if (!dish) return acc;
        return acc + (dish.totalCost * (item.expectedSalesPercentage / 100));
      }, 0);
      totalWacSum += dayWac;
      activeDaysCount++;
    }
  });

  const weeklyWAC = activeDaysCount > 0 ? (totalWacSum / activeDaysCount) : 0;
  const globalFixedCostsTotal = fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  const eventCustomCostsTotal = (event.customCosts || []).reduce((acc, cost) => acc + cost.amount, 0);
  const isCateringMode = event.useGlobalFixedCosts === false;
  const totalFixedCosts = (isCateringMode ? 0 : globalFixedCostsTotal) + eventCustomCostsTotal;
  const guests = event.guestCount || 0;
  const targetCostForMargin = isCateringMode && guests > 0
    ? weeklyWAC + (eventCustomCostsTotal / guests)
    : weeklyWAC;

  const margin = event.fixedSellingPrice - targetCostForMargin;
  const marginPercentage = event.fixedSellingPrice > 0 ? (margin / event.fixedSellingPrice) * 100 : 0;
  const breakEvenPoint = margin > 0 ? totalFixedCosts / margin : 0;
  const totalRevenue = guests * event.fixedSellingPrice;
  const totalFoodCost = guests * weeklyWAC;
  const netProfit = totalRevenue - totalFoodCost - eventCustomCostsTotal;

  const getMarginColor = (pct: number) => {
    if (pct >= 40) return 'text-emerald-600 bg-emerald-50';
    if (pct >= 25) return 'text-blue-600 bg-blue-50';
    if (pct > 0) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const unassignedDishes = activeDay
    ? dishes.filter(d => !activeDay.items.some(i => i.dishId === d.id))
    : [];

  const totalDayMix = activeDay?.items.reduce((acc, item) => acc + item.expectedSalesPercentage, 0) || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
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
              Checkout Link Público <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          {error && <span className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded-lg">Error Cloud Sync</span>}
          <button
            disabled={isLoading}
            onClick={handleSaveToCloud}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${saveStatus === 'success'
                ? 'bg-emerald-500 text-white'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 active:scale-95'
              }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveStatus === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <CloudUpload className="w-5 h-5" />
            )}
            {saveStatus === 'success' ? '¡Guardado con Éxito!' : 'Guardar en la Nube'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        <div className="xl:col-span-2 space-y-8">

          {/* Selector de Fechas */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-500" /> Límites del Calendario
            </h2>
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Inicio</label>
                <input
                  type="date"
                  value={event.startDate}
                  onChange={(e) => updateEvent(event.id, { startDate: e.target.value })}
                  className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="w-full sm:w-1/3">
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Fin</label>
                <input
                  type="date"
                  value={event.endDate}
                  onChange={(e) => updateEvent(event.id, { endDate: e.target.value })}
                  className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="w-full sm:w-1/3">
                <button
                  onClick={handleGenerateDays}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors"
                >
                  Generar / Actualizar Días
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Strategy */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6 flex flex-col items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <DollarSign className="w-32 h-32" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Estrategia de Precios</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-md">Calcula el precio basándote en el Costo Promedio Semanal total.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
              <div className="relative w-full sm:w-1/2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Precio Sugerido / Manual</label>
                <div className="relative">
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

              <div className="hidden sm:block text-slate-300 font-black text-2xl mt-6">⇌</div>

              <div className="relative w-full sm:w-1/2">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2 flex items-center gap-1">
                  Margen Objetivo <TrendingUp className="w-3 h-3" />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={marginPercentage !== 0 ? Number(marginPercentage.toFixed(1)) : ''}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        updateEvent(event.id, { fixedSellingPrice: 0 });
                        return;
                      }
                      const targetMargin = Number(e.target.value);
                      if (targetMargin >= 100 || targetMargin < -100) return;
                      let newPrice = 0;
                      if (targetCostForMargin > 0) {
                        newPrice = targetCostForMargin / (1 - (targetMargin / 100));
                      }
                      updateEvent(event.id, { fixedSellingPrice: Number(newPrice.toFixed(2)) });
                    }}
                    className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-indigo-900 ring-1 ring-inset ring-indigo-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-xl font-bold shadow-sm bg-indigo-50/50"
                    placeholder="0.0"
                    step="1"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <span className="text-slate-500 font-medium text-lg">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Menu Tabs */}
          {event.dailyMenus.length === 0 ? (
            <div className="bg-yellow-50 text-yellow-800 p-6 rounded-xl border border-yellow-200 text-center">
              Genera el rango de días en el calendario para empezar a agregar platos.
            </div>
          ) : (
            <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
              <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 custom-scrollbar hide-scroll-bar">
                {event.dailyMenus.map(day => (
                  <button
                    key={day.id}
                    onClick={() => setActiveTabId(day.id)}
                    className={`min-w-[120px] px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors ${activeTabId === day.id
                        ? 'border-indigo-600 text-indigo-600 bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <div className="text-xs font-medium uppercase tracking-wider mb-1">{day.dayName}</div>
                    <div>{day.date.split('-').slice(1).join('/')}</div>
                  </button>
                ))}
              </div>

              {activeDay && (
                <div>
                  <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold leading-6 text-slate-900">Menú del {activeDay.dayName}</h3>
                      <p className="mt-1 text-sm text-slate-500">Ajusta la estimación de venta solo para este día.</p>
                    </div>

                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm ${totalDayMix === 100 ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'}`}>
                      {totalDayMix === 100 ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      Mix Diario: {totalDayMix}%
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {activeDay.items.map(item => {
                        const dish = dishes.find(d => d.id === item.dishId);
                        if (!dish) return null;
                        return (
                          <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm">
                            <div className="flex-1 flex justify-between items-center sm:block">
                              <h4 className="font-bold text-slate-900 block truncate">{dish.name}</h4>
                              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md mt-1 inline-block">Costo base: ${dish.totalCost.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center gap-4 mt-2 sm:mt-0">
                              <div className="relative w-32 shrink-0">
                                <input
                                  type="number"
                                  value={item.expectedSalesPercentage || ''}
                                  onChange={(e) => updateEventItem(event.id, activeDay.id, item.dishId, Number(e.target.value))}
                                  className={`block w-full rounded-lg border-0 py-2.5 pr-8 pl-4 text-slate-900 ring-1 ring-inset focus:ring-2 focus:ring-inset text-center font-bold shadow-sm ${totalDayMix > 100 ? 'ring-red-300 focus:ring-red-600' : 'ring-slate-300 focus:ring-indigo-600'}`}
                                />
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                  <span className="text-slate-400 font-medium">%</span>
                                </div>
                              </div>
                              <button
                                onClick={() => removeEventItem(event.id, activeDay.id, item.dishId)}
                                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <label className="block text-sm font-medium text-slate-900 mb-2">Añadir plato para el {activeDay.dayName}:</label>
                      <div className="flex gap-3">
                        <select
                          id={`add-dish-select-${activeDay.id}`}
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
                            const select = document.getElementById(`add-dish-select-${activeDay.id}`) as HTMLSelectElement;
                            if (select && select.value) {
                              addEventItem(event.id, activeDay.id, select.value);
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
              )}
            </div>
          )}

          {/* Fixed Costs & Custom Costs */}
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden mt-8">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold leading-6 text-slate-900">Costos Fijos y Gastos del Evento</h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Prorratear Costos Mensuales</span>
                <button
                  type="button"
                  onClick={() => updateEvent(event.id, { useGlobalFixedCosts: event.useGlobalFixedCosts === false ? true : false })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${event.useGlobalFixedCosts !== false ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${event.useGlobalFixedCosts !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {!event.useGlobalFixedCosts && (
                <div className="mb-8 p-6 bg-indigo-50 border border-indigo-100 rounded-xl relative overflow-hidden">
                  <h4 className="text-lg font-bold text-indigo-900 mb-2">Modo Evento Cerrado</h4>
                  <div className="relative max-w-xs focus-within:scale-105 transition-transform duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-indigo-900 mb-2">Invitados Totales</label>
                    <input
                      type="number"
                      value={event.guestCount || ''}
                      onChange={(e) => updateEvent(event.id, { guestCount: Number(e.target.value) })}
                      className="block w-full rounded-xl border-0 py-3 px-4 text-indigo-900 ring-1 ring-inset ring-indigo-200 focus:ring-2 text-lg font-bold shadow-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">Gastos Directos</h4>

                {(!event.customCosts || event.customCosts.length === 0) ? (
                  <p className="text-sm text-slate-500 text-center py-4">Sin gastos extras registrados.</p>
                ) : (
                  <ul className="space-y-3">
                    {event.customCosts.map(cost => (
                      <li key={cost.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors">
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

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                  <input
                    type="text"
                    placeholder="Concepto"
                    id={`new-cost-name-${event.id}`}
                    className="block w-full rounded-lg border-slate-300 py-2 sm:text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Monto"
                    id={`new-cost-amount-${event.id}`}
                    className="block w-32 rounded-lg border-slate-300 py-2 sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const n = document.getElementById(`new-cost-name-${event.id}`) as HTMLInputElement;
                      const a = document.getElementById(`new-cost-amount-${event.id}`) as HTMLInputElement;
                      if (n?.value && a?.value) {
                        updateEvent(event.id, { customCosts: [...(event.customCosts || []), { id: crypto.randomUUID(), name: n.value, amount: Number(a.value) }] });
                        n.value = ''; a.value = '';
                      }
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HUD Widget */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl sticky top-8">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-indigo-400" /> HUD: Rentabilidad
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-400 mb-1">Costo Promedio (WAC Semanal)</p>
                <span className="text-3xl font-black">${weeklyWAC.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-800" />

              <div>
                <p className="text-sm text-slate-400 mb-1 flex justify-between">
                  Margen Neto
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getMarginColor(marginPercentage)}`}>
                    {marginPercentage.toFixed(1)}%
                  </span>
                </p>
                <span className="text-3xl font-black">${margin.toFixed(2)}</span>
              </div>

              <div className="h-px bg-slate-800" />

              {!isCateringMode ? (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Punto de Equilibrio</p>
                  <span className="text-3xl font-black">{Math.ceil(breakEvenPoint)}</span>
                  <p className="text-[10px] text-slate-500 mt-2">Ventas requeridas al mes para cubrir ${totalFixedCosts.toFixed(0)} fijos.</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-400 mb-1">Ganancia Final Evento</p>
                  <span className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${netProfit.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-2">Para {guests} cubiertos a ${event.fixedSellingPrice} c/u.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicMenu() {
  const { id } = useParams<{ id: string }>();
  const { dishes, saveOrder } = useStore();

  const [event, setEvent] = useState<MenuEvent | null>(null);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Cart: { [dishId_dayId]: quantity }
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customer, setCustomer] = useState({ name: '', lastName: '', phone: '', email: '', notes: '' });
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    async function fetchPublicData() {
      if (!id) return;
      try {
        setLoading(true);
        // 1. Fetch Event
        const eventSnap = await getDoc(doc(db, 'menuEvents', id));
        if (eventSnap.exists()) {
          const eventData = { ...eventSnap.data(), id: eventSnap.id } as MenuEvent;
          setEvent(eventData);
          if (eventData.dailyMenus.length > 0) setActiveTabId(eventData.dailyMenus[0].id);

          // 2. Fetch Company Profile using companyId from event
          const companyQuery = query(collection(db, 'companies'), where('companyId', '==', eventData.companyId));
          const companySnap = await getDocs(companyQuery);
          if (!companySnap.empty) {
            const profileData = { ...companySnap.docs[0].data(), id: companySnap.docs[0].id } as any;
            setProfile(profileData as CompanyProfile);
          }
        }
      } catch (err) {
        console.error("Error fetching public data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPublicData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando Menú...</p>
    </div>
  );

  if (!event || !event.isActive) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-black text-slate-900 mb-2">Menú no disponible</h2>
      <p className="text-slate-500 max-w-xs mx-auto font-medium">Este enlace ha expirado o el menú no se encuentra activo en este momento.</p>
    </div>
  );

  const activeDay = event.dailyMenus.find(d => d.id === activeTabId);
  const menuItems = activeDay?.items
    .filter(i => i.expectedSalesPercentage > 0)
    .map(i => {
      const dish = dishes.find(d => d.id === i.dishId);
      return dish ? { ...dish, eventItemId: i.id } : null;
    })
    .filter(Boolean) || [];

  const updateCart = (dishId: string, dayId: string, delta: number) => {
    const key = `${dishId}_${dayId}`;
    setCart(prev => {
      const current = prev[key] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
  };

  const totalQuantity = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = totalQuantity * event.fixedSellingPrice;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // TRUCO PARA TYPESCRIPT: Lo tratamos como 'any' para evitar líneas rojas
    const p = profile as any;

    if (!p || (!p.whatsapp && !p.whatsappNumber)) {
      alert("Error: No se pudo encontrar el número de contacto del negocio en la configuración.");
      return;
    }

    // El número final que usaremos (prioriza el nuevo campo 'whatsapp')
    const finalPhone = p.whatsapp || p.whatsappNumber;

    const orderItems: OrderItem[] = [];
    Object.entries(cart).forEach(([key, quantity]) => {
      const [dishId, dayId] = key.split('_');
      const day = event.dailyMenus.find(d => d.id === dayId);
      const dish = dishes.find(d => d.id === dishId);
      if (day && dish) {
        orderItems.push({
          id: crypto.randomUUID(),
          dishId,
          dishName: dish.name,
          quantity,
          priceAtOrder: event.fixedSellingPrice,
          dayName: day.dayName,
          date: day.date
        });
      }
    });

    const orderObj: Omit<Order, 'id' | 'createdAt'> = {
      eventId: event.id,
      companyId: event.companyId,
      customer: {
        name: customer.name,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        notes: customer.notes
      },
      items: orderItems,
      totalAmount,
      status: 'pending'
    };

    try {
      setLoading(true);
      // 1. Guardamos el pedido en Firestore
      const orderId = await saveOrder(orderObj);

      // 2. Abrimos WhatsApp con el número corregido
      const waLink = generateWhatsAppLink(
        { ...orderObj, id: orderId, createdAt: Date.now() } as Order,
        finalPhone,
        event.name
      );

      window.open(waLink, '_blank');
      setOrderSuccess(true);
      setCart({});
      setIsCheckoutOpen(false);
    } catch (err) {
      console.error("Error creating order:", err);
      alert("Hubo un error al procesar el pedido. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 p-6 text-center animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-white text-emerald-500 rounded-full flex items-center justify-center mb-8 shadow-xl border-4 border-emerald-100">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">¡Pedido Recibido!</h2>
      <p className="text-slate-600 font-medium max-w-xs mx-auto mb-8">
        Tu pedido ha sido registrado con éxito. Te hemos redirigido a WhatsApp para finalizar la coordinación con **{profile?.companyName}**.
      </p>
      <button
        onClick={() => setOrderSuccess(false)}
        className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg hover:bg-slate-800 transition-all uppercase tracking-widest text-sm"
      >
        Volver al Menú
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-6 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-tight">{event.name}</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{profile?.companyName || 'Cargando...'}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-xs font-black text-slate-400 uppercase tracking-tighter">Precio Unitario</span>
            <span className="text-lg font-black text-indigo-600">${event.fixedSellingPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Hero / Banner */}
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-2xl relative overflow-hidden">
          <Utensils className="absolute -right-8 -bottom-8 w-44 h-44 opacity-10 rotate-12" />
          <h2 className="text-2xl font-black mb-2">¡Armá tu menú semanal!</h2>
          <p className="text-white/80 font-medium text-sm max-w-xs leading-relaxed">
            Seleccioná tus platos favoritos para cada día y recibí las viandas más frescas del mercado.
          </p>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 px-4 pb-32">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow-xl rounded-3xl border border-slate-100 overflow-hidden">
            <div className="flex overflow-x-auto border-b border-slate-50 bg-slate-50/50 hide-scrollbar scroll-smooth">
              {event.dailyMenus.map(day => (
                <button
                  key={day.id}
                  onClick={() => setActiveTabId(day.id)}
                  className={`flex-1 min-w-[100px] px-4 py-5 text-center transition-all duration-300 ${activeTabId === day.id
                      ? 'bg-white shadow-inner'
                      : 'hover:bg-white/50'
                    }`}
                >
                  <div className={`text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${activeTabId === day.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {day.dayName}
                  </div>
                  <div className={`text-base font-black transition-colors ${activeTabId === day.id ? 'text-slate-900' : 'text-slate-500'}`}>
                    {day.date.split('-').slice(2).join('')}
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6">
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                {menuItems.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-400 font-medium italic">Sin platos disponibles para este día.</p>
                  </div>
                ) : (
                  menuItems.map(dish => {
                    if (!dish) return null;
                    const qty = cart[`${dish.id}_${activeTabId}`] || 0;
                    return (
                      <div key={dish.id} className="p-4 rounded-3xl border border-slate-100 bg-white shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all hover:shadow-md">
                        <div className="flex-1">
                          <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-900 transition-colors uppercase tracking-tight">{dish.name}</h3>
                          <p className="text-xs font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Disponible HOY
                          </p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                          <button
                            onClick={() => updateCart(dish.id, activeTabId!, -1)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${qty > 0 ? 'bg-white text-slate-900 shadow-sm hover:scale-110 active:scale-95' : 'text-slate-300 cursor-not-allowed'}`}
                          >
                            <Minus className="w-5 h-5" />
                          </button>
                          <span className="w-6 text-center font-black text-lg text-slate-900">{qty}</span>
                          <button
                            onClick={() => updateCart(dish.id, activeTabId!, 1)}
                            className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Cart Footer */}
      {totalQuantity > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-40 animate-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => setIsCheckoutOpen(true)}
            className="w-full bg-slate-900 text-white rounded-[2.5rem] p-4 pr-6 flex items-center justify-between shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group border-4 border-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-inner relative">
                <ShoppingBag className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-white text-slate-900 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shadow-lg border border-slate-100">
                  {totalQuantity}
                </span>
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest leading-none">Ver mi pedido</p>
                <p className="text-xl font-black">${totalAmount.toFixed(2)} total</p>
              </div>
            </div>
            <div className="bg-white/20 p-3 rounded-full group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-6 h-6" />
            </div>
          </button>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-xl bg-white rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500">
            <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-slate-50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Finalizar Pedido</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCheckout} className="p-8 space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      required
                      type="text"
                      placeholder="Ej: Juan"
                      value={customer.name}
                      onChange={e => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Apellido</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      required
                      type="text"
                      placeholder="Ej: Pérez"
                      value={customer.lastName}
                      onChange={e => setCustomer({ ...customer, lastName: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Celular / WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    type="tel"
                    placeholder="Ej: 11 2233 4455"
                    value={customer.phone}
                    onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    required
                    type="email"
                    placeholder="tu@email.com"
                    value={customer.email}
                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-0 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 font-bold transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 pb-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Notas adicionales (opcional)</label>
                <textarea
                  placeholder="Ej: Soy alérgico al maní..."
                  value={customer.notes}
                  onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                  className="w-full p-4 rounded-2xl border-0 bg-slate-50 text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-indigo-600 font-bold transition-all h-24 resize-none"
                />
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Final</p>
                  <p className="text-3xl font-black text-indigo-600">${totalAmount.toFixed(2)}</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-5 rounded-[2rem] font-black shadow-xl shadow-indigo-100 flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShoppingBag className="w-5 h-5" />}
                  CONFIRMAR Y ENVIAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
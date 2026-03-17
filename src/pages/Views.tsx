import React, { useMemo, useState } from 'react';
import { useStore, RecipeIngredient, Dish, FixedCost, MenuEvent } from '../store/useStore';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import {
  Utensils, Tag, TrendingUp, AlertCircle, ShoppingCart, Plus, Trash2,
  CheckCircle2, DollarSign, PieChart, Percent, LayoutDashboard, BrainCircuit, Wallet, Calendar, ArrowRight, Save, Carrot, ChefHat
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

type Inputs = {
  name: string;
  unit: string;
  grossWeight: number;
  netWeight: number;
  purchasePrice: number;
};

type DishInputs = {
  name: string;
  factorQ: {
    fixedAmount: number;
    percentage: number;
  };
  recipeIngredients: {
    ingredientId: string;
    gramsUsed: number;
  }[];
};

export function Ingredients() {
  const { ingredients, saveIngredient, deleteIngredientFirestore } = useStore();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<Inputs>({
    defaultValues: {
      name: '',
      unit: 'Kg',
      grossWeight: 1000,
      netWeight: 800,
      purchasePrice: 0,
    }
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await saveIngredient({
        name: data.name,
        grossWeight: Number(data.grossWeight),
        netWeight: Number(data.netWeight),
        purchasePrice: Number(data.purchasePrice),
        unit: data.unit
      });
      reset();
    } catch (err) {
      console.error("Error saving ingredient:", err);
    }
  };

  // Observamos los valores para calcular la merma en tiempo real
  const watchGross = watch('grossWeight', 1000);
  const watchNet = watch('netWeight', 800);
  const watchPrice = watch('purchasePrice', 0);

  const parsedGross = Number(watchGross) || 0;
  const parsedNet = Number(watchNet) || 0;
  const parsedPrice = Number(watchPrice) || 0;

  // Cálculos en tiempo real
  const mermaPercentage = parsedGross > 0 ? ((parsedGross - parsedNet) / parsedGross) * 100 : 0;
  const realCostPerGram = parsedNet > 0 ? parsedPrice / parsedNet : 0;
  const realCostPerUnit = realCostPerGram * 1000; // Cto x 1kg o 1L

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ingredientes</h1>
          <p className="mt-2 text-sm text-slate-500">
            Gestión de Insumos y Escandallos. Calcula el costo real de tus ingredientes descontando las mermas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Formulario (YieldCalculator) */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 sm:p-8">
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-4 mb-6">
              Agregar Nuevo Insumo
            </h2>

            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900">
                  Nombre del Insumo
                </label>
                <div className="mt-2">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Ej: Pechuga de Pollo"
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1 block">Este campo es requerido</span>}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="unit" className="block text-sm font-medium leading-6 text-slate-900">
                  Unidad
                </label>
                <div className="mt-2">
                  <select
                    {...register("unit")}
                    className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="Kg">Kg / Gramos</option>
                    <option value="L">Litros / ml</option>
                    <option value="Unidad">Unidad</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="purchasePrice" className="block text-sm font-medium leading-6 text-slate-900">
                  Precio Compra
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    {...register("purchasePrice", { required: true, min: 0 })}
                    type="number"
                    step="0.01"
                    className="block w-full rounded-lg border-slate-300 py-2.5 pl-8 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="grossWeight" className="block text-sm font-medium leading-6 text-slate-900">
                  Peso Bruto
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <input
                    {...register("grossWeight", { required: true, min: 1 })}
                    type="number"
                    className="block w-full rounded-lg border-slate-300 py-2.5 pr-12 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">gr/ml</span>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="netWeight" className="block text-sm font-medium leading-6 text-slate-900 flex justify-between">
                  Peso Neto
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <input
                    {...register("netWeight", { required: true, min: 1 })}
                    type="number"
                    className="block w-full rounded-lg border-slate-300 py-2.5 pr-12 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-slate-500 sm:text-sm">gr/ml</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-tight">Tras limpiado/merma</p>
              </div>
            </div>

            {/* Resultados del Yield Calculator */}
             <div className="mt-10 rounded-xl bg-blue-50 p-6 border border-blue-100 shadow-inner">
                <h3 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                  Yield Calculator (Tiempo Real)
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-white rounded-lg p-4 shadow-sm ring-1 ring-blue-100 flex flex-col justify-center">
                    <dt className="text-sm font-medium text-slate-500">% Merma (Pérdida)</dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-bold tracking-tight text-red-600">
                         {mermaPercentage.toFixed(1)}%
                      </span>
                    </dd>
                     <p className="text-xs text-slate-400 mt-2">De {parsedGross}g a {parsedNet}g</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm ring-1 ring-blue-100 flex flex-col justify-center">
                    <dt className="text-sm font-medium text-slate-500">Costo Real (x 1000g)</dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                       <span className="text-3xl font-bold tracking-tight text-blue-700">
                        ${realCostPerUnit.toFixed(2)}
                      </span>
                    </dd>
                    <p className="text-xs text-slate-400 mt-2 font-mono">
                      ${realCostPerGram.toFixed(4)} / gramo
                    </p>
                  </div>
                </dl>
              </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-x-4">
              <button
                type="button"
                onClick={() => reset()}
                className="text-sm font-semibold leading-6 text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
              >
                Limpiar datos
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
              >
                Guardar Insumo
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de Insumos */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden flex flex-col h-full max-h-[800px]">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Insumos Registrados</h3>
            <p className="mt-1 text-sm text-slate-500">Directorio de ingredientes con sus costos netos reales calculados.</p>
          </div>
          <div className="flex-1 overflow-auto">
             <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider sm:pl-6">Nombre</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Rendimiento</th>
                    <th scope="col" className="px-3 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Costo (x 1000g)</th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {ingredients.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="whitespace-nowrap py-12 pl-4 pr-3 text-sm text-center text-slate-500 sm:pl-6">
                          <div className="flex flex-col items-center justify-center">
                            <span className="p-3 bg-slate-50 rounded-full mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                              </svg>
                            </span>
                            <span>No hay insumos registrados.</span>
                            <span className="text-xs text-slate-400 mt-1 block">Añade uno desde el formulario izquierdo.</span>
                          </div>
                        </td>
                      </tr>
                  ) : (
                    ingredients.map((ingredient) => {
                      const yieldPercent = (ingredient.netWeight / ingredient.grossWeight) * 100;
                      const costPerKilo = ingredient.realCostPerGram * 1000;

                      return (
                        <tr key={ingredient.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                            {ingredient.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-slate-500">
                            {yieldPercent.toFixed(1)}% <span className="text-xs text-slate-400 ml-1">({ingredient.netWeight}g)</span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-blue-700">
                            ${costPerKilo.toFixed(2)}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => deleteIngredientFirestore(ingredient.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-md hover:bg-red-50"
                              title="Eliminar insumo"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { ingredients, dishes, globalConfig, fixedCosts, events, activeEventId } = useStore();

  // Calcular métricas principales (KPIs)
  const totalIngredients = ingredients.length;
  const totalDishes = dishes.length;

  const totalFixedCosts = useMemo(() => {
    return fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  }, [fixedCosts]);

  const activeEvent = useMemo(() => events.find(e => e.id === activeEventId), [events, activeEventId]);

  // Margen objetivo por defecto (30%) si no existe configuración global
  const targetMargin = globalConfig?.targetMarginPercentage ?? 30;

  // --- LÓGICA DE CÁLCULO PARA DAILY MENUS ---
  const weightedAverageCost = useMemo(() => {
    if (!activeEvent || activeEvent.dailyMenus.length === 0) return 0;
    
    // Obtenemos todos los items de todos los días
    const allItems = activeEvent.dailyMenus.flatMap(day => day.items);
    if (allItems.length === 0) return 0;

    // El WAC semanal es el promedio de los costos diarios ponderados
    const dailyWacs = activeEvent.dailyMenus.map(day => {
      if (day.items.length === 0) return 0;
      return day.items.reduce((acc, item) => {
        const dish = dishes.find(d => d.id === item.dishId);
        if (!dish) return acc;
        return acc + (dish.totalCost * (item.expectedSalesPercentage / 100));
      }, 0);
    }).filter(wac => wac > 0);

    if (dailyWacs.length === 0) return 0;
    return dailyWacs.reduce((a, b) => a + b, 0) / dailyWacs.length;
  }, [activeEvent, dishes]);

  const currentMarginAmount = activeEvent && activeEvent.fixedSellingPrice > 0
    ? activeEvent.fixedSellingPrice - weightedAverageCost 
    : 0;

  const currentMarginPercentage = activeEvent && activeEvent.fixedSellingPrice > 0 
    ? (currentMarginAmount / activeEvent.fixedSellingPrice) * 100 
    : 0;

  // Break-even (Punto de Equilibrio en Unidades)
  const breakEvenDishes = currentMarginAmount > 0 ? Math.ceil(totalFixedCosts / currentMarginAmount) : 0;

  // Preparar datos para el gráfico de "Top 5 Insumos"
  const topExpensiveIngredients = useMemo(() => {
    return [...ingredients]
      .sort((a, b) => b.realCostPerGram - a.realCostPerGram)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        costPerKilo: Number((item.realCostPerGram * 1000).toFixed(2)) 
      }));
  }, [ingredients]);

  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

  // --- UI DE ESTADO VACÍO (BIENVENIDA) ---
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-5xl mx-auto p-6">
        <div className="p-6 bg-indigo-50 rounded-full mb-8 relative">
           <LayoutDashboard className="w-14 h-14 text-indigo-600" />
           <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">¡Bienvenido a ViandasPro!</h1>
        <p className="text-slate-500 text-lg mb-12 leading-relaxed font-medium max-w-2xl">
          Para que el Dashboard cobre vida y puedas ver tu rentabilidad, sigue estos tres pasos fundamentales para configurar tu negocio.
        </p>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Líneas conectoras para Desktop */}
          <div className="hidden md:block absolute top-1/2 left-[30%] right-[30%] h-0.5 bg-slate-100 -translate-y-1/2 z-0">
             <div className="flex justify-between w-full h-full relative">
                <div className="absolute left-0 -top-1.5"><ArrowRight className="w-4 h-4 text-slate-200" /></div>
                <div className="absolute right-0 -top-1.5"><ArrowRight className="w-4 h-4 text-slate-200" /></div>
             </div>
          </div>

          <Link 
            to="/ingredients" 
            className="relative z-10 flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-indigo-500 hover:shadow-2xl transition-all group"
          >
            <div className="p-4 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
              <Carrot className="w-8 h-8 text-indigo-600 group-hover:text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-xl text-slate-900">1. Cargar Insumos</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Define los costos reales de tus materias primas.</p>
            </div>
            <div className="mt-2 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
              Ir a Insumos <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            to="/dishes" 
            className="relative z-10 flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:shadow-2xl transition-all group"
          >
            <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
              <Utensils className="w-8 h-8 text-blue-600 group-hover:text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-xl text-slate-900">2. Crear Platos</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Arma tus recetas vinculando los insumos.</p>
            </div>
            <div className="mt-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
              Ver Catálogo <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link 
            to="/events" 
            className="relative z-10 flex flex-col items-center gap-4 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-500 hover:shadow-2xl transition-all group"
          >
            <div className="p-4 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 shadow-sm">
              <Calendar className="w-8 h-8 text-emerald-600 group-hover:text-white" />
            </div>
            <div className="text-center">
              <p className="font-black text-xl text-slate-900">3. Generar Evento</p>
              <p className="text-sm text-slate-400 mt-2 font-medium">Configura tu calendario y lanza la simulación.</p>
            </div>
            <div className="mt-2 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm flex items-center gap-1">
              Crear Menú <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // Obtenemos todos los platos distintos del evento activo para el gráfico de barras
  const uniqueDishData = useMemo(() => {
    if (!activeEvent) return [];
    const allItems = activeEvent.dailyMenus.flatMap(day => day.items);
    const dishIds = Array.from(new Set(allItems.map(i => i.dishId)));
    
    return dishIds.map(id => {
      const d = dishes.find(dish => dish.id === id);
      return {
        name: d?.name || '?',
        profit: activeEvent.fixedSellingPrice - (d?.totalCost || 0)
      };
    });
  }, [activeEvent, dishes]);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
             <LayoutDashboard className="w-8 h-8 text-indigo-600" />
             Dashboard de Rentabilidad
          </h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Resumen de salud financiera basado en el Evento Activo: <span className="text-indigo-600 font-bold">{activeEvent?.name ?? 'Sin Seleccionar'}</span>
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* WAC Card */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 flex items-center gap-5 transition-all hover:shadow-md border-l-4 border-indigo-500">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
             <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest">Costo Ponderado</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                ${weightedAverageCost.toFixed(2)}
              </span>
            </dd>
          </div>
        </div>

        {/* Margin Card */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 flex flex-col justify-center transition-all hover:shadow-md border-l-4 border-emerald-500">
          <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center">
             Margen Real vs Objetivo
          </dt>
          <dd className="mt-2 flex items-baseline gap-2">
             <span className={`text-4xl font-black tracking-tight ${currentMarginPercentage >= targetMargin ? 'text-emerald-600' : 'text-red-500'}`}>
                {currentMarginPercentage.toFixed(1)}%
             </span>
             <span className="text-sm text-slate-400 font-bold">
                / {targetMargin}%
             </span>
          </dd>
          {/* Barra de progreso */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden shadow-inner">
             <div 
               className={`h-full rounded-full transition-all duration-1000 ${currentMarginPercentage >= targetMargin ? 'bg-emerald-500' : 'bg-red-500'}`} 
               style={{ width: `${Math.min(currentMarginPercentage, 100)}%` }}
             />
          </div>
        </div>

        {/* BEP Card */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 flex items-center gap-5 transition-all hover:shadow-md border-l-4 border-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
             <Wallet className="w-8 h-8" />
          </div>
          <div>
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-widest">Breakeven</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight text-slate-900">
                {breakEvenDishes}
              </span>
              <span className="text-xs text-slate-400 font-bold">Unids</span>
            </dd>
          </div>
        </div>

        {/* Metrics Card */}
        <div className="bg-white overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 flex flex-col justify-center transition-all hover:shadow-md bg-slate-50 border border-slate-200">
            <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Resumen del Inventario</dt>
            <dd className="space-y-2">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Viandas:</span>
                  <span className="text-indigo-600">{totalDishes}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-500">Gastos Fijos:</span>
                  <span className="text-slate-900">${totalFixedCosts.toFixed(0)}</span>
               </div>
            </dd>
        </div>
      </dl>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 pt-4">
        
        {/* Gráfico 1: Top 5 Insumos */}
        <div className="bg-white shadow-xl ring-1 ring-slate-200 rounded-2xl p-8 border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Analizador de Costos Críticos</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Top 5 insumos con mayor impacto por kg/lt.</p>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
               <Tag className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="h-72 w-full">
            {topExpensiveIngredients.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExpensiveIngredients} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="costPerKilo" radius={[6, 6, 0, 0]} barSize={40}>
                    {topExpensiveIngredients.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle className="w-8 h-8 mb-3 text-slate-300" />
                  <p className="text-sm font-bold">No hay insumos suficientes</p>
               </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Net Profit per Dish */}
        <div className="bg-white shadow-xl ring-1 ring-slate-200 rounded-2xl p-8 border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900">Estrategia de Compensación</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Ganancia neta por plato ($) en el evento actual.</p>
            </div>
            <div className="p-2 bg-indigo-50 rounded-lg">
               <BrainCircuit className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          
          <div className="flex-1 h-72 w-full">
             {uniqueDishData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={uniqueDishData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}}
                      tickFormatter={(value: any) => `$${value}`}
                    />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                    <Bar dataKey="profit" radius={[6, 6, 0, 0]} barSize={40}>
                      {uniqueDishData.map((item, index) => (
                         <Cell key={`cell-${index}`} fill={item.profit >= 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-8 text-center h-full">
                   <PieChart className="w-10 h-10 text-slate-300 mb-4" />
                   <p className="font-bold text-slate-500">Simulación Inactiva</p>
                   <p className="text-[11px] mt-2 max-w-xs text-slate-400 font-medium">
                     Agrega platos a tu evento activo para ver la matriz de rentabilidad unitaria.
                   </p>
                </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}

export function Dishes() {
  const { ingredients, dishes, saveDish, deleteDishFirestore } = useStore();
  const [successMsg, setSuccessMsg] = useState('');

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<DishInputs>({
    defaultValues: {
      name: '',
      factorQ: {
        fixedAmount: 150, // Ej: Envase
        percentage: 5,    // Ej: Sal, aceite
      },
      recipeIngredients: [
        { ingredientId: '', gramsUsed: 100 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "recipeIngredients"
  });

  // Watchers para calculo en tiempo real
  const watchRecipeItems = watch('recipeIngredients');
  const watchFactorQ = watch('factorQ');

  // Calcular el costo en base a los inputs del formulario
  const currentTotalCost = useMemo(() => {
    if (!watchRecipeItems) return 0;
    
    // 1. Costo base de ingredientes
    const baseCost = watchRecipeItems.reduce((acc, item) => {
      const dbIngredient = ingredients.find(i => i.id === item.ingredientId);
      if (!dbIngredient) return acc;
      return acc + (dbIngredient.realCostPerGram * (Number(item.gramsUsed) || 0));
    }, 0);

    // 2. Aplicar Factor Q
    const fixedFactor = Number(watchFactorQ?.fixedAmount) || 0;
    const percentageFactor = Number(watchFactorQ?.percentage) || 0;
    
    const factorQCost = fixedFactor + (baseCost * (percentageFactor / 100));
    
    return baseCost + factorQCost;
  }, [watchRecipeItems, watchFactorQ, ingredients]);

  const onSubmit: SubmitHandler<DishInputs> = async (data) => {
    // Validar que no envien items vacios
    const validIngredients = data.recipeIngredients.filter(i => i.ingredientId !== '');
    
    if (validIngredients.length === 0) {
      alert("Debes añadir al menos un ingrediente a la receta.");
      return;
    }

    try {
      await saveDish({
        name: data.name,
        factorQ: {
          fixedAmount: Number(data.factorQ.fixedAmount),
          percentage: Number(data.factorQ.percentage),
        },
        ingredients: validIngredients.map(item => ({
          ingredientId: item.ingredientId,
          gramsUsed: Number(item.gramsUsed)
        }))
      });

      setSuccessMsg(`¡Vianda "${data.name}" añadida éxito!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      reset();
    } catch (err) {
      console.error("Error saving dish:", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo de Viandas</h1>
          <p className="mt-2 text-sm text-slate-500">
            Diseña tus recetas (RecipeBuilder) sumando ingredientes y aplicando el Factor Q (costos ocultos).
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-md bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Formulario (RecipeBuilder) */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 sm:p-8 flex flex-col h-full">
            <div className="flex-1">
              <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-4 mb-6">
                Crear Nueva Vianda
              </h2>

              {/* Datos Básicos de la Vianda */}
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 mb-8">
                <div className="sm:col-span-4">
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Nombre del Plato
                  </label>
                  <div className="mt-2">
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      className="block w-full rounded-lg border-slate-300 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Ej: Medallón de Res con Puré"
                    />
                    {errors.name && <span className="text-red-500 text-xs mt-1 block">Obligatorio</span>}
                  </div>
                </div>
              </div>

              {/* Estimación Ventas ahora vive en Eventos */}

              {/* Escandallo - Ingredientes */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium leading-6 text-slate-900">
                    Ingredientes de la Receta
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ ingredientId: '', gramsUsed: 100 })}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4" /> Añadir Insumo
                  </button>
                </div>

                {ingredients.length === 0 ? (
                  <div className="rounded-md border border-dashed border-slate-300 p-4 text-center">
                    <p className="text-sm text-slate-500">
                      Primero debes registrar insumos en la pestaña "Ingredientes".
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {fields.map((field, index) => (
                      <li key={field.id} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200 ring-1 ring-inset ring-slate-100 shadow-sm">
                        <div className="flex-1">
                          <select
                            {...register(`recipeIngredients.${index}.ingredientId` as const, { required: true })}
                            className="block w-full rounded-md border-slate-300 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-2"
                          >
                            <option value="" disabled>Seleccionar Ingrediente...</option>
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name}</option>
                            ))}
                          </select>
                          <div className="relative rounded-md shadow-sm w-[140px]">
                            <input
                              {...register(`recipeIngredients.${index}.gramsUsed` as const, { required: true, min: 1 })}
                              type="number"
                              className="block w-full rounded-md border-slate-300 py-1.5 pr-14 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              placeholder="Peso..."
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <span className="text-slate-500 sm:text-xs">gramos</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="mt-1 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Factor Q */}
              <div className="mb-4 pt-6 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-900 mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  Factor Q (Costos Ocultos y Mermas)
                </label>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Costo Fijo (Envases)</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-slate-500 sm:text-sm">$</span>
                      </div>
                      <input
                        {...register("factorQ.fixedAmount", { required: true, min: 0 })}
                        type="number"
                        step="0.01"
                        className="block w-full rounded-lg border-slate-300 py-2 pl-8 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">% Variable (Condimentos)</label>
                    <div className="relative rounded-md shadow-sm">
                      <input
                        {...register("factorQ.percentage", { required: true, min: 0, max: 100 })}
                        type="number"
                        className="block w-full rounded-lg border-slate-300 py-2 pr-10 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-slate-500 sm:text-sm">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

             {/* Ticker de Costo en Vivo */}
             <div className="mt-8 rounded-xl bg-indigo-50 p-5 border border-indigo-100 flex items-center justify-between shadow-inner">
                <div>
                  <h3 className="text-sm font-semibold text-indigo-900 uppercase tracking-wide">
                    Costo Total del Plato
                  </h3>
                   <p className="text-xs text-indigo-700/80 mt-1">Suma ingredientes + Factor Q</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold tracking-tight text-indigo-700">
                     ${currentTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={ingredients.length === 0}
                className="w-full sm:w-auto rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Vianda
              </button>
            </div>
          </form>
        </div>

        {/* Tabla de Viandas */}
        <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden flex flex-col h-full max-h-[900px]">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Catálogo Actual</h3>
            <p className="mt-1 text-sm text-slate-500">Tus platos y sus costos estructurados.</p>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-50">
             
             {dishes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-dashed border-slate-300">
                  <span className="p-3 bg-slate-50 rounded-full mb-3">
                    <Utensils className="w-6 h-6 text-slate-400" />
                  </span>
                  <span className="text-slate-600 text-sm font-medium">No hay viandas en el catálogo.</span>
                  <span className="text-xs text-slate-400 mt-1">Usa el constructor para añadir tu primer plato.</span>
                </div>
             ) : (
                <ul className="grid grid-cols-1 gap-4">
                  {dishes.map((dish) => (
                    <li key={dish.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">{dish.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                           <TrendingUp className="w-3 h-3" /> Costo Base Estructurado
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-indigo-600">${dish.totalCost.toFixed(2)}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Costo Total</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-[10px] text-slate-400 uppercase font-semibold">Ingredientes ({dish.ingredients.length})</p>
                            <div className="mt-1 space-y-1">
                               {dish.ingredients.slice(0, 3).map((ing, idx) => {
                                 const dbIng = ingredients.find(i => i.id === ing.ingredientId);
                                 return (
                                   <div key={idx} className="text-xs text-slate-600 flex justify-between">
                                      <span className="truncate pr-2">{dbIng ? dbIng.name : 'Insumo Eliminado'}</span>
                                      <span className="font-mono text-slate-400">{ing.gramsUsed}g</span>
                                   </div>
                                 )
                               })}
                               {dish.ingredients.length > 3 && (
                                 <p className="text-[10px] text-slate-400 italic">...y {dish.ingredients.length - 3} más.</p>
                               )}
                            </div>
                         </div>
                         <div className="border-l border-slate-100 pl-4">
                             <p className="text-[10px] text-slate-400 uppercase font-semibold">Factor Q</p>
                             <ul className="mt-1 text-xs text-slate-600 space-y-1">
                               <li>Fijo: <span className="font-mono text-slate-500">${dish.factorQ.fixedAmount}</span></li>
                               <li>Var: <span className="font-mono text-slate-500">{dish.factorQ.percentage}%</span></li>
                             </ul>
                         </div>
                      </div>

                      <button
                        onClick={() => deleteDishFirestore(dish.id)}
                        className="absolute top-4 pb-2 left-1/2 -ml-3 -mt-6 sm:mt-0 sm:top-5 sm:right-5 sm:left-auto opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Eliminar plato"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
             )}

          </div>
        </div>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <div className="p-12 text-center">
      <h2>Migrando a Nueva Arquitectura de Eventos...</h2>
    </div>
  );
}

export function MenuEngineering() {
  const { dishes, events, activeEventId } = useStore();

  const activeEvent = useMemo(() => events.find(e => e.id === activeEventId), [events, activeEventId]);

  const matrixData = useMemo(() => {
    if (!activeEvent || activeEvent.dailyMenus.length === 0) return { data: [], avgProfit: 0, avgPop: 0 };

    const allItems = activeEvent.dailyMenus.flatMap(day => day.items);
    if (allItems.length === 0) return { data: [], avgProfit: 0, avgPop: 0 };

    // Agrupar por plato para calcular popularidad promedio
    const dishAggregates: Record<string, { totalPop: number, count: number }> = {};
    allItems.forEach(item => {
      if (!dishAggregates[item.dishId]) {
        dishAggregates[item.dishId] = { totalPop: 0, count: 0 };
      }
      dishAggregates[item.dishId].totalPop += item.expectedSalesPercentage;
      dishAggregates[item.dishId].count += 1;
    });

    let totalProfit = 0;
    let totalPop = 0;

    const mappedDishes = Object.entries(dishAggregates).map(([dishId, agg]) => {
      const dish = dishes.find(d => d.id === dishId);
      if (!dish) return null;

      const profit = activeEvent.fixedSellingPrice - dish.totalCost;
      // Popularidad: Promedio de su mix en los días que aparece (ponderado por la cantidad de días del ciclo)
      // Para la matriz BCG usaremos el "Sales Mix" simplificado como el promedio de su % Diario
      const pop = agg.totalPop / (activeEvent.dailyMenus.length || 1);

      totalProfit += profit;
      totalPop += pop;

      return {
        id: dish.id,
        name: dish.name,
        profitability: profit,
        popularity: pop,
        category: '' // Calculado abajo
      };
    }).filter(Boolean) as any[];

    if (mappedDishes.length === 0) return { data: [], avgProfit: 0, avgPop: 0 };

    const avgProfit = totalProfit / mappedDishes.length;
    const avgPop = totalPop / mappedDishes.length;

    // Categorizar usando lógica de Matriz BCG
    const categorizedData = mappedDishes.map(d => {
      let cat = '';
      if (d.popularity >= avgPop && d.profitability >= avgProfit) cat = 'Estrella';
      else if (d.popularity >= avgPop && d.profitability < avgProfit) cat = 'Caballo de Batalla';
      else if (d.popularity < avgPop && d.profitability >= avgProfit) cat = 'Rompecabezas';
      else cat = 'Perro';
      return { ...d, category: cat };
    });

    return { data: categorizedData, avgProfit, avgPop };
  }, [activeEvent, dishes]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Estrella': return '#10b981'; // Green
      case 'Caballo de Batalla': return '#3b82f6'; // Blue
      case 'Rompecabezas': return '#f59e0b'; // Amber
      case 'Perro': return '#ef4444'; // Red
      default: return '#94a3b8';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 max-w-xs z-50">
          <p className="font-bold text-slate-900 mb-1 leading-tight">{data.name}</p>
          <span 
            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white mb-3 shadow-sm"
            style={{ backgroundColor: getCategoryColor(data.category) }}
          >
            {data.category}
          </span>
          <div className="space-y-1 text-sm">
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Ganancia Neta:</span> 
              <span className="font-mono font-medium">${data.profitability.toFixed(2)}</span>
            </p>
            <p className="text-slate-600 flex justify-between gap-4">
              <span>Popularidad:</span> 
              <span className="font-mono font-medium">{data.popularity}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
        <div className="p-4 bg-indigo-50 rounded-full mb-6">
          <BrainCircuit className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Ingeniería de Menús Inactiva</h2>
        <p className="text-slate-500 mb-8">
          Para analizar la matriz estratégica, necesitas tener un Evento Activo. El modelo evaluará la popularidad y rentabilidad basada en el Mix de Ventas de dicho evento.
        </p>
        <Link 
          to="/events"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-500 transition-colors"
        >
          Ir a Eventos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
           <Link to="/events" className="text-sm text-indigo-600 font-medium hover:underline mb-2 inline-block">← Volver a Eventos</Link>
           <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">Ingeniería de Menús</h1>
             <span className="px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shrink-0">
               {activeEvent.name}
             </span>
           </div>
           <p className="mt-2 text-sm text-slate-500 max-w-3xl">
             La Matriz de Boston Consulting Group aplicada a tu menú. Clasifica las viandas del evento en cuatro categorías estratégicas basadas en su <b>Popularidad</b> (% Mix) y su <b>Rentabilidad</b> (Ganancia Unitaria).
           </p>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl overflow-hidden p-6 lg:p-8">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
             <BrainCircuit className="w-6 h-6" />
           </div>
           <div>
             <h2 className="text-xl font-bold text-slate-900">Matriz Estratégica del Evento Activo</h2>
             <p className="text-sm text-slate-500">Visualiza el rendimiento competitivo de tu catálogo para este ciclo.</p>
           </div>
        </div>

        {matrixData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <LayoutDashboard className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">Matriz Estática</h3>
            <p className="text-sm text-slate-500 max-w-sm mt-2">
              El evento activo no tiene platos con porcentajes de mix asignados. Ve al Editor del Evento para configurar el mix.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Gráfico Tipo Scatter */}
            <div className="xl:col-span-2 h-[500px] border border-slate-100 rounded-2xl bg-slate-50 p-2 relative overflow-hidden shadow-inner">
              
              {/* Etiquetas Categóricas (Fondo) */}
              <div className="absolute inset-0 pointer-events-none p-12">
                <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-[2px]">
                   <div className="flex items-start justify-start p-4 opacity-40 bg-gradient-to-br from-amber-50 to-transparent rounded-tl-xl rounded-[2px]">
                      <span className="text-amber-700 font-bold uppercase tracking-widest text-sm bg-amber-100/50 px-3 py-1 rounded-full backdrop-blur-sm">Rompecabezas</span>
                   </div>
                   <div className="flex items-start justify-end p-4 opacity-40 bg-gradient-to-bl from-emerald-50 to-transparent rounded-tr-xl rounded-[2px]">
                      <span className="text-emerald-700 font-bold uppercase tracking-widest text-sm bg-emerald-100/50 px-3 py-1 rounded-full backdrop-blur-sm">Estrella</span>
                   </div>
                   <div className="flex items-end justify-start p-4 opacity-40 bg-gradient-to-tr from-red-50 to-transparent rounded-bl-xl rounded-[2px]">
                      <span className="text-red-700 font-bold uppercase tracking-widest text-sm bg-red-100/50 px-3 py-1 rounded-full backdrop-blur-sm">Perro</span>
                   </div>
                   <div className="flex items-end justify-end p-4 opacity-40 bg-gradient-to-tl from-blue-50 to-transparent rounded-br-xl rounded-[2px]">
                      <span className="text-blue-700 font-bold uppercase tracking-widest text-sm bg-blue-100/50 px-3 py-1 rounded-full backdrop-blur-sm">Caballo de Batalla</span>
                   </div>
                </div>
              </div>

              <div className="relative z-10 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.6} />
                    
                    <XAxis 
                      type="number" 
                      dataKey="popularity" 
                      name="Popularidad (%)" 
                      unit="%"
                      tick={{fill: '#475569', fontSize: 12, fontWeight: 500}}
                      axisLine={{stroke: '#94a3b8', strokeWidth: 2}}
                      tickLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    
                    <YAxis 
                      type="number" 
                      dataKey="profitability" 
                      name="Ganancia Neta ($)" 
                      unit="$"
                      tick={{fill: '#475569', fontSize: 12, fontWeight: 500}}
                      axisLine={{stroke: '#94a3b8', strokeWidth: 2}}
                      tickLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />

                    <ZAxis type="number" range={[300, 300]} />
                    
                    <Tooltip content={<CustomTooltip />} cursor={{strokeDasharray: '3 3', stroke: '#94a3b8'}} />

                    {/* Ejes Centrales (Promedios) */}
                    <ReferenceLine x={matrixData.avgPop} stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" opacity={0.7} />
                    <ReferenceLine y={matrixData.avgProfit} stroke="#64748b" strokeWidth={2} strokeDasharray="5 5" opacity={0.7} />

                    <Scatter name="Viandas" data={matrixData.data}>
                      {matrixData.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} className="drop-shadow-sm hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leyenda y Acciones */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-6">Plan de Acción / Estrategias</h3>
                <ul className="space-y-6">
                  <li className="flex gap-4 group">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 transition-transform" />
                     <div>
                       <p className="text-sm font-bold text-slate-900">Estrellas</p>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">Alta Ganancia, Alta Venta. Mantén la calidad estricta por sobre todo, promociónalos fuertemente.</p>
                     </div>
                  </li>
                  <li className="flex gap-4 group">
                     <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 transition-transform" />
                     <div>
                       <p className="text-sm font-bold text-slate-900">Caballos de Batalla</p>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">Baja Ganancia, Alta Venta. Son tus anclas. Reduce discretamente su Factor Q o sube el precio levemente de todo el evento.</p>
                     </div>
                  </li>
                  <li className="flex gap-4 group">
                     <div className="w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 transition-transform" />
                     <div>
                       <p className="text-sm font-bold text-slate-900">Rompecabezas</p>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">Alta Ganancia, Baja Venta. Da mucha plata pero sale poco. Usa marketing psicológico o fotos irresistibles para impulsar su volumen.</p>
                     </div>
                  </li>
                  <li className="flex gap-4 group">
                     <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0 shadow-sm group-hover:scale-125 transition-transform" />
                     <div>
                       <p className="text-sm font-bold text-slate-900">Perros</p>
                       <p className="text-xs text-slate-500 mt-1 leading-relaxed">Baja Ganancia, Baja Venta. Suelen ser logística muerta. Considera reducir su porción drásticamente o eliminarlos del menú.</p>
                     </div>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                 <div className="bg-slate-50 px-5 py-4 rounded-xl border border-slate-200/50 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Líneas de Corte</span>
                    </div>
                    <div className="flex gap-4">
                       <div className="flex-1">
                          <p className="text-[10px] text-slate-400 capitalize mb-1">Corte Rentabilidad:</p>
                          <p className="text-xl font-black text-slate-800">${matrixData.avgProfit.toFixed(2)}</p>
                       </div>
                       <div className="w-px bg-slate-200"></div>
                       <div className="flex-1">
                          <p className="text-[10px] text-slate-400 capitalize mb-1">Corte Popularidad:</p>
                          <p className="text-xl font-black text-slate-800">{matrixData.avgPop.toFixed(1)}%</p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FixedCosts() {
  const { fixedCosts, addFixedCost, deleteFixedCost } = useStore();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<FixedCost, 'id'>>();

  const onSubmit: SubmitHandler<Omit<FixedCost, 'id'>> = (data) => {
    addFixedCost({
      name: data.name,
      amount: Number(data.amount),
      type: data.type
    });
    reset();
  };

  const totalFixedCosts = useMemo(() => {
    return fixedCosts.reduce((acc, cost) => acc + cost.amount, 0);
  }, [fixedCosts]);

  const typeLabels: Record<string, string> = {
    rent: 'Alquiler / Hipoteca',
    salary: 'Sueldos / Mano de Obra',
    utilities: 'Servicios (Luz, Agua, Gas)',
    marketing: 'Marketing / Publicidad',
    maintenance: 'Mantenimiento / Seguros',
    insurance: 'Seguros / Impuestos',
    other: 'Otros Gastos Generales'
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="sm:flex sm:items-center sm:justify-between px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Costos Fijos Operativos (Overhead)</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-3xl">
            Registra los gastos mensuales ineludibles. No se asignan por plato ("Full Cost"), sino que el Modelo los usará para calcular cuántas viandas debes vender al mes para pagar las cuentas (Punto de Equilibrio).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Formulario */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl p-6">
            <h2 className="text-base font-semibold leading-7 text-slate-900 mb-6 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-500" />
              Nuevo Gasto Fijo
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Descripción / Nombre</label>
                <div className="mt-2">
                  <input
                    {...register("name", { required: true })}
                    type="text"
                    placeholder="Ej. Alquiler Local"
                    className="block w-full rounded-lg border-slate-300 py-2 text-slate-900 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1 block">Requerido</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Cuota Mensual Exacta ($)</label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-500 sm:text-sm">$</span>
                  </div>
                  <input
                    {...register("amount", { required: true, min: 1 })}
                    type="number"
                    step="0.01"
                    className="block w-full rounded-lg border-slate-300 py-2 pl-8 text-slate-900 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  />
                  {errors.amount && <span className="text-red-500 text-xs mt-1 block">Inválido</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-slate-900">Categoría</label>
                <div className="mt-2">
                  <select
                    {...register("type", { required: true })}
                    className="block w-full rounded-lg border-slate-300 py-2 text-slate-900 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                  >
                    <option value="" disabled>Seleccione...</option>
                    <option value="salary">Sueldos Directos / Indirectos</option>
                    <option value="rent">Alquiler / Hipoteca</option>
                    <option value="utilities">Servicios Básicos (Luz, Internet)</option>
                    <option value="maintenance">Mantenimiento de Software/Licencias</option>
                    <option value="insurance">Seguros Pólizas</option>
                    <option value="marketing">Marketing (Social Media Ads)</option>
                    <option value="other">Otros Gastos Generales</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                 <button
                   type="submit"
                   className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                 >
                   Guardar Gasto Fijo
                 </button>
              </div>
            </form>
          </div>

          <div className="mt-6 rounded-xl bg-amber-50 p-6 border border-amber-100 flex flex-col justify-center items-center text-center shadow-inner">
             <h3 className="text-sm font-bold uppercase tracking-wider text-amber-800 mb-2">
                Total Gastos Fijos (Mes)
             </h3>
             <span className="text-4xl font-bold tracking-tight text-amber-600">
               ${totalFixedCosts.toFixed(2)}
             </span>
             <p className="text-xs text-amber-700/80 mt-2">Dinero que el negocio debe producir mes a mes solo por estar abierto.</p>
          </div>
        </div>

        {/* Tabla/Listado */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Desglose de Costos Fijos</h3>
            </div>
            <div className="overflow-x-auto p-4 sm:p-6 bg-slate-50 min-h-[400px]">
              {fixedCosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-lg border border-dashed border-slate-300 h-full">
                  <span className="p-4 bg-slate-50 rounded-full mb-4">
                    <Wallet className="w-8 h-8 text-slate-300" />
                  </span>
                  <span className="text-slate-600 font-medium">No has registrado Costos Fijos aún.</span>
                  <span className="text-sm text-slate-400 mt-2 max-w-sm">
                    Recomendación del autor: Empieza registrando alquiler, sueldos fijos y facturas de servicios.
                  </span>
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {fixedCosts.map((cost) => (
                    <li key={cost.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start pr-6">
                        <div className="overflow-hidden">
                          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 mb-2">
                             {typeLabels[cost.type]}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 truncate" title={cost.name}>{cost.name}</h4>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 text-right">
                         <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-0.5">Cuota Mensual</span>
                         <span className="text-2xl font-black text-slate-700">${cost.amount.toFixed(2)}</span>
                      </div>
                      
                      <button
                        onClick={() => deleteFixedCost(cost.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        title="Eliminar Gasto"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
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

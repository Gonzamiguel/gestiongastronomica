import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// --- Interfaces para el Modelo de Datos ---

export interface Ingredient {
  id: string;
  name: string;
  grossWeight: number; // Peso bruto de compra
  netWeight: number; // Peso neto tras mermas
  purchasePrice: number; // Precio de compra
  realCostPerGram: number; // Costo por gramaje utilizable (calculado)
}

// Configuración del Factor Q (Costos Ocultos)
export interface FactorQConfig {
  fixedAmount: number; // Valor monetario fijo (ej: Envase)
  percentage: number; // Porcentaje sobre el costo de ingredientes (ej: Mermas invisibles, condimentos)
}

export interface RecipeIngredient {
  ingredientId: string;
  gramsUsed: number;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  factorQ: FactorQConfig;
  totalCost: number; // Costo total (Ingredientes + Factor Q)
}

export interface MenuEventItem {
  dishId: string;
  expectedSalesPercentage: number;
}

export interface EventCustomCost {
  id: string;
  name: string;
  amount: number;
}

export interface MenuEvent {
  id: string;
  name: string;
  createdAt: number;
  fixedSellingPrice: number;
  isActive: boolean;
  items: MenuEventItem[];
  useGlobalFixedCosts: boolean;
  customCosts: EventCustomCost[];
  guestCount?: number;
}

export interface GlobalConfig {
  targetMarginPercentage: number; // Margen de ganancia objetivo (ej: 40%)
}

export interface FixedCost {
  id: string;
  name: string;
  amount: number;
  type: 'rent' | 'salary' | 'utilities' | 'marketing' | 'maintenance' | 'insurance' | 'other';
}

// --- Interfaz del Store ---

interface FoodCostingState {
  ingredients: Ingredient[];
  dishes: Dish[];
  globalConfig: GlobalConfig;
  fixedCosts: FixedCost[];
  events: MenuEvent[];
  activeEventId: string | null;
  
  // Acciones - Ingredientes
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'realCostPerGram'>) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;

  // Acciones - Platos
  addDish: (dish: Omit<Dish, 'id' | 'totalCost'>) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  deleteDish: (id: string) => void;

  // Acciones - Costos Fijos
  addFixedCost: (cost: Omit<FixedCost, 'id'>) => void;
  updateFixedCost: (id: string, cost: Partial<FixedCost>) => void;
  deleteFixedCost: (id: string) => void;

  // Acciones - Eventos
  addEvent: (event: Omit<MenuEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<MenuEvent>) => void;
  deleteEvent: (id: string) => void;
  setActiveEvent: (id: string | null) => void;
  addEventItem: (eventId: string, dishId: string) => void;
  updateEventItem: (eventId: string, dishId: string, percentage: number) => void;
  removeEventItem: (eventId: string, dishId: string) => void;

  // Acciones - Configuración Global
  updateGlobalConfig: (config: Partial<GlobalConfig>) => void;
}

// --- Helpers ---

const calculateRealCostPerGram = (grossWeight: number, netWeight: number, purchasePrice: number) => {
  if (netWeight === 0) return 0;
  // Costo por gramo utilizable = (Precio de compra / Peso neto en gramos)
  return purchasePrice / netWeight;
};

const calculateDishTotalCost = (
  recipeIngredients: RecipeIngredient[], 
  factorQ: FactorQConfig, 
  allIngredients: Ingredient[]
) => {
  // 1. Sumar costo de ingredientes
  const ingredientsCost = recipeIngredients.reduce((total, recipeItem) => {
    const ingredient = allIngredients.find(i => i.id === recipeItem.ingredientId);
    if (!ingredient) return total;
    return total + (ingredient.realCostPerGram * recipeItem.gramsUsed);
  }, 0);

  // 2. Aplicar Factor Q (Monto fijo + Porcentaje sobre costo de ingredientes)
  const factorQCost = factorQ.fixedAmount + (ingredientsCost * (factorQ.percentage / 100));

  // 3. Costo Total del Plato
  return ingredientsCost + factorQCost;
};


// --- Store de Zustand con Persistencia ---

export const useStore = create<FoodCostingState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      dishes: [],
      fixedCosts: [],
      events: [],
      activeEventId: null,
      globalConfig: {
        targetMarginPercentage: 35, // Margen predeterminado
      },

      // --- Implementación de Acciones ---

      addIngredient: (ingredientData) => {
        set((state) => {
          const newId = crypto.randomUUID();
          const realCost = calculateRealCostPerGram(
            ingredientData.grossWeight, 
            ingredientData.netWeight, 
            ingredientData.purchasePrice
          );
          
          return {
            ingredients: [
              ...state.ingredients,
              { ...ingredientData, id: newId, realCostPerGram: realCost }
            ]
          };
        });
        // TODO: Al añadir/actualizar un ingrediente, se deben recalcular los costos de los platos afectados.
      },

      updateIngredient: (id, updateData) => {
        set((state) => {
          const updatedIngredients = state.ingredients.map(ing => {
            if (ing.id !== id) return ing;
            
            const newData = { ...ing, ...updateData };
            newData.realCostPerGram = calculateRealCostPerGram(
              newData.grossWeight, newData.netWeight, newData.purchasePrice
            );
            return newData;
          });

          // Recalcular costos de platos si cambia el precio de un ingrediente
          const updatedDishes = state.dishes.map(dish => ({
            ...dish,
            totalCost: calculateDishTotalCost(dish.ingredients, dish.factorQ, updatedIngredients)
          }));

          return { ingredients: updatedIngredients, dishes: updatedDishes };
        });
      },

      deleteIngredient: (id) => {
        set((state) => ({
          ingredients: state.ingredients.filter(ing => ing.id !== id)
        }));
      },

      addDish: (dishData) => {
        set((state) => {
          const newId = crypto.randomUUID();
          const totalCost = calculateDishTotalCost(dishData.ingredients, dishData.factorQ, state.ingredients);
          
          return {
            dishes: [
              ...state.dishes,
              { ...dishData, id: newId, totalCost }
            ]
          };
        });
      },

      updateDish: (id, updateData) => {
        set((state) => {
          const updatedDishes = state.dishes.map(dish => {
            if (dish.id !== id) return dish;
            const newData = { ...dish, ...updateData };
            // always recalculate total cost in case ingredients or factorQ changed
            newData.totalCost = calculateDishTotalCost(newData.ingredients, newData.factorQ, state.ingredients);
            return newData;
          });
          return { dishes: updatedDishes };
        });
      },

      deleteDish: (id) => {
        set((state) => ({
          dishes: state.dishes.filter(dish => dish.id !== id)
        }));
      },

      addFixedCost: (costData) => {
        set((state) => {
          const newId = crypto.randomUUID();
          return {
            fixedCosts: [
              ...state.fixedCosts,
              { ...costData, id: newId }
            ]
          };
        });
      },

      updateFixedCost: (id, updateData) => {
        set((state) => ({
          fixedCosts: state.fixedCosts.map(cost => 
            cost.id === id ? { ...cost, ...updateData } : cost
          )
        }));
      },

      deleteFixedCost: (id) => {
        set((state) => ({
          fixedCosts: state.fixedCosts.filter(cost => cost.id !== id)
        }));
      },

      // --- Acciones de Eventos ---
      addEvent: (eventData) => {
        set((state) => {
          const newId = crypto.randomUUID();
          const newEvent: MenuEvent = {
            ...eventData,
            id: newId,
            createdAt: Date.now(),
            useGlobalFixedCosts: eventData.useGlobalFixedCosts ?? true,
            customCosts: eventData.customCosts ?? [],
            guestCount: eventData.guestCount ?? 0,
          };
          
          return {
            events: [...state.events, newEvent],
            // Si es el primer evento o está marcado como activo, lo seteamos
            activeEventId: eventData.isActive ? newId : state.activeEventId
          };
        });
      },

      updateEvent: (id, updateData) => {
        set((state) => {
          // Si este evento se marca como activo, desmarcamos los demás
          let newEvents = state.events.map(ev => 
             ev.id === id ? { ...ev, ...updateData } : ev
          );
          
          if (updateData.isActive === true) {
             newEvents = newEvents.map(ev => ({ ...ev, isActive: ev.id === id }));
          }

          return {
            events: newEvents,
            activeEventId: updateData.isActive ? id : (updateData.isActive === false && state.activeEventId === id ? null : state.activeEventId)
          };
        });
      },

      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter(ev => ev.id !== id),
          activeEventId: state.activeEventId === id ? null : state.activeEventId
        }));
      },

      setActiveEvent: (id) => {
        set((state) => ({
          activeEventId: id,
          events: state.events.map(ev => ({ ...ev, isActive: ev.id === id }))
        }));
      },

      addEventItem: (eventId, dishId) => {
        set((state) => {
          return {
            events: state.events.map(ev => {
              if (ev.id !== eventId) return ev;
              // Avoid duplicates
              if (ev.items.some(item => item.dishId === dishId)) return ev;
              return {
                ...ev,
                items: [...ev.items, { dishId, expectedSalesPercentage: 0 }]
              };
            })
          };
        });
      },

      updateEventItem: (eventId, dishId, percentage) => {
        set((state) => ({
          events: state.events.map(ev => {
            if (ev.id !== eventId) return ev;
            return {
              ...ev,
              items: ev.items.map(item => 
                item.dishId === dishId ? { ...item, expectedSalesPercentage: percentage } : item
              )
            };
          })
        }));
      },

      removeEventItem: (eventId, dishId) => {
        set((state) => ({
          events: state.events.map(ev => {
            if (ev.id !== eventId) return ev;
            return {
              ...ev,
              items: ev.items.filter(item => item.dishId !== dishId)
            };
          })
        }));
      },

      updateGlobalConfig: (configUpdate) => {
        set((state) => ({
          globalConfig: { ...state.globalConfig, ...configUpdate }
        }));
      }

    }),
    {
      name: 'food-costing-storage', // Nombre para localStorage
    }
  )
);

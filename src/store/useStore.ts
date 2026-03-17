import { create } from 'zustand';
import { db } from '../firebase';
import { useAuthStore } from './useAuthStore';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy 
} from 'firebase/firestore';

// --- Interfaces para el Modelo de Datos (Multi-Tenant) ---

export interface Ingredient {
  id: string;
  companyId: string; // SaaS
  name: string;
  unit: string;
  grossWeight: number;
  netWeight: number;
  purchasePrice: number;
  realCostPerGram: number;
}

export interface FactorQConfig {
  fixedAmount: number;
  percentage: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  gramsUsed: number;
}

export interface Dish {
  id: string;
  companyId: string; // SaaS
  name: string;
  ingredients: RecipeIngredient[];
  factorQ: FactorQConfig;
  totalCost: number;
}

export interface MenuEventItem {
  id: string;
  dishId: string;
  expectedSalesPercentage: number;
}

export interface DailyMenu {
  id: string;
  date: string;
  dayName: string;
  items: MenuEventItem[];
}

export interface EventCustomCost {
  id: string;
  name: string;
  amount: number;
}

export interface MenuEvent {
  id: string;
  companyId: string; // SaaS
  name: string;
  createdAt: number;
  startDate: string;
  endDate: string;
  fixedSellingPrice: number;
  isActive: boolean;
  dailyMenus: DailyMenu[];
  useGlobalFixedCosts: boolean;
  customCosts: EventCustomCost[];
  guestCount?: number;
}

export interface CompanyProfile {
  companyId: string;
  companyName: string;
  whatsappNumber: string;
  email: string;
  isActive: boolean;
}

export interface GuestCustomer {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  dishId: string;
  dishName: string;
  quantity: number;
  priceAtOrder: number;
  dayName: string;
  date: string;
}

export interface Order {
  id: string;
  eventId: string;
  companyId: string;
  customer: GuestCustomer;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface GlobalConfig {
  companyId: string;
  targetMarginPercentage: number;
}

export interface FixedCost {
  id: string;
  companyId: string;
  name: string;
  amount: number;
  type: 'rent' | 'salary' | 'utilities' | 'marketing' | 'maintenance' | 'insurance' | 'other';
}

// --- Interfaz del Store ---

interface FoodCostingState {
  ingredients: Ingredient[];
  dishes: Dish[];
  globalConfig: GlobalConfig | null;
  fixedCosts: FixedCost[];
  events: MenuEvent[];
  companyProfile: CompanyProfile | null;
  activeEventId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones - Perfil de Empresa
  fetchCompanyProfile: (companyId: string) => Promise<CompanyProfile | null>;
  updateCompanyProfile: (profile: Partial<CompanyProfile>) => Promise<void>;

  // Acciones - Órdenes (Checkout)
  saveOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Promise<string>;
  // Acciones - Ingredientes (Firestore)
  fetchIngredients: () => Promise<void>;
  saveIngredient: (ingredient: Omit<Ingredient, 'companyId' | 'realCostPerGram' | 'id'> & { id?: string }) => Promise<void>;
  deleteIngredientFirestore: (id: string) => Promise<void>;

  // Acciones - Platos (Firestore)
  fetchDishes: () => Promise<void>;
  saveDish: (dish: Omit<Dish, 'companyId' | 'totalCost' | 'id'> & { id?: string }) => Promise<void>;
  deleteDishFirestore: (id: string) => Promise<void>;

  // Acciones Principal de Eventos (Firestore Multi-Tenant)
  fetchEvents: () => Promise<void>;
  saveEvent: (event: Omit<MenuEvent, 'companyId'> & { companyId?: string }) => Promise<void>;
  deleteEventFirestore: (id: string) => Promise<void>;

  // Orquestador SaaS
  fetchCompanyData: () => Promise<void>;

  // Acciones Local UI
  setActiveEvent: (id: string | null) => void;
  // ... rest of local actions
  addEvent: (event: Omit<MenuEvent, 'id' | 'createdAt' | 'dailyMenus' | 'companyId'>) => void;
  updateEvent: (id: string, event: Partial<MenuEvent>) => void;
  deleteEvent: (id: string) => void;
  
  // Acciones - Gestor de Calendario
  generateDailyMenus: (eventId: string, startDate: string, endDate: string) => void;
  addEventItem: (eventId: string, dailyMenuId: string, dishId: string) => void;
  updateEventItem: (eventId: string, dailyMenuId: string, dishId: string, percentage: number) => void;
  removeEventItem: (eventId: string, dailyMenuId: string, dishId: string) => void;

  // Acciones - Órdenes (Gestión de Dueño)
  orders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: 'pending' | 'approved' | 'completed' | 'cancelled') => Promise<void>;

  updateGlobalConfig: (config: Partial<GlobalConfig>) => void;

  // Acciones - Gastos Fijos (Keep local for now or migrate if asked)
  addFixedCost: (fixedCost: Omit<FixedCost, 'id' | 'companyId'>) => void;
  deleteFixedCost: (id: string) => void;
}

const calculateRealCostPerGram = (grossWeight: number, netWeight: number, purchasePrice: number) => {
  if (netWeight === 0) return 0;
  return purchasePrice / netWeight;
};

const calculateDishTotalCost = (
  recipeIngredients: RecipeIngredient[], 
  factorQ: FactorQConfig, 
  allIngredients: Ingredient[]
) => {
  const ingredientsCost = recipeIngredients.reduce((total, recipeItem) => {
    const ingredient = allIngredients.find(i => i.id === recipeItem.ingredientId);
    if (!ingredient) return total;
    return total + (ingredient.realCostPerGram * recipeItem.gramsUsed);
  }, 0);

  const factorQCost = factorQ.fixedAmount + (ingredientsCost * (factorQ.percentage / 100));
  return ingredientsCost + factorQCost;
};


export const useStore = create<FoodCostingState>()((set, get) => ({
  ingredients: [],
  dishes: [],
  fixedCosts: [],
  events: [],
  activeEventId: null,
  isLoading: false,
  error: null,
  globalConfig: null,
  companyProfile: null,
  orders: [],

  // --- IMPLEMENTACIÓN FIRESTORE MULTI-TENANT ---

  fetchCompanyProfile: async (companyId) => {
    try {
      const docRef = doc(db, 'companies', companyId);
      const docSnap = await getDocs(query(collection(db, 'companies'), where('companyId', '==', companyId)));
      if (!docSnap.empty) {
        const profile = { ...docSnap.docs[0].data(), id: docSnap.docs[0].id } as any;
        set({ companyProfile: profile as CompanyProfile });
        return profile as CompanyProfile;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching company profile:", err);
      return null;
    }
  },

  updateCompanyProfile: async (profileUpdate) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set({ isLoading: true });
    try {
      // Buscar el documento de la empresa para esta ID
      const q = query(collection(db, 'companies'), where('companyId', '==', currentUser.companyId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const companyDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, 'companies', companyDoc.id), profileUpdate);
        
        set(state => ({
          companyProfile: state.companyProfile ? { ...state.companyProfile, ...profileUpdate } : null,
          isLoading: false
        }));
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveOrder: async (orderData) => {
    try {
      const finalOrder = {
        ...orderData,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'orders'), finalOrder);
      return docRef.id;
    } catch (err: any) {
      console.error("Error saving order:", err);
      throw err;
    }
  },

  fetchOrders: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set({ isLoading: true });
    try {
      const q = query(
        collection(db, 'orders'), 
        where('companyId', '==', currentUser.companyId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
      set({ orders, isLoading: false });
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  updateOrderStatus: async (orderId, newStatus) => {
    set({ isLoading: true });
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      set(state => ({
        orders: state.orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o),
        isLoading: false
      }));
    } catch (err: any) {
      console.error("Error updating order status:", err);
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCompanyData: async () => {
    const { fetchEvents, fetchIngredients, fetchDishes, fetchOrders } = get();
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        fetchEvents(),
        fetchIngredients(),
        fetchDishes(),
        fetchOrders()
      ]);
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchIngredients: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'ingredients'), 
        where('companyId', '==', currentUser.companyId)
      );
      const querySnapshot = await getDocs(q);
      const ingredients = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Ingredient[];
      set({ ingredients });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  saveIngredient: async (ingredientData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("No hay usuario autenticado.");

    set({ isLoading: true, error: null });
    try {
      const realCost = calculateRealCostPerGram(
        ingredientData.grossWeight, 
        ingredientData.netWeight, 
        ingredientData.purchasePrice
      );
      
      const finalIngredient: Ingredient = {
        ...ingredientData,
        id: ingredientData.id || crypto.randomUUID(),
        companyId: currentUser.companyId,
        realCostPerGram: realCost
      };
      
      await setDoc(doc(db, 'ingredients', finalIngredient.id), finalIngredient);
      
      // Update Local State
      const current = get().ingredients;
      const index = current.findIndex(i => i.id === finalIngredient.id);
      if (index > -1) {
        set({ ingredients: current.map(i => i.id === finalIngredient.id ? finalIngredient : i) });
      } else {
        set({ ingredients: [...current, finalIngredient] });
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteIngredientFirestore: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'ingredients', id));
      set(state => ({
        ingredients: state.ingredients.filter(ing => ing.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchDishes: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    try {
      const q = query(
        collection(db, 'dishes'), 
        where('companyId', '==', currentUser.companyId)
      );
      const querySnapshot = await getDocs(q);
      const dishes = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Dish[];
      set({ dishes });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  saveDish: async (dishData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("No hay usuario autenticado.");

    set({ isLoading: true, error: null });
    try {
      const totalCost = calculateDishTotalCost(dishData.ingredients, dishData.factorQ, get().ingredients);
      
      const finalDish: Dish = {
        ...dishData,
        id: dishData.id || crypto.randomUUID(),
        companyId: currentUser.companyId,
        totalCost: totalCost
      };
      
      await setDoc(doc(db, 'dishes', finalDish.id), finalDish);
      
      // Update Local State
      const current = get().dishes;
      const index = current.findIndex(d => d.id === finalDish.id);
      if (index > -1) {
        set({ dishes: current.map(d => d.id === finalDish.id ? finalDish : d) });
      } else {
        set({ dishes: [...current, finalDish] });
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteDishFirestore: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'dishes', id));
      set(state => ({
        dishes: state.dishes.filter(d => d.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchEvents: async () => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    set({ isLoading: true, error: null });
    try {
      const q = query(
        collection(db, 'menuEvents'), 
        where('companyId', '==', currentUser.companyId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as MenuEvent[];
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  saveEvent: async (eventData) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) throw new Error("No hay usuario autenticado.");

    set({ isLoading: true, error: null });
    try {
      const finalEvent: MenuEvent = {
        ...eventData,
        companyId: currentUser.companyId,
        id: eventData.id || crypto.randomUUID(),
        createdAt: eventData.createdAt || Date.now()
      } as MenuEvent;
      
      await setDoc(doc(db, 'menuEvents', finalEvent.id), finalEvent);
      
      const currentEvents = get().events;
      const index = currentEvents.findIndex(e => e.id === finalEvent.id);
      if (index > -1) {
        set({ events: currentEvents.map(e => e.id === finalEvent.id ? finalEvent : e) });
      } else {
        set({ events: [finalEvent, ...currentEvents] });
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteEventFirestore: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteDoc(doc(db, 'menuEvents', id));
      set(state => ({
        events: state.events.filter(e => e.id !== id),
        activeEventId: state.activeEventId === id ? null : state.activeEventId,
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  // --- MÉTODOS LOCALES Y BACKUP ---

  setActiveEvent: (id) => {
    set((state) => ({
      activeEventId: id,
      events: state.events.map(ev => ({ ...ev, isActive: ev.id === id }))
    }));
  },

  addEvent: (eventData) => {
    const cid = useAuthStore.getState().user?.companyId || 'anon';
    set((state) => {
      const newId = crypto.randomUUID();
      const newEvent: MenuEvent = {
        ...eventData,
        id: newId,
        companyId: cid,
        createdAt: Date.now(),
        useGlobalFixedCosts: eventData.useGlobalFixedCosts ?? true,
        customCosts: eventData.customCosts ?? [],
        dailyMenus: []
      } as MenuEvent;
      return { events: [...state.events, newEvent] };
    });
  },

  updateEvent: (id, updateData) => {
    set((state) => ({
      events: state.events.map(ev => ev.id === id ? { ...ev, ...updateData } : ev)
    }));
  },

  deleteEvent: (id) => {
     set(state => ({ events: state.events.filter(e => e.id !== id) }));
  },

  generateDailyMenus: (eventId, startDate, endDate) => {
    set((state) => ({
      events: state.events.map(ev => {
        if (ev.id !== eventId) return ev;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const newDailyMenus: DailyMenu[] = [];
        if (start <= end) {
           let currentDate = new Date(start);
           while (currentDate <= end) {
             const dateIso = currentDate.toISOString().split('T')[0];
             newDailyMenus.push({
               id: crypto.randomUUID(),
               date: dateIso,
               dayName: 'Día',
               items: []
             });
             currentDate.setDate(currentDate.getDate() + 1);
           }
        }
        return { ...ev, startDate, endDate, dailyMenus: newDailyMenus };
      })
    }));
  },

  addEventItem: (eventId, dailyMenuId, dishId) => {
    set((state) => ({
      events: state.events.map(ev => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          dailyMenus: ev.dailyMenus.map(day => {
             if (day.id !== dailyMenuId) return day;
             return { ...day, items: [...day.items, { id: crypto.randomUUID(), dishId, expectedSalesPercentage: 0 }] };
          })
        };
      })
    }));
  },

  updateEventItem: (eventId, dailyMenuId, dishId, percentage) => {
    set((state) => ({
      events: state.events.map(ev => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          dailyMenus: ev.dailyMenus.map(day => {
            if (day.id !== dailyMenuId) return day;
            return {
              ...day,
              items: day.items.map(item => item.dishId === dishId ? { ...item, expectedSalesPercentage: percentage } : item)
            };
          })
        };
      })
    }));
  },

  removeEventItem: (eventId, dailyMenuId, dishId) => {
    set((state) => ({
      events: state.events.map(ev => {
        if (ev.id !== eventId) return ev;
        return {
          ...ev,
          dailyMenus: ev.dailyMenus.map(day => {
            if (day.id !== dailyMenuId) return day;
            return { ...day, items: day.items.filter(item => item.dishId !== dishId) };
          })
        };
      })
    }));
  },

  updateGlobalConfig: (configUpdate) => {
    set((state) => ({
      globalConfig: state.globalConfig ? { ...state.globalConfig, ...configUpdate } : null
    }));
  },

  addFixedCost: (costData) => {
    const cid = useAuthStore.getState().user?.companyId || 'anon';
    set((state) => ({
      fixedCosts: [...state.fixedCosts, { ...costData, id: crypto.randomUUID(), companyId: cid }]
    }));
  },

  deleteFixedCost: (id: string) => {
    set((state) => ({
      fixedCosts: state.fixedCosts.filter(c => c.id !== id)
    }));
  }

}));

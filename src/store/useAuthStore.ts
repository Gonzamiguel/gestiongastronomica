import { create } from 'zustand';
import { auth, db } from '../firebase';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  createUserWithEmailAndPassword,
  getAuth
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: 'superadmin' | 'company';
  companyId: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  createNewCompany: (companyName: string, email: string, password: string) => Promise<void>;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  initialized: false,

  setInitialized: (val) => set({ initialized: val }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        await signOut(auth);
        set({ 
          user: null, 
          isLoading: false, 
          error: "Tu cuenta no está registrada en el sistema. Contacta al administrador." 
        });
        throw new Error("Unauthorized");
      }
      
      const data = userDoc.data();
      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: data.role || 'company',
          companyId: data.companyId,
        },
        isLoading: false,
        initialized: true
      });
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        set({ error: err.message || "Error al autenticar", isLoading: false });
      } else {
        set({ isLoading: false });
      }
      throw err;
    }
  },

  // --- LÓGICA DE SUPERADMIN PARA CREAR EMPRESAS (SECONDARY APP PATTERN) ---
  createNewCompany: async (companyName, email, password) => {
    const currentUser = get().user;
    if (currentUser?.role !== 'superadmin') throw new Error("Acceso denegado.");

    set({ isLoading: true, error: null });
    
    // Necesitamos la config original para la app secundaria
    const firebaseConfig = {
      apiKey: auth.config.apiKey,
      authDomain: auth.config.authDomain,
      projectId: auth.app.options.projectId,
      storageBucket: auth.app.options.storageBucket,
      messagingSenderId: auth.app.options.messagingSenderId,
      appId: auth.app.options.appId,
    };

    let secondaryApp;
    try {
      // 1. Crear app temporal
      secondaryApp = initializeApp(firebaseConfig, "secondary");
      const secondaryAuth = getAuth(secondaryApp);

      // 2. Registrar el nuevo usuario en Firebase Auth (sin afectar la sesión del superadmin)
      const credential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUid = credential.user.uid;
      const companyId = crypto.randomUUID();

      // 3. Guardar el perfil en Firestore de la app principal
      await setDoc(doc(db, 'users', newUid), {
        email,
        companyName,
        companyId,
        role: 'company',
        createdAt: Date.now()
      });

      // 4. Guardar un documento de la empresa para estadísticas
      await setDoc(doc(db, 'companies', companyId), {
        name: companyName,
        ownerEmail: email,
        ownerUid: newUid,
        status: 'active',
        createdAt: Date.now()
      });

      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    } finally {
      if (secondaryApp) {
        await deleteApp(secondaryApp);
      }
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
}));

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        useAuthStore.setState({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: data.role || 'company',
            companyId: data.companyId || 'default-company',
          },
          isLoading: false,
          initialized: true
        });
      } else {
        await signOut(auth);
        useAuthStore.setState({ user: null, isLoading: false, initialized: true });
      }
    } catch (err) {
      useAuthStore.setState({ user: null, isLoading: false, initialized: true });
    }
  } else {
    useAuthStore.setState({ user: null, isLoading: false, initialized: true });
  }
});

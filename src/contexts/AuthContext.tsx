// Contexte d'authentification pour Tragax
// Ce contexte gère l'état d'authentification de l'utilisateur

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { StorageService } from '../services/storageService';

// Type pour le contexte d'authentification
type AuthContextType = {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
};

// Création du contexte avec une valeur par défaut
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateCurrentUser: () => {},
});

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fonction simple de hachage pour les mots de passe (à remplacer par une solution plus sécurisée en production)
const hashPassword = (password: string): string => {
  // Cette fonction est une simulation simplifiée de hachage
  // En production, utilisez bcrypt ou une autre solution sécurisée
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Conversion en entier 32 bits
  }
  return hash.toString(16);
};

// Fournisseur du contexte d'authentification
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier s'il y a un utilisateur connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem('currentUserId');
        if (userId) {
          const user = await StorageService.users.getById(userId);
          if (user) setCurrentUser(user);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const passwordHash = hashPassword(password);
      const user = await StorageService.users.authenticate(username, passwordHash);
      
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUserId', user.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      return false;
    }
  };

  // Fonction d'inscription
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      // Vérifier si l'utilisateur existe déjà
      const users = await StorageService.users.getAll();
      const userExists = users.some(user => user.username === username || user.email === email);
      
      if (userExists) {
        return false;
      }
      
      // Créer un nouvel utilisateur
      const newUser: User = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        username,
        email,
        passwordHash: hashPassword(password),
        createdAt: Date.now(),
        lists: [],
        stats: {
          totalWords: 0,
          learnedWords: 0,
          testsTaken: 0,
          correctAnswers: 0,
          streakDays: 0,
          lastActivity: Date.now()
        }
      };
      
      await StorageService.users.add(newUser);
      setCurrentUser(newUser);
      localStorage.setItem('currentUserId', newUser.id);
      
      return true;
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return false;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUserId');
  };

  // Fonction pour mettre à jour l'utilisateur courant
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUserId', user.id);
  };

  // Valeur du contexte
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    login,
    register,
    logout,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
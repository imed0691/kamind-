// Service de stockage local pour Tragax
// Ce service gère la persistance des données dans le navigateur via IndexedDB

import type { User, WordList, TranslationItem, TestResult } from '../types';

// Noms des stores dans IndexedDB
const DB_NAME = 'tragax-db';
const DB_VERSION = 1;
const STORES = {
  USERS: 'users',
  LISTS: 'lists',
  ITEMS: 'items',
  TEST_RESULTS: 'testResults'
};

// Initialisation de la base de données
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Erreur lors de l'ouverture de la base de données"));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      
      // Création des object stores si nécessaire
      if (!db.objectStoreNames.contains(STORES.USERS)) {
        db.createObjectStore(STORES.USERS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.LISTS)) {
        db.createObjectStore(STORES.LISTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.ITEMS)) {
        const itemsStore = db.createObjectStore(STORES.ITEMS, { keyPath: 'id' });
        itemsStore.createIndex('listId', 'listId', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(STORES.TEST_RESULTS)) {
        const testResultsStore = db.createObjectStore(STORES.TEST_RESULTS, { keyPath: 'id' });
        testResultsStore.createIndex('listId', 'listId', { unique: false });
      }
    };
  });
};

// Fonction générique pour ajouter un élément à un store
const addItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = () => {
      reject(new Error(`Erreur lors de l'ajout de l'élément dans ${storeName}`));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Fonction générique pour mettre à jour un élément dans un store
const updateItem = async <T>(storeName: string, item: T): Promise<T> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);
    
    request.onsuccess = () => {
      resolve(item);
    };
    
    request.onerror = () => {
      reject(new Error(`Erreur lors de la mise à jour de l'élément dans ${storeName}`));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Fonction générique pour récupérer un élément par son ID
const getItemById = async <T>(storeName: string, id: string): Promise<T | null> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      reject(new Error(`Erreur lors de la récupération de l'élément dans ${storeName}`));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Fonction générique pour récupérer tous les éléments d'un store
const getAllItems = async <T>(storeName: string): Promise<T[]> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = () => {
      reject(new Error(`Erreur lors de la récupération des éléments dans ${storeName}`));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Fonction générique pour supprimer un élément par son ID
const deleteItemById = async (storeName: string, id: string): Promise<void> => {
  const db = await initDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);
    
    request.onsuccess = () => {
      resolve();
    };
    
    request.onerror = () => {
      reject(new Error(`Erreur lors de la suppression de l'élément dans ${storeName}`));
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Service de stockage
export const StorageService = {
  // Gestion des utilisateurs
  users: {
    add: (user: User) => addItem<User>(STORES.USERS, user),
    update: (user: User) => updateItem<User>(STORES.USERS, user),
    getById: (id: string) => getItemById<User>(STORES.USERS, id),
    getAll: () => getAllItems<User>(STORES.USERS),
    delete: (id: string) => deleteItemById(STORES.USERS, id),
    
    // Authentification
    authenticate: async (username: string, passwordHash: string): Promise<User | null> => {
      const users = await getAllItems<User>(STORES.USERS);
      return users.find(user => user.username === username && user.passwordHash === passwordHash) || null;
    }
  },
  
  // Gestion des listes de mots
  lists: {
    add: (list: WordList) => addItem<WordList>(STORES.LISTS, list),
    update: (list: WordList) => updateItem<WordList>(STORES.LISTS, list),
    getById: (id: string) => getItemById<WordList>(STORES.LISTS, id),
    getAll: () => getAllItems<WordList>(STORES.LISTS),
    delete: (id: string) => deleteItemById(STORES.LISTS, id),
    
    // Récupérer les listes d'un utilisateur
    getByUserId: async (userId: string): Promise<WordList[]> => {
      const user = await getItemById<User>(STORES.USERS, userId);
      // Correction: Vérifier si l'utilisateur existe ET a des listes
      if (!user || !user.lists) return [];
      
      const lists = await Promise.all(
        user.lists.map(listId => getItemById<WordList>(STORES.LISTS, listId))
      );
      
      return lists.filter((list): list is WordList => list !== null);
    }
  },
  
  // Gestion des items de traduction
  items: {
    add: (item: TranslationItem & { listId: string }) => addItem(STORES.ITEMS, item),
    update: (item: TranslationItem & { listId: string }) => updateItem(STORES.ITEMS, item),
    getById: (id: string) => getItemById<TranslationItem & { listId: string }>(STORES.ITEMS, id),
    getAll: () => getAllItems<TranslationItem & { listId: string }>(STORES.ITEMS),
    delete: (id: string) => deleteItemById(STORES.ITEMS, id),
    
    // Récupérer les items d'une liste
    getByListId: async (listId: string): Promise<TranslationItem[]> => {
      const db = await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.ITEMS, 'readonly');
        const store = transaction.objectStore(STORES.ITEMS);
        const index = store.index('listId');
        const request = index.getAll(listId);
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          reject(new Error(`Erreur lors de la récupération des items pour la liste ${listId}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    },
    
    // Marquer un item comme appris
    markAsLearned: async (id: string, learned: boolean): Promise<void> => {
      const item = await getItemById<TranslationItem & { listId: string }>(STORES.ITEMS, id);
      if (!item) return;
      
      item.learned = learned;
      item.lastReviewed = Date.now();
      
      await updateItem(STORES.ITEMS, item);
    }
  },
  
  // Gestion des résultats de test
  testResults: {
    add: (result: TestResult) => addItem<TestResult>(STORES.TEST_RESULTS, result),
    getById: (id: string) => getItemById<TestResult>(STORES.TEST_RESULTS, id),
    getAll: () => getAllItems<TestResult>(STORES.TEST_RESULTS),
    
    // Récupérer les résultats de test pour une liste
    getByListId: async (listId: string): Promise<TestResult[]> => {
      const db = await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORES.TEST_RESULTS, 'readonly');
        const store = transaction.objectStore(STORES.TEST_RESULTS);
        const index = store.index('listId');
        const request = index.getAll(listId);
        
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        
        request.onerror = () => {
          reject(new Error(`Erreur lors de la récupération des résultats de test pour la liste ${listId}`));
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      });
    }
  }
};

export default StorageService;
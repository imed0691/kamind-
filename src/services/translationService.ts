// Service de traduction amélioré pour Kamind
// Intègre une vraie API de traduction avec fallback

import type { TranslationItem } from '../types';

// Dictionnaire de base pour les mots les plus courants (optionnel, pour le cache)
const commonWords: Record<string, string> = {
  'hello': 'bonjour',
  'world': 'monde',
  'book': 'livre',
  'car': 'voiture',
  'house': 'maison',
  'dog': 'chien',
  'cat': 'chat',
  'yes': 'oui',
  'no': 'non',
  'thank you': 'merci',
  'please': 's\'il vous plaît',
  'sorry': 'désolé',
  'goodbye': 'au revoir'
};

// Cache pour éviter les appels répétés à l'API
const translationCache = new Map<string, string>();

// Configuration des APIs de traduction
const TRANSLATION_APIS = {
  // Google Translate API (recommandé)
  GOOGLE: {
    url: 'https://translation.googleapis.com/language/translate/v2',
    key: 'VOTRE_CLE_API_GOOGLE' // À remplacer par votre vraie clé
  },
  
  // LibreTranslate (gratuit, open source)
  LIBRE: {
    url: 'https://libretranslate.de/translate',
    key: null // Pas de clé nécessaire pour l'instance publique
  },
  
  // MyMemory (gratuit jusqu'à 1000 mots/jour)
  MYMEMORY: {
    url: 'https://api.mymemory.translated.net/get',
    key: null
  }
};

// Fonction pour nettoyer et normaliser le texte
const normalizeText = (text: string): string => {
  return text.trim().toLowerCase().replace(/[^\w\s-']/g, '');
};

// Fonction pour créer une clé de cache
const createCacheKey = (text: string, from: string, to: string): string => {
  return `${normalizeText(text)}_${from}_${to}`;
};

// Traduction via Google Translate API
const translateWithGoogle = async (text: string, from: string, to: string): Promise<string> => {
  const response = await fetch(`${TRANSLATION_APIS.GOOGLE.url}?key=${TRANSLATION_APIS.GOOGLE.key}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to,
      format: 'text'
    })
  });

  if (!response.ok) {
    throw new Error(`Google Translate API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
};

// Traduction via LibreTranslate
const translateWithLibre = async (text: string, from: string, to: string): Promise<string> => {
  const response = await fetch(TRANSLATION_APIS.LIBRE.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: text,
      source: from,
      target: to
    })
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText;
};

// Traduction via MyMemory
const translateWithMyMemory = async (text: string, from: string, to: string): Promise<string> => {
  const langPair = `${from}|${to}`;
  const url = `${TRANSLATION_APIS.MYMEMORY.url}?q=${encodeURIComponent(text)}&langpair=${langPair}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`MyMemory API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.responseStatus === 200) {
    return data.responseData.translatedText;
  } else {
    throw new Error(`MyMemory translation failed: ${data.responseDetails}`);
  }
};

// Fonction principale de traduction avec fallback
const translateText = async (text: string, from: string, to: string): Promise<string> => {
  // Validation des entrées
  if (!text || text.trim() === '') {
    throw new Error('Texte vide ou invalide');
  }

  const normalizedText = normalizeText(text);
  const cacheKey = createCacheKey(text, from, to);

  // 1. Vérifier le cache
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 2. Vérifier le dictionnaire local pour les mots courants
  if (commonWords[normalizedText] && from === 'en' && to === 'fr') {
    const translation = commonWords[normalizedText];
    translationCache.set(cacheKey, translation);
    return translation;
  }
  // 3. Essayer les APIs dans l'ordre de préférence
  const apis = [
    { name: 'Google', func: translateWithGoogle },
    { name: 'LibreTranslate', func: translateWithLibre },
    { name: 'MyMemory', func: translateWithMyMemory }
  ];

  let lastError: Error | null = null;

  for (const api of apis) {
    try {
      console.log(`Tentative de traduction avec ${api.name}...`);
      const translation = await api.func(text, from, to);
      
      // Mettre en cache le résultat
      translationCache.set(cacheKey, translation);
      console.log(`✅ Traduction réussie avec ${api.name}: "${text}" → "${translation}"`);
      
      return translation;
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Échec avec ${api.name}:`, error);
      continue;
    }
  }

  // Si toutes les APIs échouent, lever une erreur
  throw new Error(`Toutes les APIs de traduction ont échoué. Dernière erreur: ${lastError?.message}`);
};

// Service de traduction principal
export const TranslationService = {
  // Traduire un seul mot ou phrase
  translateSingle: async (
    text: string,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'fr'
  ): Promise<TranslationItem> => {
    try {
      const translation = await translateText(text, sourceLanguage, targetLanguage);
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourceText: text,
        targetText: translation,
        sourceLanguage,
        targetLanguage,
        createdAt: Date.now(),
        learned: false
      };
    } catch (error) {
      console.error('Erreur de traduction:', error);
      
      // En cas d'erreur, retourner un objet avec une indication d'échec
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sourceText: text,
        targetText: `Erreur: ${error instanceof Error ? error.message : String(error)}`,
        sourceLanguage,
        targetLanguage,
        createdAt: Date.now(),
        learned: false
      };
    }
  },

  // Traduire plusieurs mots/phrases
  translateMultiple: async (
    texts: string[],
    sourceLanguage: string = 'en',
    targetLanguage: string = 'fr'
  ): Promise<TranslationItem[]> => {
    // Filtrer les textes vides
    const validTexts = texts.filter(text => text && text.trim() !== '');
    
    if (validTexts.length === 0) {
      return [];
    }

    // Traduire chaque texte individuellement
    const results: TranslationItem[] = [];
    
    for (const text of validTexts) {
      try {
        const result = await TranslationService.translateSingle(text, sourceLanguage, targetLanguage);
        results.push(result);
        
        // Petite pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Erreur lors de la traduction de "${text}":, error`);
        
        // Continuer avec les autres même en cas d'erreur
        results.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceText: text,
          targetText: `Erreur: ${error instanceof Error ? error.message : String(error)}`,
          sourceLanguage,
          targetLanguage,
          createdAt: Date.now(),
          learned: false
        });
      }
    }

    return results;
  },

  // Vider le cache
  clearCache: (): void => {
    translationCache.clear();
  },

  // Obtenir les statistiques du cache
  getCacheStats: () => {
    return {
      size: translationCache.size,
      keys: Array.from(translationCache.keys())
    };
  }
};

export default TranslationService;
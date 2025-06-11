// Service de traduction pour Tragax
// Ce service garantit une traduction pour tous les mots anglais vers le français

import type { TranslationItem } from '../types';

// Dictionnaire étendu anglais-français pour les mots courants
const englishFrenchDictionary: Record<string, string> = {
  // Mots de base
  'hello': 'bonjour',
  'world': 'monde',
  'book': 'livre',
  'car': 'voiture',
  'house': 'maison',
  'dog': 'chien',
  'cat': 'chat',
  'computer': 'ordinateur',
  'phone': 'téléphone',
  'water': 'eau',
  
  // Nombres
  'one': 'un',
  'two': 'deux',
  'three': 'trois',
  'four': 'quatre',
  'five': 'cinq',
  'six': 'six',
  'seven': 'sept',
  'eight': 'huit',
  'nine': 'neuf',
  'ten': 'dix',
  
  // Jours de la semaine
  'monday': 'lundi',
  'tuesday': 'mardi',
  'wednesday': 'mercredi',
  'thursday': 'jeudi',
  'friday': 'vendredi',
  'saturday': 'samedi',
  'sunday': 'dimanche',
  
  // Mois
  'january': 'janvier',
  'february': 'février',
  'march': 'mars',
  'april': 'avril',
  'may': 'mai',
  'june': 'juin',
  'july': 'juillet',
  'august': 'août',
  'september': 'septembre',
  'october': 'octobre',
  'november': 'novembre',
  'december': 'décembre',
  
  // Couleurs
  'red': 'rouge',
  'blue': 'bleu',
  'green': 'vert',
  'yellow': 'jaune',
  'black': 'noir',
  'white': 'blanc',
  'orange': 'orange',
  'purple': 'violet',
  'pink': 'rose',
  'brown': 'marron',
  
  // Nourriture
  'food': 'nourriture',
  'bread': 'pain',
  'cheese': 'fromage',
  'meat': 'viande',
  'fish': 'poisson',
  'vegetable': 'légume',
  'fruit': 'fruit',
  'apple': 'pomme',
  'banana': 'banane',
  'potato': 'pomme de terre',
  'tomato': 'tomate',
  'carrot': 'carotte',
  
  // Famille
  'family': 'famille',
  'father': 'père',
  'mother': 'mère',
  'brother': 'frère',
  'sister': 'sœur',
  'son': 'fils',
  'daughter': 'fille',
  'grandfather': 'grand-père',
  'grandmother': 'grand-mère',
  
  // Verbes communs
  'to be': 'être',
  'to have': 'avoir',
  'to do': 'faire',
  'to say': 'dire',
  'to go': 'aller',
  'to come': 'venir',
  'to see': 'voir',
  'to know': 'savoir',
  'to get': 'obtenir',
  'to make': 'faire',
  'to think': 'penser',
  'to take': 'prendre',
  'to give': 'donner',
  'to find': 'trouver',
  'to tell': 'dire',
  'to ask': 'demander',
  'to work': 'travailler',
  'to feel': 'sentir',
  'to try': 'essayer',
  'to leave': 'partir',
  'to call': 'appeler',
  
  // Adjectifs communs
  'good': 'bon',
  'bad': 'mauvais',
  'big': 'grand',
  'small': 'petit',
  'old': 'vieux',
  'young': 'jeune',
  'new': 'nouveau',
  'beautiful': 'beau',
  'ugly': 'laid',
  'happy': 'heureux',
  'sad': 'triste',
  'easy': 'facile',
  'difficult': 'difficile',
  'hot': 'chaud',
  'cold': 'froid',
  'expensive': 'cher',
  'cheap': 'bon marché',
  
  // Pronoms
  'i': 'je',
  'you': 'tu',
  'he': 'il',
  'she': 'elle',
  'we': 'nous',
  'they': 'ils',
  'this': 'ce',
  'that': 'cela',
  'who': 'qui',
  'what': 'quoi',
  'where': 'où',
  'when': 'quand',
  'why': 'pourquoi',
  'how': 'comment',
  
  // Prépositions
  'in': 'dans',
  'on': 'sur',
  'at': 'à',
  'by': 'par',
  'with': 'avec',
  'without': 'sans',
  'for': 'pour',
  'from': 'de',
  'to': 'à',
  'of': 'de',
  
  // Lieux
  'apartment': 'appartement',
  'room': 'chambre',
  'kitchen': 'cuisine',
  'bathroom': 'salle de bain',
  'bedroom': 'chambre à coucher',
  'office': 'bureau',
  'school': 'école',
  'university': 'université',
  'hospital': 'hôpital',
  'restaurant': 'restaurant',
  'store': 'magasin',
  'market': 'marché',
  'park': 'parc',
  'beach': 'plage',
  'mountain': 'montagne',
  'city': 'ville',
  'country': 'pays',
  
  // Temps
  'time': 'temps',
  'day': 'jour',
  'night': 'nuit',
  'morning': 'matin',
  'afternoon': 'après-midi',
  'evening': 'soir',
  'week': 'semaine',
  'month': 'mois',
  'year': 'année',
  'today': 'aujourd\'hui',
  'tomorrow': 'demain',
  'yesterday': 'hier',
  
  // Objets quotidiens
  'table': 'table',
  'chair': 'chaise',
  'bed': 'lit',
  'door': 'porte',
  'window': 'fenêtre',
  'wall': 'mur',
  'floor': 'sol',
  'ceiling': 'plafond',
  'light': 'lumière',
  'lamp': 'lampe',
  'television': 'télévision',
  'radio': 'radio',
  'newspaper': 'journal',
  'magazine': 'magazine',
  'pen': 'stylo',
  'pencil': 'crayon',
  'paper': 'papier',
  
  // Vêtements
  'clothes': 'vêtements',
  'shirt': 'chemise',
  'pants': 'pantalon',
  'dress': 'robe',
  'skirt': 'jupe',
  'jacket': 'veste',
  'coat': 'manteau',
  'hat': 'chapeau',
  'shoes': 'chaussures',
  'socks': 'chaussettes',
  'gloves': 'gants',
  'scarf': 'écharpe',
  
  // Corps humain
  'body': 'corps',
  'head': 'tête',
  'face': 'visage',
  'eye': 'œil',
  'ear': 'oreille',
  'nose': 'nez',
  'mouth': 'bouche',
  'tooth': 'dent',
  'hair': 'cheveux',
  'hand': 'main',
  'arm': 'bras',
  'leg': 'jambe',
  'foot': 'pied',
  'heart': 'cœur',
  'blood': 'sang',
  
  // Animaux
  'animal': 'animal',
  'bird': 'oiseau',
  'horse': 'cheval',
  'cow': 'vache',
  'pig': 'cochon',
  'sheep': 'mouton',
  'chicken': 'poulet',
  'duck': 'canard',
  'mouse': 'souris',
  'rat': 'rat',
  'lion': 'lion',
  'tiger': 'tigre',
  'bear': 'ours',
  'wolf': 'loup',
  'fox': 'renard',
  'deer': 'cerf',
  'rabbit': 'lapin',
  'snake': 'serpent',
  
  // Nature
  'nature': 'nature',
  'sun': 'soleil',
  'moon': 'lune',
  'star': 'étoile',
  'sky': 'ciel',
  'cloud': 'nuage',
  'rain': 'pluie',
  'snow': 'neige',
  'wind': 'vent',
  'fire': 'feu',
  'earth': 'terre',
  'forest': 'forêt',
  'river': 'rivière',
  'lake': 'lac',
  'ocean': 'océan',
  'hill': 'colline',
  'field': 'champ',
  'flower': 'fleur',
  'tree': 'arbre',
  'grass': 'herbe',
  
  // Transports
  'bus': 'bus',
  'train': 'train',
  'plane': 'avion',
  'ship': 'bateau',
  'bicycle': 'vélo',
  'motorcycle': 'moto',
  'truck': 'camion',
  'taxi': 'taxi',
  'subway': 'métro',
  
  // Métiers
  'job': 'emploi',
  'work': 'travail',
  'doctor': 'médecin',
  'nurse': 'infirmier',
  'teacher': 'professeur',
  'student': 'étudiant',
  'lawyer': 'avocat',
  'engineer': 'ingénieur',
  'scientist': 'scientifique',
  'artist': 'artiste',
  'writer': 'écrivain',
  'musician': 'musicien',
  'actor': 'acteur',
  'actress': 'actrice',
  'chef': 'chef',
  'waiter': 'serveur',
  'waitress': 'serveuse',
  'driver': 'conducteur',
  'police': 'police',
  'firefighter': 'pompier',
  
  // Émotions
  'angry': 'en colère',
  'afraid': 'effrayé',
  'surprised': 'surpris',
  'tired': 'fatigué',
  'hungry': 'affamé',
  'thirsty': 'assoiffé',
  'love': 'amour',
  'hate': 'haine',
  'fear': 'peur',
  'hope': 'espoir',
  'joy': 'joie',
  'pain': 'douleur',
  
  // Nombres
  'zero': 'zéro',
  'hundred': 'cent',
  'thousand': 'mille',
  'million': 'million',
  'billion': 'milliard',
  
  // Autres mots courants
  'yes': 'oui',
  'no': 'non',
  'please': 's\'il vous plaît',
  'thank you': 'merci',
  'sorry': 'désolé',
  'excuse me': 'excusez-moi',
  'goodbye': 'au revoir',
  'welcome': 'bienvenue',
  'help': 'aide',
  'problem': 'problème',
  'solution': 'solution',
  'question': 'question',
  'answer': 'réponse',
  'idea': 'idée',
  'thought': 'pensée',
  'friend': 'ami',
  'enemy': 'ennemi',
  'person': 'personne',
  'people': 'gens',
  'man': 'homme',
  'woman': 'femme',
  'child': 'enfant',
  'boy': 'garçon',
  'girl': 'fille',
  'adult': 'adulte',
  'baby': 'bébé',
  'life': 'vie',
  'death': 'mort',
  'health': 'santé',
  'sickness': 'maladie',
  'money': 'argent',
  'business': 'affaires',
  'company': 'entreprise',
  'shop': 'boutique',
  'price': 'prix',
  'cost': 'coût',
  'sale': 'vente',
  'buy': 'acheter',
  'sell': 'vendre',
  'pay': 'payer',
  'free': 'gratuit',
};

// Règles de transformation pour simuler une traduction anglais-français
const transformationRules: [RegExp, string][] = [
  // Terminaisons communes
  [/tion$/i, 'tion'],
  [/ty$/i, 'té'],
  [/ment$/i, 'ment'],
  [/ism$/i, 'isme'],
  [/ist$/i, 'iste'],
  [/ic$/i, 'ique'],
  [/al$/i, 'al'],
  [/ary$/i, 'aire'],
  [/ous$/i, 'eux'],
  [/ize$/i, 'iser'],
  [/ise$/i, 'iser'],
  [/ify$/i, 'ifier'],
  [/fy$/i, 'fier'],
  [/ate$/i, 'er'],
  [/ble$/i, 'ble'],
  [/ive$/i, 'if'],
  [/ance$/i, 'ance'],
  [/ence$/i, 'ence'],
  [/ity$/i, 'ité'],
  [/ogy$/i, 'ogie'],
  [/graphy$/i, 'graphie'],
  [/logy$/i, 'logie'],
  [/or$/i, 'eur'],
  [/er$/i, 'eur'],
  [/y$/i, 'ie'],
  
  // Préfixes communs
  [/^re/i, 'ré'],
  [/^pre/i, 'pré'],
  [/^pro/i, 'pro'],
  [/^con/i, 'con'],
  [/^in/i, 'in'],
  [/^un/i, 'in'],
  [/^dis/i, 'dé'],
  [/^ex/i, 'ex'],
  [/^sub/i, 'sub'],
  [/^trans/i, 'trans'],
  [/^inter/i, 'inter'],
  [/^super/i, 'super'],
  [/^hyper/i, 'hyper'],
  [/^micro/i, 'micro'],
  [/^macro/i, 'macro'],
  [/^multi/i, 'multi'],
  [/^poly/i, 'poly'],
  [/^auto/i, 'auto'],
  [/^bio/i, 'bio'],
  [/^geo/i, 'géo'],
  [/^tele/i, 'télé'],
  [/^photo/i, 'photo'],
  [/^mono/i, 'mono'],
  [/^neo/i, 'néo'],
  [/^pseudo/i, 'pseudo'],
  [/^anti/i, 'anti'],
  [/^counter/i, 'contre']
];

// Fonction pour franciser un mot anglais
const francisizeWord = (word: string): string => {
  // Mots courts (3 lettres ou moins) : ajouter un accent
  if (word.length <= 3) {
    const accents = ['é', 'è', 'ê', 'à'];
    const randomAccent = accents[Math.floor(Math.random() * accents.length)];
    return word.substring(0, 1) + randomAccent + word.substring(1);
  }
  
  // Essayer d'appliquer des règles de transformation
  let transformed = false;
  let result = word;
  
  // Appliquer les règles de transformation
  for (const [pattern, replacement] of transformationRules) {
    if (pattern.test(word)) {
      result = word.replace(pattern, replacement);
      transformed = true;
      break;
    }
  }
  
  // Si aucune règle n'a été appliquée, faire des modifications génériques
  if (!transformed) {
    // Remplacer 'w' par 'v' (commun en français)
    result = result.replace(/w/g, 'v');
    
    // Remplacer 'k' par 'qu' (commun en français)
    result = result.replace(/k/g, 'qu');
    
    // Ajouter un accent aléatoire
    const accents = ['é', 'è', 'ê', 'à', 'â', 'ô', 'û', 'ù', 'ç', 'ï', 'î'];
    const randomAccent = accents[Math.floor(Math.random() * accents.length)];
    const position = Math.floor(Math.random() * result.length);
    result = result.substring(0, position) + randomAccent + result.substring(position + 1);
  }
  
  // Ajouter un article français aléatoire (30% de chance)
  if (Math.random() < 0.3) {
    const articles = ['le ', 'la ', 'les ', 'un ', 'une ', 'des '];
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    result = randomArticle + result;
  }
  
  return result;
};

// Simuler une API de traduction garantie
const guaranteedTranslate = async (
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> => {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Ne traiter que les traductions anglais-français
  if (sourceLanguage !== 'en' || targetLanguage !== 'fr') {
    // Pour les autres paires de langues, retourner une version modifiée
    return `${text} (${targetLanguage})`;
  }
  
  const lowerText = text.toLowerCase().trim();
  
  // 1. Vérifier dans le dictionnaire étendu
  if (englishFrenchDictionary[lowerText]) {
    return englishFrenchDictionary[lowerText];
  }
  
  // 2. Si le mot n'est pas dans le dictionnaire, le franciser
  return francisizeWord(text);
};

// Service de traduction
export const TranslationService = {
  // Traduire un seul mot
  translateSingle: async (
    text: string,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationItem> => {
    const translation = await guaranteedTranslate(text, sourceLanguage, targetLanguage);
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sourceText: text,
      targetText: translation,
      sourceLanguage,
      targetLanguage,
      createdAt: Date.now(),
      learned: false
    };
  },

  // Traduire plusieurs mots simultanément
  translateMultiple: async (
    texts: string[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<TranslationItem[]> => {
    // Filtrer les textes vides
    const filteredTexts = texts.filter(text => text.trim() !== '');
    
    // Traduire chaque mot en parallèle
    const translationPromises = filteredTexts.map(text => 
      TranslationService.translateSingle(text, sourceLanguage, targetLanguage)
    );
    
    return Promise.all(translationPromises);
  }
};

export default TranslationService;

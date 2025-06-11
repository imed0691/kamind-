// Types pour l'application Tragax

// Type pour les langues supportées
export type Language = {
  code: string;
  name: string;
};

// Type pour un mot ou une phrase à traduire
export type TranslationItem = {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: number;
  lastReviewed?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learned: boolean;
};

// Type pour une liste de mots
export type WordList = {
  id: string;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  items: TranslationItem[];
  createdAt: number;
  lastModified: number;
};

// Type pour un utilisateur
export type User = {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: number;
  lists: string[]; // IDs des listes
  stats: UserStats;
};

// Type pour les statistiques d'un utilisateur
export type UserStats = {
  totalWords: number;
  learnedWords: number;
  testsTaken: number;
  correctAnswers: number;
  streakDays: number;
  lastActivity: number;
};

// Type pour les résultats d'un test
export type TestResult = {
  id: string;
  listId: string;
  type: 'truefalse' | 'multiplechoice' | 'writing';
  date: number;
  totalQuestions: number;
  correctAnswers: number;
  itemResults: {
    itemId: string;
    correct: boolean;
  }[];
};

// Type pour les options de test
export type TestOptions = {
  type: 'truefalse' | 'multiplechoice' | 'writing';
  listId: string;
  questionCount: number;
  randomOrder: boolean;
  includeLearnedItems: boolean;
};

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StorageService } from "../services/storageService";
import type { WordList, TranslationItem } from "../types";

const LearningComponent: React.FC<{ listId: string }> = ({ listId }) => {
  const { currentUser, isAuthenticated } = useAuth();

  // États pour l'apprentissage
  const [list, setList] = useState<WordList | null>(null);
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<TranslationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [includeLearnedItems, setIncludeLearnedItems] = useState(false);
  const [randomOrder, setRandomOrder] = useState(true);
  const [learningStarted, setLearningStarted] = useState(false);
  const [progress, setProgress] = useState({ learned: 0, total: 0 });
  const [wordsToLearnCount, setWordsToLearnCount] = useState(10); // valeur par défaut

  // Charger la liste et ses items
  useEffect(() => {
    const loadListAndItems = async () => {
      try {
        setIsLoading(true);

        // Charger la liste
        const loadedList = await StorageService.lists.getById(listId);
        if (!loadedList) {
          setError("Liste introuvable.");
          setIsLoading(false);
          return;
        }

        setList(loadedList);

        // Charger les items de la liste
        const loadedItems = await StorageService.items.getByListId(listId);
        setItems(loadedItems);

        // Calculer la progression
        const learnedCount = loadedItems.filter((item) => item.learned).length;
        setProgress({
          learned: learnedCount,
          total: loadedItems.length,
        });

        setIsLoading(false);
      } catch {
        setError("Une erreur est survenue lors du chargement de la liste.");
        setIsLoading(false);
      }
    };

    loadListAndItems();
  }, [listId]);

  // Démarrer l'apprentissage
const startLearning = () => {
  let itemsToLearn = [...items];
  if (!includeLearnedItems) {
    itemsToLearn = itemsToLearn.filter(item => !item.learned);
  }
  if (itemsToLearn.length === 0) {
    setError("Aucun mot à apprendre. Ajoutez des mots à votre liste ou modifiez les paramètres d'apprentissage.");
    return;
  }
  if (randomOrder) {
    itemsToLearn = shuffleArray(itemsToLearn);
  }
  // Limite au nombre choisi par l'utilisateur
  itemsToLearn = itemsToLearn.slice(0, wordsToLearnCount);
  setFilteredItems(itemsToLearn);
  setCurrentItemIndex(0);
  setShowTranslation(false);
  setLearningStarted(true);
  setError(null);
};

  // Mélanger un tableau
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Retourner la carte
  const flipCard = () => {
    setShowTranslation((prev) => !prev);
  };

  // Passer à l'item suivant
  const nextItem = async (difficulty?: "easy" | "medium" | "hard") => {
    if (isAuthenticated && currentUser && difficulty) {
      const currentItem = filteredItems[currentItemIndex];
      try {
        const learned = difficulty === "easy" || difficulty === "medium";
        await StorageService.items.markAsLearned(currentItem.id, learned);
        const updatedItems = items.map((item) =>
          item.id === currentItem.id
            ? { ...item, learned, lastReviewed: Date.now(), difficulty }
            : item
        );
        setItems(updatedItems);
        if (learned && !currentItem.learned) {
          const updatedUser = { ...currentUser };
          updatedUser.stats.learnedWords += 1;
          updatedUser.stats.lastActivity = Date.now();
          await StorageService.users.update(updatedUser);
          setProgress((prev) => ({
            ...prev,
            learned: prev.learned + 1,
          }));
        }
      } catch {
        // Optionnel : afficher une erreur
      }
    }
    if (currentItemIndex < filteredItems.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setShowTranslation(false);
    } else {
      setLearningStarted(false);
      alert("Félicitations ! Vous avez terminé cette session d'apprentissage.");
    }
  };

  // Afficher le formulaire de configuration de l'apprentissage
  const renderLearningSetup = () => (
    <div className="learning-setup-card">
      <h2 className="learning-setup-title">Configurer l'apprentissage</h2>
      <div className="learning-options">
        <label className="learning-option">
          <input
            id="includeLearnedItems"
            type="checkbox"
            checked={includeLearnedItems}
            onChange={(e) => setIncludeLearnedItems(e.target.checked)}
          />
          Inclure les mots déjà appris
        </label>
        <label className="learning-option">
          <input
            id="randomOrder"
            type="checkbox"
            checked={randomOrder}
            onChange={(e) => setRandomOrder(e.target.checked)}
          />
          Ordre aléatoire des mots
        </label>
        <div className="learning-option">
          <label htmlFor="wordsToLearnCount" style={{ marginRight: 8 }}>
            Nombre de mots à apprendre :
          </label>
          <input
            id="wordsToLearnCount"
            type="number"
            min={1}
            max={
              includeLearnedItems
                ? items.length
                : items.filter((item) => !item.learned).length
            }
            value={wordsToLearnCount}
            onChange={(e) => setWordsToLearnCount(Number(e.target.value))}
            className="learning-number-input"
            style={{ width: 80 }}
          />
        </div>
      </div>

      <div className="learning-stats">
        <div>
          <span className="learning-stats-label">Mots appris</span>
          <span className="learning-stats-value">
            {progress.learned} / {progress.total}
          </span>
        </div>
        <div className="learning-stats-bar-bg">
          <div
            className="learning-stats-bar"
            style={{
              width: `${
                progress.total > 0
                  ? (progress.learned / progress.total) * 100
                  : 0
              }%`,
            }}
          ></div>
        </div>
      </div>
      <button onClick={startLearning} className="learning-start-btn">
        Commencer l'apprentissage
      </button>
    </div>
  );

  // Afficher la flashcard
  const renderFlashcard = () => {
    if (currentItemIndex >= filteredItems.length) return null;
    const currentItem = filteredItems[currentItemIndex];
    return (
      <div className="flashcard-outer">
        <div
          className={`flashcard-inner ${showTranslation ? "show-answer" : ""}`}
          onClick={flipCard}
          tabIndex={0}
          role="button"
          aria-pressed={showTranslation}
        >
          <div className="flashcard-front">
            <div className="flashcard-text">{currentItem.sourceText}</div>
          </div>
          <div className="flashcard-back">
            <div className="flashcard-text">{currentItem.targetText}</div>
          </div>
        </div>
        <div className="flashcard-instructions">
          <p>
            {showTranslation
              ? "Évaluez votre connaissance"
              : "Cliquez sur la carte pour voir la traduction"}
          </p>
        </div>
        {showTranslation && (
          <div className="flashcard-difficulty-btns">
            <button
              onClick={() => nextItem("hard")}
              className="difficulty-btn hard"
            >
              Difficile
            </button>
            <button
              onClick={() => nextItem("medium")}
              className="difficulty-btn medium"
            >
              Moyen
            </button>
            <button
              onClick={() => nextItem("easy")}
              className="difficulty-btn easy"
            >
              Facile
            </button>
          </div>
        )}
        {!showTranslation && (
          <button onClick={flipCard} className="flashcard-see-btn">
            Voir la traduction
          </button>
        )}
      </div>
    );
  };

  // Affichage principal
  return (
    <div className="learning-main-container">
      <div className="learning-header">
        <h1 className="learning-title">
          {list ? `Apprendre: ${list.name}` : "Chargement..."}
        </h1>
        {list && <p className="learning-description">{list.description}</p>}
      </div>
      {error && <div className="learning-error">{error}</div>}
      {isLoading && (
        <div className="learning-loading">
          <div className="loading-spinner"></div>
        </div>
      )}
      {!isLoading && !error && (
        <div>
          {!learningStarted && renderLearningSetup()}
          {learningStarted && renderFlashcard()}
        </div>
      )}
    </div>
  );
};

export default LearningComponent;

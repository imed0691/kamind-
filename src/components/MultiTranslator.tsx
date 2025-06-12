// Composant de traduction multiple pour Tragax
// Ce composant permet de traduire plusieurs mots simultanément

import React, { useState, useEffect } from "react";
import { TranslationService } from "../services/translationService";
import { OfflineTranslationAPI } from "../services/tranlslationServiceOffline"; 
import type { TranslationItem } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { StorageService } from "../services/storageService";

// Liste des langues supportées
const SUPPORTED_LANGUAGES = [
  { code: "en", name: "Anglais" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Espagnol" },
];

const MultiTranslator: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();

  // États pour le formulaire de traduction
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [inputText, setInputText] = useState("");
  const [translations, setTranslations] = useState<TranslationItem[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showListModal, setShowListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [userLists, setUserLists] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedListId, setSelectedListId] = useState<string>("");

  useEffect(() => {
    const savedTranslations = localStorage.getItem("tragax_translations");
    if (savedTranslations) {
      setTranslations(JSON.parse(savedTranslations));
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("tragax_translations", JSON.stringify(translations));
  }, [translations]);
  // Charger la valeur sauvegardée au montage
  useEffect(() => {
    const savedInput = localStorage.getItem("tragax_inputText");
    if (savedInput !== null) {
      setInputText(savedInput);
    }
  }, []);

  // Sauvegarder la valeur à chaque modification
  useEffect(() => {
    localStorage.setItem("tragax_inputText", inputText);
  }, [inputText]);

  // Charger les listes de l'utilisateur
  const loadUserLists = async () => {
    if (!isAuthenticated || !currentUser) return;

    try {
      const lists = await StorageService.lists.getByUserId(currentUser.id);
      setUserLists(lists.map((list) => ({ id: list.id, name: list.name })));

      if (lists.length > 0) {
        setSelectedListId(lists[0].id);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des listes:", error);
    }
  };

  // Gérer la soumission du formulaire de traduction
const handleTranslate = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!inputText.trim()) {
    setError("Veuillez entrer au moins un mot à traduire.");
    return;
  }

  if (sourceLanguage === targetLanguage) {
    setError("Les langues source et cible doivent être différentes.");
    return;
  }

  setError(null);
  setIsTranslating(true);

  try {
    // Diviser le texte en lignes et filtrer les lignes vides
    const words = inputText
      .split("\n")
      .map((word) => word.trim())
      .filter((word) => word !== "");

    let results: TranslationItem[];

    try {
      // Essayer la traduction en ligne
      results = await TranslationService.translateMultiple(
        words,
        sourceLanguage,
        targetLanguage
      );
    } catch {
      // Si la traduction en ligne échoue, utiliser la traduction hors ligne
      results = await Promise.all(
        words.map(async (word) => {
          const res = await OfflineTranslationAPI.translate(word, sourceLanguage, targetLanguage);
          return {
            id: res.id,
            sourceText: word,
            targetText: res.targetText,
            sourceLanguage,
            targetLanguage,
            createdAt: Date.now(),
            learned: false
          };
        })
      );
    }

    setTranslations(results);
    setSelectedItems([]);
  } catch (error) {
    console.error("Erreur lors de la traduction:", error);
    setError(
      "Une erreur est survenue lors de la traduction. Veuillez réessayer."
    );
  } finally {
    setIsTranslating(false);
  }
};

  // Gérer la sélection/désélection d'un item
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Sélectionner/désélectionner tous les items
  const toggleSelectAll = () => {
    if (selectedItems.length === translations.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(translations.map((item) => item.id));
    }
  };

  // Ouvrir la modal pour ajouter à une liste
  const handleAddToList = () => {
    if (selectedItems.length === 0) {
      setError("Veuillez sélectionner au moins un mot à ajouter à une liste.");
      return;
    }

    loadUserLists();
    setShowListModal(true);
  };

  // Créer une nouvelle liste
  const handleCreateList = async () => {
    if (!isAuthenticated || !currentUser) {
      setError("Vous devez être connecté pour créer une liste.");
      return;
    }

    if (!newListName.trim()) {
      setError("Veuillez entrer un nom pour la liste.");
      return;
    }

    try {
      // Créer la nouvelle liste
      const newList = {
        id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newListName.trim(),
        description: `Liste créée le ${new Date().toLocaleDateString()}`,
        sourceLanguage,
        targetLanguage,
        items: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      await StorageService.lists.add(newList);

      // Mettre à jour les listes de l'utilisateur
      const updatedUser = { ...currentUser };
      updatedUser.lists = [...updatedUser.lists, newList.id];
      await StorageService.users.update(updatedUser);

      // Mettre à jour l'état local
      setUserLists((prev) => [...prev, { id: newList.id, name: newList.name }]);
      setSelectedListId(newList.id);
      setNewListName("");

      // Ajouter les items sélectionnés à la nouvelle liste
      await addItemsToList(newList.id);
    } catch (error) {
      console.error("Erreur lors de la création de la liste:", error);
      setError("Une erreur est survenue lors de la création de la liste.");
    }
  };

  // Ajouter les items sélectionnés à une liste existante
  const addItemsToList = async (listId: string) => {
    if (!isAuthenticated || !currentUser) {
      setError("Vous devez être connecté pour ajouter des mots à une liste.");
      return;
    }

    try {
      // Récupérer les items sélectionnés
      const itemsToAdd = translations.filter((item) =>
        selectedItems.includes(item.id)
      );

      // Ajouter chaque item à la liste
      for (const item of itemsToAdd) {
        await StorageService.items.add({
          ...item,
          listId,
        });
      }

      // Fermer la modal
      setShowListModal(false);
      setError(null);

      // Mettre à jour les statistiques de l'utilisateur
      const updatedUser = { ...currentUser };
      updatedUser.stats.totalWords += itemsToAdd.length;
      await StorageService.users.update(updatedUser);

      // Afficher un message de succès
      alert(`${itemsToAdd.length} mot(s) ajouté(s) à la liste avec succès.`);
    } catch (error) {
      console.error("Erreur lors de l'ajout des mots à la liste:", error);
      setError("Une erreur est survenue lors de l'ajout des mots à la liste.");
    }
  };

  // Inverser les langues source et cible
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
  };

  return (
    <div className="translation-container">
      <h1 className="text-2xl font-bold mb-6">Traduction Multiple</h1>

      {/* Formulaire de traduction */}
      <form onSubmit={handleTranslate} className="mb-8">
        <div className="language-selector">
          {/* Sélection de la langue source */}
          <div className="flex-1">
            <label
              htmlFor="sourceLanguage"
              className="block text-sm font-medium mb-1"
            >
              Langue source
            </label>
            <select
              id="sourceLanguage"
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton pour inverser les langues */}
          <div className="flex items-center justify-center mt-6">
            <button
              type="button"
              onClick={handleSwapLanguages}
              className="language-swap"
              aria-label="Inverser les langues"
            >
              ⇄
            </button>
          </div>

          {/* Sélection de la langue cible */}
          <div className="flex-1">
            <label
              htmlFor="targetLanguage"
              className="block text-sm font-medium mb-1"
            >
              Langue cible
            </label>
            <select
              id="targetLanguage"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Zone de texte pour les mots à traduire */}
        <div className="translation-input">
          <label htmlFor="inputText" className="block text-sm font-medium mb-1">
            Entrez vos mots (un par ligne)
          </label>
          <textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={5}
            placeholder="Entrez un mot par ligne..."
            className="w-full p-2 border rounded-md"
          />
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Bouton de traduction */}
        <button
          type="submit"
          disabled={isTranslating}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
        >
          {isTranslating ? "Traduction en cours..." : "Traduire"}
        </button>
      </form>

      {/* Résultats de traduction */}
      {translations.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Résultats</h2>

            <div className="flex gap-2">
              <button
                onClick={toggleSelectAll}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {selectedItems.length === translations.length
                  ? "Désélectionner tout"
                  : "Sélectionner tout"}
              </button>

              <button
                onClick={handleAddToList}
                disabled={selectedItems.length === 0}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                Ajouter à une liste
              </button>
            </div>
          </div>

          {/* Tableau des résultats */}
          <div className="translation-results">
            <table className="translation-table">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left border">Sélection</th>
                  <th className="p-2 text-left border">Mot source</th>
                  <th className="p-2 text-left border">Traduction</th>
                </tr>
              </thead>
              <tbody>
                {translations.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="p-2 border">{item.sourceText}</td>
                    <td className="p-2 border">{item.targetText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal pour ajouter à une liste */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Ajouter à une liste</h2>

            {/* Sélection d'une liste existante */}
            {userLists.length > 0 && (
              <div className="mb-4">
                <label
                  htmlFor="existingList"
                  className="block text-sm font-medium mb-1"
                >
                  Choisir une liste existante
                </label>
                <select
                  id="existingList"
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="w-full p-2 border rounded-md mb-2"
                >
                  {userLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addItemsToList(selectedListId)}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Ajouter à cette liste
                </button>
              </div>
            )}

            {/* Séparateur */}
            <div className="my-4 flex items-center">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-2 text-gray-500">ou</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Création d'une nouvelle liste */}
            <div>
              <label
                htmlFor="newListName"
                className="block text-sm font-medium mb-1"
              >
                Créer une nouvelle liste
              </label>
              <input
                id="newListName"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Nom de la nouvelle liste"
                className="w-full p-2 border rounded-md mb-2"
              />
              <button
                onClick={handleCreateList}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Créer et ajouter
              </button>
            </div>

            {/* Bouton pour fermer la modal */}
            <button
              onClick={() => setShowListModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiTranslator;

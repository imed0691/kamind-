// Composant de gestion des listes pour Tragax
// Ce composant permet de gérer les listes de mots

import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { StorageService } from "../services/storageService";
import type { WordList, TranslationItem } from "../types";

const ListManager: React.FC = () => {
  // Ajout de updateCurrentUser dans la déstructuration
  const { currentUser, isAuthenticated, updateCurrentUser } = useAuth();

  // États pour la gestion des listes
  const [lists, setLists] = useState<WordList[]>([]);
  const [selectedList, setSelectedList] = useState<WordList | null>(null);
  const [listItems, setListItems] = useState<TranslationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("fr");
  const [searchTerm, setSearchTerm] = useState("");

  // Liste des langues supportées
  const SUPPORTED_LANGUAGES = [
    { code: "en", name: "Anglais" },
    { code: "fr", name: "Français" },
    { code: "es", name: "Espagnol" },
  ];

  // Charger les listes de l'utilisateur
  useEffect(() => {
    const loadLists = async () => {
      if (!isAuthenticated || !currentUser) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const userLists = await StorageService.lists.getByUserId(
          currentUser.id
        );
        setLists(userLists);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des listes:", error);
        setError("Une erreur est survenue lors du chargement des listes.");
        setIsLoading(false);
      }
    };

    loadLists();
  }, [currentUser, isAuthenticated]);

  // Charger les items d'une liste
  const loadListItems = async (listId: string) => {
    try {
      setIsLoading(true);
      const items = await StorageService.items.getByListId(listId);
      setListItems(items);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des items:", error);
      setError(
        "Une erreur est survenue lors du chargement des items de la liste."
      );
      setIsLoading(false);
    }
  };

  // Sélectionner une liste
  const handleSelectList = async (list: WordList) => {
    setSelectedList(list);
    await loadListItems(list.id);
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
      const newList: WordList = {
        id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newListName.trim(),
        description:
          newListDescription.trim() ||
          `Liste créée le ${new Date().toLocaleDateString()}`,
        sourceLanguage,
        targetLanguage,
        items: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
      };

      await StorageService.lists.add(newList);

      // Mettre à jour les listes de l'utilisateur
      const updatedUser = { ...currentUser };
      if (!updatedUser.lists) updatedUser.lists = [];
      updatedUser.lists = [...updatedUser.lists, newList.id];
      await StorageService.users.update(updatedUser);

      // MISE À JOUR DU CONTEXTE D'AUTHENTIFICATION - SOLUTION CLÉ
      updateCurrentUser(updatedUser);

      // Mettre à jour l'état local
      const userLists = await StorageService.lists.getByUserId(currentUser.id);
      setLists(userLists);
      setShowCreateModal(false);
      setNewListName("");
      setNewListDescription("");
      setError(null);
    } catch (error) {
      console.error("Erreur lors de la création de la liste:", error);
      setError("Une erreur est survenue lors de la création de la liste.");
    }
  };

  // Supprimer une liste
  const handleDeleteList = async (listId: string) => {
    if (!isAuthenticated || !currentUser) {
      setError("Vous devez être connecté pour supprimer une liste.");
      return;
    }

    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer cette liste ? Cette action est irréversible."
      )
    ) {
      return;
    }

    try {
      // Supprimer la liste
      await StorageService.lists.delete(listId);

      // Mettre à jour les listes de l'utilisateur
      const updatedUser = { ...currentUser };
      updatedUser.lists = updatedUser.lists.filter((id) => id !== listId);
      await StorageService.users.update(updatedUser);

      // MISE À JOUR DU CONTEXTE D'AUTHENTIFICATION
      updateCurrentUser(updatedUser);

      // Mettre à jour l'état local
      setLists((prev) => prev.filter((list) => list.id !== listId));

      if (selectedList && selectedList.id === listId) {
        setSelectedList(null);
        setListItems([]);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la liste:", error);
      setError("Une erreur est survenue lors de la suppression de la liste.");
    }
  };

  // Supprimer un item d'une liste
  const handleDeleteItem = async (itemId: string) => {
    if (!selectedList) return;

    try {
      // Supprimer l'item
      await StorageService.items.delete(itemId);

      // Mettre à jour l'état local
      setListItems((prev) => prev.filter((item) => item.id !== itemId));

      // Mettre à jour les statistiques de l'utilisateur
      if (currentUser) {
        const updatedUser = { ...currentUser };
        updatedUser.stats.totalWords -= 1;
        await StorageService.users.update(updatedUser);

        // MISE À JOUR DU CONTEXTE D'AUTHENTIFICATION
        updateCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'item:", error);
      setError("Une erreur est survenue lors de la suppression de l'item.");
    }
  };

  // Marquer un item comme appris/non appris
  const handleToggleLearnedStatus = async (
    itemId: string,
    learned: boolean
  ) => {
    try {
      // Mettre à jour l'item
      await StorageService.items.markAsLearned(itemId, learned);

      // Mettre à jour l'état local
      setListItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, learned, lastReviewed: Date.now() }
            : item
        )
      );

      // Mettre à jour les statistiques de l'utilisateur
      if (currentUser) {
        const updatedUser = { ...currentUser };
        updatedUser.stats.learnedWords += learned ? 1 : -1;
        await StorageService.users.update(updatedUser);

        // MISE À JOUR DU CONTEXTE D'AUTHENTIFICATION
        updateCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut d'apprentissage:",
        error
      );
      setError(
        "Une erreur est survenue lors de la mise à jour du statut d'apprentissage."
      );
    }
  };

  // Filtrer les listes en fonction du terme de recherche
  const filteredLists = lists.filter(
    (list) =>
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (list.description &&
        list.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="container-list">
      <h1 className="text-2xl font-bold mb-6">Mes Listes</h1>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Message si non connecté */}
      {!isAuthenticated && (
        <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-md">
          Vous devez être connecté pour gérer vos listes.
        </div>
      )}

      {/* Chargement */}
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}
      </div>

      {/* Interface principale */}
      {isAuthenticated && !isLoading && (
        <div className="lists-container">
          {/* Panneau de gauche: Liste des listes */}
          <div className="lists-sidebar">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Listes</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
              >
                + Nouvelle liste
              </button>
            </div>

            {/* Recherche */}
            <div className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une liste..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Liste des listes */}
            {filteredLists.length === 0 ? (
              <div className="p-4 bg-gray-100 rounded-md text-center">
                {searchTerm
                  ? "Aucune liste ne correspond à votre recherche."
                  : "Vous n'avez pas encore de liste. Créez-en une !"}
              </div>
            ) : (
              <div>
                {filteredLists.map((list) => (
                  <div
                    key={list.id}
                    className={`list-item${
                      selectedList?.id === list.id ? " active" : ""
                    }`}
                    onClick={() => handleSelectList(list)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{list.name}</h3>
                        <p className="text-sm text-gray-600">
                          {list.description ||
                            `Créée le ${new Date(
                              list.createdAt
                            ).toLocaleDateString()}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {list.sourceLanguage.toUpperCase()} →{" "}
                          {list.targetLanguage.toUpperCase()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-xl font-bold"
                        aria-label="Supprimer la liste"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Panneau de droite: Détails de la liste sélectionnée */}
          <div className="lists-content">
            {selectedList ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{selectedList.name}</h2>
                  <p className="text-gray-600">{selectedList.description}</p>
                  <div
                    style={{ display: "flex", gap: "1rem", margin: "1rem 0" }}
                  >
                    <Link to={`/learn/${selectedList.id}`} className="ap">
                      Apprendre
                    </Link>
                    <Link to={`/test/${selectedList.id}`} className="ts">
                      Tester
                    </Link>
                  </div>
                </div>

                {/* Items de la liste */}
                {listItems.length === 0 ? (
                  <div className="p-4 bg-gray-100 rounded-md text-center">
                    Cette liste est vide. Ajoutez des mots depuis la page de
                    traduction.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th>Mot source</th>
                          <th>Traduction</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listItems.map((item) => (
                          <tr
                            key={item.id}
                            className={item.learned ? "bg-green-50" : ""}
                          >
                            <td>{item.sourceText}</td>
                            <td>{item.targetText}</td>
                            <td>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  item.learned
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {item.learned ? "Appris" : "À apprendre"}
                              </span>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleToggleLearnedStatus(
                                      item.id,
                                      !item.learned
                                    )
                                  }
                                  className={`px-2 py-1 rounded-md text-xs ${
                                    item.learned
                                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                      : "bg-green-100 text-green-800 hover:bg-green-200"
                                  }`}
                                >
                                  {item.learned
                                    ? "Marquer comme non appris"
                                    : "Marquer comme appris"}
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  className="px-2 py-1 bg-red-100 text-red-800 rounded-md text-xs hover:bg-red-200"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 bg-gray-100 rounded-md text-center">
                Sélectionnez une liste pour voir son contenu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal pour créer une nouvelle liste */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">
              Créer une nouvelle liste
            </h2>
            {/* Nom de la liste */}
            <div className="mb-4">
              <label
                htmlFor="newListName"
                className="block text-sm font-medium mb-1"
              >
                Nom de la liste *
              </label>
              <input
                id="newListName"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Ex: Vocabulaire de base"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            {/* Description de la liste */}
            <div className="mb-4">
              <label
                htmlFor="newListDescription"
                className="block text-sm font-medium mb-1"
              >
                Description
              </label>
              <input
                id="newListDescription"
                type="text"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                placeholder="Description de la liste"
                className="w-full p-2 border rounded-md"
              />
            </div>
            {/* Langues */}
            <div className="mb-4 flex gap-2">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">
                  Langue source
                </label>
                <select
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
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">
                  Langue cible
                </label>
                <select
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
            {/* Boutons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                type="button"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateList}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                type="button"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListManager;

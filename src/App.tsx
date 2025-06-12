// Composant principal de l'application Tragax
// Ce composant gère le routage et la structure générale de l'application

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Composants
import MultiTranslator from "./components/MultiTranslator";
import ListManager from "./components/ListManager";
import LearningComponent from "./components/LearningComponent";
import TestComponent from "./components/TestComponent";
import AuthComponent from "./components/AuthComponent";
import "./App.css"; // Importer le fichier CSS pour les styles globaux

// Composant de navigation
const Navigation: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
   <header className="header">
      <nav>
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
            Tragax
          </Link>
          
          {/* Bouton Burger */}
          <button
            className={`burger-menu ${menuOpen ? "open" : ""}`}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
            <span className="burger-bar"></span>
          </button>
          
          {/* Menu de navigation - CORRIGÉ */}
          <div className={`nav-links-wrapper ${menuOpen ? "open" : ""}`}>
            <div className="nav-links">
              <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
                Accueil
              </Link>
              <Link to="/translate" className="nav-link" onClick={() => setMenuOpen(false)}>
                Traduire
              </Link>
              <Link to="/lists" className="nav-link" onClick={() => setMenuOpen(false)}>
                Mes Listes
              </Link>
            </div>
            <div className="nav-links">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link" onClick={() => setMenuOpen(false)}>
                    {currentUser?.username}
                  </Link>
                  <button onClick={logout} className="nav-button">
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/auth" className="nav-link" onClick={() => setMenuOpen(false)}>
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Overlay pour fermer le menu */}
      {menuOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
};
// Page d'accueil
const HomePage: React.FC = () => {
  return (
    <div>
      {/* Section Hero */}
      <section className="hero">
        <h1 className="hero-title">Bienvenue sur Tragax</h1>
        <p className="hero-subtitle">
          Votre plateforme pour traduire, mémoriser et tester vos connaissances
          linguistiques
        </p>
      </section>

      {/* Section Fonctionnalités */}
      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h2 className="feature-title">Traduction Multiple</h2>
            <p className="feature-description">
              Traduisez plusieurs mots simultanément et ajoutez-les à vos listes
              d'apprentissage.
            </p>
            <Link
              to="/translate"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Commencer à traduire
            </Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗂️</div>
            <h2 className="feature-title">Listes Personnalisées</h2>
            <p className="feature-description">
              Créez et gérez vos listes de vocabulaire pour un apprentissage
              organisé.
            </p>
            <Link
              to="/lists"
              className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Gérer mes listes
            </Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h2 className="feature-title">Apprentissage Efficace</h2>
            <p className="feature-description">
              Utilisez les flashcards et la répétition espacée pour mémoriser
              efficacement.
            </p>
            <Link
              to="/lists"
              className="inline-block mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
            >
              Commencer à apprendre
            </Link>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h2 className="feature-title">Tests Variés</h2>
            <p className="feature-description">
              Testez vos connaissances avec trois modes différents : Vrai/Faux,
              QCM, Écriture.
            </p>
            <Link
              to="/lists"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Tester mes connaissances
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Route protégée qui redirige vers la page d'authentification si non connecté
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({
  element,
}) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <>{element}</> : <Navigate to="/auth" replace />;
};

// Composant principal de l'application
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation />

          <main className="py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/translate" element={<MultiTranslator />} />
              <Route
                path="/lists"
                element={<ProtectedRoute element={<ListManager />} />}
              />
              <Route
                path="/learn/:listId"
                element={
                  <ProtectedRoute element={<LearningComponentWrapper />} />
                }
              />
              <Route
                path="/test/:listId"
                element={<ProtectedRoute element={<TestComponentWrapper />} />}
              />
              <Route path="/auth" element={<AuthComponent />} />
              <Route
                path="/profile"
                element={<ProtectedRoute element={<AuthComponent />} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer className="footer">
            <div className="footer-container">
              <div>
                <h2 className="footer-logo">Tragax</h2>
                <p className="footer-description">
                  Votre plateforme d'apprentissage linguistique
                </p>
                <div className="footer-links">
                  <a href="/about" className="footer-link">
                    À propos
                  </a>
                  <a href="/contact" className="footer-link">
                    Contact
                  </a>
                </div>
                <div className="footer-socials">
                  <a
                    href="#"
                    className="footer-social-link"
                    aria-label="Twitter"
                  >
                    🐦
                  </a>
                  <a
                    href="#"
                    className="footer-social-link"
                    aria-label="Facebook"
                  >
                    📘
                  </a>
                </div>
              </div>
              <div className="footer-copyright">
                <p>&copy; 2025 Tragax. Tous droits réservés.</p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

// Wrappers pour les composants qui utilisent des paramètres d'URL
const LearningComponentWrapper: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  return <LearningComponent listId={listId || ""} />;
};

const TestComponentWrapper: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  return <TestComponent listId={listId || ""} />;
};

// Fonction utilitaire pour obtenir les paramètres d'URL
const useParams = <T extends Record<string, string>>(): T => {
  const location = window.location.pathname;
  const params: Record<string, string> = {};

  // Extraire les paramètres de l'URL
  const segments = location.split("/");
  if (location.includes("/learn/") && segments.length > 2) {
    params.listId = segments[segments.length - 1];
  } else if (location.includes("/test/") && segments.length > 2) {
    params.listId = segments[segments.length - 1];
  }

  return params as T;
};

export default App;

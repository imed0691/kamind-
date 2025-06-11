// Composant d'authentification pour Tragax
// Ce composant gère l'inscription et la connexion des utilisateurs

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

type AuthMode = 'login' | 'register';

const AuthComponent: React.FC = () => {
  const { login, register, isAuthenticated, currentUser, logout } = useAuth();
  
  // États pour le formulaire
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation des champs
    if (!username) {
      setError("Le nom d'utilisateur est requis.");
      return;
    }
    
    if (mode === 'register' && !email) {
      setError("L'email est requis.");
      return;
    }
    
    if (!password) {
      setError("Le mot de passe est requis.");
      return;
    }
    
    if (mode === 'register' && password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      if (mode === 'login') {
        success = await login(username, password);
        if (!success) {
          setError("Nom d'utilisateur ou mot de passe incorrect.");
        }
      } else {
        success = await register(username, email, password);
        if (!success) {
          setError("Cet utilisateur ou cet email existe déjà.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'authentification:", error);
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Changer de mode (connexion/inscription)
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  };
  
  // Afficher le profil utilisateur si connecté
  if (isAuthenticated && currentUser) {
    return (
      
        <div className="profile-container">
          <h1 className="profile-header">Profil Utilisateur</h1>
          
          <div className="profile-stats">
            <div className="profile-stat">
              <span className="profile-stat-value">Nom d'utilisateur:</span> {currentUser.username}
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">Email:</span> {currentUser.email}
            </div>
            <div className="profile-stat">
              <span className="profile-stat-value">Compte créé le:</span> {new Date(currentUser.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div>
            <h2 className="header2">Statistiques</h2>
            <div className="grid-cols-2">
              <div className="stat-value1">
                <div className="stat-value-header">Mots totaux</div>
                <div className="stat-value-content">{currentUser.stats.totalWords}</div>
              </div>
              <div className="stat-value2">
                <div className="stat-value-header">Mots appris</div>
                <div className="stat-value-content ">{currentUser.stats.learnedWords}</div>
              </div>
              <div className="stat-value2">
                <div className="stat-value-header">Tests effectués</div>
                <div className="stat-value-content ">{currentUser.stats.testsTaken}</div>
              </div>
              <div className="stat-value2">
                <div className="stat-value-header">Réponses correctes</div>
                <div className="stat-value-content ">{currentUser.stats.correctAnswers}</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="profile-button "
          >
            Se déconnecter
          </button>
        </div>
      
    );
  }
  
  // Afficher le formulaire d'authentification
  // ...existing code...

// Afficher le formulaire d'authentification
return (
  <div className="auth-container">
    <div className="auth-tabs">
      <h1 className="auth-title">
        {mode === 'login' ? 'Connexion' : 'Inscription'}
      </h1>

      {error && (
        <div className="auth-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Nom d'utilisateur */}
        <div>
          <label htmlFor="username" className="auth-label">
            Nom d'utilisateur
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        {/* Email (uniquement pour l'inscription) */}
        {mode === 'register' && (
          <div>
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
          </div>
        )}

        {/* Mot de passe */}
        <div>
          <label htmlFor="password" className="auth-label">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
        </div>

        {/* Confirmation du mot de passe (uniquement pour l'inscription) */}
        {mode === 'register' && (
          <div>
            <label htmlFor="confirmPassword" className="auth-label">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-submit-btn"
        >
          {isSubmitting
            ? 'Chargement...'
            : mode === 'login'
              ? 'Se connecter'
              : 'S\'inscrire'
          }
        </button>
      </form>

      <div className="auth-switch">
        <button
          onClick={toggleMode}
          className="auth-switch-btn"
          type="button"
        >
          {mode === 'login'
            ? 'Pas encore de compte ? S\'inscrire'
            : 'Déjà un compte ? Se connecter'
          }
        </button>
      </div>
    </div>
  </div>
);
};

export default AuthComponent;

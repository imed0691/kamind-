import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storageService';
import type { WordList, TranslationItem, TestResult } from '../types';

type Question = {
  id: string;
  itemId: string;
  sourceText: string;
  targetText: string;
  type: 'truefalse' | 'multiplechoice' | 'writing';
  options?: string[];
  userAnswer?: string;
  isCorrect?: boolean;
};

const WritingQuestion: React.FC<{
  question: Question;
  handleAnswer: (answer: string) => void;
}> = ({ question, handleAnswer }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAnswer(inputValue);
    setInputValue('');
  };

  return (
    <div className="writing-container">
      <p className="instruction">Écrivez la traduction correcte</p>
      <div className="source-word">{question.sourceText}</div>
      <form onSubmit={handleSubmit} className="writing-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Votre réponse..."
          className="writing-input"
          autoFocus
        />
        <button
          type="submit"
          className="submit-button"
        >
          Valider
        </button>
      </form>
    </div>
  );
};

const TestComponent: React.FC<{ listId: string }> = ({ listId }) => {
  const { currentUser, isAuthenticated } = useAuth();

  // États pour le test
  const [list, setList] = useState<WordList | null>(null);
  const [items, setItems] = useState<TranslationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState<'setup' | 'test' | 'results'>('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [includeLearnedItems, setIncludeLearnedItems] = useState(true);
  const [randomOrder, setRandomOrder] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [selectedTestTypes, setSelectedTestTypes] = useState<('truefalse' | 'multiplechoice' | 'writing')[]>(['multiplechoice']);

  // Charger la liste et ses items
  useEffect(() => {
    const loadListAndItems = async () => {
      try {
        setIsLoading(true);
        const loadedList = await StorageService.lists.getById(listId);
        if (!loadedList) {
          setError("Liste introuvable.");
          setIsLoading(false);
          return;
        }
        setList(loadedList);
        const loadedItems = await StorageService.items.getByListId(listId);
        setItems(loadedItems);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement de la liste:", error);
        setError("Une erreur est survenue lors du chargement de la liste.");
        setIsLoading(false);
      }
    };
    loadListAndItems();
  }, [listId]);

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateTrueFalseQuestions = (selectedItems: TranslationItem[]): Question[] => {
    return selectedItems.map(item => {
      const useCorrectTranslation = Math.random() > 0.5;
      let targetText = item.targetText;
      if (!useCorrectTranslation) {
        const otherItems = items.filter(i => i.id !== item.id);
        if (otherItems.length > 0) {
          const randomItem = otherItems[Math.floor(Math.random() * otherItems.length)];
          targetText = randomItem.targetText;
        }
      }
      return {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.id,
        sourceText: item.sourceText,
        targetText: targetText,
        type: 'truefalse',
        options: ['true', 'false'],
        isCorrect: undefined,
        userAnswer: undefined
      };
    });
  };

  const generateMultipleChoiceQuestions = (
    selectedItems: TranslationItem[],
    allItems: TranslationItem[]
  ): Question[] => {
    return selectedItems.map(item => {
      const correctOption = item.targetText;
      const incorrectOptions = allItems
        .filter(i => i.id !== item.id && i.targetText !== correctOption)
        .map(i => i.targetText);
      let options = [correctOption];
      while (options.length < 4 && incorrectOptions.length > 0) {
        const randomIndex = Math.floor(Math.random() * incorrectOptions.length);
        const option = incorrectOptions[randomIndex];
        if (!options.includes(option)) {
          options.push(option);
        }
        incorrectOptions.splice(randomIndex, 1);
      }
      options = shuffleArray(options);
      return {
        id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        itemId: item.id,
        sourceText: item.sourceText,
        targetText: item.targetText,
        type: 'multiplechoice',
        options,
        isCorrect: undefined,
        userAnswer: undefined
      };
    });
  };

  const generateWritingQuestions = (selectedItems: TranslationItem[]): Question[] => {
    return selectedItems.map(item => ({
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      itemId: item.id,
      sourceText: item.sourceText,
      targetText: item.targetText,
      type: 'writing',
      isCorrect: undefined,
      userAnswer: undefined
    }));
  };

  const generateQuestions = () => {
    if (selectedTestTypes.length === 0) {
      setError("Veuillez sélectionner au moins un type de test.");
      return;
    }
    
    let availableItems = [...items];
    if (!includeLearnedItems) {
      availableItems = availableItems.filter(item => !item.learned);
    }
    if (availableItems.length === 0) {
      setError("Aucun mot disponible pour le test. Ajoutez des mots à votre liste ou modifiez les paramètres du test.");
      return;
    }
    
    const actualQuestionCount = Math.min(questionCount, availableItems.length);
    if (randomOrder) {
      availableItems = shuffleArray(availableItems);
    }
    const selectedItems = availableItems.slice(0, actualQuestionCount);
    
    let generatedQuestions: Question[] = [];
    const questionsPerType = Math.ceil(actualQuestionCount / selectedTestTypes.length);
    
    selectedTestTypes.forEach(type => {
      const itemsForType = selectedItems.splice(0, Math.min(questionsPerType, selectedItems.length));
      switch (type) {
        case 'truefalse':
          generatedQuestions = [...generatedQuestions, ...generateTrueFalseQuestions(itemsForType)];
          break;
        case 'multiplechoice':
          generatedQuestions = [...generatedQuestions, ...generateMultipleChoiceQuestions(itemsForType, availableItems)];
          break;
        case 'writing':
          generatedQuestions = [...generatedQuestions, ...generateWritingQuestions(itemsForType)];
          break;
      }
    });
    
    if (randomOrder) {
      generatedQuestions = shuffleArray(generatedQuestions);
    }
    
    setQuestions(generatedQuestions);
    setCurrentQuestionIndex(0);
    setTestMode('test');
    setTestResult(null);
    setError(null);
  };

  const handleAnswer = (answer: string) => {
    if (currentQuestionIndex >= questions.length) return;
    const currentQuestion = questions[currentQuestionIndex];
    let isCorrect = false;
    
    switch (currentQuestion.type) {
      case 'truefalse':
        isCorrect =
          (answer === 'true' && currentQuestion.targetText === items.find(i => i.id === currentQuestion.itemId)?.targetText) ||
          (answer === 'false' && currentQuestion.targetText !== items.find(i => i.id === currentQuestion.itemId)?.targetText);
        break;
      case 'multiplechoice':
        isCorrect = answer === currentQuestion.targetText;
        break;
      case 'writing':
        isCorrect = answer.toLowerCase().trim() === currentQuestion.targetText.toLowerCase().trim();
        break;
    }
    
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect
    };
    
    setQuestions(updatedQuestions);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeTest(updatedQuestions);
    }
  };

  const completeTest = async (finalQuestions: Question[]) => {
    const correctAnswers = finalQuestions.filter(q => q.isCorrect).length;
    const result: TestResult = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      listId,
      type: selectedTestTypes[0],
      date: Date.now(),
      totalQuestions: finalQuestions.length,
      correctAnswers,
      itemResults: finalQuestions.map(q => ({
        itemId: q.itemId,
        correct: q.isCorrect || false,
        questionType: q.type
      }))
    };
    
    if (isAuthenticated && currentUser) {
      try {
        await StorageService.testResults.add(result);
        const updatedUser = { ...currentUser };
        updatedUser.stats.testsTaken += 1;
        updatedUser.stats.correctAnswers += correctAnswers;
        updatedUser.stats.lastActivity = Date.now();
        await StorageService.users.update(updatedUser);
        
        for (const question of finalQuestions) {
          if (question.isCorrect) {
            await StorageService.items.markAsLearned(question.itemId, true);
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'enregistrement des résultats:", error);
      }
    }
    
    setTestResult(result);
    setTestMode('results');
  };

  const restartTest = () => {
    setTestMode('setup');
    setTestResult(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
  };

  const toggleTestType = (type: 'truefalse' | 'multiplechoice' | 'writing') => {
    setSelectedTestTypes(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const renderTestSetup = () => (
    <div className="test-setup-container">
      <h2 className="test-title">Configurer votre test</h2>
      
      <div className="test-type-selector">
        <label className="section-label">Type de test</label>
        <div className="test-type-grid">
          <button
            onClick={() => toggleTestType('truefalse')}
            className={`test-type-card ${selectedTestTypes.includes('truefalse') ? 'selected' : ''}`}
          >
            <div className="test-type-title">Vrai ou Faux</div>
            <div className="test-type-description">Indiquez si la traduction est correcte</div>
          </button>
          <button
            onClick={() => toggleTestType('multiplechoice')}
            className={`test-type-card ${selectedTestTypes.includes('multiplechoice') ? 'selected' : ''}`}
          >
            <div className="test-type-title">Choix Multiple</div>
            <div className="test-type-description">Choisissez la bonne traduction</div>
          </button>
          <button
            onClick={() => toggleTestType('writing')}
            className={`test-type-card ${selectedTestTypes.includes('writing') ? 'selected' : ''}`}
          >
            <div className="test-type-title">Écriture</div>
            <div className="test-type-description">Écrivez la traduction correcte</div>
          </button>
        </div>
      </div>
      
      <div className="test-options-section">
        <div className="option-group">
          <label htmlFor="questionCount" className="option-label">
            Nombre de questions
          </label>
          <input
            id="questionCount"
            type="number"
            min="1"
            max={items.length}
            value={questionCount}
            onChange={(e) => setQuestionCount(Math.min(parseInt(e.target.value) || 1, items.length))}
            className="number-input"
          />
        </div>
        
        <div className="checkbox-group">
          <div className="checkbox-option">
            <input
              id="includeLearnedItems"
              type="checkbox"
              checked={includeLearnedItems}
              onChange={(e) => setIncludeLearnedItems(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="includeLearnedItems" className="checkbox-label">
              Inclure les mots déjà appris
            </label>
          </div>
          <div className="checkbox-option">
            <input
              id="randomOrder"
              type="checkbox"
              checked={randomOrder}
              onChange={(e) => setRandomOrder(e.target.checked)}
              className="checkbox-input"
            />
            <label htmlFor="randomOrder" className="checkbox-label">
              Ordre aléatoire des questions
            </label>
          </div>
        </div>
      </div>
      
      <button
        onClick={generateQuestions}
        className="start-button"
      >
        Commencer le test
      </button>
    </div>
  );

  const renderTrueFalseQuestion = (question: Question) => (
    <div className="truefalse-container">
      <p className="question-instruction">La traduction suivante est-elle correcte ?</p>
      <div className="question-content">
        <div className="source-text">{question.sourceText}</div>
        <div className="target-text">{question.targetText}</div>
      </div>
      <div className="answer-buttons">
        <button
          onClick={() => handleAnswer('true')}
          className="true-button"
        >
          Vrai
        </button>
        <button
          onClick={() => handleAnswer('false')}
          className="false-button"
        >
          Faux
        </button>
      </div>
    </div>
  );

  const renderMultipleChoiceQuestion = (question: Question) => (
    <div className="multiplechoice-container">
      <p className="question-instruction">Quelle est la traduction correcte ?</p>
      <div className="source-text">{question.sourceText}</div>
      <div className="options-grid">
        {question.options?.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            className="option-button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const renderCurrentQuestion = () => {
    if (currentQuestionIndex >= questions.length) return null;
    const question = questions[currentQuestionIndex];
    
    return (
      <div className="question-container">
        <div className="question-header">
          <h2 className="question-count">
            Question {currentQuestionIndex + 1}/{questions.length}
            <span className={`question-type ${question.type}`}>
              {question.type === 'truefalse' ? 'Vrai/Faux' : 
               question.type === 'multiplechoice' ? 'Choix multiple' : 'Écriture'}
            </span>
          </h2>
          <div className="language-indicator">
            {list?.sourceLanguage?.toUpperCase()} → {list?.targetLanguage?.toUpperCase()}
          </div>
        </div>
        
        {question.type === 'truefalse' && renderTrueFalseQuestion(question)}
        {question.type === 'multiplechoice' && renderMultipleChoiceQuestion(question)}
        {question.type === 'writing' && (
          <WritingQuestion question={question} handleAnswer={handleAnswer} />
        )}
      </div>
    );
  };

  const renderTestResults = () => {
    if (!testResult) return null;
    const percentage = Math.round((testResult.correctAnswers / testResult.totalQuestions) * 100);
    
    return (
      <div className="results-container">
        <h2 className="results-title">Résultats du test</h2>
        
        <div className="score-summary">
          <div className="percentage">{percentage}%</div>
          <div className="score-detail">
            {testResult.correctAnswers} correctes sur {testResult.totalQuestions} questions
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${
                percentage >= 80 ? 'excellent' : 
                percentage >= 60 ? 'good' : 'poor'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="answers-detail">
          <h3 className="detail-title">Détail des réponses</h3>
          <div className="answers-list">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`answer-item ${question.isCorrect ? 'correct' : 'incorrect'}`}
              >
                <div className="answer-header">
                  <div className="answer-index">
                    {index + 1}. {question.sourceText}
                    <span className={`answer-type ${question.type}`}>
                      {question.type === 'truefalse' ? 'V/F' : 
                       question.type === 'multiplechoice' ? 'MCQ' : 'Écriture'}
                    </span>
                  </div>
                  <div className="answer-status">
                    {question.isCorrect ? '✓' : '✗'}
                  </div>
                </div>
                <div className="answer-details">
                  <div>
                    <span className="detail-label">Réponse correcte:</span> 
                    <span className="correct-answer">{question.targetText}</span>
                  </div>
                  {question.userAnswer && (
                    <div>
                      <span className="detail-label">Votre réponse:</span> 
                      <span className="user-answer">{question.userAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={restartTest}
          className="restart-button"
        >
          Recommencer le test
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading-container">Chargement...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  switch (testMode) {
    case 'setup':
      return renderTestSetup();
    case 'test':
      return renderCurrentQuestion();
    case 'results':
      return renderTestResults();
    default:
      return renderTestSetup();
  }
};

export default TestComponent;
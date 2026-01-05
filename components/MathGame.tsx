
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathOperation, Difficulty, MathProblem, GameState } from '../types';
import { DIFFICULTIES, REWARD_ANIMALS } from '../constants';
import { generateMathStory, generateMotivationalFeedback, generateRewardImage } from '../services/geminiService';

interface MathGameProps {
  operation: MathOperation;
  difficulty: Difficulty;
  streak: number;
  onStatUpdate: (isCorrect: boolean) => void;
}

const MathGame: React.FC<MathGameProps> = ({ operation, difficulty, onStatUpdate, streak }) => {
  const [game, setGame] = useState<GameState>({
    currentProblem: null,
    userAnswer: '',
    isCorrect: null,
    feedback: 'Generating your quest...',
    rewardImage: null,
    isLoading: true,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const createProblem = useCallback(() => {
    const diff = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
    let n1 = Math.floor(Math.random() * diff.range) + 1;
    let n2 = Math.floor(Math.random() * diff.range) + 1;
    let ans = 0;

    switch (operation) {
      case 'addition':
        ans = n1 + n2;
        break;
      case 'subtraction':
        if (n1 < n2) [n1, n2] = [n2, n1];
        ans = n1 - n2;
        break;
      case 'multiplication':
        n1 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 12)) + 1;
        n2 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 12)) + 1;
        ans = n1 * n2;
        break;
      case 'division':
        n2 = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 10)) + 1;
        ans = Math.floor(Math.random() * (difficulty === 'easy' ? 5 : 10)) + 1;
        n1 = n2 * ans;
        break;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      num1: n1,
      num2: n2,
      operation,
      answer: ans,
    };
  }, [operation, difficulty]);

  const loadNextProblem = useCallback(async () => {
    const problem = createProblem();
    // Set basic problem state immediately so UI isn't empty
    setGame(prev => ({ 
      ...prev, 
      isLoading: false, 
      currentProblem: problem,
      isCorrect: null, 
      userAnswer: '', 
      rewardImage: null,
      feedback: 'Thinking of a magical story...'
    }));
    
    // Auto focus for immediate play
    setTimeout(() => inputRef.current?.focus(), 300);

    // Load AI content in background
    try {
      const story = await generateMathStory(problem);
      setGame(prev => ({
        ...prev,
        currentProblem: prev.currentProblem?.id === problem.id ? { ...problem, story } : prev.currentProblem,
        feedback: story
      }));
    } catch (e) {
      setGame(prev => ({ ...prev, feedback: "Solve the puzzle!" }));
    }
  }, [createProblem]);

  useEffect(() => {
    loadNextProblem();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operation, difficulty]); // Refresh if these change

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!game.currentProblem || game.isCorrect !== null || !game.userAnswer) return;

    const isCorrect = parseInt(game.userAnswer) === game.currentProblem.answer;
    onStatUpdate(isCorrect);
    
    setGame(prev => ({
      ...prev,
      isCorrect,
      feedback: isCorrect ? 'Checking... You got it!' : 'Almost! Try again soon!'
    }));

    // Generate feedback and rewards
    const motivationalMsg = await generateMotivationalFeedback(isCorrect, isCorrect ? streak + 1 : 0);
    
    let rewardImg = null;
    if (isCorrect && (streak + 1) % 3 === 0) {
      const animal = REWARD_ANIMALS[Math.floor(Math.random() * REWARD_ANIMALS.length)];
      rewardImg = await generateRewardImage(animal);
    }

    setGame(prev => ({
      ...prev,
      feedback: motivationalMsg,
      rewardImage: rewardImg
    }));
  };

  const getOpSymbol = () => {
    switch (operation) {
      case 'addition': return '+';
      case 'subtraction': return '-';
      case 'multiplication': return '×';
      case 'division': return '÷';
      default: return '?';
    }
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border-4 sm:border-8 border-white relative">
      {/* Dynamic Header */}
      <div className={`p-4 sm:p-6 text-center text-white font-bold text-lg sm:text-xl uppercase tracking-widest font-fredoka transition-colors duration-500 ${
        game.isCorrect === true ? 'bg-green-500' : game.isCorrect === false ? 'bg-red-500' : 'bg-blue-500'
      }`}>
        {game.isCorrect === true ? '✨ Perfect! ✨' : game.isCorrect === false ? '💫 Nice Try! 💫' : `${operation} Mission`}
      </div>

      <div className="p-6 sm:p-10 flex flex-col items-center">
        {/* Story Area - Collapsible or scrollable on small screens */}
        <div className="bg-blue-50/50 p-4 sm:p-6 rounded-3xl mb-8 w-full border-2 border-dashed border-blue-200 relative min-h-[80px] flex items-center justify-center">
          <div className="absolute -top-3 left-6 bg-white px-3 text-[10px] sm:text-xs text-blue-400 font-bold uppercase tracking-tighter">Mission Story</div>
          <p className="text-gray-700 text-sm sm:text-lg text-center leading-tight sm:leading-relaxed font-medium font-fredoka">
            {game.feedback}
          </p>
        </div>

        {/* Reward Image Container */}
        <div className={`transition-all duration-700 overflow-hidden flex flex-col items-center ${game.rewardImage ? 'h-56 sm:h-72 opacity-100 mb-6' : 'h-0 opacity-0'}`}>
          <img 
            src={game.rewardImage || ''} 
            alt="Reward" 
            className="w-40 h-40 sm:w-56 sm:h-56 rounded-2xl shadow-xl border-4 border-yellow-300 object-cover animate-bounce" 
          />
          <p className="text-center font-bold text-yellow-600 mt-2 font-fredoka text-sm sm:text-base">Special Award Unlocked! ✨</p>
        </div>

        {/* Math Problem Area - Main Attraction */}
        {game.currentProblem && (
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 mb-10">
              <div className="bg-gray-50 w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center rounded-3xl shadow-inner text-4xl sm:text-6xl font-fredoka font-bold text-gray-800 border-2 border-gray-100">
                {game.currentProblem.num1}
              </div>
              <span className="text-3xl sm:text-5xl text-blue-500 font-bold">{getOpSymbol()}</span>
              <div className="bg-gray-50 w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center rounded-3xl shadow-inner text-4xl sm:text-6xl font-fredoka font-bold text-gray-800 border-2 border-gray-100">
                {game.currentProblem.num2}
              </div>
              <span className="text-3xl sm:text-5xl text-gray-400 font-bold">=</span>
              <div className="relative">
                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="number"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={game.userAnswer}
                    onChange={(e) => setGame(prev => ({ ...prev, userAnswer: e.target.value }))}
                    disabled={game.isCorrect !== null}
                    placeholder="?"
                    className={`w-24 h-20 sm:w-36 sm:h-28 text-center rounded-3xl shadow-lg outline-none transition-all border-4 text-4xl sm:text-6xl font-fredoka font-bold ${
                      game.isCorrect === true ? 'bg-green-50 border-green-500 text-green-600' :
                      game.isCorrect === false ? 'bg-red-50 border-red-500 text-red-600' :
                      'bg-white border-blue-200 focus:border-blue-500 focus:scale-110 focus:shadow-blue-200/50'
                    }`}
                  />
                </form>
              </div>
            </div>

            <div className="w-full flex justify-center">
              {game.isCorrect === null ? (
                <button
                  onClick={() => handleSubmit()}
                  disabled={!game.userAnswer}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-10 py-4 rounded-2xl text-xl sm:text-2xl font-bold shadow-xl transform transition-all hover:-translate-y-1 active:scale-95 font-fredoka"
                >
                  Check Answer
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  {game.isCorrect === false && (
                    <div className="bg-red-50 px-6 py-2 rounded-full border border-red-100 animate-shake">
                      <p className="text-red-600 font-bold text-lg font-fredoka">
                        Psst! The answer is {game.currentProblem.answer}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={loadNextProblem}
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-2xl text-xl sm:text-2xl font-bold shadow-xl transform transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 font-fredoka"
                  >
                    Next Mission <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Background Shapes for Kid Aesthetic */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 pointer-events-none"></div>
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-400 rounded-full opacity-10 pointer-events-none"></div>
    </div>
  );
};

export default MathGame;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MathOperation, Difficulty, MathProblem, GameState } from './types';
import { DIFFICULTIES, MISSION_CHARACTERS, REWARD_TYPES } from './constants';
import { generateMathStory, generateCharacterReaction, generateRewardImage, generateEncouragementBadge } from './services/geminiService';
import { playCorrectSound, playWrongSound } from './services/audioService';

interface MathGameProps {
  operation: MathOperation;
  difficulty: Difficulty;
  streak: number;
  level: number;
  onStatUpdate: (isCorrect: boolean) => void;
}

const MathGame: React.FC<MathGameProps> = ({ operation, difficulty, onStatUpdate, streak, level }) => {
  const [game, setGame] = useState<GameState & { reactionImage: string | null, encouragementBadge: string | null }>({
    currentProblem: null,
    userAnswer: '',
    isCorrect: null,
    feedback: 'Generating Quest...',
    rewardImage: null,
    reactionImage: null,
    encouragementBadge: null,
    isLoading: true,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const calculateReward = (lvl: number, diff: Difficulty) => {
    const diffMultiplier = diff === 'easy' ? 1 : diff === 'medium' ? 5 : 20;
    const value = lvl * diffMultiplier;
    const type = REWARD_TYPES[Math.floor(Math.random() * REWARD_TYPES.length)];
    
    if (type === "Dollars") return `$${value}`;
    if (type === "Gold Coins") return `${value * 10} Gold Coins`;
    return `${type} (Lvl ${lvl})`;
  };

  const createProblem = useCallback(() => {
    const diffConfig = DIFFICULTIES.find(d => d.id === difficulty) || DIFFICULTIES[0];
    const levelModifier = level * 2;
    const finalRange = diffConfig.range + levelModifier;
    
    let n1 = Math.floor(Math.random() * finalRange) + 1;
    let n2 = Math.floor(Math.random() * finalRange) + 1;
    let ans = 0;

    switch (operation) {
      case 'addition': ans = n1 + n2; break;
      case 'subtraction': if (n1 < n2) [n1, n2] = [n2, n1]; ans = n1 - n2; break;
      case 'multiplication':
        n1 = Math.floor(Math.random() * (Math.sqrt(finalRange) + 2)) + 1;
        n2 = Math.floor(Math.random() * (Math.sqrt(finalRange) + 2)) + 1;
        ans = n1 * n2;
        break;
      case 'division':
        n2 = Math.floor(Math.random() * (Math.sqrt(finalRange) + 1)) + 1;
        ans = Math.floor(Math.random() * (Math.sqrt(finalRange) + 1)) + 1;
        n1 = n2 * ans;
        break;
    }

    const char = MISSION_CHARACTERS[Math.floor(Math.random() * MISSION_CHARACTERS.length)];
    const reward = calculateReward(level, difficulty);

    return {
      id: Math.random().toString(36).substr(2, 9),
      num1: n1, num2: n2, operation, answer: ans,
      character: char, reward: reward
    };
  }, [operation, difficulty, level]);

  const loadNextProblem = useCallback(async () => {
    const problem = createProblem();
    setGame(prev => ({ 
      ...prev, isLoading: false, currentProblem: problem, isCorrect: null, 
      userAnswer: '', rewardImage: null, reactionImage: null, encouragementBadge: null,
      feedback: `${problem.character} has a puzzle...` 
    }));
    
    setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
    }, 100);

    try {
      const story = await generateMathStory(problem);
      setGame(prev => (prev.currentProblem?.id === problem.id ? { ...prev, feedback: story } : prev));
    } catch (e) {
      setGame(prev => ({ ...prev, feedback: `Help ${problem.character} solve this for ${problem.reward}!` }));
    }
  }, [createProblem]);

  useEffect(() => {
    let timer: any;
    if (game.isCorrect === true) {
      timer = setTimeout(() => {
        loadNextProblem();
      }, 3000); 
    }
    return () => clearTimeout(timer);
  }, [game.isCorrect, loadNextProblem]);

  useEffect(() => {
    loadNextProblem();
  }, [operation, level, loadNextProblem]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!game.currentProblem || game.isCorrect !== null || !game.userAnswer) return;

    const isCorrect = parseInt(game.userAnswer) === game.currentProblem.answer;
    onStatUpdate(isCorrect);
    
    if (isCorrect) {
      playCorrectSound();
      setGame(prev => ({ ...prev, isCorrect, feedback: 'Amazing Job! Checking Reward...' }));
      
      const [reactionImg, rewardImg] = await Promise.all([
        generateCharacterReaction(game.currentProblem?.character || "Hero", true),
        generateRewardImage(game.currentProblem?.reward || "Prize")
      ]);
      setGame(prev => ({ ...prev, reactionImage: reactionImg, rewardImage: rewardImg, feedback: 'Mission Successful!' }));
    } else {
      playWrongSound();
      setGame(prev => ({ ...prev, isCorrect, feedback: 'Keep Trying, You Got This!' }));
      const encouragement = await generateEncouragementBadge();
      setGame(prev => ({ ...prev, encouragementBadge: encouragement }));
    }
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

  const diffConfig = DIFFICULTIES.find(d => d.id === difficulty)!;
  const progress = (level / diffConfig.maxLevel) * 100;

  return (
    <div className="w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-white animate-in relative">
      {/* TAPE BAR (Progress Bar) - Increased Height */}
      <div className="absolute top-0 left-0 w-full h-5 bg-gray-100 overflow-hidden z-20">
        <div className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.6)]" style={{ width: `${progress}%` }}></div>
      </div>

      <div className={`pt-8 pb-5 text-center text-white font-bold font-fredoka uppercase tracking-widest text-lg transition-colors duration-500 ${
        game.isCorrect === true ? 'bg-green-500' : game.isCorrect === false ? 'bg-red-600' : 'bg-blue-600'
      }`}>
        {game.isCorrect === true ? '✨ SUCCESS! ✨' : game.isCorrect === false ? '💫 MAGIC RELOAD 💫' : `Quest Level ${level}`}
      </div>

      <div className="bg-yellow-50 py-3 px-4 border-b border-yellow-100 text-center">
        <p className="text-yellow-700 font-bold text-xs sm:text-sm uppercase tracking-widest flex items-center justify-center gap-2">
          🏆 Win Reward: <span className="bg-yellow-400 text-white px-3 py-1 rounded-full font-black text-sm shadow-sm">{game.currentProblem?.reward}</span>
        </p>
      </div>

      <div className="p-6 sm:p-12 flex flex-col items-center">
        
        <div className="mb-10 flex flex-col items-center w-full min-h-[200px] justify-center">
           {game.isCorrect !== null ? (
             <div className="flex flex-col items-center animate-in">
                <div className="relative mb-6">
                  {game.isCorrect ? (
                    game.reactionImage ? (
                      <img src={game.reactionImage} alt="Success" className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border-8 border-white shadow-2xl object-cover animate-bounce bg-green-50" />
                    ) : (
                      <div className="w-40 h-40 bg-green-50 rounded-full flex items-center justify-center border-8 border-white shadow-2xl"><i className="fas fa-star text-green-500 text-6xl"></i></div>
                    )
                  ) : (
                    game.encouragementBadge ? (
                      <img src={game.encouragementBadge} alt="Encouragement" className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border-8 border-white shadow-2xl object-cover animate-pulse bg-red-50" />
                    ) : (
                      <div className="w-40 h-40 bg-red-50 rounded-full flex items-center justify-center border-8 border-white shadow-2xl"><i className="fas fa-heart text-red-500 text-6xl"></i></div>
                    )
                  )}
                  
                  <div className={`absolute -top-14 -right-12 sm:-right-24 px-8 py-4 rounded-[2rem] shadow-2xl border-4 font-bold font-fredoka text-xl sm:text-3xl whitespace-nowrap z-10 ${
                    game.isCorrect ? 'bg-green-500 text-white border-green-300' : 'bg-red-600 text-white border-red-300'
                  }`}>
                    {game.isCorrect ? "JACKPOT!" : "TRY AGAIN!"}
                    <div className={`absolute -bottom-3 left-8 w-6 h-6 rotate-45 ${game.isCorrect ? 'bg-green-500' : 'bg-red-600'}`}></div>
                  </div>
                </div>
                {game.rewardImage && game.isCorrect && (
                  <div className="flex flex-col items-center mb-6 animate-in delay-200">
                    <img src={game.rewardImage} alt="Reward" className="w-28 h-28 rounded-[2rem] shadow-2xl border-4 border-yellow-300 animate-pulse object-cover bg-white" />
                    <p className="text-green-600 font-black text-sm mt-3 uppercase tracking-tighter">CLAIMED: {game.currentProblem?.reward}</p>
                  </div>
                )}
             </div>
           ) : (
             <div className="flex flex-col items-center w-full animate-in">
                <div className="bg-blue-100 text-blue-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-4 shadow-sm">
                  {game.currentProblem?.character} asks...
                </div>
                <p className="text-gray-700 text-lg sm:text-2xl text-center font-fredoka italic max-w-xl leading-relaxed px-6 drop-shadow-sm">
                  "{game.feedback}"
                </p>
             </div>
           )}
        </div>

        {game.currentProblem && (
          <div className="flex flex-col items-center w-full">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 mb-12">
              <div className="text-6xl sm:text-9xl font-fredoka font-bold text-gray-800 drop-shadow-sm">
                {game.currentProblem.num1}
              </div>
              <span className="text-5xl sm:text-7xl text-blue-500 font-bold drop-shadow-md">{getOpSymbol()}</span>
              <div className="text-6xl sm:text-9xl font-fredoka font-bold text-gray-800 drop-shadow-sm">
                {game.currentProblem.num2}
              </div>
              <span className="text-5xl sm:text-7xl text-gray-300 font-bold">=</span>
              
              <div className="relative">
                <form onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    type="number"
                    inputMode="numeric"
                    value={game.userAnswer}
                    onChange={(e) => setGame(prev => ({ ...prev, userAnswer: e.target.value }))}
                    disabled={game.isCorrect !== null}
                    placeholder="?"
                    className={`w-32 h-24 sm:w-52 sm:h-36 text-center outline-none border-t-[12px] text-6xl sm:text-9xl font-fredoka font-bold transition-all bg-transparent ${
                      game.isCorrect === true ? 'border-green-500 text-green-700' :
                      game.isCorrect === false ? 'border-red-600 text-red-600 animate-shake' :
                      'border-blue-200 focus:border-blue-500 text-gray-900 placeholder-gray-200'
                    }`}
                  />
                </form>
              </div>
            </div>

            <div className="w-full flex justify-center pb-4">
              {game.isCorrect === null ? (
                <button 
                  onClick={() => handleSubmit()} 
                  disabled={!game.userAnswer} 
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white px-20 py-6 rounded-3xl text-2xl sm:text-3xl font-bold shadow-[0_12px_0_rgb(30,58,138)] transform transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none font-fredoka"
                >
                  Check Answer
                </button>
              ) : (
                <div className="flex flex-col items-center gap-8 w-full max-w-md">
                  {game.isCorrect === false ? (
                    <>
                      <div className="bg-red-50 px-10 py-6 rounded-[2.5rem] border-4 border-red-200 shadow-xl animate-in scale-110">
                        <p className="text-red-600 font-bold text-xl font-fredoka text-center mb-2">The Correct Number was:</p>
                        <p className="text-6xl text-center font-black text-red-700 font-fredoka">{game.currentProblem.answer}</p>
                      </div>
                      <button 
                        onClick={loadNextProblem} 
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white px-16 py-6 rounded-[2.5rem] text-3xl font-bold shadow-[0_10px_0_rgb(30,58,110)] transform transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none font-fredoka flex items-center justify-center gap-4"
                      >
                        <i className="fas fa-redo-alt"></i> Try Another
                      </button>
                    </>
                  ) : (
                    <div className="text-center animate-in">
                      <button 
                        onClick={loadNextProblem} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-20 py-8 rounded-[2.5rem] text-3xl sm:text-5xl font-bold shadow-[0_12px_0_rgb(22,101,52)] transform transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none flex items-center justify-center gap-6 font-fredoka group"
                      >
                        Next Mission <i className="fas fa-chevron-right group-hover:translate-x-3 transition-transform"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MathGame;


import React, { useState, useEffect } from 'react';
import { MathOperation, Difficulty, UserStats } from './types';
import { OPERATIONS, DIFFICULTIES } from './constants';
import MathGame from './MathGame';
import { generateAppLogo, generateDifficultyBadge } from './services/geminiService';

const App: React.FC = () => {
  const [selectedOp, setSelectedOp] = useState<MathOperation | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);
  const [diffBadges, setDiffBadges] = useState<Record<string, string | null>>({});
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('math_magic_stats');
    return saved ? JSON.parse(saved) : {
      correct: 0,
      total: 0,
      streak: 0,
      highestStreak: 0,
      levels: { addition: 1, subtraction: 1, multiplication: 1, division: 1 }
    };
  });

  useEffect(() => {
    localStorage.setItem('math_magic_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const fetchLogo = async () => {
      setLogoLoading(true);
      try {
        const logo = await generateAppLogo();
        setAppLogo(logo);
      } catch (e) {
        console.error("Logo fetch failed", e);
      } finally {
        setLogoLoading(false);
      }
    };
    fetchLogo();
    
    DIFFICULTIES.forEach(async (d) => {
      try {
        const badge = await generateDifficultyBadge(d.prompt);
        setDiffBadges(prev => ({ ...prev, [d.id]: badge }));
      } catch (e) {
        console.error("Badge fetch failed", e);
      }
    });
  }, []);

  const updateStats = (isCorrect: boolean) => {
    setStats(prev => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const currentOp = selectedOp!;
      const currentLevel = prev.levels[currentOp];
      
      const diffConfig = DIFFICULTIES.find(d => d.id === difficulty)!;
      const maxLvl = diffConfig.maxLevel;

      let newLevels = { ...prev.levels };
      if (isCorrect && (prev.correct + 1) % 3 === 0) {
        newLevels[currentOp] = Math.min(maxLvl, currentLevel + 1);
      }

      return {
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        total: prev.total + 1,
        streak: newStreak,
        highestStreak: Math.max(prev.highestStreak, newStreak),
        levels: newLevels
      };
    });
  };

  const currentDiffConfig = DIFFICULTIES.find(d => d.id === difficulty)!;

  return (
    <div className="min-h-screen pb-12 bg-blue-50 selection:bg-blue-200">
      <header className="bg-white/90 backdrop-blur-md shadow-sm py-3 px-4 sm:px-6 flex justify-between items-center sticky top-0 z-50 border-b border-blue-100">
        <div 
          className="flex items-center gap-2 group cursor-pointer" 
          onClick={() => setSelectedOp(null)}
        >
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12">
            <i className="fas fa-magic"></i>
          </div>
          <h1 className="text-xl sm:text-2xl font-fredoka font-bold text-blue-600">MathMagic</h1>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <div className="bg-white px-3 py-1 rounded-full flex items-center gap-2 border border-blue-100 shadow-sm">
            <span className="text-sm font-bold text-blue-500">🔥 {stats.streak}</span>
          </div>
          <div className="bg-yellow-50 px-3 py-1 rounded-full flex items-center gap-2 border border-yellow-200 shadow-sm">
            <span className="text-lg">💰</span>
            <span className="font-bold text-sm text-yellow-700">${stats.correct * 5}</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        {!selectedOp ? (
          <div className="flex flex-col gap-6 animate-in">
            {/* LOGO BOX - Compact, just the logo, no text below */}
            <div className="bg-white rounded-[2rem] shadow-lg border-4 border-white p-4 text-center flex flex-col items-center">
               {logoLoading ? (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-blue-50 flex flex-col items-center justify-center border-2 border-dashed border-blue-200">
                   <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : appLogo ? (
                <div className="animate-float">
                   <img src={appLogo} className="mx-auto w-28 h-28 sm:w-36 sm:h-36 object-contain" alt="MathMagic Logo" />
                </div>
              ) : (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-inner">
                   <i className="fas fa-calculator text-white text-3xl"></i>
                </div>
              )}
            </div>

            {/* DIFFICULTY BOX (Small Box style) */}
            <div className="bg-white rounded-[1.5rem] shadow-md border-4 border-white p-3 text-center">
                <div className="flex flex-wrap justify-center gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button 
                      key={d.id} 
                      onClick={() => setDifficulty(d.id as Difficulty)} 
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all border-2 ${
                        difficulty === d.id 
                          ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-105' 
                          : 'bg-blue-50/50 border-transparent text-gray-400 hover:bg-blue-50 hover:border-blue-100'
                      }`}
                    >
                      <div className="w-5 h-5 relative flex items-center justify-center">
                        {diffBadges[d.id] ? (
                          <img src={diffBadges[d.id]!} alt={d.label} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        ) : (
                          <i className={`fas ${d.id === 'easy' ? 'fa-star' : d.id === 'medium' ? 'fa-bolt' : 'fa-crown'} text-[10px] opacity-50`}></i>
                        )}
                      </div>
                      <span className="text-[10px] sm:text-xs font-black font-fredoka uppercase tracking-wider">
                        {d.label}
                      </span>
                    </button>
                  ))}
                </div>
            </div>

            {/* OPERATION MISSIONS - Square Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {OPERATIONS.map((op) => {
                const currentLevel = stats.levels[op.id as MathOperation];
                const maxLevel = currentDiffConfig.maxLevel;
                const progress = (currentLevel / maxLevel) * 100;
                
                return (
                  <button 
                    key={op.id} 
                    onClick={() => setSelectedOp(op.id as MathOperation)} 
                    className={`${op.color} text-white aspect-square rounded-[2rem] shadow-lg transform transition-all active:scale-95 relative overflow-hidden flex flex-col items-center justify-center group border-4 border-white/30 p-2`}
                  >
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/30 rounded-2xl flex items-center justify-center mb-2 backdrop-blur-sm group-hover:scale-110 transition-transform">
                        <i className={`fas ${op.icon} text-xl sm:text-2xl`}></i>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold font-fredoka mb-1">{op.label}</h3>
                      <div className="w-16 sm:w-20 bg-black/10 h-1.5 rounded-full overflow-hidden mb-1">
                        <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-white/80 text-[8px] font-black uppercase tracking-tighter">
                        Lvl {currentLevel}/{maxLevel}
                      </span>
                    </div>
                    {/* Background faint icon */}
                    <div className="absolute -bottom-2 -right-2 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                      <i className={`fas ${op.icon} text-6xl`}></i>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button 
              onClick={() => setSelectedOp(null)} 
              className="self-start bg-white text-blue-600 px-5 py-2 rounded-full font-bold mb-6 flex items-center gap-2 shadow-sm hover:bg-blue-50 transition-all border border-blue-100"
            >
              <i className="fas fa-chevron-left"></i> Back
            </button>
            <MathGame 
              operation={selectedOp} 
              difficulty={difficulty} 
              onStatUpdate={updateStats}
              streak={stats.streak}
              level={stats.levels[selectedOp]}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal, Skull, Activity, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

// --- CONSTANTS & CONFIG ---
const GRID_SIZE = 25;
const INITIAL_SNAKE = [{ x: 12, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 45;

const TRACKS = [
  { id: '0x01', title: 'SYNTH_WAVE_PROTOCOL.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '0x02', title: 'NEURAL_NET_LULLABY.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: '0x03', title: 'VOID_DRIFTER.mp3', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  // --- AUDIO STATE ---
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // --- GAME STATE ---
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 18, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [glitchTrigger, setGlitchTrigger] = useState(false);
  
  const directionRef = useRef(INITIAL_DIRECTION);
  const lastProcessedDirectionRef = useRef(INITIAL_DIRECTION);

  // --- TERMINAL LOGS ---
  const [logs, setLogs] = useState<string[]>([
    'INITIATING NEURAL HANDSHAKE...',
    'AUDIO SUBSYSTEM: ONLINE.',
    'AWAITING KINETIC INPUT TO BREACH MAINFRAME...'
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
  }, []);

  // Random glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchTrigger(true);
        setTimeout(() => setGlitchTrigger(false), 150);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  // --- AUDIO HANDLERS ---
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        addLog('AUDIO STREAM: SEVERED');
      } else {
        audioRef.current.play();
        addLog('AUDIO STREAM: INJECTED');
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = (forward: boolean) => {
    let nextIdx = currentTrackIdx + (forward ? 1 : -1);
    if (nextIdx >= TRACKS.length) nextIdx = 0;
    if (nextIdx < 0) nextIdx = TRACKS.length - 1;
    setCurrentTrackIdx(nextIdx);
    addLog(`DECRYPTING TRACK: ${TRACKS[nextIdx].id}`);
    setIsPlaying(true);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      addLog(isMuted ? 'AUDIO: UNMUTED' : 'AUDIO: MUTED');
    }
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        addLog('ERR: AUDIO INJECTION BLOCKED BY HOST');
      });
    }
  }, [currentTrackIdx]);

  // --- GAME LOGIC ---
  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    directionRef.current = INITIAL_DIRECTION;
    lastProcessedDirectionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
    addLog('NEURAL LINK RE-ESTABLISHED. PROCEED.');
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prev) => {
      const head = prev[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;

      const newHead = {
        x: (head.x + currentDir.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + currentDir.y + GRID_SIZE) % GRID_SIZE,
      };

      // Self Collision
      if (prev.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        addLog('FATAL EXCEPTION: PARADOXICAL COLLISION DETECTED.');
        return prev;
      }

      const newSnake = [newHead, ...prev];

      // Food Collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
          const newScore = s + 10;
          addLog(`MEMORY FRAGMENT ASSIMILATED. INTEGRITY: ${newScore}`);
          return newScore;
        });
        setFood({
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        });
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, gameOver, gameStarted, addLog]);

  useEffect(() => {
    const interval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(interval);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === ' ' && gameOver) {
        resetGame();
        return;
      }

      if (!gameStarted && !gameOver && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        setGameStarted(true);
        addLog('MAINFRAME BREACHED. NAVIGATE THE VOID.');
      }

      const lastDir = lastProcessedDirectionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (lastDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (lastDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (lastDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (lastDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  return (
    <div className={`min-h-screen w-full bg-[#020002] text-[#00ffff] font-mono p-4 md:p-8 flex flex-col items-center justify-center static-noise screen-tear relative z-10 ${glitchTrigger ? 'invert' : ''}`}>
      
      {/* HEADER */}
      <header className="w-full max-w-5xl mb-6 flex flex-col md:flex-row justify-between items-end border-b-4 border-[#ff00ff] pb-2 relative">
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-[#00ffff]"></div>
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-[#00ffff]"></div>
        
        <div>
          <h1 className="text-5xl md:text-7xl font-bold glitch-text-extreme tracking-tighter text-[#ff00ff] uppercase">NEURAL_SNAKE</h1>
          <p className="text-sm md:text-lg opacity-90 mt-1 uppercase tracking-widest text-[#00ffff] bg-[#ff00ff] text-black inline-block px-2">v2.0.4 // UNAUTHORIZED ACCESS DETECTED</p>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <div className="text-5xl md:text-7xl text-[#00ffff] drop-shadow-[0_0_20px_#00ffff] glitch-text font-bold">
            {score.toString().padStart(4, '0')}
          </div>
          <div className="text-xs tracking-widest text-[#ff00ff]">DATA_INTEGRITY</div>
        </div>
      </header>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT PANEL: AUDIO & TERMINAL */}
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          
          {/* AUDIO PLAYER */}
          <div className="border-neon-cyan p-4 bg-black/80 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#00ffff] opacity-10 transform rotate-45 translate-x-8 -translate-y-8"></div>
            
            <div className="flex items-center gap-2 mb-4 text-[#ff00ff] border-b-2 border-[#ff00ff] pb-2">
              <Activity className="w-6 h-6 animate-pulse" />
              <h2 className="text-2xl tracking-widest font-bold">AUDIO_LINK</h2>
            </div>
            
            <audio 
              ref={audioRef} 
              src={TRACKS[currentTrackIdx].url} 
              onEnded={() => skipTrack(true)}
              loop={false}
            />
            
            <div className="marquee-container bg-[#ff00ff] text-black p-2 mb-4 font-bold tracking-widest">
              <div className="marquee-content">
                NOW INJECTING: {TRACKS[currentTrackIdx].title} // AI_GENERATED_STREAM // 
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => skipTrack(false)} className="p-2 hover:bg-[#00ffff] hover:text-black text-[#00ffff] transition-colors border-2 border-[#00ffff]">
                <SkipBack className="w-6 h-6" />
              </button>
              <button onClick={togglePlay} className="p-3 bg-[#00ffff] text-black hover:bg-[#ff00ff] transition-colors border-2 border-transparent">
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button onClick={() => skipTrack(true)} className="p-2 hover:bg-[#00ffff] hover:text-black text-[#00ffff] transition-colors border-2 border-[#00ffff]">
                <SkipForward className="w-6 h-6" />
              </button>
              <button onClick={toggleMute} className="p-2 hover:bg-[#ff00ff] hover:text-black text-[#ff00ff] transition-colors border-2 border-[#ff00ff]">
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* TERMINAL */}
          <div className="border-neon-magenta p-4 bg-black/80 flex-grow flex flex-col relative">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ff00ff] animate-pulse"></div>
            <div className="flex items-center gap-2 mb-2 text-[#00ffff] border-b-2 border-[#00ffff] pb-2">
              <Terminal className="w-6 h-6" />
              <h2 className="text-2xl tracking-widest font-bold">SYS_LOGS</h2>
            </div>
            <div className="flex-grow flex flex-col justify-end text-lg opacity-90 space-y-1">
              {logs.map((log, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  className={log.includes('FATAL') ? 'text-[#ff00ff] font-bold glitch-text' : log.includes('AUDIO') ? 'text-white' : 'text-[#00ffff]'}
                >
                  {log}
                </motion.div>
              ))}
              <div className="animate-pulse mt-1 text-[#00ffff] font-bold">_</div>
            </div>
          </div>

        </div>

        {/* CENTER/RIGHT PANEL: GAME GRID */}
        <div className="lg:col-span-2 order-1 lg:order-2 flex justify-center items-center relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#00ffff] to-[#ff00ff] opacity-20 blur-xl animate-pulse"></div>
          <div className="relative w-full max-w-[500px] aspect-square border-4 border-[#00ffff] bg-[#020002] overflow-hidden shadow-[0_0_40px_rgba(0,255,255,0.3)]">
            
            {/* GRID LINES (Aesthetic) */}
            <div className="absolute inset-0 pointer-events-none opacity-20" 
                 style={{ 
                   backgroundImage: 'linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)', 
                   backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` 
                 }} 
            />

            {/* SNAKE */}
            {snake.map((segment, i) => (
              <div 
                key={i}
                className={`absolute ${i === 0 ? 'bg-white shadow-[0_0_20px_#fff,0_0_40px_#00ffff] z-20' : 'bg-[#00ffff] shadow-[0_0_15px_#00ffff] z-10'}`}
                style={{
                  left: `${(segment.x / GRID_SIZE) * 100}%`,
                  top: `${(segment.y / GRID_SIZE) * 100}%`,
                  width: `${100 / GRID_SIZE}%`,
                  height: `${100 / GRID_SIZE}%`,
                  borderRadius: i === 0 ? '0px' : '0px', // Brutalist square
                  opacity: Math.max(0.2, 1 - (i / Math.max(snake.length, 1))),
                  transform: `scale(${Math.max(0.5, 1 - (i / Math.max(snake.length, 1)) * 0.5)})`
                }}
              />
            ))}

            {/* FOOD */}
            <div 
              className="absolute bg-[#ff00ff] animate-pulse shadow-[0_0_25px_#ff00ff,0_0_50px_#ff00ff] z-10"
              style={{
                left: `${(food.x / GRID_SIZE) * 100}%`,
                top: `${(food.y / GRID_SIZE) * 100}%`,
                width: `${100 / GRID_SIZE}%`,
                height: `${100 / GRID_SIZE}%`
              }}
            >
              <div className="w-full h-full bg-white opacity-50 animate-ping"></div>
            </div>

            {/* OVERLAYS */}
            {!gameStarted && !gameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm border-4 border-[#ff00ff] m-4">
                <div className="grid grid-cols-3 gap-2 mb-6 animate-pulse">
                  <div />
                  <ArrowUp className="w-16 h-16 text-[#00ffff] drop-shadow-[0_0_20px_#00ffff]" />
                  <div />
                  <ArrowLeft className="w-16 h-16 text-[#00ffff] drop-shadow-[0_0_20px_#00ffff]" />
                  <ArrowDown className="w-16 h-16 text-[#00ffff] drop-shadow-[0_0_20px_#00ffff]" />
                  <ArrowRight className="w-16 h-16 text-[#00ffff] drop-shadow-[0_0_20px_#00ffff]" />
                </div>
                <h3 className="text-3xl text-[#ff00ff] mb-2 glitch-text-extreme drop-shadow-[0_0_15px_#ff00ff] tracking-widest font-bold">INITIATE SEQUENCE</h3>
                <p className="text-[#00ffff] opacity-90 tracking-widest bg-black px-2">AWAITING KINETIC INPUT</p>
              </div>
            )}

            {gameOver && (
              <div className="absolute inset-0 bg-[#020002]/90 flex flex-col items-center justify-center text-center p-6 backdrop-blur-md border-8 border-[#ff00ff] m-4">
                <Zap className="w-24 h-24 text-[#ff00ff] mb-4 animate-bounce drop-shadow-[0_0_20px_#ff00ff]" />
                <h3 className="text-5xl text-[#ff00ff] mb-2 font-bold tracking-widest glitch-text-extreme">SYSTEM HALTED</h3>
                <p className="text-[#00ffff] mb-8 text-2xl tracking-widest">INTEGRITY: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-8 py-4 bg-[#00ffff] text-black font-bold text-2xl tracking-widest hover:bg-[#ff00ff] hover:text-white transition-colors border-4 border-white shadow-[0_0_30px_#00ffff]"
                >
                  REBOOT [SPACE]
                </button>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

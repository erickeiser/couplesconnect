
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabaseClient';
import type { Game, Player } from './types';
import HomePage from './components/HomePage';
import LobbyPage from './components/LobbyPage';
import GamePage from './components/GamePage';
import { Header } from './components/Header';
import { Loader } from './components/Loader';

type View = 'home' | 'lobby' | 'game';

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetGame = useCallback(() => {
    sessionStorage.removeItem('gameId');
    sessionStorage.removeItem('playerId');
    setGame(null);
    setCurrentPlayer(null);
    setView('home');
    setError(null);
  }, []);

  const handleGameUpdate = useCallback((payload: any) => {
    const updatedGame = payload.new;
    if (updatedGame.players.length === 2 && updatedGame.status === 'waiting') {
        supabase.from('games').update({ status: 'playing' }).eq('id', updatedGame.id).then(() => {
            setGame(updatedGame);
            setView('game');
        });
    } else {
        setGame(updatedGame);
        if (updatedGame.status === 'playing' && view !== 'game') {
          setView('game');
        }
    }
  }, [view]);

  useEffect(() => {
    const restoreSession = async () => {
      const gameId = sessionStorage.getItem('gameId');
      const playerId = sessionStorage.getItem('playerId');
      
      if (gameId && playerId) {
        const { data, error } = await supabase
          .from('games')
          .select('*, players(*)')
          .eq('id', gameId)
          .single();

        if (error || !data) {
          resetGame();
        } else {
          const player = data.players.find((p: Player) => p.id === playerId);
          if (player) {
            setGame(data as Game);
            setCurrentPlayer(player);
            if(data.status === 'playing') {
                setView('game');
            } else if (data.status === 'waiting') {
                setView('lobby');
            }
          } else {
            resetGame();
          }
        }
      }
      setIsLoading(false);
    };

    restoreSession();
  }, [resetGame]);

  useEffect(() => {
    if (!game?.id) return;

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${game.id}` },
        (payload) => handleGameUpdate(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, handleGameUpdate]);


  const setGameState = (newGame: Game, newPlayer: Player) => {
    sessionStorage.setItem('gameId', newGame.id);
    sessionStorage.setItem('playerId', newPlayer.id);
    setGame(newGame);
    setCurrentPlayer(newPlayer);
    setError(null);
  };
  
  const handleCreateGame = (newGame: Game, newPlayer: Player) => {
    setGameState(newGame, newPlayer);
    setView('lobby');
  };

  const handleJoinGame = (newGame: Game, newPlayer: Player) => {
    setGameState(newGame, newPlayer);
    if(newGame.players.length === 2) {
        setView('game');
    } else {
        setView('lobby');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex justify-center items-center h-full"><Loader /></div>;
    }

    switch (view) {
      case 'lobby':
        return game && currentPlayer && <LobbyPage game={game} />;
      case 'game':
        return game && currentPlayer && <GamePage game={game} currentPlayer={currentPlayer} onLeave={resetGame} />;
      case 'home':
      default:
        return (
          <HomePage
            onCreateGame={handleCreateGame}
            onJoinGame={handleJoinGame}
            setError={setError}
          />
        );
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col font-sans">
      <Header onLogoClick={resetGame} />
      <main className="flex-grow flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          {error && (
            <div 
              className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 text-center" 
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
              </button>
            </div>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;

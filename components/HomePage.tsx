import React, { useState } from 'react';
import { createGame, joinGame } from '../services/gameService';
import type { Game, Player } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Loader } from './Loader';
import { Modal } from './ui/Modal';

interface HomePageProps {
  onCreateGame: (game: Game, player: Player) => void;
  onJoinGame: (game: Game, player: Player) => void;
  setError: (error: string | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onCreateGame, onJoinGame, setError }) => {
  const [gameCode, setGameCode] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [joinerName, setJoinerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName.trim()) {
      setError("Please enter your name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { game, player } = await createGame(creatorName);
      onCreateGame(game, player);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsCreateModalOpen(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinerName.trim()) {
        setError("Please enter your name.");
        return;
    }
    if (!gameCode.trim()) {
        setError("Please enter a game code.");
        return;
    };
    setIsLoading(true);
    setError(null);
    try {
      const { game, player } = await joinGame(gameCode, joinerName);
      onJoinGame(game, player);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center animate-fade-in-up">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        Ready to Connect?
      </h2>
      <p className="text-lg text-gray-400 mb-10 max-w-md mx-auto">
        Create a private game room or join your partner's to start a journey of discovery.
      </p>

      <div className="space-y-6">
        <div className="max-w-sm mx-auto">
            <Button 
                onClick={() => setIsCreateModalOpen(true)}
                disabled={isLoading}
                className="w-full"
                variant="primary"
            >
                Create New Game
            </Button>
        </div>

        <div className="flex items-center justify-center">
            <div className="h-px bg-gray-700 w-20"></div>
            <p className="px-4 text-gray-500 font-medium">OR</p>
            <div className="h-px bg-gray-700 w-20"></div>
        </div>
        
        <form onSubmit={handleJoin} className="space-y-4 max-w-sm mx-auto">
          <Input
            type="text"
            placeholder="Your Name"
            value={joinerName}
            onChange={(e) => setJoinerName(e.target.value)}
            disabled={isLoading}
            className="text-center"
          />
          <Input
            type="text"
            placeholder="Enter Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="text-center tracking-widest font-bold"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !gameCode || !joinerName} className="w-full" variant="secondary">
            {isLoading ? <Loader /> : 'Join Game'}
          </Button>
        </form>
      </div>
      
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
        <form onSubmit={handleCreate} className="p-8 space-y-6">
            <h3 className="text-2xl font-bold text-center text-white">Create Your Game</h3>
            <Input
                type="text"
                placeholder="Enter Your Name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                disabled={isLoading}
                className="text-center"
                autoFocus
            />
            <Button 
                type="submit"
                disabled={isLoading || !creatorName.trim()} 
                className="w-full"
                variant="primary"
            >
                {isLoading ? <Loader /> : 'Create & Get Code'}
            </Button>
        </form>
      </Modal>
    </div>
  );
};

export default HomePage;
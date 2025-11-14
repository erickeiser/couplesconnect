import React, { useState } from 'react';
import type { Game } from '../types';

interface LobbyPageProps {
  game: Game;
}

const LobbyPage: React.FC<LobbyPageProps> = ({ game }) => {
  const [copied, setCopied] = useState(false);
  const player1 = game.players.find(p => p.player_number === 1);

  const handleCopy = () => {
    navigator.clipboard.writeText(game.game_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center animate-fade-in-up bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-2xl shadow-purple-500/10">
      <h2 className="text-3xl font-bold text-white mb-4">Game Lobby</h2>
      <p className="text-gray-400 mb-8">Share this code with your partner to have them join.</p>
      
      <div className="bg-gray-900 rounded-lg p-4 mb-6 flex items-center justify-center space-x-4">
        <span className="text-4xl font-extrabold tracking-widest text-purple-400">
          {game.game_code}
        </span>
        <button onClick={handleCopy} className="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M20 6 9 17l-5-5"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center space-x-3 text-lg text-gray-300">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span>{player1?.name || 'Player 1'} is waiting for another player to join...</span>
      </div>
      <div className="mt-4 text-sm text-gray-500">Players in lobby: {game.players.length}/2</div>
    </div>
  );
};

export default LobbyPage;
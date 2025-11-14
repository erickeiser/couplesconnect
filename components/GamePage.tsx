

import React, { useState, useMemo, useEffect } from 'react';
import type { Game, Player, Vote } from '../types';
import { QUESTIONS } from '../constants/questions';
import { castVote, nextQuestion, submitAnswer } from '../services/gameService';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ThumbsDown, ThumbsUp } from './icons';
import { Loader } from './Loader';

interface GamePageProps {
  game: Game;
  currentPlayer: Player;
  onLeave: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ game, currentPlayer, onLeave }) => {
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    const opponent = useMemo(() => game.players.find(p => p.id !== currentPlayer.id), [game.players, currentPlayer.id]);
  
    const myAnswer = currentPlayer.player_number === 1 ? game.player1_answer : game.player2_answer;
    const opponentAnswer = opponent?.player_number === 1 ? game.player1_answer : game.player2_answer;
  
    const myVote = currentPlayer.player_number === 1 ? game.player1_vote : game.player2_vote;
    const opponentVote = opponent?.player_number === 1 ? game.player1_vote : game.player2_vote;

    const bothAnswered = game.player1_answer && game.player2_answer;
    const bothVoted = game.player1_vote && game.player2_vote;

    useEffect(() => {
        // When the question changes, reset the local answer state for both players.
        setAnswer('');
    }, [game.current_question_index]);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        try {
            await submitAnswer(game.id, currentPlayer.player_number, answer);
        } catch (error) {
            console.error("Error submitting answer:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVote = async (vote: Vote) => {
        if(myVote) return; // Already voted
        try {
            await castVote(game, currentPlayer, vote);
        } catch (error) {
            console.error("Error casting vote:", error);
        }
    };
    
    const handleNextQuestion = async () => {
        try {
          await nextQuestion(game.id, game.current_question_index);
        } catch (error) {
          console.error("Error moving to next question:", error);
        }
      };

      const handleSkip = async () => {
        await handleNextQuestion();
      };
      
    if (!opponent) {
        return (
            <div className="text-center">
                <p className="text-lg text-gray-400">Waiting for opponent...</p>
                <button onClick={onLeave} className="mt-4 text-purple-400 hover:text-purple-300">Leave Game</button>
            </div>
        );
    }
  
    const currentQuestion = QUESTIONS[game.current_question_index];

    if (!currentQuestion) {
        return (
            <Card>
                <div className="text-center p-8">
                    <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
                    <p className="text-lg text-gray-300 mb-6">You've answered all the questions.</p>
                    <div className="text-2xl font-bold">
                        Final Score: <span className="text-green-400">{currentPlayer.score}</span> - <span className="text-red-400">{opponent.score}</span>
                    </div>
                    <Button onClick={onLeave} className="mt-8" variant="primary">Play Again</Button>
                </div>
            </Card>
        )
    }

    const renderContent = () => {
        if (!myAnswer) {
            return (
                <div>
                    <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full h-32 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-white"
                        disabled={isSubmitting}
                    />
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                         <Button onClick={handleSkip} disabled={isSubmitting} className="w-full sm:w-auto" variant="secondary">Skip Question</Button>
                         <Button onClick={handleSubmit} disabled={isSubmitting || !answer.trim()} className="w-full sm:flex-1" variant="primary">
                            {isSubmitting ? <Loader /> : 'Submit Answer'}
                         </Button>
                    </div>
                </div>
            );
        }

        if (!bothAnswered) {
            return (
                <div className="text-center p-8 space-y-4">
                    <Loader />
                    <p className="text-xl font-semibold text-gray-300">Your answer is locked in!</p>
                    <p className="text-gray-400">Waiting for {opponent.name || 'your partner'} to answer...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="font-bold text-purple-400">{currentPlayer.name}'s Answer:</h3>
                    <p className="p-4 bg-gray-800 rounded-lg border border-gray-700">{myAnswer}</p>
                </div>
                <div className="space-y-2">
                    <h3 className="font-bold text-pink-400">{opponent.name}'s Answer:</h3>
                    <p className="p-4 bg-gray-800 rounded-lg border border-gray-700">{opponentAnswer}</p>
                </div>

                {!bothVoted && (
                    <div className="text-center pt-4">
                        <h3 className="text-lg font-semibold mb-4 text-gray-300">How do you feel about their answer?</h3>
                        <div className="flex justify-center items-center space-x-6">
                            <button onClick={() => handleVote('down')} disabled={!!myVote} className={`p-4 rounded-full transition-all duration-300 ${myVote ? 'opacity-50' : 'hover:scale-110 hover:bg-red-500/20'}`}>
                                <ThumbsDown className={`w-10 h-10 ${myVote === 'down' ? 'text-red-500' : 'text-gray-500'}`} />
                            </button>
                            <button onClick={() => handleVote('up')} disabled={!!myVote} className={`p-4 rounded-full transition-all duration-300 ${myVote ? 'opacity-50' : 'hover:scale-110 hover:bg-green-500/20'}`}>
                                <ThumbsUp className={`w-10 h-10 ${myVote === 'up' ? 'text-green-500' : 'text-gray-500'}`} />
                            </button>
                        </div>
                        {myVote && !opponentVote && <p className="mt-6 text-gray-400 animate-pulse">Waiting for {opponent.name} to vote...</p>}
                    </div>
                )}
                
                {bothVoted && (
                    <div className="text-center pt-4 space-y-4">
                         <div className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                            <h4 className="text-lg font-semibold text-center text-white mb-2">Round Results</h4>
                            <div className="flex items-center justify-between text-gray-300">
                                <span>You gave their answer a:</span>
                                {myVote === 'up' 
                                    ? <ThumbsUp className="w-6 h-6 text-green-500" /> 
                                    : <ThumbsDown className="w-6 h-6 text-red-500" />}
                            </div>
                            <div className="flex items-center justify-between text-gray-300">
                                <span>They gave your answer a:</span>
                                {opponentVote === 'up' 
                                    ? <ThumbsUp className="w-6 h-6 text-green-500" /> 
                                    : <ThumbsDown className="w-6 h-6 text-red-500" />}
                            </div>
                        </div>
                        <Button onClick={handleNextQuestion} className="w-full" variant="primary">Next Question</Button>
                    </div>
                )}

            </div>
        )
    };
  
    return (
        <div className="w-full animate-fade-in-up">
            <div className="flex justify-between items-center mb-6 text-lg">
                <div className="font-bold truncate px-2">{currentPlayer.name || 'You'}: <span className="text-green-400">{currentPlayer.score}</span></div>
                <div className="text-sm text-gray-500 font-medium whitespace-nowrap">Q {game.current_question_index + 1}/{QUESTIONS.length}</div>
                <div className="font-bold truncate px-2 text-right">{opponent.name || 'Them'}: <span className="text-green-400">{opponent.score}</span></div>
            </div>

            <Card>
                <div className="p-6">
                    <h2 
                        key={game.current_question_index}
                        className="text-2xl md:text-3xl font-bold text-center mb-8 leading-tight animate-fade-in"
                    >
                        {currentQuestion}
                    </h2>
                    {renderContent()}
                </div>
            </Card>
        </div>
    );
};
export default GamePage;
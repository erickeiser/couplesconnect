
import { supabase } from '../lib/supabaseClient';
import type { Game, Player, Vote } from '../types';

const generateGameCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createGame = async (player1Name: string): Promise<{ game: Game; player: Player }> => {
  const gameCode = generateGameCode();
  
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .insert({ 
        game_code: gameCode, 
        status: 'waiting', 
        current_question_index: 0,
    })
    .select()
    .single();

  if (gameError) throw new Error(gameError.message);

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({ game_id: gameData.id, player_number: 1, score: 0, name: player1Name })
    .select()
    .single();

  if (playerError) throw new Error(playerError.message);
  
  const { data: fullGameData, error: fullGameError } = await supabase
    .from('games')
    .select('*, players(*)')
    .eq('id', gameData.id)
    .single();
  
  if (fullGameError) throw new Error(fullGameError.message);

  return { game: fullGameData, player: playerData };
};

export const joinGame = async (gameCode: string, playerName: string): Promise<{ game: Game; player: Player }> => {
  const { data: gameData, error: gameError } = await supabase
    .from('games')
    .select('*, players(*)')
    .eq('game_code', gameCode.toUpperCase())
    .single();

  if (gameError || !gameData) throw new Error('Game not found or error fetching game.');
  if (gameData.players.length >= 2) throw new Error('This game is already full.');

  const { data: playerData, error: playerError } = await supabase
    .from('players')
    .insert({ 
        game_id: gameData.id, 
        player_number: 2, 
        score: 0,
        name: playerName
    })
    .select()
    .single();

  if (playerError) throw new Error(playerError.message);

  // With the second player now in, update the game status to 'playing'.
  // This is the event Player 1's client is waiting for to leave the lobby.
  const { error: updateError } = await supabase
    .from('games')
    .update({ status: 'playing' })
    .eq('id', gameData.id);
  
  if (updateError) throw new Error(updateError.message);

  // Fetch the final, updated game state to return to the joining player.
  const { data: updatedGameData, error: updatedGameError } = await supabase
    .from('games')
    .select('*, players(*)')
    .eq('id', gameData.id)
    .single();

  if (updatedGameError) throw new Error(updatedGameError.message);

  return { game: updatedGameData, player: playerData };
};

export const submitAnswer = async (gameId: string, playerNumber: 1 | 2, answer: string): Promise<void> => {
  const updatePayload = playerNumber === 1 ? { player1_answer: answer } : { player2_answer: answer };
  const { error } = await supabase
    .from('games')
    .update(updatePayload)
    .eq('id', gameId);
  if (error) throw new Error(error.message);
};

export const castVote = async (game: Game, voter: Player, vote: Vote): Promise<void> => {
  const opponent = game.players.find(p => p.id !== voter.id);
  if (!opponent) return;

  const updatePayload = voter.player_number === 1 ? { player1_vote: vote } : { player2_vote: vote };
  
  // Update the vote
  const { error: voteError } = await supabase
    .from('games')
    .update(updatePayload)
    .eq('id', game.id);
  if (voteError) throw new Error(voteError.message);

  // If the vote is 'up', update the opponent's score
  if (vote === 'up') {
    const { error: scoreError } = await supabase
      .rpc('increment_score', { player_id: opponent.id });
    if (scoreError) throw new Error(scoreError.message);
  }
};


export const nextQuestion = async (gameId: string, currentQuestionIndex: number): Promise<void> => {
    const { error } = await supabase
      .from('games')
      .update({
        current_question_index: currentQuestionIndex + 1,
        player1_answer: null,
        player2_answer: null,
        player1_vote: null,
        player2_vote: null,
      })
      .eq('id', gameId);
  
    if (error) throw new Error(error.message);
  };

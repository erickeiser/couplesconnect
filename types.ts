export type Player = {
  id: string;
  game_id: string;
  created_at: string;
  player_number: 1 | 2;
  score: number;
  name: string | null;
};

export type Game = {
  id: string;
  created_at: string;
  game_code: string;
  status: 'waiting' | 'playing' | 'finished';
  current_question_index: number;
  player1_answer: string | null;
  player2_answer: string | null;
  player1_vote: Vote | null;
  player2_vote: Vote | null;
  players: Player[];
};

export type Vote = 'up' | 'down';

export type GameState = {
  game: Game | null;
  currentPlayer: Player | null;
  opponent: Player | null;
};
export const START_GAME = 'start';
export const END_GAME = 'end';
export const GAME_PLAY = 'play';

export const PLAY_START_CARD = 0;
export const PLAY_CARD = 1;
export const DISCARD_CARD = 2;
export const DRAW_CARDS = 3;
export const DISCARD_START_CARDS = 4;
export const REQUIRED_DISCARD = 5;
export const GAME_WON = 6;
export const GAME_LOST = 7;

export const PLAY_MSG = 'Drag 1 card to Play or 2 cards to discard';
export const DISCARD_MSG = 'Discard another card';

export const COMPLETE_BOARD_MSG = 'Board must be full';

export const PLAY_START_MSG = 'Play Start card then Discard 8 cards';

export const RULES = [
    "Fill the board with cards in ascending order, from bottom-left to top-right.",
    "You have 1 Start card and 5 Finish cards.",
    "Fill the board, then play a Finish card to win.",
    "Play next to another card? Discard cards equal to the lowest number difference up to 4.",
    "Play 1 card or discard 2 cards then draw back to 5.",
    "Run out of cards? Complete the board without being able to play a Finish card? You lose!"
];
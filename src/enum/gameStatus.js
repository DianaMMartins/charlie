export const START = 'start';
export const TUTORIAL = 'tut'
export const END = 'end';
export const GAME_PLAY = 'play';

export const PLAY_START_CARD = 0;
export const PLAY_CARD = 1;
export const DISCARD_CARD = 2;
export const DISCARD_START_CARDS = 4;
export const REQUIRED_DISCARD = 5;
export const GAME_WON = 6;
export const GAME_LOST = 7;

export const PLAY_MSG = 'Drag 1 card to Play or discard 2';
export const DISCARD_MSG = 'Discard another card';

export const COMPLETE_BOARD_MSG = 'Board must be full';

export const PLAY_START_MSG = 'Play Start card then Discard 8 cards';

export const RULES = [
    "You have 1 Start, 80 Numbers and 5 Finish cards.",
    "You need to fill the board by dragging cards to the board in ascending order.",
    "But here's the catch!",
    "When you play numbers next to each other you discard their difference up to 4 from your hand.",
    "And, you can only finish the game by playing the finish card last.",
    "Run out of cards? You lose!"
];
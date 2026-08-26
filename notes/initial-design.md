
# Bot Bash

We are building a moderately complicated example game to introduce some core
concepts of multi-user interactive web apps.

## Stack

Vite, Vite-Express, React, React-Konva, React-Spring, Zustand, Socket.io,
React-Router (routes only, no data management)

## Architecture

The source of truth for application state is in-memory in the server process,
stored in a global `state` variable defined in server/state.js

**Server state structure:**

Decks in the players list have cards copied directly from the main card list.

Decks in games may have modified cards representing current game state. Those
changes go away when the game is cleaned up.


```
state = {
  players = [{name: 'Alice', deck: [...], {name: 'Bob', deck: [...]}],
  games = {
    '[uuid0]': {
      players: [
        { name: 'Carol', 
          deck: [card3, card1, card12, 
                 ... (card objects in some order)],
          board: [null, card8, null], 
        { name: 'Bob', 
          deck: [card42, card3, card21, 
                 ... (card objects in some order)],
          board: [null, card8, card41]
      ],
    },
    '[uuid1]': {
      ...
    },
    ...
  }
}

```

**Server static data:**

The available cards are defined in shared/cards.js. A player starting deck is a copy of
some subset of the available cards. The available card list doesn't change at
runtime, but the copies in games track updates.

```
cards = [
  {name: "Robot Duck", type: "bot", atk: 2, hp: [6, 6], status: []},
  ...
]
```

**Workflow**

- User arrives at /, enters username, clicks "List Games".
- Add them to the list if needed, and redirect to /dashboard.
- From /dashboard, the player can:
  - Rejoin or leave a game they're already in, if any.
  - Edit their deck.
  - Create a new game.
  - Join a game with only one player.
  - A player can be in at most one game at a time.
  - Join any in-progress game as an observer (observers aren't on the player
  list for the game).
- When a player joins a game, we add them and their deck to the game.
- When a player joins a game, they end up at /games/{uuid}

When a user visits the site, they connect to a socket and:

- Are redirected to / if they haven't entered a username.
- All client-server communication is via that socket, with SPA path management
via react-router and in-browser state as a single Zustand store.


## Decks

Each player has one deck.

New players get a random starter bot and deck (5 bots, 15 non-bot cards).

Each player can edit their deck, picking their starter bot, 5 more bots, and 15
non-bot cards.

## Gameplay

Each player has a board with three slots, initially {empty, starter bot, empty}.

Each player has a deck with their remaining cards, shuffled at game start.

The game has one scrap pile, initially containing 10 random cards (2 bots, 8
non-bots) from the card pool that are not in either player's deck.

Each player has a hand of cards. They draw to five at the start of the turn.
Hands can contain no more than 5 cards.

Players draw from their deck and discard to the scrap pile.

If a player's deck has (0 < x <= 5) cards at the start of their turn, they draw
their remaining cards.

If a players deck has zero cards at the start of their turn, they get two random
cards from the scrap pile.

Each turn is a series of phases. Each phase happens simultaneously for both
players. If a phase involves player input, both players select their actions
before the results are simultaneously revealed to both players.

Phases:

- Draw
- Deploy (each player can pick a bot from their hand and an empty slot to
deploy to).
- Action (each player can pick a non-bot card and play it)
- Combat

Only the deploy and action phases involve player input.


## Combat

Each bot simultaneously attacks the bot across from it, or the center bot if there's no bot
in the opposite slot. Bot slots are numbered 0 on the left for both players, so
player 0's slot 0 is across from player 1's slot 2.

HP is specified as {current, max}. Attacks decrease current HP of the defender
by the atk value of the attacker (min 0).

If a bot is reduced to 0 HP, it goes to the scrap pile. Temporary status effects
are cleared, but permanent statuses and current HP stay as is.

If the center bot is scrapped, a random side-bot is moved to the center, or if
there is no side bot to move the game ends. Whoever has no bots first loses, or
the game draws if both players lose their last bot at the same time.

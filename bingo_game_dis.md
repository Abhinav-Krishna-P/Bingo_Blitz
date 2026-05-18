# Bingo Game — Rules & Instructions

---

## What is this Bingo?

This is a **turn-based multiplayer Bingo** where players take turns picking numbers. There is no separate "caller" — every player is both a player and a caller. When it's your turn, you pick a number from your own board, and that number is immediately crossed off on **every other player's board too**. The first player to complete a row, column, or diagonal wins.

---

## The Card

- Each player gets their own 5×5 grid = 25 squares
- Every square has a unique number from **1 to 25**
- All 25 numbers appear exactly once on each card
- Numbers are placed randomly — no two cards are the same
- **No FREE space** in this version

```
┌────┬────┬────┬────┬────┐
│ 17 │  3 │ 22 │  8 │ 14 │
├────┼────┼────┼────┼────┤
│  5 │ 19 │ 11 │ 25 │  1 │
├────┼────┼────┼────┼────┤
│ 23 │  7 │ 16 │  2 │ 20 │
├────┼────┼────┼────┼────┤
│ 10 │ 13 │  4 │ 18 │  6 │
├────┼────┼────┼────┼────┤
│ 24 │  9 │ 15 │ 21 │ 12 │
└────┴────┴────┴────┴────┘
```

Because each board contains every number from 1 to 25 exactly once, **any number that is picked exists on every player's board**. Layouts differ, so the same picked number lands in a different position for each player.

---

## Turn Order

- At game start, a random turn order is assigned to all players
- Turns cycle in that fixed order, wrapping around
- Players who have already won (or disconnected) are skipped

---

## How to Play

1. The host creates a room and shares the party code; at least **2 players** must join
2. When the host starts the game, every player receives a randomized 5×5 card and a turn order is set
3. On each turn, the **active player has 10 seconds** to pick an uncrossed number from their own board
4. The picked number is announced and **crossed off on every player's board**
5. The next player in the turn order becomes active
6. The first player to complete a winning line wins immediately

---

## The 10-Second Timer

- Each turn has a fixed countdown (default **10 seconds**, configurable 5–20s by the host in the lobby)
- The timer is shown on every player's screen so everyone sees the same countdown
- If the active player picks before the timer runs out → their pick is used
- If the timer runs out → the system **auto-picks a random uncrossed number** from the active player's board, and play continues
- A player cannot pick a number that has already been crossed; only uncrossed cells are selectable on their turn

---

## Marking Numbers

- Marking is **automatic**. When a number is picked, it is crossed on every player's board immediately
- A crossed cell stays crossed for the rest of the game
- Players do not manually mark numbers and there is no "BINGO" claim button — wins are detected and announced automatically

---

## Win Condition — Spell "BINGO"

Every player has the word **BINGO** displayed above their board. Each player's letters are tracked independently.

- Every time a player completes a new line on their card (a full row, column, or diagonal), **one letter of BINGO is crossed off** for that player
- The order is fixed: **B → I → N → G → O**
- The first player to cross off all 5 letters **wins the game**

A single pick can sometimes complete multiple lines at once (for example, when a number lies on a row and a diagonal that were both one short). In that case, the player crosses off the corresponding number of letters in one go.

### What counts as a line
- Any complete row of 5 (5 rows)
- Any complete column of 5 (5 columns)
- Either of the 2 diagonals
- Each line counts once. Re-completing the same line does not earn another letter.
- Total distinct lines available per card = 12, but only the first 5 of them produce letters (5 letters in BINGO).

---

## Validation

After every pick, for each player:

1. Count the number of completed lines on their card
2. That count = the number of BINGO letters they have crossed (capped at 5)
3. Any player whose count reaches 5 is a winner
4. If two or more players hit 5 on the same pick, they all win — declared a **draw**

There is no manual claim step — the system is the source of truth.

---

## Game Over Scenarios

| Scenario | Outcome |
|---|---|
| A player crosses off their 5th letter (BINGO) | That player wins, game ends |
| Two or more players cross off their 5th letter on the same pick | All of them win — declared a draw |
| All 25 numbers are picked with no one reaching 5 letters | Game ends with no winner |

---

## Key Rules Summary

- Each card has numbers **1–25** placed randomly, no FREE space
- Players take turns; each turn has a **10-second** countdown
- On timeout, a random uncrossed number is auto-picked for the active player
- A picked number is crossed on **every** player's board, simultaneously
- A player can only pick uncrossed numbers from their **own** board
- Each completed row/column/diagonal crosses one letter of **BINGO** on that player's strip
- First to cross all 5 letters (B-I-N-G-O) wins the game
- Ties on the same pick → all tied players win

---

*End of Rules*


# Mythomagic Rules

**MythoMagic** is a strategic deck-building card game. Players harness the ancient forces of Fire, Blood, Gold, and Wood resources, to summon powerful creatures, and cast spells. Players must use their resources wisely to defeat their opponent by reducing their life total to 0 while protecting their own life. Each player begins with 15 life, and the first player to bring their opponent's life total to 0 wins the game.

## Setup
1. **Deck Construction:**
   - Each player builds a **30-card deck**.
   - Decks must include a mix of **Rishis**, **Creatures**, and **Spells**.
   - Cards generate or consume resources of four types: **Fire (F)**, **Blood (B)**, **Gold (G)**, and **Wood (W)**.

2. **Starting Hand:**
   - Each player shuffles their deck and draws **5 cards**.
   - Players may mulligan once (shuffling their hand back into the deck and drawing 4 cards instead.)

3. **Determine First Player:**
   - A coin toss decides which player goes first.

## Card Types
1. **Rishis:**
   - **Purpose:** Generate resources to summon creatures and cast spells.
   - Rishis remain in play and can generate **1 resource per turn** of their specified type(s).
   - **Limit:** Only **1 Rishi** can be played per turn.
   - Once a Rishi generates a resource, it gets tapped (can't generate resources) until its controller's next turn.

2. **Creatures:**
   - **Purpose:** Attack the opponent and defend against their creatures.
   - Creatures require resources to be summoned, as indicated by their **resource cost**.
   - Creatures can't attack on the turn they have been summoned. They can only attack from their controller's next turn.
   - Once they attack, creatures get tapped(can't block or activate any of their abilities) until their controller's next turn.
   - Once summoned, creatures remain in play until they are destroyed.
   - Creatures have **Strength** and **Toughness**:
     - **Strength:** The amount of damage dealt in combat.
     - **Toughness:** The amount of damage they can absorb before being destroyed.
   - Additionally, creatures may have special abilities (as indicated on their card):
      - **Haste**: This creature can attack even on the turn it has been summoned.
      - **Lifelink**: The controller of the creature gains life equal to the damage dealt whenever the creature deals damage.
      - **DT (Deathtouch)**: Any creature dealt damage by this creature immediately is destroyed, irrespective of the damage dealt.
      - **Vigilance**: Attacking does not cause the creature to tap.
      - **Trample**: Even if the creature is blocked, it deals any leftover damage (any portion of its strength it has remaining, after destroying its blocker(s)), to the opponent.


3. **Spells:**
   - **Purpose:** Provide instant magical effects, such as damaging creatures, strengthening creatures, or affecting the game state in various ways.
   - Spells are cast as **instants** (i.e., they can be played at any time, even during the opponent's turn), provided the player has the necessary resources.
   - After resolving, spells go to the **discard pile**.

## The Discard Pile
- The **discard pile** is where cards that are used up or destroyed are placed.
- **Cards in the discard pile include:**
  1. **Creatures that are destroyed** (through combat damage, spells, or abilities).
  2. **Spells that have been cast** and resolved.
- The discard pile is **public information**, and players can view it at any time.
- Cards in the discard pile are no longer active in the game.

## Gameplay
1. **Turn Phases:**
   Each turn has the following phases:
   - **Untap Phase:** All tapped rishis and creatures are untapped.
   - **Draw Phase:** Draw one card from your deck.
   - **Main Phase:** 
     - Play upto 1 Rishi per turn.
     - Activate Rishis to gain resources. Resources are **reset** at the end of your turn (unused resources do not carry over).
     - Summon Creatures or cast spells by paying their resource costs.
   - **Combat Phase:**
     - Declare attacking creatures.
     - Opponent declares blockers.
     - Resolve combat damage.
   - **End Phase:** End your turn and pass to the opponent.
   - **Spells:** Spells can be played at any phase.


2. **Combat Rules:**
   - Creatures can attack the opponent directly unless blocked by an opposing creature.
   - Blocking creatures absorb damage equal to their Toughness.
   - Any unblocked attacking creature deals its Strength value as damage to the opponent’s life total.

3. **Damage Resolution:**
   - If a creature takes damage equal to or greater than its Toughness, it is destroyed and placed into the **discard pile**.
   - Players lose life equal to the damage dealt by unblocked attacking creatures or spell effects.
   - At the end of the turn, all creatures regain their original toughness and strength.

## Resource Management
- Players rely on **Rishis** to generate resources.
- Each card has a resource cost, which is listed in its top-right corner. The cost may include a combination of specific resource types or any combination of resources.
  - Example: **2FFG** means the card requires **2** resources of **any type**, **2 Fire** resources(FF), and **1 Gold** resource(G) to cast.
- Players cannot play cards if they lack the required resources.

## Winning and Losing
- **Win Condition:** Reduce opponent’s life total to **0**.
- **Lose Condition:**
  - A player’s life total reaches **0**.
  - A player attempts to draw from an **empty deck**.

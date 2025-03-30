# Vibing Game Todo List

## Authentication System
- [x] Create Account Page
  - [x] Design and implement account creation form
  - [x] Add email validation
  - [x] Add password requirements
  - [x] Implement account creation API endpoint
  - [x] Add error handling and success messages
  - [x] Add redirect to login after successful account creation

- [x] Login Page
  - [x] Design and implement login form
  - [x] Add "Remember me" functionality
  - [x] Implement login API endpoint
  - [x] Add error handling and success messages
  - [x] Add redirect to account page after successful login
  - [x] Implement session management

## Character Management
- [x] Character Selection Page
  - [x] Design and implement character selection UI
  - [x] Display existing characters
  - [x] Add "Create New Character" button
  - [x] Add character deletion option
  - [x] Implement character selection logic

- [ ] New Character Creation
  - [x] Design and implement character creation form
  - [ ] Add character name validation
  - [ ] Add character appearance customization
  - [x] Set initial character stats
  - [x] Implement character creation API endpoint
  - [x] Add error handling and success messages

## Game Flow
- [x] Game Initialization
  - [x] Load selected character data
  - [x] Initialize game state with character data
  - [x] Set up camera at temple center
  - [x] Initialize player position at temple center

- [x] Game Exit
  - [x] Add exit game button/option
  - [x] Implement save game state
  - [x] Save character progress
  - [x] Handle cleanup of game resources
  - [x] Redirect to character selection

## Data Persistence
- [ ] Character Data Storage
  - [x] Design database schema for characters
  - [ ] Implement character save functionality
  - [ ] Add auto-save feature
  - [ ] Handle character data updates
  - [ ] Implement data validation

- [ ] Game State Management
  - [ ] Track player position
  - [ ] Save inventory state
  - [ ] Save equipment state
  - [ ] Save skills and experience
  - [ ] Handle game state restoration

## Graphics
- [x] Terrain
  - [x] Create Tiles
    - [x] Grass
    - [x] Water
    - [x] Dirt
    - [x] Rock
    - [x] Sand
  
  - Create Elements
   - [ ] Big Rock
   - [ ] Trees

  - [ ] Implement in Game

## Additional Considerations
- [ ] Security
  - [ ] Implement proper password hashing
  - [ ] Add session management
  - [ ] Implement API authentication
  - [ ] Add rate limiting for API endpoints

- [ ] User Experience
  - [ ] Add loading states
  - [ ] Implement error boundaries
  - [ ] Add success/error notifications
  - [ ] Implement proper navigation flow
  - [ ] Add confirmation dialogs for important actions

- [ ] Testing
  - [ ] Add unit tests for authentication
  - [ ] Add unit tests for character management
  - [ ] Add integration tests for game flow
  - [ ] Add end-to-end tests for critical paths
  - [ ] Implement test data seeding

## Player Updates
- [ ] Modifiers property
  - [ ] Save all buff modifiers
    - [ ] Attack speed
    - [ ] Damage
    - [ ] Magic Damage
    - [ ] Max life
    ...


## Nawari Runes System
- [ ] Core System Implementation
  - [ ] Nawari resource mechanic
  - [ ] Rune learning/acquisition system
  - [ ] Rune combination interface
  - [ ] Spell casting animation system
  - [ ] Nawari crystal collection mechanic

- [ ] Element Runes
  - [ ] Fire (heat, flames, combustion)
  - [ ] Water (liquid, ice, vapor)
  - [ ] Earth (stone, metal, plants)
  - [ ] Wind (air, lightning, sound)
  - [ ] Light (illumination, purification, truth)
  - [ ] Shadow (darkness, concealment, illusion)
  - [ ] Spirit (soul, mind, ancestral power)

- [ ] Effect Runes
  - [ ] Damage (harm, weaken, break)
  - [ ] Heal (restore, mend, rejuvenate)
  - [ ] Protect (shield, ward, defend)
  - [ ] Enhance (strengthen, empower, sharpen)
  - [ ] Diminish (weaken, reduce, dull)
  - [ ] Control (command, dominate, influence)
  - [ ] Transform (change, alter, adapt)
  - [ ] Reveal (detect, find, uncover)
  - [ ] Conceal (hide, mask, obscure)
  - [ ] Bind (restrict, trap, contain)
  - [ ] Purify (cleanse, cure, restore)
  - [ ] Corrupt (taint, poison, decay)

- [ ] Target Runes
  - [ ] Self (caster only)
  - [ ] Touch (single target in contact)
  - [ ] Projectile (single distant target)
  - [ ] Beam (line of effect)
  - [ ] Burst (area around caster)
  - [ ] Area (chosen location effect)
  - [ ] Wall (vertical barrier)
  - [ ] Allies (friendly targets only)
  - [ ] Enemies (hostile targets only)
  - [ ] All (affects everything in range)

- [ ] Form Runes
  - [ ] Instant (immediate one-time effect)
  - [ ] Sustained (continuous while concentrating)
  - [ ] Duration (temporary effect for set time)
  - [ ] Delayed (triggers after set time)
  - [ ] Conditional (triggers on specific event)
  - [ ] Channeled (escalating effect while casting)
  - [ ] Ritual (powerful effect requiring preparation)

- [ ] Intensity Runes
  - [ ] Whisper (minimal power, low Nawari cost)
  - [ ] Voice (standard power, medium Nawari cost)
  - [ ] Shout (strong power, high Nawari cost)
  - [ ] Roar (maximum power, very high Nawari cost)

- [ ] Meta Runes
  - [ ] Extend (increase range or area)
  - [ ] Prolong (increase duration)
  - [ ] Amplify (increase intensity)
  - [ ] Diminish (decrease Nawari cost)
  - [ ] Split (affect multiple targets)
  - [ ] Chain (jump to secondary targets)
  - [ ] Echo (repeat effect)
  - [ ] Silent (cast without visible signs)
  - [ ] Swift (reduced casting time)
  - [ ] Persistent (remains after caster leaves)

- [ ] Advanced Combination System
  - [ ] Basic combinations (2-3 runes)
  - [ ] Complex combinations (4-5 runes)
  - [ ] Master combinations (6+ runes)
  - [ ] Forbidden combinations (dangerous but powerful)
  - [ ] Ancestral combinations (unique to Ezkari tribes)
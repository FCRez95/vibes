'use client'

import { useEffect, useRef, useState } from 'react';
import { CanvasManipulator } from './engine/canvas';
import { GameConstructor } from './engine/game';
import { GameControls } from '../components/GameControls';
import { Player } from './entitites/player';
import { EquippedItemsModel, PlayerModel, OnlinePlayerModel } from '../models/game/entities/player-model';
import { useRouter } from 'next/navigation';
import { updateCharacter, updateCharacterSkills, updateEquippedItems, createInventoryItem, deleteAllInventoryItems } from '../lib/supabaseClient';
import { MonsterModel } from '../models/game/entities/monster-model';
import { Bat } from './entitites/monsters/bat';
import { SkillsModel } from '../models/game/entities/skill-model';
import { Loot } from './items/loot';
import { armorList } from './items/armor';
import { weaponList } from './items/weapons';
import { Item } from './items/Item';
import { ItemModel } from '../models/game/entities/items-model';
import { LootModal } from '../components/LootModal';
import { Rat } from './entitites/monsters/rat';
import { Goblin } from './entitites/monsters/goblin';
import { Troll } from './entitites/monsters/troll';
import { Orc } from './entitites/monsters/orc';
import { OnlinePlayer } from './entitites/online-player';
import { GameAction, ActionType } from '../models/game/Actions';

export default function GamePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameInstanceRef = useRef<GameConstructor | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [currentLootItems, setCurrentLootItems] = useState<Item[]>([]);
  const [currentLootId, setCurrentLootId] = useState<string | null>(null);
  
  // Get selected character data
  useEffect(() => {
    // Load character from database
    const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');
    if (!selectedCharacter) {
      router.push('/account');
      return;
    }
  }, [router]);

  // Handle websocket connection messages
  useEffect(() => {
    function handleGameAction(action: GameAction, socket: WebSocket): void {
      const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');
      switch (action.type) {
        case ActionType.GAME_STATE:
          if (!canvasRef.current) return;
          const canvas = new CanvasManipulator(canvasRef.current);
          // Set canvas size to match container
          console.log('Game state:', action.state);
          const container = canvasRef.current.parentElement;
          if (container) {
            const rect = container.getBoundingClientRect();
            canvas.resize(rect.width, rect.height);
          }
  
          // Initialize local player
          const player = action.state.player;
          console.log('player', player);
          if (!player) {
            console.error('Could not find local player in game state');
            return;
          }
          const localPlayer = initializePlayer(player, true, socket);
          if (!localPlayer) {
            console.error('Failed to initialize local player');
            return;
          }
          
          // Create Lairs positions array from action.state.monsterLairs
          const monsterLairs = action.state.world.monsterLairs.map((lair: { position: { x: number, y: number } }) => ({
            x: lair.position.x,
            y: lair.position.y
          }));
  
          // Initialize game instance with the canvas, local player, online players map, and world state
          gameInstanceRef.current = new GameConstructor(
            canvas,
            localPlayer,
            action.state.world.tiles,
            monsterLairs,
            socket,
          );
          // Set up game loop
          let lastTime = 0;
          const targetFPS = gameInstanceRef.current?.isMobile ? 30 : 60;
          const frameInterval = 1000 / targetFPS;
          
          const gameLoop = (currentTime: number) => {
            if (!lastTime) lastTime = currentTime;
            const deltaTime = currentTime - lastTime;
            
            if (deltaTime >= frameInterval) {
              if (gameInstanceRef.current) {
                gameInstanceRef.current.update();
                gameInstanceRef.current.draw();
              }
              lastTime = currentTime - (deltaTime % frameInterval);
            }
            
            requestAnimationFrame(gameLoop);
          };
          
          // Start the game loop
          requestAnimationFrame(gameLoop);
          break;
        
        case ActionType.GAME_UPDATE:
          if (gameInstanceRef.current) {
            // Update monsters
            action.state.relevantMonsters.forEach((monster: MonsterModel) => {
              const monsterInstance = gameInstanceRef.current?.monsters.get(monster.id);
              if (monsterInstance) {
                monsterInstance.updateMonster(monster.position, monster.health, null);
              } else {
                const monsterInstance = initializeMonster(monster);
                if (monsterInstance) {
                  gameInstanceRef.current?.monsters.set(monster.id, monsterInstance);
                }
              }
            });
            // Update world items
            action.state.relevantWorldItems.forEach((item: Loot) => {
              const itemData = new Loot(item.id, item.items, item.position);
              gameInstanceRef.current?.worldItems.set(item.id, itemData);
            });
            // Update player
            const playerInstance = gameInstanceRef.current?.player;
            if (playerInstance) {
              playerInstance.health = action.state.health;
              playerInstance.mana = action.state.mana;
              playerInstance.inventory = action.state.inventory?.map((item: Item) => new Item(item.id, item.type !== 'axe' && item.type !== 'bow' && item.type !== 'club' && item.type !== 'throwing' ? armorList[item.identifier as keyof typeof armorList] : weaponList[item.identifier as keyof typeof weaponList]));
              playerInstance.equipment = {
                helmet: action.state.equipment.helmet ? new Item(action.state.equipment.helmet.id, armorList[action.state.equipment.helmet?.identifier as keyof typeof armorList]) : null,
                chestplate: action.state.equipment.chestplate ? new Item(action.state.equipment.chestplate.id, armorList[action.state.equipment.chestplate?.identifier as keyof typeof armorList]) : null,
                weapon: action.state.equipment.weapon ? new Item(action.state.equipment.weapon.id, weaponList[action.state.equipment.weapon?.identifier as keyof typeof weaponList]) : null,
                shield: action.state.equipment.shield ? new Item(action.state.equipment.shield.id, armorList[action.state.equipment.shield?.identifier as keyof typeof armorList]) : null,
                legs: action.state.equipment.legs ? new Item(action.state.equipment.legs.id, armorList[action.state.equipment.legs?.identifier as keyof typeof armorList]) : null,
                boots: action.state.equipment.boots ? new Item(action.state.equipment.boots.id, armorList[action.state.equipment.boots?.identifier as keyof typeof armorList]) : null
              }
            }
  
            //Update online players
            action.state.relevantPlayers.forEach((player: OnlinePlayerModel) => {
              const playerInstance = gameInstanceRef.current?.players.get(player.id);
              if (playerInstance) {
                playerInstance.updateOnlinePlayer(player.position, player.health, player.mana);
              }
              else {
                const playerInstance = initializeOnlinePlayer(player);
                if (playerInstance) {
                  gameInstanceRef.current?.players.set(player.id, playerInstance);
                }
              }
            });
          }
          break;
      
        case ActionType.LEVEL_UP:
          if (gameInstanceRef.current) {
            console.log('Level up:', action.payload);
            const { playerId, skill } = action.payload;
            if (playerId === selectedCharacter.id) {
              gameInstanceRef.current.player.levelUp(skill as keyof SkillsModel);
            }
            console.log('Level up:', gameInstanceRef.current.player.skills);
          }
          break;
        
        case ActionType.PLAYER_BLOCK:
          if (gameInstanceRef.current) {
            const { playerId, skill, experience } = action.payload;
            if (playerId === selectedCharacter.id) {
              gameInstanceRef.current.player.blockAttack();
              gameInstanceRef.current.player.skills[skill as keyof SkillsModel].experience = Math.round(experience);
            } else {
              gameInstanceRef.current.players.get(playerId)?.blockAttack();
            }
          }
          break;
    
        case ActionType.PLAYER_EVADE:
          if (gameInstanceRef.current) {
            const { playerId, skill, experience } = action.payload;
            if (playerId === selectedCharacter.id) {
              gameInstanceRef.current.player.evadeAttack();
              gameInstanceRef.current.player.skills[skill as keyof SkillsModel].experience = Math.round(experience);
            } else {
              gameInstanceRef.current.players.get(playerId)?.evadeAttack();
            }
          }
          break;
          
        case ActionType.PLAYER_ATTACKED:
          if (gameInstanceRef.current) {
            const { playerId, monsterId, skill, experience, damage } = action.payload;
            const monster = gameInstanceRef.current.monsters.get(monsterId);
            if (monster) {
              monster.takeDamage(damage);
            }
            if (playerId === selectedCharacter.id) {
              gameInstanceRef.current.player.skills[skill as keyof SkillsModel].experience = Math.round(experience);
            }
          }
          break;
  
        case ActionType.MONSTER_BLOCK:
            if (gameInstanceRef.current) {
              const { monsterId } = action.payload;
              gameInstanceRef.current.monsters.get(monsterId)?.blockAttack();
            }
            break;
      
        case ActionType.MONSTER_EVADE:
          if (gameInstanceRef.current) {
            const { monsterId } = action.payload;
            gameInstanceRef.current.monsters.get(monsterId)?.evadeAttack();
          } 
          break;
            
        case ActionType.MONSTER_ATTACKED:
          if (gameInstanceRef.current) {
            const { playerId, damage } = action.payload;
            if (playerId === selectedCharacter.id) {
              gameInstanceRef.current.player.takeDamage(damage);
              gameInstanceRef.current.player.skills.shield.experience = Math.round(action.payload.experienceShield);
              gameInstanceRef.current.player.skills.running.experience = Math.round(action.payload.experienceRunning);
            } else {
              gameInstanceRef.current.players.get(playerId)?.takeDamage(damage);
            }
          }
          break;
  
        case ActionType.PICKUP_ITEM:
          const lootItems = gameInstanceRef.current?.worldItems.get(action.lootId)?.items;
          if (lootItems) {
            const index = lootItems.findIndex(i => i.identifier === action.itemIdentifier);
            if (index !== -1) {
              lootItems.splice(index, 1);
            }
            if (lootItems.length === 0) {
              gameInstanceRef.current?.worldItems.delete(action.lootId);
            }
          }
          break;  
        
        case ActionType.PICKUP_ALL_ITEMS:
          gameInstanceRef.current?.worldItems.delete(action.lootId);
          break;
      }
    }

    const socket = new WebSocket("ws://localhost:3001");
    //const socket = new WebSocket("wss://hero-vibes.online");

    socket.onopen = () => {
      console.log("Connected to game server!");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const action: GameAction = JSON.parse(event.data);
        handleGameAction(action, socket);
      } catch (error) {
        console.error('Error processing message:', error);
        socket.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setWs(null);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setWs(null);
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);

  // Join game on character load
  useEffect(() => {
    const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "JOIN_GAME", payload: { playerId: selectedCharacter.id } }));
    }
  }, [ws]);

  // Helper function to initialize a player
  // Calculate max experience for each skill based on the level -- 150 * level
  const initializePlayer = (character: PlayerModel, isLocalPlayer: boolean = false, socket: WebSocket | null) => {
    const equipment: EquippedItemsModel = {
      helmet: character.equipment.helmet ? new Item(character.equipment.helmet.id, armorList[character.equipment.helmet?.identifier as keyof typeof armorList]) : null,
      chestplate: character.equipment.chestplate ? new Item(character.equipment.chestplate.id, armorList[character.equipment.chestplate?.identifier as keyof typeof armorList]) : null,
      weapon: character.equipment.weapon ? new Item(character.equipment.weapon.id, weaponList[character.equipment.weapon?.identifier as keyof typeof weaponList]) : null,
      shield: character.equipment.shield ? new Item(character.equipment.shield.id, armorList[character.equipment.shield?.identifier as keyof typeof armorList]) : null,
      legs: character.equipment.legs ? new Item(character.equipment.legs.id, armorList[character.equipment.legs?.identifier as keyof typeof armorList]) : null,
      boots: character.equipment.boots ? new Item(character.equipment.boots.id, armorList[character.equipment.boots?.identifier as keyof typeof armorList]) : null,
    };

    const inventory = character.inventory.map((item) => {
      console.log('item', item);
      if (item.type === 'helmet' || item.type === 'chestplate' || item.type === 'legs' || item.type === 'boots' || item.type === 'shield') {
        return new Item(item.id, armorList[item.identifier as keyof typeof armorList]);
      } else {
        return new Item(item.id, weaponList[item.identifier as keyof typeof weaponList]);
      }
    });

    if (!socket) return null;
    return new Player(
      character.id,
      character.position.x,
      character.position.y,
      character.name,
      character.health,
      character.maxHealth,
      character.mana,
      character.maxMana,  
      character.lastAttackTime,
      character.skills,
      inventory,
      equipment,
      isLocalPlayer,
      socket
    );
  };

  // Helper function to initialize an online player
  const initializeOnlinePlayer = (player: OnlinePlayerModel) => {
    return new OnlinePlayer(player.id, player.position.x, player.position.y, player.name, player.health, player.maxHealth, player.mana, player.maxMana);
  };

  // Helper function to initialize a monster
  const initializeMonster = (monster: MonsterModel) => {
    switch (monster.monster) {
      case 'Bat':
        return new Bat(monster.id, monster.position.x, monster.position.y);
      case 'Rat':
        return new Rat(monster.id, monster.position.x, monster.position.y);
      case 'Goblin':
        return new Goblin(monster.id, monster.position.x, monster.position.y);
      case 'Troll':
        return new Troll(monster.id, monster.position.x, monster.position.y);
      case 'Orc':
        return new Orc(monster.id, monster.position.x, monster.position.y);
    }
  };

  interface ClosestLoot {
    id: string;
    loot: Loot;
    distance: number;
  }

  // Function to find the closest loot to the player
  const findClosestLoot = (): ClosestLoot | null => {
    if (!gameInstanceRef.current) return null;
    
    const player = gameInstanceRef.current.player;
    let closestLoot: ClosestLoot | null = null;
    
    gameInstanceRef.current.worldItems.forEach((loot, id) => {
      const dx = loot.position.x - player.position.x;
      const dy = loot.position.y - player.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only consider loot within a certain range (e.g., 100 units)
      if (distance <= 100) {
        if (!closestLoot || distance < closestLoot.distance) {
          closestLoot = { id, loot, distance };
        }
      }
    });
    if (closestLoot) {
      return closestLoot;
    }
    return null;
  };

  // Function to open the loot modal
  const openLoot = () => {
    const closestLoot = findClosestLoot();
    if (closestLoot) {
      setCurrentLootItems(closestLoot.loot.items);
      setCurrentLootId(closestLoot.id);
      setIsLootModalOpen(true);
    } else {
      // You could show a notification here that no loot is nearby
      console.log('No loot nearby');
    }
  };

  // Function to pick up a single item
  const pickupItem = (item: ItemModel) => {
    if (!gameInstanceRef.current || !currentLootId || !ws) return;
    
    // Send pickup item action to server
    ws.send(JSON.stringify({
      type: "PICKUP_ITEM",
      payload: {
        playerId: gameInstanceRef.current.player.id,
        lootId: currentLootId,
        itemIdentifier: item.identifier
      }
    }));
    
    // Remove the item from the current loot items
    setCurrentLootItems(prevItems => {
      const newItems = prevItems.filter(i => i.identifier !== item.identifier);
      return newItems;
    });
    
    // If no items left, close the modal
    if (currentLootItems.length <= 1) {
      setIsLootModalOpen(false);
    }
  };

  // Function to pick up all items
  const pickupAllItems = () => {
    if (!gameInstanceRef.current || !currentLootId || !ws) return;
    
    // Send pickup all items action to server
    ws.send(JSON.stringify({
      type: "PICKUP_ALL_ITEMS",
      payload: {
        playerId: gameInstanceRef.current.player.id,
        lootId: currentLootId
      }
    }));
    
    // Close the modal
    setIsLootModalOpen(false);
  };

  // Function to equip an item
  const equipItem = (item: Item) => {
    if (!gameInstanceRef.current || !ws) return;
    
    // Send equip item action to server
    ws.send(JSON.stringify({
      type: "EQUIP_ITEM",
      payload: {
        playerId: gameInstanceRef.current.player.id,
        itemId: item.id
      }
    }));
  };

  // Function to unequip an item
  const unequipItem = (item: Item) => {
    if (!gameInstanceRef.current || !ws) return;
    
    // Send unequip item action to server
    ws.send(JSON.stringify({
      type: "UNEQUIP_ITEM",
      payload: {
        playerId: gameInstanceRef.current.player.id,
        itemType: item.type
      }
    }));
  };
  
  // Function to save game state and character progress
  const saveGameState = async (): Promise<boolean> => {
    try {
      if (!gameInstanceRef.current) {
        console.error('Game instance not available');
        return false;
      }

      const player = gameInstanceRef.current.player;
      
      // Player data to save in database
      const characterData = {
        health: Math.floor(player.health),
        max_health: Math.floor(player.maxHealth),
        mana: Math.floor(player.mana),
        max_mana: Math.floor(player.maxMana),
        position_x: Math.floor(player.position.x),
        position_y: Math.floor(player.position.y),
        last_attack_time: 0,
        online: false
      };
      
      // Skills data to save in database
      const skillsData = {
        running: player.skills.running.level,
        running_exp: player.skills.running.experience,
        unarmed: player.skills.unarmed.level,
        unarmed_exp: player.skills.unarmed.experience,
        axe: player.skills.axe.level,
        axe_exp: player.skills.axe.experience,
        throwing: player.skills.throwing.level,
        throwing_exp: player.skills.throwing.experience,
        bow: player.skills.bow.level,
        bow_exp: player.skills.bow.experience,
        club: player.skills.club.level,
        club_exp: player.skills.club.experience,
        elemental_magic: player.skills.elementalMagic.level,
        elemental_magic_exp: player.skills.elementalMagic.experience,
        nature_magic: player.skills.natureMagic.level,
        nature_magic_exp: player.skills.natureMagic.experience,
        summoning_magic: player.skills.summoningMagic.level,
        summoning_magic_exp: player.skills.summoningMagic.experience,
        shamman_magic: player.skills.shammanMagic.level,
        shamman_magic_exp: player.skills.shammanMagic.experience,
        shield: player.skills.shield.level,
        shield_exp: player.skills.shield.experience
      };

      // Inventory data to save in database
      const inventoryData = player.inventory.map(item => ({
        identifier: item.identifier,
        player_id: player.id,
        type: item.type,
        quantity: 1
      }));

      // Equipment data to save in database
      const equipmentData = {
        head: player.equipment.helmet?.identifier,
        chest: player.equipment.chestplate?.identifier,
        weapon: player.equipment.weapon?.identifier,
        shield: player.equipment.shield?.identifier,
        legs: player.equipment.legs?.identifier,
        boots: player.equipment.boots?.identifier
      };

      // Update character data
      const { error: characterError } = await updateCharacter(player.id, characterData);
      if (characterError) {
        console.error('Error updating character:', characterError);
        return false;
      }
      
      // Update skills
      const { error: skillsError } = await updateCharacterSkills(player.id, skillsData);
      if (skillsError) {
        console.error('Error updating skills:', skillsError);
        return false;
      }

      // Update inventory
      const { error: inventoryError } = await deleteAllInventoryItems(player.id);
      if (inventoryError) {
        console.error('Error deleting inventory:', inventoryError);
        return false;
      }
      inventoryData.forEach(async (item) => { 
        const { error: inventoryError } = await createInventoryItem({
          identifier: item.identifier,
          player_id: player.id,
          quantity: item.quantity,
          type: item.type
        });
        if (inventoryError) {
          console.error('Error updating inventory:', inventoryError);
          return false;
        }
      });

      // Update equipped items
      const { error: equippedItemsError } = await updateEquippedItems(player.id, equipmentData);
      if (equippedItemsError) {
        console.error('Error updating equipped items:', equippedItemsError);
        return false;
      }

      console.log('Game state saved successfully');

      // Send Leave Game Action
      if (ws) {
        ws.send(JSON.stringify({ type: "LEAVE_GAME", playerId: player.id }));
      }
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  };

  return (
    <>
      <main className="w-full h-full flex justify-center items-center overflow-hidden touch-none">
        <canvas ref={canvasRef} className="border border-gray-300" />
        <GameControls
          saveGameState={saveGameState}
          equipItem={equipItem}
          unequipItem={unequipItem}
          onAttackClick={() => {
            if (gameInstanceRef.current) {
              gameInstanceRef.current.controls.handleAttackClick();  
            }
          }} 
          onJoystickMove={(direction) => {
            if (gameInstanceRef.current) {
              gameInstanceRef.current.controls.handleJoystickMove(direction);
            }
          }} 
          onJoystickStart={() => {
            if (gameInstanceRef.current) {
              gameInstanceRef.current.controls.handleJoystickStart();
            }
          }} 
          onJoystickEnd={() => {
            if (gameInstanceRef.current) {
              gameInstanceRef.current.controls.handleJoystickEnd();
            }
          }}
          openLoot={openLoot}
          player={() => {
            if (gameInstanceRef.current) {
              return gameInstanceRef.current.player;
            }
          }}
          inventory={() => {
            if (gameInstanceRef.current) {
              return gameInstanceRef.current.player.inventory;
            }
          }}
          equipment={() => {
            if (gameInstanceRef.current) {
              return gameInstanceRef.current.player.equipment;
            }
          }}
        />
        <LootModal
          isOpen={isLootModalOpen}
          onClose={() => setIsLootModalOpen(false)}
          lootItems={currentLootItems}
          onPickupItem={pickupItem}
          onPickupAll={pickupAllItems}
        />
      </main>
    </>
  );  
}

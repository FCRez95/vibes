import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://altmfkrgfocekmlersvz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsdG1ma3JnZm9jZWttbGVyc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjY5NjAsImV4cCI6MjA1ODYwMjk2MH0.FFd0MRtluMYQ81hqXePeIYHz_WUSEPHwpAcP-vnmVmQ'
)

export interface Skills {
  running: number;
  running_exp: number;
  unarmed: number;
  unarmed_exp: number;
  axe: number;
  axe_exp: number;
  throwing: number;
  throwing_exp: number;
  bow: number;
  bow_exp: number;
  club: number;
  club_exp: number;
  elemental_magic: number;
  elemental_magic_exp: number;
  nature_magic: number;
  nature_magic_exp: number;
  summoning_magic: number;
  summoning_magic_exp: number;
  shamman_magic: number;
  shamman_magic_exp: number;
  shield: number;
  shield_exp: number;
}

export interface EquippedItems {
  id: string;
  player_id: string;
  head: string;
  chest: string;
  legs: string;
  boots: string;
  weapon: string;
  shield: string;
}

export interface Inventory {
  id: string;
  item_id: string;
  player_id: string;
  quantity: number;
}

export interface Character {
  id: string;
  name: string;
  health: number;
  max_health: number;
  mana: number;
  max_mana: number;
  position_x: number;
  position_y: number;
  last_attack_time: number;
  skills?: Skills[];
  equipped_items?: EquippedItems[];
  inventory?: Inventory[];
}

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const fetchUserCharacters = async (userId: string) => {
  const { data, error } = await supabase
    .from('Player')
    .select('*')
    .eq('user_id', userId);
  return { data, error };
}

export const createCharacter = async (userId: string, name: string) => {
  const { data, error } = await supabase
    .from('Player')
    .insert([
      {
        user_id: userId,
        name,
        health: 100,
        max_health: 100,
        mana: 100,
        max_mana: 100,
        position_x: 0,
        position_y: 0,
        last_attack_time: new Date().toISOString()
      }
    ])
    .select();
  return { data, error };
}

export const deleteCharacter = async (characterId: string) => {
  const { error } = await supabase
    .from('Player')
    .delete()
    .eq('id', characterId);
  return { error };
}

export const createCharacterSkills = async (playerId: string) => {
  const { data, error } = await supabase
    .from('skills')
    .insert([
      {
        player_id: playerId,
        running: 1,
        running_exp: 0,
        unarmed: 1,
        unarmed_exp: 0,
        axe: 1,
        axe_exp: 0,
        throwing: 1,
        throwing_exp: 0,
        bow: 1,
        bow_exp: 0,
        club: 1,
        club_exp: 0,
        elemental_magic: 1,
        elemental_magic_exp: 0,
        nature_magic: 1,
        nature_magic_exp: 0,
        summoning_magic: 1,
        summoning_magic_exp: 0,
        shamman_magic: 1,
        shamman_magic_exp: 0,
        shield: 1,
        shield_exp: 0
      }
    ])
    .select();
  return { data, error };
}

export const fetchCharacter = async (characterId: string) => {
  const { data, error } = await supabase
    .from('Player')
    .select('*, skills(*), equipped_items(*), inventory(*)')
    .eq('id', characterId);
  return { data, error };
}
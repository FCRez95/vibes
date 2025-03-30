/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Character, getCurrentUser, fetchUserCharacters, createCharacter, deleteCharacter, createCharacterSkills } from "../lib/supabaseClient";

export default function AccountPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const { user, error: userError } = await getCurrentUser();
        if (userError || !user) {
          router.push('/');
          return;
        }
  
        const { data, error } = await fetchUserCharacters(user.id);
        if (error) throw error;
        setCharacters(data as Character[] || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacters();
  }, [router]);

  const handleCreateCharacter = async () => {
    try {
      const { user, error: userError } = await getCurrentUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await createCharacter(user.id, newCharacterName);
      if (error) throw error;

      if (data && data.length > 0) {
        const { error: skillsError } = await createCharacterSkills(data[0].id);
        if (skillsError) throw skillsError;
      }
      setCharacters([...characters, ...(data as Character[])]);
      setShowCreateForm(false);
      setNewCharacterName("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteCharacter = async (characterId: number) => {
    try {
      const { error } = await deleteCharacter(characterId);
      if (error) throw error;
      
      setCharacters(characters.filter(char => char.id !== characterId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const selectCharacter = (character: Character) => {
    // Store selected character in localStorage
    localStorage.setItem('selectedCharacter', JSON.stringify(character));
    // Navigate to game page
    router.push('/game');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading characters...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Characters</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create New Character
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Create New Character</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={newCharacterName}
                onChange={(e) => setNewCharacterName(e.target.value)}
                placeholder="Character Name"
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                onClick={handleCreateCharacter}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <div
              key={character.id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{character.name}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Health:</span>
                  <span>{character.health}/{character.max_health}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mana:</span>
                  <span>{character.mana}/{character.max_mana}</span>
                </div>
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span>({character.position_x}, {character.position_y})</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => selectCharacter(character)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Select
                </button>
                <button
                  onClick={() => handleDeleteCharacter(character.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {characters.length === 0 && !showCreateForm && (
          <div className="text-center text-gray-500 mt-8">
            No characters found. Create your first character to begin your adventure!
          </div>
        )}
      </div>
    </div>
  );
}

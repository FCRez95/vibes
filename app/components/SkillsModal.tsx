import React from 'react';
import { SkillsModel } from '../models/game/entities/skill-model';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: () => SkillsModel | undefined;
}

export function SkillsModal({ isOpen, onClose, skills }: SkillsModalProps) {
  if (!isOpen) return null;

  const currentSkills = skills();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-[#383838]">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Skills</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentSkills && Object.entries(currentSkills).map(([skillKey, skill]) => (
            <div key={skillKey} className="bg-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{skill.name}</h3>
                <span className="text-sm text-gray-600">Level {skill.level}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${(skill.experience / skill.maxExperience) * 100}%`
                  }}
                />
              </div>
              
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{skill.experience} XP</span>
                <span>{skill.maxExperience} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 
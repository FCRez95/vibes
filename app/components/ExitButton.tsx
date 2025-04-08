import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ExitButtonProps {
  onSaveGameState: () => Promise<boolean>;
}

export function ExitButton({ onSaveGameState }: ExitButtonProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const handleExitClick = () => {
    setShowConfirmation(true);
  };
  
  const handleCancelExit = () => {
    setShowConfirmation(false);
  };

  const handleExitGame = async () => {
    setIsSaving(true);
    await onSaveGameState();
    setIsSaving(false);
    router.push('/account');
  };

  return (
    <>
      <button 
        onClick={handleExitClick}
        className="w-16 h-16 rounded-full bg-[#e24a4aa6] border-none pointer-events-auto flex items-center justify-center text-white transition-colors hover:bg-[#e24a4ad0]"
        aria-label="Exit game"
      >
        <span role="img" aria-label="exit">🚪</span>
      </button>
      
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold mb-4">Exit Game?</h3>
            <p className="mb-6">Your progress will be saved. Are you sure you want to exit?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCancelExit}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleExitGame}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Exit Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
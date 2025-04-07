import React from 'react';

const WineTastingInstructions = ({ onDismiss }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 animate-fade-in">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-purple-800">Wine Tasting Simulation</h3>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Dismiss instructions"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="text-gray-600 mb-4">
        <p className="mb-2">
          This is a wine tasting simulation with a potential customer who is visiting your winery.
        </p>
        <div className="bg-purple-50 border-l-4 border-purple-500 p-3 my-3">
          <p className="font-medium">To start the tasting:</p>
          <p className="mt-1">Type <strong>GREET</strong> in the chat box below and press Enter.</p>
        </div>
        <p>
          The customer will approach your tasting counter, and you can begin guiding them through the tasting experience. Remember to:
        </p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Create a warm, welcoming atmosphere</li>
          <li>Showcase the unique qualities of each wine</li>
          <li>Tell the story of your winery and wine-making process</li>
          <li>Listen for buying signals and preferences</li>
          <li>End with a clear call to action (wine purchase, wine club, etc.)</li>
        </ul>
      </div>
      
      <button
        onClick={onDismiss}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md transition-colors"
      >
        Got it!
      </button>
    </div>
  );
};

export default WineTastingInstructions; 
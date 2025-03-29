import React from 'react';

const TopBar = () => {
  return (
    <div className="w-full bg-gray-200 p-4 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold">Board name #TXK5F2</h1>
      </div>
      <div className="flex items-center">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Add to</button>
        <div className="rounded-full bg-gray-400 w-8 h-8 mr-2"></div>
        <div className="rounded-full bg-gray-400 w-8 h-8 mr-2"></div>
        <div className="rounded-full bg-gray-400 w-8 h-8"></div>
      </div>
    </div>
  );
};

export default TopBar;

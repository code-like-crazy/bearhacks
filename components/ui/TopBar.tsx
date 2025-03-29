import React from "react";

const TopBar = () => {
  return (
    <div className="flex w-full items-center justify-between bg-gray-200 p-4">
      <div>
        <h1 className="text-lg font-bold">Board name #TXK5F2</h1>
      </div>
      <div className="flex items-center">
        <button className="mr-2 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Add to
        </button>
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-400"></div>
        <div className="mr-2 h-8 w-8 rounded-full bg-gray-400"></div>
        <div className="h-8 w-8 rounded-full bg-gray-400"></div>
      </div>
    </div>
  );
};

export default TopBar;

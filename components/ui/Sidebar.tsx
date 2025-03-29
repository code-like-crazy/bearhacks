import React from "react";

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-200 p-4">
      <h2 className="mb-2 text-lg font-bold">Boards</h2>
      <ul>
        <li>Board 1</li>
        <li>Board 2</li>
        <li>Board 3</li>
      </ul>
      <h2 className="mt-4 mb-2 text-lg font-bold">Chats</h2>
      <ul>
        <li>Chat 1</li>
        <li>Chat 2</li>
        <li>Chat 3</li>
      </ul>
    </div>
  );
};

export default Sidebar;

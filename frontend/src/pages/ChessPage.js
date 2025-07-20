import React from 'react';
import ChessBoard from '../components/ChessBoard';

const ChessPage = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="w-[600px] h-[600px]">
        <ChessBoard />
      </div>
    </div>
  );
};

export default ChessPage;

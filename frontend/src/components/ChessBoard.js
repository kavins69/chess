import React, { useState } from 'react';

const ChessBoard = () => {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const pieces = {
    '♜': '/assets/Chess_rdt60.png',
    '♞': '/assets/Chess_ndt60.png',
    '♝': '/assets/Chess_bdt60.png',
    '♛': '/assets/Chess_qdt60.png',
    '♚': '/assets/Chess_kdt60.png',
    '♟': '/assets/Chess_pdt60.png',
    '♖': '/assets/Chess_rlt60.png',
    '♘': '/assets/Chess_nlt60.png',
    '♗': '/assets/Chess_blt60.png',
    '♕': '/assets/Chess_qlt60.png',
    '♔': '/assets/Chess_klt60.png',
    '♙': '/assets/Chess_plt60.png'
  };

  const [board, setBoard] = useState([
    ['♜','♞','♝','♛','♚','♝','♞','♜'],
    ['♟','♟','♟','♟','♟','♟','♟','♟'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['♙','♙','♙','♙','♙','♙','♙','♙'],
    ['♖','♘','♗','♕','♔','♗','♘','♖'],
  ]);

  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ row: null, col: null });
  const [currentTurn, setCurrentTurn] = useState('white');

  const handleDragStart = (row, col) => {
    setDraggedPiece(board[row][col]);
    setDragStartPos({ row, col });
  };

  const getPieceColor = (piece) => {
    if (!piece) return null;
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♙'];
    const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♟'];
  
    if (whitePieces.includes(piece)) return 'white';
    if (blackPieces.includes(piece)) return 'black';
    return null;
  };

  const isPathClear = (board, fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
  
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
  
    while (currentRow !== toRow || currentCol !== toCol) {
      if (board[currentRow][currentCol] !== '') {
        return false;
      }
      currentRow += rowStep;
      currentCol += colStep;
    }
  
    return true;
  };
  
  const isChecked = (board, kingColor) => {
    let kingPosition = null;
  
    // 1. Find the king
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (
          (kingColor === 'white' && piece === '♔') ||
          (kingColor === 'black' && piece === '♚')
        ) {
          kingPosition = { row, col };
          break;
        }
      }
      if (kingPosition) break;
    }
  
    if (!kingPosition) return false;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && getPieceColor(piece) !== kingColor) {
          if (isValidMove(piece, row, col, kingPosition.row, kingPosition.col)) {
            return true;
          }
        }
      }
    }
    return false;
  };
 
  const doesMoveCheckOpponentKing = (board, fromRow, fromCol, toRow, toCol) => {
    const piece = board[fromRow][fromCol];
    const color = getPieceColor(piece);
    const opponentColor = color === 'white' ? 'black' : 'white';
  
    // Simulate the move
    const simulatedBoard = board.map(row => [...row]);
    simulatedBoard[toRow][toCol] = piece;
    simulatedBoard[fromRow][fromCol] = '';
  
    // Check if the opponent's king is in check
    return isChecked(simulatedBoard, opponentColor);
  };
  
  const isValidMove = (piece, fromRow, fromCol, toRow, toCol) => {
    const direction = piece === '♙' ? -1 : piece === '♟' ? 1 : 0;
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    if (board[toRow][toCol] !== '' && getPieceColor(piece) === getPieceColor(board[toRow][toCol])) {
        return false;
      }

    switch (piece) {
      case '♙': // White pawn
        return (
          (colDiff === 0 && rowDiff === -1 && board[toRow][toCol] === '') || // move forward
          (fromRow === 6 && colDiff === 0 && rowDiff === -2 && board[toRow][toCol] === '') || // double move from start
          (Math.abs(colDiff) === 1 && rowDiff === -1 && board[toRow][toCol] !== '') // capture
        );
      case '♟': // Black pawn
        return (
          (colDiff === 0 && rowDiff === 1 && board[toRow][toCol] === '') ||
          (fromRow === 1 && colDiff === 0 && rowDiff === 2 && board[toRow][toCol] === '') ||
          (Math.abs(colDiff) === 1 && rowDiff === 1 && board[toRow][toCol] !== '')
        );
      case '♖':
      case '♜': // Rook
        return (fromRow === toRow || fromCol === toCol) && isPathClear(board, fromRow, fromCol, toRow, toCol);
      case '♗':
      case '♝': // Bishop
        return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) && isPathClear(board, fromRow, fromCol, toRow, toCol);
      case '♘':
      case '♞': // Knight
        return (
          (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
          (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2)
        );
      case '♕':
      case '♛': // Queen
        return (
          fromRow === toRow ||
          fromCol === toCol ||
          Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)
        ) &&
        isPathClear(board, fromRow, fromCol, toRow, toCol);
      case '♔':
      case '♚': // King
        return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
      default:
        return false;
    }
  };
   

  const handleDrop = (targetRow, targetCol) => {
    if (draggedPiece !== null) {
      const { row: fromRow, col: fromCol } = dragStartPos;
      const pieceColor = getPieceColor(draggedPiece);
  
      if (pieceColor !== currentTurn) {
        setDraggedPiece(null);
        return;
      }
  
      if (isValidMove(draggedPiece, fromRow, fromCol, targetRow, targetCol)) {
        const newBoard = [...board.map(r => [...r])];
        newBoard[fromRow][fromCol] = '';
        newBoard[targetRow][targetCol] = draggedPiece;
  
        const checksOpponent = doesMoveCheckOpponentKing(board, fromRow, fromCol, targetRow, targetCol);
        if (checksOpponent) {
          console.log(`${pieceColor.toUpperCase()} puts opponent in CHECK!`);
        }
  
        setBoard(newBoard);
        setCurrentTurn(pieceColor === 'white' ? 'black' : 'white');
      }
  
      setDraggedPiece(null);
    }
  };
  

  return (
    <div className="grid grid-cols-8 w-full h-full max-w-[600px] max-h-[600px]">
      {board.flatMap((rowArr, row) =>
        rowArr.map((piece, col) => {
          const isDark = (row + col) % 2 === 1;
          const showLetter = row === 7;
          const showNumber = col === 0;
          const labelLetter = letters[col];
          const labelNumber = 8 - row;

          return (
            <div
              key={`${row}-${col}`}
              className={`relative aspect-square ${isDark ? 'bg-dark' : 'bg-light'} border border-gray-300 flex items-center justify-center`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(row, col)}
            >
              {piece && pieces[piece] && (
                <img
                  src={pieces[piece]}
                  alt={piece}
                  draggable
                  onDragStart={() => handleDragStart(row, col)}
                  className="w-15 h-15 select-none"
                />
              )}

              {showLetter && (
                <span className="absolute bottom-1 right-1 text-xs text-gray-600">
                  {labelLetter}
                </span>
              )}
              {showNumber && (
                <span className="absolute top-1 left-1 text-xs text-gray-600">
                  {labelNumber}
                </span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;

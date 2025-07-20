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

  const [castlingRights, setCastlingRights] = useState({
    white: { kingMoved: false, rookMoved: { left: false, right: false } },
    black: { kingMoved: false, rookMoved: { left: false, right: false } }
  });
  

  const [draggedPiece, setDraggedPiece] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ row: null, col: null });
  const [currentTurn, setCurrentTurn] = useState('white');
  const [enPassantTarget, setEnPassantTarget] = useState(null);
  const [checkStatus, setCheckStatus] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [touchPosition, setTouchPosition] = useState(null);

    const handleTouchStart = (e, row, col) => {
    handleDragStart(row, col);
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchMove = (e) => {
    e.preventDefault();
    };

    const handleTouchEnd = (e) => {
    if (!touchPosition) return;

    const touch = e.changedTouches[0];
    const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!targetElement) return;

    const cell = targetElement.closest('[data-row][data-col]');
    if (cell) {
        const row = parseInt(cell.getAttribute('data-row'));
        const col = parseInt(cell.getAttribute('data-col'));
        handleDrop(row, col);
    }

    setTouchPosition(null);
    };

  
  const handleDragStart = (row, col) => {
    const piece = board[row][col];
    setDraggedPiece(piece);
    setDragStartPos({ row, col });
  
    const possibleMoves = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (isValidMove(piece, row, col, r, c)) {
          const simulatedBoard = board.map(r => [...r]);
          simulatedBoard[r][c] = piece;
          simulatedBoard[row][col] = '';
          if (!isChecked(simulatedBoard, getPieceColor(piece))) {
            possibleMoves.push({ row: r, col: c });
          }
        }
      }
    }
    setValidMoves(possibleMoves);
  };
  

  const getPieceColor = (piece) => {
    if (!piece) return null;
    const whitePieces = ['♖', '♘', '♗', '♕', '♔', '♙'];
    const blackPieces = ['♜', '♞', '♝', '♛', '♚', '♟'];
  
    if (whitePieces.includes(piece)) return 'white';
    if (blackPieces.includes(piece)) return 'black';
    return null;
  };

  const isPathClear = (boardToUse, fromRow, fromCol, toRow, toCol) => {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);
  
    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;
  
    while (currentRow !== toRow || currentCol !== toCol) {
      if (boardToUse[currentRow][currentCol] !== '') {
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
            if (isValidMove(piece, row, col, kingPosition.row, kingPosition.col, board)) {
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
  
  const isValidMove = (
    piece,
    fromRow,
    fromCol,
    toRow,
    toCol,
    boardToUse = board
  ) => {
    if (!piece) return false;
  
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    const targetPiece = boardToUse[toRow][toCol];
  
    const pieceColor = getPieceColor(piece);
    const targetColor = getPieceColor(targetPiece);
  
    if (targetPiece && targetColor === pieceColor) return false;
  
    const absRow = Math.abs(rowDiff);
    const absCol = Math.abs(colDiff);
  
    const isEmpty = (r, c) => boardToUse[r][c] === '';
  
    // Helpers for en passant
    const isEnPassant = () => {
      if (!enPassantTarget) return false;
      return toRow === enPassantTarget.row && toCol === enPassantTarget.col;
    };
  
    switch (piece) {
      case '♙': { // White pawn
        if (colDiff === 0 && rowDiff === -1 && isEmpty(toRow, toCol)) return true;
        if (colDiff === 0 && fromRow === 6 && rowDiff === -2 && isEmpty(toRow, toCol) && isEmpty(fromRow - 1, fromCol)) return true;
        if (absCol === 1 && rowDiff === -1 && targetColor === 'black') return true;
        if (absCol === 1 && rowDiff === -1 && isEnPassant()) return true;
        return false;
      }
      case '♟': { // Black pawn
        if (colDiff === 0 && rowDiff === 1 && isEmpty(toRow, toCol)) return true;
        if (colDiff === 0 && fromRow === 1 && rowDiff === 2 && isEmpty(toRow, toCol) && isEmpty(fromRow + 1, fromCol)) return true;
        if (absCol === 1 && rowDiff === 1 && targetColor === 'white') return true;
        if (absCol === 1 && rowDiff === 1 && isEnPassant()) return true;
        return false;
      }
      case '♖':
      case '♜':
        return (fromRow === toRow || fromCol === toCol) && isPathClear(boardToUse, fromRow, fromCol, toRow, toCol);
      case '♗':
      case '♝':
        return absRow === absCol && isPathClear(boardToUse, fromRow, fromCol, toRow, toCol);
      case '♕':
      case '♛':
        return ((fromRow === toRow || fromCol === toCol || absRow === absCol) &&
          isPathClear(boardToUse, fromRow, fromCol, toRow, toCol));
      case '♘':
      case '♞':
        return (absRow === 2 && absCol === 1) || (absRow === 1 && absCol === 2);
      case '♔': {
        const normalMove = absRow <= 1 && absCol <= 1;
        const kingside = fromCol === 4 && toCol === 6;
        const queenside = fromCol === 4 && toCol === 2;
        const row = 7;
  
        if (normalMove) return true;
  
        if (fromRow === row && toRow === row) {
          if (
            kingside &&
            !castlingRights.white.kingMoved &&
            !castlingRights.white.rookMoved.right &&
            isEmpty(row, 5) && isEmpty(row, 6) &&
            isPathClear(boardToUse, row, 4, row, 7)
          ) {
            return true;
          }
          if (
            queenside &&
            !castlingRights.white.kingMoved &&
            !castlingRights.white.rookMoved.left &&
            isEmpty(row, 1) && isEmpty(row, 2) && isEmpty(row, 3) &&
            isPathClear(boardToUse, row, 4, row, 0)
          ) {
            return true;
          }
        }
  
        return false;
      }
      case '♚': {
        const normalMove = absRow <= 1 && absCol <= 1;
        const kingside = fromCol === 4 && toCol === 6;
        const queenside = fromCol === 4 && toCol === 2;
        const row = 0;
  
        if (normalMove) return true;
  
        if (fromRow === row && toRow === row) {
          if (
            kingside &&
            !castlingRights.black.kingMoved &&
            !castlingRights.black.rookMoved.right &&
            isEmpty(row, 5) && isEmpty(row, 6) &&
            isPathClear(boardToUse, row, 4, row, 7)
          ) {
            return true;
          }
          if (
            queenside &&
            !castlingRights.black.kingMoved &&
            !castlingRights.black.rookMoved.left &&
            isEmpty(row, 1) && isEmpty(row, 2) && isEmpty(row, 3) &&
            isPathClear(boardToUse, row, 4, row, 0)
          ) {
            return true;
          }
        }
  
        return false;
      }
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
  
      const tryMoveAndCheckResult = () => {
        const newBoard = board.map(row => [...row]);
        newBoard[fromRow][fromCol] = '';
        newBoard[targetRow][targetCol] = draggedPiece;
        return newBoard;
      };
      
      if (isValidMove(draggedPiece, fromRow, fromCol, targetRow, targetCol)) {
        const simulatedBoard = tryMoveAndCheckResult();
      
        const kingStillInCheck = isChecked(simulatedBoard, pieceColor);
      
        if (isChecked(board, pieceColor)) {
          // King is already in check, only allow unchecking moves
          if (kingStillInCheck) {
            setDraggedPiece(null);
            return; // ❌ this move doesn't fix the check
          }
        } else {
          // King is not in check, just prevent moving into check
          if (kingStillInCheck) {
            setDraggedPiece(null);
            return; // ❌ can't move into check
          }
        }
        const newBoard = simulatedBoard;
      
        if ((draggedPiece === '♙' || draggedPiece === '♟') && enPassantTarget) {
          if (
            targetRow === enPassantTarget.row &&
            targetCol === enPassantTarget.col
          ) {
            const dir = draggedPiece === '♙' ? 1 : -1;
            newBoard[targetRow + dir][targetCol] = ''; 
          }
        }
      
        if (draggedPiece === '♙' && fromRow === 6 && targetRow === 4) {
          setEnPassantTarget({ row: 5, col: fromCol });
        } else if (draggedPiece === '♟' && fromRow === 1 && targetRow === 3) {
          setEnPassantTarget({ row: 2, col: fromCol });
        } else {
          setEnPassantTarget(null);
        }

        // Castling move execution
        if (draggedPiece === '♔' && fromRow === 7 && fromCol === 4) {
            if (targetRow === 7 && targetCol === 6) {
            newBoard[7][5] = '♖'; // move rook
            newBoard[7][7] = '';
            } else if (targetRow === 7 && targetCol === 2) {
            newBoard[7][3] = '♖';
            newBoard[7][0] = '';
            }
        }
        if (draggedPiece === '♚' && fromRow === 0 && fromCol === 4) {
            if (targetRow === 0 && targetCol === 6) {
            newBoard[0][5] = '♜';
            newBoard[0][7] = '';
            } else if (targetRow === 0 && targetCol === 2) {
            newBoard[0][3] = '♜';
            newBoard[0][0] = '';
            }
        }
        const newRights = { ...castlingRights };

        if (draggedPiece === '♔') newRights.white.kingMoved = true;
        if (draggedPiece === '♚') newRights.black.kingMoved = true;
        if (draggedPiece === '♖') {
        if (fromRow === 7 && fromCol === 0) newRights.white.rookMoved.left = true;
        if (fromRow === 7 && fromCol === 7) newRights.white.rookMoved.right = true;
        }
        if (draggedPiece === '♜') {
        if (fromRow === 0 && fromCol === 0) newRights.black.rookMoved.left = true;
        if (fromRow === 0 && fromCol === 7) newRights.black.rookMoved.right = true;
        }
        setCastlingRights(newRights);

        if ((draggedPiece === '♙' && targetRow === 0) || (draggedPiece === '♟' && targetRow === 7)) {
            const tempBoard = [...newBoard];
            tempBoard[targetRow][targetCol] = draggedPiece; // temporary pawn
            setBoard(tempBoard);
            setPromotion({
              row: targetRow,
              col: targetCol,
              color: getPieceColor(draggedPiece),
            });
            setDraggedPiece(null);
            setValidMoves([]);
            return;
          }        
      
        const checksOpponent = doesMoveCheckOpponentKing(board, fromRow, fromCol, targetRow, targetCol);
        if (checksOpponent) {
          setCheckStatus(`CHECK: ${pieceColor.toUpperCase()} puts opponent in check!`);
        } else {
          setCheckStatus(null);
        }
      
        setBoard(newBoard);
        const isMate = isCheckmate(newBoard, currentTurn === 'white' ? 'black' : 'white');
            if (isMate) {
            setCheckStatus(`CHECKMATE: ${currentTurn.toUpperCase()} wins!`);
            }

        setCurrentTurn(pieceColor === 'white' ? 'black' : 'white');
      }
      
      setDraggedPiece(null);
        setValidMoves([]);
    }
  };

  const isCheckmate = (board, playerColor) => {
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (!piece || getPieceColor(piece) !== playerColor) continue;
  
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            if (!isValidMove(piece, fromRow, fromCol, toRow, toCol, board)) continue;
  
            // Simulate move
            const simulatedBoard = board.map(r => [...r]);
            simulatedBoard[toRow][toCol] = piece;
            simulatedBoard[fromRow][fromCol] = '';

            if (!isChecked(simulatedBoard, playerColor)) {
            return false; // This move saves the king
            }           
          }
        }
      }
    }
  
    return true; 
  }; 

  const handlePromotion = (selectedPieceSymbol) => {
    const newBoard = board.map(row => row.slice());
    const { row, col, color } = promotion;
  
    const promotedPiece = selectedPieceSymbol;
    newBoard[row][col] = promotedPiece;
  
    setBoard(newBoard);
    setPromotion(null);
    setCurrentTurn(color === 'white' ? 'black' : 'white');
  
    const check = isChecked(newBoard, color === 'white' ? 'black' : 'white');
    if (check) {
      setCheckStatus(`${(color === 'white' ? 'Black' : 'White')} is in check`);
    } else {
      setCheckStatus('');
    }
  }; 
  
  return (
    <div>
    <div className="mb-2">
        <h2 className="text-lg font-semibold">{currentTurn.toUpperCase()}'s turn</h2>
        {checkStatus && (
            <p className="text-red-600 font-bold text-sm">{checkStatus}</p>
        )}
        </div>
    <div className="grid grid-cols-8 w-full h-full max-w-[600px] max-h-[600px]">
      {board.flatMap((rowArr, row) =>
        rowArr.map((piece, col) => {
          const isDark = (row + col) % 2 === 1;
          const showLetter = row === 7;
          const showNumber = col === 0;
          const labelLetter = letters[col];
          const labelNumber = 8 - row;
          const isHighlighted = validMoves.some(m => m.row === row && m.col === col);

          return (
            <div
                key={`${row}-${col}`}
                data-row={row}
                data-col={col}
                className={`relative aspect-square ${isDark ? 'bg-dark' : 'bg-light'} border border-gray-300 flex items-center justify-center`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(row, col)}
                >
            {isHighlighted && (
                <div className="absolute w-3 h-3 rounded-full bg-yellow-400 opacity-80 z-10" />
              )}              
              {piece && pieces[piece] && (
                <img
                    src={pieces[piece]}
                    alt={piece}
                    draggable
                    onDragStart={(e) => handleDragStart(row, col)}
                    onTouchStart={(e) => handleTouchStart(e, row, col)}
                    onTouchMove={(e) => handleTouchMove(e)}
                    onTouchEnd={(e) => handleTouchEnd(e)}
                    className="w-15 h-15 select-none touch-none"
                    />
              )}

              {promotion && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-72 sm:w-80 text-center">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Choose Promotion</h2>
                    <div className="grid grid-cols-4 gap-4">
                      {['q', 'r', 'b', 'n'].map(type => {
                        const pieceMap = {
                          q: promotion.color === 'white' ? '♕' : '♛',
                          r: promotion.color === 'white' ? '♖' : '♜',
                          b: promotion.color === 'white' ? '♗' : '♝',
                          n: promotion.color === 'white' ? '♘' : '♞',
                        };
                        const symbol = pieceMap[type];
                        const imgSrc = pieces[symbol];
              
                        return (
                          <button
                            key={type}
                            className="transform hover:scale-105 transition-transform duration-200 ease-in-out"
                            onClick={() => handlePromotion(symbol)}
                          >
                            <img
                              src={imgSrc}
                              alt={symbol}
                              className="w-14 h-14 border-2 border-gray-300 rounded-lg hover:border-indigo-500 shadow-sm"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

export default ChessBoard;

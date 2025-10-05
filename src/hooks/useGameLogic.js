import { useState, useCallback } from 'react';

export const useGameLogic = () => {
  const [board, setBoard] = useState({
    player1Houses: [4, 4, 4, 4, 4, 4],
    player2Houses: [4, 4, 4, 4, 4, 4],
    player1Store: 0,
    player2Store: 0
  });
  
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winner, setWinner] = useState(null);

  const getTotalSeeds = useCallback((player) => {
    if (player === 1) {
      return board.player1Houses.reduce((a, b) => a + b, 0) + board.player1Store;
    } else {
      return board.player2Houses.reduce((a, b) => a + b, 0) + board.player2Store;
    }
  }, [board]);

  const canPlayerMove = useCallback((player, boardState = board) => {
    if (player === 1) {
      return boardState.player1Houses.some(house => house > 0);
    } else {
      return boardState.player2Houses.some(house => house > 0);
    }
  }, [board]);

  const checkGameEnd = useCallback((newBoard) => {
    const player1Total = newBoard.player1Houses.reduce((a, b) => a + b, 0);
    const player2Total = newBoard.player2Houses.reduce((a, b) => a + b, 0);
    
    if (player1Total === 0 || player2Total === 0) {
      const finalBoard = {
        ...newBoard,
        player1Store: newBoard.player1Store + (player1Total > 0 ? player1Total : 0),
        player2Store: newBoard.player2Store + (player2Total > 0 ? player2Total : 0),
        player1Houses: [0, 0, 0, 0, 0, 0],
        player2Houses: [0, 0, 0, 0, 0, 0]
      };
      
      setBoard(finalBoard);
      
      if (finalBoard.player1Store > finalBoard.player2Store) {
        setWinner(1);
      } else if (finalBoard.player2Store > finalBoard.player1Store) {
        setWinner(2);
      } else {
        setWinner(0);
      }
      
      setGameStatus('ended');
      return { gameEnded: true, finalBoard };
    }
    return { gameEnded: false };
  }, []);

  const resetGame = useCallback(() => {
    setBoard({
      player1Houses: [4, 4, 4, 4, 4, 4],
      player2Houses: [4, 4, 4, 4, 4, 4],
      player1Store: 0,
      player2Store: 0
    });
    setCurrentPlayer(1);
    setGameStatus('playing');
    setWinner(null);
  }, []);

  return {
    board,
    setBoard,
    currentPlayer,
    setCurrentPlayer,
    gameStatus,
    setGameStatus,
    winner,
    setWinner,
    getTotalSeeds,
    canPlayerMove,
    checkGameEnd,
    resetGame
  };
};

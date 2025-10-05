// Game logic utilities for Gebeta

export const getHousePosition = (player, index) => {
  return `${player === 1 ? 'p1' : 'p2'}-house-${index}`;
};

export const getStorePosition = (player) => {
  return `${player === 1 ? 'p1' : 'p2'}-store`;
};

export const calculateMovePath = (houseIndex, seeds, currentPlayer) => {
  const path = [];
  let currentPos = houseIndex;
  let currentSide = currentPlayer;
  
  for (let i = 0; i < seeds; i++) {
    if (currentSide === 1) {
      currentPos = (currentPos + 1) % 7;
      if (currentPos < 6) {
        path.push(getHousePosition(1, currentPos));
      } else {
        path.push(getStorePosition(1));
        currentSide = 2;
        currentPos = -1;
      }
    } else {
      currentPos = (currentPos + 1) % 7;
      if (currentPos < 6) {
        path.push(getHousePosition(2, currentPos));
      } else {
        if (currentPlayer === 2) {
          path.push(getStorePosition(2));
        }
        currentSide = 1;
        currentPos = -1;
      }
    }
  }
  
  return path;
};

export const processMoveResult = (houseIndex, seeds, currentPlayer, board) => {
  const newBoard = { ...board };
  let currentPos = houseIndex;
  let currentSide = currentPlayer;
  let anotherTurn = false;
  
  // Validate input
  if (seeds <= 0 || houseIndex < 0 || houseIndex > 5) {
    return { newBoard, anotherTurn: false };
  }
  
  // Distribute seeds
  for (let i = 0; i < seeds; i++) {
    if (currentSide === 1) {
      currentPos++;
      if (currentPos > 5) {
        newBoard.player1Store++;
        if (i === seeds - 1) {
          anotherTurn = true;
        }
        currentPos = 0;
        currentSide = 2;
      } else {
        newBoard.player1Houses[currentPos]++;
        // Check for capture
        if (i === seeds - 1 && newBoard.player1Houses[currentPos] === 1 && currentPlayer === 1) {
          const oppositeHouse = 5 - currentPos;
          if (newBoard.player2Houses[oppositeHouse] > 0) {
            newBoard.player1Store += newBoard.player2Houses[oppositeHouse] + 1;
            newBoard.player1Houses[currentPos] = 0;
            newBoard.player2Houses[oppositeHouse] = 0;
          }
        }
      }
    } else {
      currentPos++;
      if (currentPos > 5) {
        newBoard.player2Store++;
        if (currentPlayer === 2 && i === seeds - 1) {
          anotherTurn = true;
        }
        currentPos = 0;
        currentSide = 1;
      } else {
        newBoard.player2Houses[currentPos]++;
        // Check for capture
        if (i === seeds - 1 && newBoard.player2Houses[currentPos] === 1 && currentPlayer === 2) {
          const oppositeHouse = 5 - currentPos;
          if (newBoard.player1Houses[oppositeHouse] > 0) {
            newBoard.player2Store += newBoard.player1Houses[oppositeHouse] + 1;
            newBoard.player2Houses[currentPos] = 0;
            newBoard.player1Houses[oppositeHouse] = 0;
          }
        }
      }
    }
  }
  
  return { newBoard, anotherTurn };
};

export const getComputerMove = (board, player) => {
  const houses = player === 1 ? board.player1Houses : board.player2Houses;
  let bestIdx = -1;
  let maxSeeds = -1;
  let storeMoveIdx = -1;
  
  for (let i = 0; i < houses.length; i++) {
    const seeds = houses[i];
    if (seeds > 0) {
      // Check if this move lands in the store
      if (seeds === (5 - i + 1)) {
        storeMoveIdx = i;
      }
      if (seeds > maxSeeds) {
        maxSeeds = seeds;
        bestIdx = i;
      }
    }
  }
  
  // Prefer move that lands in store, else pick house with most seeds
  return storeMoveIdx !== -1 ? storeMoveIdx : bestIdx;
};

export const createGameResult = (board, playerNames, winner) => {
  return {
    date: new Date().toLocaleString(),
    player1: playerNames[1] || 'Player 1',
    player2: playerNames[2] || 'Player 2',
    score1: board.player1Store,
    score2: board.player2Store,
    winner: winner === 0 ? 'Tie' : 
            winner === 1 ? (playerNames[1] || 'Player 1') : 
            (playerNames[2] || 'Player 2')
  };
};

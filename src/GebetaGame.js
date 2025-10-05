import React, { useState, useEffect, useCallback } from 'react';
import Tooltip from './components/Tooltip';
import GameResultsTable from './components/GameResultsTable';
import HighestScorer from './components/HighestScorer';
import RulesPanel from './components/RulesPanel';
import PlayerNameInput from './components/PlayerNameInput';
import CulturalNote from './components/CulturalNote';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameStatus from './components/GameStatus';
import GameEndModal from './components/GameEndModal';

// Custom hooks
import { useGameLogic } from './hooks/useGameLogic';
import { useWebSocket } from './hooks/useWebSocket';
import { useGameResults } from './hooks/useGameResults';
import { useSounds } from './hooks/useSounds';

// Utils
import { 
  calculateMovePath, 
  processMoveResult, 
  getComputerMove, 
  createGameResult 
} from './utils/gameUtils';

const GebetaGame = () => {
  // Custom hooks for game logic
  const {
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
    resetGame: resetGameLogic
  } = useGameLogic();

  const {
    gameResults,
    highestScorer,
    saveGameResult,
    clearResults
  } = useGameResults();

  const {
    clickSoundRef,
    finishSoundRef,
    clapSoundRef,
    playSound
  } = useSounds();

  // Local state
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameLog, setGameLog] = useState(['Game started! Player 1 begins.']);
  const [showRules, setShowRules] = useState(false);
  const [movingSeed, setMovingSeed] = useState(null);
  const [moveAnimationStep, setMoveAnimationStep] = useState(0);
  const [movePath, setMovePath] = useState([]);
  const [playerNames, setPlayerNames] = useState({ 1: '', 2: '' });
  const [nameInputVisible, setNameInputVisible] = useState(true);
  const [onlineMode, setOnlineMode] = useState(false);
  const [computerSelectedHouse, setComputerSelectedHouse] = useState(null);

  // WebSocket hook
  const {
    ws,
    gameId,
    setGameId,
    isHost,
    onlineStatus,
    onlineError,
    setOnlineError,
    remotePlayerJoined,
    createGame,
    joinGame,
    sendMove,
    disconnect
  } = useWebSocket(addToLog);

  const addToLog = useCallback((message) => {
    setGameLog(prev => [...prev.slice(-4), message]);
  }, []);

  // Game control handlers
  const handleCreateGame = useCallback(() => {
    createGame(board);
  }, [createGame, board]);

  const handleJoinGame = useCallback((id) => {
    joinGame(id);
  }, [joinGame]);

  const makeMove = useCallback((houseIndex) => {
    if (isAnimating || gameStatus === 'ended' || selectedHouse !== null) return;
    
    // Check if it's the player's turn in online mode
    if (onlineMode && onlineStatus === 'playing') {
      if (!((isHost && currentPlayer === 1) || (!isHost && currentPlayer === 2))) {
        return;
      }
    }

    // Get seeds from the house
    let seeds = 0;
    let newBoard = { ...board };
    if (currentPlayer === 1) {
      if (newBoard.player1Houses[houseIndex] === 0) return;
      seeds = newBoard.player1Houses[houseIndex];
      newBoard.player1Houses[houseIndex] = 0;
    } else {
      if (newBoard.player2Houses[houseIndex] === 0) return;
      seeds = newBoard.player2Houses[houseIndex];
      newBoard.player2Houses[houseIndex] = 0;
    }

    setIsAnimating(true);
    setSelectedHouse({ player: currentPlayer, house: houseIndex });

    // Calculate move path
    const path = calculateMovePath(houseIndex, seeds, currentPlayer);
    setMovePath(path);
    setMoveAnimationStep(0);
    setMovingSeed({ player: currentPlayer, house: houseIndex });

    // Animate seed movement
    const animateSeed = (step) => {
      setMoveAnimationStep(step);
      if (step < path.length) {
        // Increment the seed count in the target house/store immediately for animation
        let target = path[step];
        let tempBoard = { ...newBoard };
        if (target.startsWith('p1-house-')) {
          const idx = parseInt(target.split('-')[2]);
          tempBoard.player1Houses[idx]++;
        } else if (target.startsWith('p2-house-')) {
          const idx = parseInt(target.split('-')[2]);
          tempBoard.player2Houses[idx]++;
        } else if (target === 'p1-store') {
          tempBoard.player1Store++;
        } else if (target === 'p2-store') {
          tempBoard.player2Store++;
        }
        setBoard(tempBoard);
        setTimeout(() => animateSeed(step + 1), 400);
      } else {
        // After animation, process the move result
        const { newBoard: finalBoard, anotherTurn } = processMoveResult(houseIndex, seeds, currentPlayer, newBoard);
        setBoard(finalBoard);
        
        if (!checkGameEnd(finalBoard)) {
          if (!anotherTurn) {
            const nextPlayer = currentPlayer === 1 ? 2 : 1;
            if (canPlayerMove(nextPlayer, finalBoard)) {
              setCurrentPlayer(nextPlayer);
              addToLog(`Player ${nextPlayer}'s turn`);
            } else {
              addToLog(`Player ${nextPlayer} has no moves - Player ${currentPlayer} continues`);
            }
          } else {
            addToLog(`Player ${currentPlayer} gets another turn!`);
          }
        } else {
          // Game ended, save result
          const result = createGameResult(finalBoard, playerNames, winner);
          saveGameResult(result);
          addToLog(winner === 0 ? '🤝 Game ends in a tie!' : `🏆 ${playerNames[winner] || `Player ${winner}`} wins the game!`);
        }
        
        setSelectedHouse(null);
        setIsAnimating(false);
        setMovingSeed(null);
        setMovePath([]);
        setMoveAnimationStep(0);
        
        // Send move to server if online
        if (onlineMode) {
          sendMove(finalBoard);
        }
      }
    };
    animateSeed(0);
  }, [
    isAnimating, gameStatus, selectedHouse, onlineMode, onlineStatus, isHost, currentPlayer,
    board, setBoard, checkGameEnd, canPlayerMove, setCurrentPlayer, addToLog, playerNames,
    winner, saveGameResult, sendMove
  ]);

  const resetGame = useCallback(() => {
    resetGameLogic();
    setSelectedHouse(null);
    setIsAnimating(false);
    setGameLog(['Game restarted! Player 1 begins.']);
  }, [resetGameLogic]);

  const handleNameChange = useCallback((player, value) => {
    setPlayerNames(prev => ({ ...prev, [player]: value }));
  }, []);

  const handleStartGame = useCallback(() => {
    setNameInputVisible(false);
  }, []);

  const startNewGame = useCallback(() => {
    setNameInputVisible(true);
    resetGameLogic();
    setSelectedHouse(null);
    setIsAnimating(false);
    setGameLog(['Game restarted! Player 1 begins.']);
  }, [resetGameLogic]);

  const renderSeeds = (count, houseId) => {
    if (count === 0) return null;
    const seeds = [];
    for (let i = 0; i < Math.min(count, 20); i++) {
      seeds.push(
        <div
          key={i}
          className="w-2 h-2 bg-amber-600 rounded-full shadow-sm"
          style={{
            position: 'absolute',
            left: `${20 + (i % 5) * 15}%`,
            top: `${20 + Math.floor(i / 5) * 20}%`,
            transition: 'all 0.2s',
          }}
        />
      );
    }
    if (count > 20) {
      seeds.push(
        <div key="overflow" className="absolute bottom-1 right-1 text-xs font-bold text-amber-800">
          +{count - 20}
        </div>
      );
    }
    // Animated moving seed
    if (movingSeed && movePath[moveAnimationStep - 1] === houseId) {
      seeds.push(
        <div
          key="moving"
          className="w-4 h-4 bg-yellow-400 rounded-full shadow-lg animate-bounce"
          style={{ position: 'absolute', left: '40%', top: '40%', zIndex: 10 }}
        />
      );
    }
    return seeds;
  };

  // Computer move logic
  useEffect(() => {
    if (!onlineMode && !nameInputVisible && playerNames[2] === '' && currentPlayer === 2 && gameStatus === 'playing' && canPlayerMove(2)) {
      const idx = getComputerMove(board, 2);
      if (idx !== -1) {
        setComputerSelectedHouse(idx);
        const timeout = setTimeout(() => {
          makeMove(idx);
          setTimeout(() => setComputerSelectedHouse(null), 800);
        }, 1800);
        return () => {
          clearTimeout(timeout);
          setComputerSelectedHouse(null);
        };
      }
    }
  }, [currentPlayer, board, onlineMode, nameInputVisible, playerNames, gameStatus, canPlayerMove, makeMove]);

  // Play sound on pit click
  const handlePitClick = useCallback((houseIndex, player) => {
    if ((player === 1 && currentPlayer === 1) || (player === 2 && currentPlayer === 2)) {
      playSound(clickSoundRef);
      makeMove(houseIndex);
    }
  }, [currentPlayer, playSound, makeMove, clickSoundRef]);

  // Play sound on game end
  useEffect(() => {
    if (gameStatus === 'ended') {
      playSound(finishSoundRef);
      if (winner && winner !== 0) {
        setTimeout(() => {
          playSound(clapSoundRef);
        }, 800);
      }
    }
  }, [gameStatus, winner, playSound, finishSoundRef, clapSoundRef]);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-8 border border-amber-100">
        {/* Game Controls */}
        <GameControls
          onlineMode={onlineMode}
          setOnlineMode={setOnlineMode}
          onlineStatus={onlineStatus}
          gameId={gameId}
          setGameId={setGameId}
          onlineError={onlineError}
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onResetGame={resetGame}
          onToggleRules={() => setShowRules(!showRules)}
          showRules={showRules}
        />
        {/* Player Name Input */}
        {nameInputVisible && (
          <div className="w-full max-w-md mx-auto">
            <PlayerNameInput
              playerNames={playerNames}
              handleNameChange={handleNameChange}
              handleStartGame={handleStartGame}
            />
          </div>
        )}
        
        {/* Highest Scorer Display */}
        <div className="w-full max-w-md mx-auto mb-2 sm:mb-4">
          <HighestScorer highestScorer={highestScorer} />
        </div>
        
        {/* Rules Panel */}
        {showRules && <div className="w-full max-w-lg mx-auto"><RulesPanel /></div>}
        
        {/* Game Status */}
        <GameStatus
          board={board}
          playerNames={playerNames}
          nameInputVisible={nameInputVisible}
          gameStatus={gameStatus}
          winner={winner}
        />
        {/* Game Board */}
        <GameBoard
          board={board}
          currentPlayer={currentPlayer}
          selectedHouse={selectedHouse}
          isAnimating={isAnimating}
          computerSelectedHouse={computerSelectedHouse}
          playerNames={playerNames}
          nameInputVisible={nameInputVisible}
          movingSeed={movingSeed}
          movePath={movePath}
          moveAnimationStep={moveAnimationStep}
          onHouseClick={handlePitClick}
          renderSeeds={renderSeeds}
        />
        {/* Game End Modal */}
        <GameEndModal
          gameStatus={gameStatus}
          winner={winner}
          playerNames={playerNames}
          board={board}
          onPlayAgain={resetGame}
          onExit={startNewGame}
        />
        
        {/* Game Results History */}
        <div className="w-full max-w-2xl mx-auto">
          <GameResultsTable gameResults={gameResults} />
        </div>
        
        {/* New Game Button */}
        <div className="mt-2 flex justify-center w-full">
          <Tooltip text="Start a new game with new names">
            <button
              onClick={startNewGame}
              className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 font-bold shadow text-xs sm:text-base min-w-[100px]"
              style={{ fontSize: '1rem', minHeight: '40px' }}
            >
              New Game
            </button>
          </Tooltip>
        </div>
        
        {/* Cultural Note */}
        <div className="mt-6 w-full max-w-lg mx-auto">
          <CulturalNote />
        </div>
      </div>
    </div>
  );
};

export default GebetaGame;

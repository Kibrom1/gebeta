import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy, Info, Users, Link2, Loader2 } from 'lucide-react';
import PlayerAvatar from './components/PlayerAvatar';
import Tooltip from './components/Tooltip';
import GameLog from './components/GameLog';
import GameResultsTable from './components/GameResultsTable';
import HighestScorer from './components/HighestScorer';
import RulesPanel from './components/RulesPanel';
import PlayerNameInput from './components/PlayerNameInput';
import GameEndPanel from './components/GameEndPanel';
import CulturalNote from './components/CulturalNote';

const WS_SERVER_URL = 'https://gebeta-ws-server.fly.dev/'; // Use your actual public WebSocket server URL here

const GebetaGame = () => {
  // Game state - 12 houses (6 per player) + 2 stores
  const [board, setBoard] = useState({
    player1Houses: [4, 4, 4, 4, 4, 4], // Bottom row (left to right)
    player2Houses: [4, 4, 4, 4, 4, 4], // Top row (right to left)
    player1Store: 0, // Right side
    player2Store: 0  // Left side
  });
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, ended
  const [winner, setWinner] = useState(null);
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameLog, setGameLog] = useState(['Game started! Player 1 begins.']);
  const [showRules, setShowRules] = useState(false);
  const [movingSeed, setMovingSeed] = useState(null); // For animation
  const [moveAnimationStep, setMoveAnimationStep] = useState(0);
  const [movePath, setMovePath] = useState([]);
  const [playerNames, setPlayerNames] = useState({ 1: '', 2: '' });
  const [nameInputVisible, setNameInputVisible] = useState(true);
  const [gameResults, setGameResults] = useState([]); // In-memory list
  const [highestScorer, setHighestScorer] = useState(null);
  const [onlineMode, setOnlineMode] = useState(false); // Placeholder for online play
  const [ws, setWs] = useState(null);
  const [gameId, setGameId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const [onlineStatus, setOnlineStatus] = useState('idle'); // idle, waiting, playing
  const wsRef = useRef(null);
  const [remotePlayerJoined, setRemotePlayerJoined] = useState(false);
  const [computerSelectedHouse, setComputerSelectedHouse] = useState(null);

  const addToLog = (message) => {
    setGameLog(prev => [...prev.slice(-4), message]);
  };

  const getTotalSeeds = (player) => {
    if (player === 1) {
      return board.player1Houses.reduce((a, b) => a + b, 0) + board.player1Store;
    } else {
      return board.player2Houses.reduce((a, b) => a + b, 0) + board.player2Store;
    }
  };

  const checkGameEnd = (newBoard) => {
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
        addToLog('🏆 Player 1 wins the game!');
      } else if (finalBoard.player2Store > finalBoard.player1Store) {
        setWinner(2);
        addToLog('🏆 Player 2 wins the game!');
      } else {
        setWinner(0);
        addToLog('🤝 Game ends in a tie!');
      }
      setGameStatus('ended');

      let result = {
        date: new Date().toLocaleString(),
        player1: playerNames[1] || 'Player 1',
        player2: playerNames[2] || 'Player 2',
        score1: finalBoard.player1Store,
        score2: finalBoard.player2Store,
        winner: finalBoard.player1Store > finalBoard.player2Store ? playerNames[1] || 'Player 1' : finalBoard.player2Store > finalBoard.player1Store ? playerNames[2] || 'Player 2' : 'Tie',
      };
      saveGameResult(result);

      return true;
    }
    return false;
  };

  const canPlayerMove = (player, boardState = board) => {
    if (player === 1) {
      return boardState.player1Houses.some(house => house > 0);
    } else {
      return boardState.player2Houses.some(house => house > 0);
    }
  };

  // Helper to get house position for animation
  const getHousePosition = (player, index) => {
    // Returns a unique string for each house/store for animation targeting
    return `${player === 1 ? 'p1' : 'p2'}-house-${index}`;
  };
  const getStorePosition = (player) => {
    return `${player === 1 ? 'p1' : 'p2'}-store`;
  };

  // Connect to WebSocket server
  const connectWebSocket = () => {
    if (wsRef.current) return;
    const socket = new window.WebSocket(WS_SERVER_URL);
    wsRef.current = socket;
    setWs(socket);
    socket.onopen = () => {
      setOnlineStatus('waiting');
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'created') {
        setGameId(data.gameId);
        setIsHost(true);
        setOnlineStatus('waiting');
        addToLog('Game created. Waiting for opponent to join...');
      } else if (data.type === 'start') {
        setOnlineStatus('playing');
        setRemotePlayerJoined(true);
        setBoard(data.state);
        addToLog('Opponent joined. Game started!');
      } else if (data.type === 'update') {
        setBoard(data.state);
        addToLog('Opponent made a move.');
      } else if (data.type === 'error') {
        setOnlineError(data.message);
        addToLog('Error: ' + data.message);
      } else if (data.type === 'joined') {
        setOnlineStatus('playing');
        setRemotePlayerJoined(true);
        addToLog('Joined game. Waiting for host to start.');
      }
    };
    socket.onclose = () => {
      setWs(null);
      wsRef.current = null;
      setOnlineStatus('idle');
      setRemotePlayerJoined(false);
      addToLog('Disconnected from server.');
    };
  };

  // Create or join game
  const handleCreateGame = () => {
    connectWebSocket();
    setTimeout(() => {
      wsRef.current && wsRef.current.send(JSON.stringify({ type: 'create', state: board }));
    }, 500);
  };
  const handleJoinGame = (id) => {
    connectWebSocket();
    setTimeout(() => {
      wsRef.current && wsRef.current.send(JSON.stringify({ type: 'join', gameId: id }));
    }, 500);
  };

  // Send move to server
  const sendMove = (newBoard) => {
    if (wsRef.current && gameId) {
      wsRef.current.send(JSON.stringify({ type: 'move', gameId, state: newBoard }));
    }
  };

  const makeMove = (houseIndex) => {
    if (isAnimating || gameStatus === 'ended' || selectedHouse !== null) return;
    if (onlineMode && wsRef.current && onlineStatus === 'playing') {
      // Only allow local player to move on their turn
      if ((isHost && currentPlayer === 1) || (!isHost && currentPlayer === 2)) {
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

        // Prepare animation path
        let path = [];
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
            setTimeout(() => animateSeed(step + 1), 400); // 400ms per seed (slower)
          } else {
            // After animation, update board for captures and turn logic
            let currentPos = houseIndex;
            let currentSide = currentPlayer;
            let anotherTurn = false;
            for (let i = 0; i < seeds; i++) {
              if (currentSide === 1) {
                currentPos++;
                if (currentPos > 5) {
                  // Already incremented store above
                  if (i === seeds - 1) {
                    anotherTurn = true;
                  }
                  currentPos = 0;
                  currentSide = 2;
                } else {
                  // Already incremented house above
                  if (i === seeds - 1 && newBoard.player1Houses[currentPos] === 1 && currentPlayer === 1) {
                    const oppositeHouse = 5 - currentPos;
                    if (newBoard.player2Houses[oppositeHouse] > 0) {
                      newBoard.player1Store += newBoard.player2Houses[oppositeHouse] + 1;
                      newBoard.player1Houses[currentPos] = 0;
                      newBoard.player2Houses[oppositeHouse] = 0;
                      addToLog(`Player 1 captured ${newBoard.player2Houses[oppositeHouse] + 1} seeds!`);
                    }
                  }
                }
              } else {
                currentPos++;
                if (currentPos > 5) {
                  // Already incremented store above
                  if (currentPlayer === 2 && i === seeds - 1) {
                    anotherTurn = true;
                  }
                  currentPos = 0;
                  currentSide = 1;
                } else {
                  // Already incremented house above
                  if (i === seeds - 1 && newBoard.player2Houses[currentPos] === 1 && currentPlayer === 2) {
                    const oppositeHouse = 5 - currentPos;
                    if (newBoard.player1Houses[oppositeHouse] > 0) {
                      newBoard.player2Store += newBoard.player1Houses[oppositeHouse] + 1;
                      newBoard.player2Houses[currentPos] = 0;
                      newBoard.player1Houses[oppositeHouse] = 0;
                      addToLog(`Player 2 captured ${newBoard.player1Houses[oppositeHouse] + 1} seeds!`);
                    }
                  }
                }
              }
            }
            setBoard(newBoard);
            if (!checkGameEnd(newBoard)) {
              if (!anotherTurn) {
                const nextPlayer = currentPlayer === 1 ? 2 : 1;
                if (canPlayerMove(nextPlayer, newBoard)) {
                  setCurrentPlayer(nextPlayer);
                  addToLog(`Player ${nextPlayer}'s turn`);
                } else {
                  addToLog(`Player ${nextPlayer} has no moves - Player ${currentPlayer} continues`);
                }
              } else {
                addToLog(`Player ${currentPlayer} gets another turn!`);
              }
            }
            setSelectedHouse(null);
            setIsAnimating(false);
            setMovingSeed(null);
            setMovePath([]);
            setMoveAnimationStep(0);
            // Send move to server
            sendMove(newBoard);
          }
        };
        animateSeed(0);
      }
    } else if (!onlineMode) {
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

      // Prepare animation path
      let path = [];
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
          setTimeout(() => animateSeed(step + 1), 400); // 400ms per seed (slower)
        } else {
          // After animation, update board for captures and turn logic
          let currentPos = houseIndex;
          let currentSide = currentPlayer;
          let anotherTurn = false;
          for (let i = 0; i < seeds; i++) {
            if (currentSide === 1) {
              currentPos++;
              if (currentPos > 5) {
                // Already incremented store above
                if (i === seeds - 1) {
                  anotherTurn = true;
                }
                currentPos = 0;
                currentSide = 2;
              } else {
                // Already incremented house above
                if (i === seeds - 1 && newBoard.player1Houses[currentPos] === 1 && currentPlayer === 1) {
                  const oppositeHouse = 5 - currentPos;
                  if (newBoard.player2Houses[oppositeHouse] > 0) {
                    newBoard.player1Store += newBoard.player2Houses[oppositeHouse] + 1;
                    newBoard.player1Houses[currentPos] = 0;
                    newBoard.player2Houses[oppositeHouse] = 0;
                    addToLog(`Player 1 captured ${newBoard.player2Houses[oppositeHouse] + 1} seeds!`);
                  }
                }
              }
            } else {
              currentPos++;
              if (currentPos > 5) {
                // Already incremented store above
                if (currentPlayer === 2 && i === seeds - 1) {
                  anotherTurn = true;
                }
                currentPos = 0;
                currentSide = 1;
              } else {
                // Already incremented house above
                if (i === seeds - 1 && newBoard.player2Houses[currentPos] === 1 && currentPlayer === 2) {
                  const oppositeHouse = 5 - currentPos;
                  if (newBoard.player1Houses[oppositeHouse] > 0) {
                    newBoard.player2Store += newBoard.player1Houses[oppositeHouse] + 1;
                    newBoard.player2Houses[currentPos] = 0;
                    newBoard.player1Houses[oppositeHouse] = 0;
                    addToLog(`Player 2 captured ${newBoard.player1Houses[oppositeHouse] + 1} seeds!`);
                  }
                }
              }
            }
          }
          setBoard(newBoard);
          if (!checkGameEnd(newBoard)) {
            if (!anotherTurn) {
              const nextPlayer = currentPlayer === 1 ? 2 : 1;
              if (canPlayerMove(nextPlayer, newBoard)) {
                setCurrentPlayer(nextPlayer);
                addToLog(`Player ${nextPlayer}'s turn`);
              } else {
                addToLog(`Player ${nextPlayer} has no moves - Player ${currentPlayer} continues`);
              }
            } else {
              addToLog(`Player ${currentPlayer} gets another turn!`);
            }
          }
          setSelectedHouse(null);
          setIsAnimating(false);
          setMovingSeed(null);
          setMovePath([]);
          setMoveAnimationStep(0);
        }
      };
      animateSeed(0);
    }
  };

  const resetGame = () => {
    setBoard({
      player1Houses: [4, 4, 4, 4, 4, 4],
      player2Houses: [4, 4, 4, 4, 4, 4],
      player1Store: 0,
      player2Store: 0
    });
    setCurrentPlayer(1);
    setGameStatus('playing');
    setWinner(null);
    setSelectedHouse(null);
    setIsAnimating(false);
    setGameLog(['Game restarted! Player 1 begins.']);
  };

  const handleNameChange = (player, value) => {
    setPlayerNames(prev => ({ ...prev, [player]: value }));
  };

  const handleStartGame = () => {
    setNameInputVisible(false);
  };

  const saveGameResult = (result) => {
    const newResults = [...gameResults, result];
    setGameResults(newResults);
    // Find highest scorer
    let maxScore = -1;
    let maxPlayer = '';
    newResults.forEach(r => {
      if (r.score1 > maxScore) {
        maxScore = r.score1;
        maxPlayer = r.player1;
      }
      if (r.score2 > maxScore) {
        maxScore = r.score2;
        maxPlayer = r.player2;
      }
    });
    setHighestScorer({ name: maxPlayer, score: maxScore });
  };

  const startNewGame = () => {
    setNameInputVisible(true);
    setBoard({
      player1Houses: [4, 4, 4, 4, 4, 4],
      player2Houses: [4, 4, 4, 4, 4, 4],
      player1Store: 0,
      player2Store: 0
    });
    setCurrentPlayer(1);
    setGameStatus('playing');
    setWinner(null);
    setSelectedHouse(null);
    setIsAnimating(false);
    setGameLog(['Game restarted! Player 1 begins.']);
  };

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

  // Add computer move logic
  useEffect(() => {
    if (!onlineMode && !nameInputVisible && playerNames[2] === '' && currentPlayer === 2 && gameStatus === 'playing' && canPlayerMove(2)) {
      // Computer move after longer delay and flash the house
      const idx = board.player2Houses.findIndex(h => h > 0);
      if (idx !== -1) {
        setComputerSelectedHouse(idx);
        const timeout = setTimeout(() => {
          makeMove(idx);
          setTimeout(() => setComputerSelectedHouse(null), 800); // Remove flash after move
        }, 1800); // 1.8s delay for computer move
        return () => {
          clearTimeout(timeout);
          setComputerSelectedHouse(null);
        };
      }
    }
  }, [currentPlayer, board, onlineMode, nameInputVisible, playerNames, gameStatus]);

  return (
    <div className="w-full max-w-5xl mx-auto p-2 sm:p-4 bg-gradient-to-b from-amber-50 to-orange-50 min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl p-2 sm:p-8 border border-amber-100">
        {/* Responsive controls and top bar */}
        <div className="mb-2 sm:mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 w-full items-start">
          {/* Left: Online Play & Status */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              <Tooltip text="Play with someone online in real time">
                <button
                  className={`px-2 sm:px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 sm:gap-2 shadow transition-colors ${onlineMode ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-green-100'}`}
                  onClick={() => setOnlineMode(!onlineMode)}
                >
                  <Link2 size={18} />
                  {onlineMode ? 'Online Mode Enabled' : 'Play Online'}
                </button>
              </Tooltip>
              {onlineMode && (
                <span className="text-green-700 text-xs sm:text-sm font-semibold flex items-center gap-1">
                  <Loader2 className="animate-spin" size={16} />
                  {onlineStatus === 'idle' ? 'Ready' : onlineStatus === 'waiting' ? 'Waiting for opponent...' : 'Connected'}
                </span>
              )}
            </div>
            {/* Game ID and Status - only for online mode */}
            {onlineMode && (
              <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start mt-2">
                {onlineStatus === 'idle' && (
                  <>
                    <button
                      className="bg-green-500 text-white px-2 sm:px-3 py-1.5 rounded-lg font-bold shadow hover:bg-green-600"
                      onClick={handleCreateGame}
                    >
                      Create Game
                    </button>
                    <input
                      type="text"
                      placeholder="Game ID"
                      value={gameId}
                      onChange={e => setGameId(e.target.value)}
                      className="px-2 py-1.5 rounded border border-blue-300 focus:outline-none shadow w-24 sm:w-auto"
                    />
                    <button
                      className="bg-blue-500 text-white px-2 sm:px-3 py-1.5 rounded-lg font-bold shadow hover:bg-blue-600"
                      onClick={() => handleJoinGame(gameId)}
                    >
                      Join Game
                    </button>
                    {onlineError && <div className="text-red-600 mt-1">{onlineError}</div>}
                  </>
                )}
                {onlineStatus === 'waiting' && (
                  <div className="text-green-700 font-mono text-xs sm:text-sm">
                    Game ID: <span className="font-bold">{gameId}</span>
                  </div>
                )}
                {onlineStatus === 'playing' && (
                  <div className="text-green-700 font-mono text-xs sm:text-sm">
                    Connected {isHost ? '(Host)' : '(Guest)'} | Game ID: <span className="font-bold">{gameId}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Right: Rules & New Game Controls */}
          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-end">
              <Tooltip text="View game rules">
                <button
                  onClick={() => setShowRules(!showRules)}
                  className="bg-blue-500 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 sm:gap-2 shadow text-xs sm:text-base"
                >
                  <Info size={16} />
                  Rules
                </button>
              </Tooltip>
              <Tooltip text="Restart the game">
                <button
                  onClick={resetGame}
                  className="bg-green-600 text-white px-2 sm:px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-2 shadow text-xs sm:text-base"
                >
                  <RotateCcw size={16} />
                  New Game
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6 text-xs sm:text-sm">
          {/* Player 1 Score */}
          <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
            <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Users size={16} />
              {playerNames[1] || 'Player 1'}
            </div>
            <div className="font-bold text-base sm:text-lg">{board.player1Store}</div>
          </div>
          {/* Player 2 Score */}
          <div className="bg-red-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
            <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Users size={16} />
              {playerNames[2] || (nameInputVisible ? 'Player 2' : 'Computer')}
            </div>
            <div className="font-bold text-base sm:text-lg">{board.player2Store}</div>
          </div>
          {/* Game Status */}
          <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg flex flex-col items-center">
            <div className="text-xs sm:text-sm text-gray-600">Game Status</div>
            <div className="font-bold text-base sm:text-lg">
              {gameStatus === 'ended' ? (
                winner === 0 ? 'Tie!' : `${playerNames[winner] || (winner === 2 ? 'Computer' : `Player ${winner}`)} Wins!`
              ) : 'Playing'}
            </div>
          </div>
        </div>
        {/* Game Board - Modernized & Mobile Friendly */}
        <div className="bg-amber-300 p-2 sm:p-6 rounded-xl shadow-inner overflow-x-auto w-full flex flex-col items-center" style={{ background: 'repeating-linear-gradient(135deg, #fbbf24 0px, #fbbf24 2px, #fff3c4 2px, #fff3c4 32px)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2 sm:mb-4 gap-4 sm:gap-0 w-full">
            {/* Player 2 Store */}
            <div className="w-20 sm:w-24 h-20 sm:h-32 bg-red-200 rounded-lg shadow-lg flex flex-col items-center justify-center relative border-4 border-red-400 mb-2 sm:mb-0 shrink-0 text-base sm:text-lg">
              <div className={`font-bold mb-1 text-white ${currentPlayer === 2 ? 'animate-flash' : ''}`}>{playerNames[2] || 'Computer'}</div>
              {renderSeeds(board.player2Store, getStorePosition(2))}
            </div>
            {/* Playing Field */}
            <div className="flex-1 mx-2 sm:mx-6 min-w-[320px] max-w-full flex flex-col gap-4">
              {/* Player 2 Houses (top row) */}
              <div className="flex gap-2 sm:gap-4 mb-2 sm:mb-4 justify-center flex-wrap w-full">
                {board.player2Houses.slice().reverse().map((seeds, idx) => {
                  const actualIndex = 5 - idx;
                  const houseId = getHousePosition(2, actualIndex);
                  const isSelectedP2 = selectedHouse && selectedHouse.player === 2 && selectedHouse.house === actualIndex;
                  const canSelectP2 = currentPlayer === 2 && seeds > 0 && !isAnimating;
                  const isComputerFlash = computerSelectedHouse === actualIndex && currentPlayer === 2 && playerNames[2] === '' && !onlineMode;
                  return (
                    <Tooltip key={`p2-${actualIndex}`} text={`House ${actualIndex + 1}`}>
                      <div
                        id={houseId}
                        className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl shadow-md cursor-pointer transition-all relative border-2 flex items-center justify-center
                          ${isSelectedP2 ? 'border-red-500 bg-red-200 animate-flash' :
                            canSelectP2 ? 'border-red-400 bg-red-100 hover:bg-red-200' :
                            'border-red-300 bg-red-50'}
                          ${isComputerFlash ? 'animate-flash' : ''}
                        `}
                        onClick={() => currentPlayer === 2 && makeMove(actualIndex)}
                        style={{ margin: '4px' }}
                        aria-label={`Player 2 House ${actualIndex + 1}`}
                      >
                        <span className="absolute top-1 left-1 text-xs font-bold text-red-700 bg-white bg-opacity-70 rounded px-1">{actualIndex + 1}</span>
                        {renderSeeds(seeds, houseId)}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
              {/* Player 1 Houses (bottom row) */}
              <div className="flex gap-2 sm:gap-4 justify-center flex-wrap w-full">
                {board.player1Houses.map((seeds, idx) => {
                  const houseId = getHousePosition(1, idx);
                  const isSelectedP1 = selectedHouse && selectedHouse.player === 1 && selectedHouse.house === idx;
                  const canSelectP1 = currentPlayer === 1 && seeds > 0 && !isAnimating;
                  return (
                    <Tooltip key={`p1-${idx}`} text={`House ${idx + 1}`}>
                      <div
                        id={houseId}
                        className={`w-16 sm:w-20 h-16 sm:h-20 rounded-xl shadow-md cursor-pointer transition-all relative border-2 flex items-center justify-center
                          ${isSelectedP1 ? 'border-blue-500 bg-blue-200 animate-flash' :
                            canSelectP1 ? 'border-blue-400 bg-blue-100 hover:bg-blue-200' :
                            'border-blue-300 bg-blue-50'}
                        `}
                        onClick={() => currentPlayer === 1 && makeMove(idx)}
                        style={{ margin: '4px' }}
                        aria-label={`Player 1 House ${idx + 1}`}
                      >
                        <span className="absolute top-1 left-1 text-xs font-bold text-blue-700 bg-white bg-opacity-70 rounded px-1">{idx + 1}</span>
                        {renderSeeds(seeds, houseId)}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
            {/* Player 1 Store */}
            <div className="w-20 sm:w-24 h-20 sm:h-32 bg-blue-200 rounded-lg shadow-lg flex flex-col items-center justify-center relative border-4 border-blue-400 mt-2 sm:mt-0 shrink-0 text-base sm:text-lg">
              <div className={`font-bold mb-1 text-white ${currentPlayer === 1 ? 'animate-flash' : ''}`}>{playerNames[1] || 'Player 1'}</div>
              {renderSeeds(board.player1Store, getStorePosition(1))}
            </div>
          </div>
          {/* Turn Indicator - persistent and clear */}
          <div className="w-full text-center mt-2 mb-2">
            <span className={`inline-block px-4 py-2 rounded-lg font-bold text-lg shadow-lg ${currentPlayer === 1 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'} animate-flash`}>
              {currentPlayer === 1 ? `${playerNames[1] || 'Player 1'}'s Turn` : `${playerNames[2] || (!nameInputVisible ? 'Computer' : 'Player 2')}'s Turn`}
            </span>
          </div>
        </div>
        {/* Game End - persistent message with Play Again/Exit */}
        {gameStatus === 'ended' && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="p-8 bg-white rounded-2xl shadow-2xl border-4 border-yellow-400 text-center max-w-md mx-auto">
              <Trophy className="mx-auto mb-2 text-yellow-600" size={40} />
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {winner === 0 ? 'Game Tied!' : `${playerNames[winner] || (winner === 2 ? 'Computer' : `Player ${winner}`)} Wins!`}
              </h3>
              <p className="text-gray-700 mb-4 text-lg">
                Final Score: {playerNames[1] || 'Player 1'}: {board.player1Store} | {playerNames[2] || 'Player 2'}: {board.player2Store}
              </p>
              <button
                onClick={resetGame}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow text-lg"
              >
                Play Again
              </button>
              <button
                onClick={startNewGame}
                className="ml-4 bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-bold shadow text-lg"
              >
                Exit
              </button>
            </div>
          </div>
        )}
        {/* Game Results History - Modernized, responsive */}
        <div className="w-full max-w-2xl mx-auto">
          <GameResultsTable gameResults={gameResults} />
        </div>
        {/* New Game Button always asks for names */}
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
        {/* Cultural Note - moved to bottom, responsive */}
        <div className="mt-6 w-full max-w-lg mx-auto">
          <CulturalNote />
        </div>
      </div>
    </div>
  );
};

export default GebetaGame;

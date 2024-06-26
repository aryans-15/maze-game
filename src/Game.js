// add aesthetic notification alerts instead of default alerts
import React, {useState, useEffect } from 'react';
import {io } from 'socket.io-client';
import {CopyToClipboard } from 'react-copy-to-clipboard';
import './index.css';

const socket = io('http://localhost:8080');

const Game = () => {
  const [connected, setConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [inRoom, setInRoom] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [invalidRoom, setInvalidRoom] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState('');
  const [players, setPlayers] = useState([]);
  const [usernameRequired, setUsernameRequired] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
        console.log('connected!');
        setConnected(true);
    });

    socket.on('room_joined', () => {
        setInRoom(true);
        setInvalidRoom(false);
    });

    socket.on('room_full', () => {
        alert('Room is full!');
    });

    socket.on('invalid_room', () => {
        setInvalidRoom(true);
    });

    socket.on('username_required', () => {
        setUsernameRequired(true);
    });

    socket.on('game_start', () => {
        setGameStarted(true);
    });

    socket.on('move', (data) => {
        console.log('move:', data.move);
    });

    socket.on('room_created', (data) => {
        setCreatedRoomId(data.id);
        setInRoom(true);
        setPlayers([username]);
    });

    socket.on('update_players', (data) => {
        setPlayers(data.usernames);
    });

    return () => {
        socket.off('connect');
        socket.off('room_joined');
        socket.off('room_full');
        socket.off('invalid_room');
        socket.off('username_required');
        socket.off('game_start');
        socket.off('move');
        socket.off('room_created');
        socket.off('update_players');
    };
  }, [username]);

  const joinRoom = () => {
    if (!username) {
        setUsernameRequired(true);
        return;
    }
    socket.emit('join_room', {id: roomId, username});
  };

  const createRoom = () => {
    if (!username) {
        setUsernameRequired(true);
        return;
    }
    socket.emit('create_room', username);
  };

  const sendMove = (move) => {
    socket.emit('move', {id: roomId, move});
  };

  const handleCopyRoomCode = () => {
    alert(`Room code ${createdRoomId} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-4">Maze Game</h1>

        {connected ? (
          <div>
            {inRoom ? (
              <div>
                {gameStarted ? (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Game Started!</h2>
                    <button onClick={() => sendMove('some move')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Make Move
                    </button>
                    <h3 className="text-lg font-semibold mt-4">Players:</h3>
                    <ul className="list-disc pl-4">
                      {players.map((player, index) => (
                        <li key={index}>{player}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Waiting for another player...</h2>
                    {createdRoomId && (
                      <div className="mb-4">
                        <p>Room created! Share this code:</p>
                        <div className="flex items-center justify-between bg-gray-700 rounded-lg px-4 py-2">
                          <strong>{createdRoomId}</strong>
                          <CopyToClipboard text={createdRoomId} onCopy={handleCopyRoomCode}>
                            <button className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                              Copy Code
                            </button>
                          </CopyToClipboard>
                        </div>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold">Players:</h3>
                    <ul className="list-disc pl-4">
                      {players.map((player, index) => (
                        <li key={index}>{player}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter Room ID" className="w-full rounded-lg px-4 py-2 mb-4 text-slate-600"/>
                <br/>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Your Username" className="w-full rounded-lg px-4 py-2 mb-4 text-slate-600"/>
                <br/>
                <button onClick={joinRoom} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Join Room
                </button>
                <br />
                <button onClick={createRoom} className="w-full mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                    Create Room
                </button>
                {usernameRequired && <p className="mt-4 text-red-500">Please enter a username.</p>}
                {invalidRoom && <p className="mt-4 text-red-500">Invalid room ID. Please enter a valid room ID.</p>}
              </div>
            )}
          </div>
        ) : (
          <h2 className="text-2xl font-bold">Connecting...</h2>
        )}
      </div>
    </div>
  );
};

export default Game;

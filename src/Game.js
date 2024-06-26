import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8080');

const Game = () => {
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameRequired, setUsernameRequired] = useState(false);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('a user connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('a user disconnected');
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const joinRoom = () => {
    if (!username) {
      setUsernameRequired(true);
      return;
    }
  };

  const createRoom = () => {
    if (!username) {
      setUsernameRequired(true);
      return;
    }
  };

  return (
    <div>
      {connected ? (
        <div>
          <h2>u are connected!</h2>
          <div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter Your Username"/><br/>
            <button onClick={joinRoom}>Join Room</button><br/>
            <button onClick={createRoom}>Create Room</button>
            {usernameRequired && <p>Please enter a username.</p>}
          </div>
        </div>
      ) : (
        <h2>Connecting...</h2>
      )}
    </div>
  );
};

export default Game;

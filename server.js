// make sure players can't have same name in the same room
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // only to test
    }
});

const rooms = {};

function generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        const idx = Math.floor(Math.random() * characters.length);
        code += characters[idx];
    }
    return code;
}

function updatePlayersInRoom(id) {
    const room = rooms[id];
    if (room) {
        const usernames = room.players.map(player => player.username);
        io.to(id).emit('update_players', { usernames });
    }
}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('create_room', (username) => {
        if (!username) {
            socket.emit('username_required');
            return;
        }

        let id = generateRoomCode();
        while (rooms[id]) {
            id = generateRoomCode();
        }
        
        rooms[id] = { players: [{ id: socket.id, username }] };
        socket.join(id);
        socket.emit('room_created', { id });
        updatePlayersInRoom(id);
    });

    socket.on('join_room', (data) => {
        const room = rooms[data.id];
    
        if (!room) {
            socket.emit('invalid_room');
            return;
        }
    
        const username = data.username;
        if (!username) {
            socket.emit('username_required');
            return;
        }
    
        if (room.players.length < 2) {
            room.players.push({ id: socket.id, username });
            socket.join(data.id);
            socket.emit('room_joined');
            updatePlayersInRoom(data.id);
            if (room.players.length === 2) {
                io.to(data.id).emit('game_start');
            }
        } else {
            socket.emit('room_full');
        }
    });

    socket.on('move', (data) => {
        socket.to(data.id).emit('move', { move: data.move });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        for (const id in rooms) {
            const room = rooms[id];
            room.players = room.players.filter(player => player.id !== socket.id);
            if (room.players.length === 0) {
                delete rooms[id];
            } else {
                updatePlayersInRoom(id);
            }
        }
    });
});

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});

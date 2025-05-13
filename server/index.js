const { Socket } = require("dgram");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);
const userSocketMap = {}; // Define `userSocketMap` instead of `usernameMap`

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId], // Use `userSocketMap` instead of undefined variable
      };
    }
  );
};

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);
  socket.on("join_room", ({ roomId, username }) => {
    userSocketMap[socket.id] = username; // Store username in `userSocketMap`
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);

    // THIS IS THE CODE FOR THAT THE NEW USER HAVE JOIN.
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("user_joined", {
        username,
        clients,
        socketId: socket.id,
      });
    });
  });

  socket.on("code_change", ({ roomId, code }) => {
    socket.in(roomId).emit("code_change", { code });
  });

  socket.on("sync_code", ({ roomId, code }) => {
    io.to(roomId).emit("sync_code", { code });
  });

//  for removal of the user from the room

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((room) => {
      socket.to(room).emit("user_left", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
    socket.leave(); // Remove the socket from the server
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

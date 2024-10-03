import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

// Create a basic HTTP server (Socket.IO will attach to this)
const httpServer = createServer();

// Create a new Socket.IO server instance
const io = new SocketIOServer(httpServer, {
  path: "/ws",
  cors: {
    origin: "*", // Adjust to match your front-end domain if needed
    methods: ["GET", "POST"],
  },
});

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Handle joining a room (e.g., for group/private chat rooms)
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room: ${roomId}`);
  });

  // Handle sending/receiving messages
  socket.on("message", (messageData) => {
    const { roomId, message } = messageData;
    console.log(`Message received in room ${roomId}:`, message);
    io.to(roomId).emit("message", messageData);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start the WebSocket server on port 4000 (or any other port)
const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server is running on http://localhost:${PORT}`);
});

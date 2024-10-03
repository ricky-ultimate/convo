import { Server as HTTPServer } from "http";
import { NextApiResponse, NextApiRequest } from "next";
import { Server as SocketIOServer } from "socket.io";
import { Socket as NetSocket } from "net";

// Extend the Node.js HTTP server type to include `io`
declare module "http" {
  interface Server {
    io: SocketIOServer | undefined;
  }
}

// WebSocket server instance (Singleton)
let io: SocketIOServer | undefined;

export const initializeSocket = (req: NextApiRequest, res: NextApiResponse) => {
  const socket = res.socket as NetSocket & { server: HTTPServer };

  // Ensure socket.server.io exists
  if (!socket.server.io) {
    // Initialize Socket.IO server
    io = new SocketIOServer(socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*", // Adjust this to match your front-end domain
        methods: ["GET", "POST"],
      },
    });

    // Setup WebSocket event listeners
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
        // Broadcast message to everyone in the room
        io?.to(roomId).emit("message", messageData);
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    // Attach the Socket.IO server to Next.js
    socket.server.io = io;
  }

  res.end();
};

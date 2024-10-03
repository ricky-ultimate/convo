import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { Socket as NetSocket } from "net";

// Extend the Node.js HTTP server type to include `io`
declare module "http" {
  interface Server {
    io?: SocketIOServer;
  }
}

// WebSocket server instance (Singleton)
let io: SocketIOServer | undefined;

// Updated socket initialization function to only use `req`
export const initializeSocket = (req: Request) => {
  // Check if `req` has a socket object (only in Node.js environments)
  const socket = (req as any)?.socket as NetSocket & { server: HTTPServer };

  // Ensure server exists and is available
  if (!socket?.server) {
    console.error("Server or socket is not available in this environment. This may indicate a serverless environment or incompatible setup.");
    return new Response("Server or socket is not available in this environment", { status: 500 });
  }

  // Initialize Socket.IO server if it doesn't exist
  if (!socket.server.io) {
    io = new SocketIOServer(socket.server, {
      path: "/api/socket",
      cors: {
        origin: "*", // Adjust this to match your front-end domain
        methods: ["GET", "POST"],
      },
    });

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

  return new Response("Socket initialized successfully");
};

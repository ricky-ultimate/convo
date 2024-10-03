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

export const initializeSocket = (res: any) => {
  const isAppRouter = !("status" in res);

  // Ensure res.socket is available (common between API Routes and App Router)
  if (!res.socket) {
    console.error("Socket is not available in this environment.");
    if (isAppRouter) {
      return new Response("Socket is not available", { status: 500 });
    } else {
      res.status(500).end("Socket is not available");
    }
    return;
  }

  const socket = res.socket as NetSocket & { server: HTTPServer };

  // Ensure server exists and is available
  if (!socket.server) {
    console.error("Server is not available.");
    if (isAppRouter) {
      return new Response("Server is not available", { status: 500 });
    } else {
      res.status(500).end("Server is not available");
    }
    return;
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

  if (isAppRouter) {
    return new Response("Socket initialized successfully");
  } else {
    res.end();
  }
};

import { initializeSocket } from "@/lib/socket";

// Handler for the GET request in the App Router
export async function GET(req: Request) {
  // Create a mock response object for `initializeSocket` to handle
  const mockResponse = { socket: (req as any).socket };

  const response = initializeSocket(req, mockResponse);

  // Ensure a response is returned
  return response ?? new Response("Socket initialization failed", { status: 500 });
}

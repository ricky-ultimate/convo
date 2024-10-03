import { initializeSocket } from "@/lib/socket";

// Handler for the GET request in the App Router
export async function GET(req: Request) {
  // Call initializeSocket with the single `req` parameter
  const response = initializeSocket(req);

  // Ensure a response is returned
  return response ?? new Response("Socket initialization failed", { status: 500 });
}

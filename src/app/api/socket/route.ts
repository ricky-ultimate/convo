import { NextApiRequest, NextApiResponse } from "next";
import { initializeSocket } from "@/lib/socket";

// Named export for GET method
export async function GET(req: NextApiRequest, res: NextApiResponse) {
  initializeSocket(req, res);
}

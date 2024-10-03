import { initializeSocket } from "@/lib/socket";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    initializeSocket(req, res);
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

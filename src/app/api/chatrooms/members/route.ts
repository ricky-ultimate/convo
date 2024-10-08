import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

// POST: Add a user to a chat room
export async function POST(req: NextRequest) {
  const { chatRoomName, username } = await req.json();
  const token = req.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Missing token in request headers" },
      { status: 401 }
    );
  }

  // Use token for authentication
  const session = await auth(token);

  console.log("Session retrieved from token:", session);

  if (!session?.user || !chatRoomName || !username) {
    return NextResponse.json(
      { error: "All fields are required and the user must be logged in" },
      { status: 400 }
    );
  }

  try {
    const chatRoom = await prisma.chatRoom.findUnique({ where: { name: chatRoomName } });

    if (!chatRoom) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({
        data: { username, email: `${username}@example.com`, password: "password" },
      });
    }

    await prisma.chatRoomMembership.create({
      data: { chatRoomId: chatRoom.id, userId: user.id },
    });

    return NextResponse.json(
      { message: `User ${username} added to room ${chatRoomName}` },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user to chat room:", error);
    return NextResponse.json(
      { error: "Failed to add user to chat room" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

// POST: Create a new message
export async function POST(req: NextRequest) {
  const session = await auth();
  const { content, chatRoomName, user } = await req.json(); // Include `user` in the message

  if (!content || !chatRoomName || !user?.username) {
    return NextResponse.json(
      { error: "All fields are required (content, chatRoomName, user)" },
      { status: 400 }
    );
  }

  try {
    // Ensure chat room exists (create if not)
    let room = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: { name: chatRoomName },
      });
    }

    // Ensure user exists (use WebSocket-provided username)
    let dbUser = await prisma.user.findUnique({
      where: { username: user.username },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          username: user.username,
          email: `${user.username}@example.com`, // Placeholder email for simplicity
          password: "password",
        },
      });
    }

    // Create the message in the database
    const message = await prisma.message.create({
      data: {
        content,
        userId: dbUser.id,
        chatRoomId: room.id, // Reference the correct room ID
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}

// GET: Fetch messages for a specific chat room
export async function GET(req: NextRequest) {
  const chatRoomName = req.nextUrl.searchParams.get("chatRoomId");

  if (!chatRoomName) {
    return NextResponse.json(
      { error: "Missing chatRoomName" },
      { status: 400 }
    );
  }

  try {
    // Find the chat room by name to get its ID
    const room = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 }
      );
    }

    // Fetch messages using chatRoomId (not name)
    const messages = await prisma.message.findMany({
      where: { chatRoomId: room.id }, // Use the ID for message lookups
      include: { user: true }, // Include user details
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

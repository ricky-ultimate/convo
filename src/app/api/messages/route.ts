import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create a new message
export async function POST(req: NextRequest) {
  const { content, userId, chatRoomId } = await req.json();

  // Validate input
  if (!content || !userId || !chatRoomId) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
    // Ensure user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure chat room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: chatRoomId }
    });

    if (!room) {
      return NextResponse.json({ error: "Chat room not found" }, { status: 404 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        userId,
        chatRoomId,
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
  const chatRoomId = req.nextUrl.searchParams.get("chatRoomId");

  if (!chatRoomId) {
    return NextResponse.json({ error: "Missing chatRoomId" }, { status: 400 });
  }

  try {
    // Fetch messages from the chat room
    const messages = await prisma.message.findMany({
      where: { chatRoomId: Number(chatRoomId) },
      include: { user: true },  // Include user details
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

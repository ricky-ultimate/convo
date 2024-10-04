import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

// POST: Create a new message
export async function POST(req: NextRequest) {
  const session = await auth(); // Use auth() to get the user session
  const { content, chatRoomName } = await req.json();

  if (!session?.user || !content || !chatRoomName) {
    return NextResponse.json(
      { error: "All fields are required, and the user must be logged in" },
      { status: 400 }
    );
  }

  try {
    // Ensure chat room exists, or create a new one
    let room = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!room) {
      room = await prisma.chatRoom.create({
        data: { name: chatRoomName },
      });
    }

    // Convert session.user.id (string) to a number
    const userId = Number(session.user.id);

    // Check if userId is a valid number
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Create the message and associate it with the user and room
    const message = await prisma.message.create({
      data: {
        content,
        userId, // Store the message with the logged-in user's ID (as a number)
        chatRoomName,
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
    return NextResponse.json({ error: "Missing chatRoomName" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatRoomName },
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

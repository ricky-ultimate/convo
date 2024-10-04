import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../auth";

// POST: Create a new message
export async function POST(req: NextRequest) {
  const session = await auth();
  const { content, chatRoomName } = await req.json();

  if (!session?.user || !content || !chatRoomName) {
    return NextResponse.json(
      { error: "All fields are required, and the user must be logged in" },
      { status: 400 }
    );
  }

  try {
    let room = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!room) {
      room = await prisma.chatRoom.create({ data: { name: chatRoomName } });
    }

    const userId = Number(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Create the message with correct content and user details
    const message = await prisma.message.create({
      data: {
        content, // Ensure content is saved correctly
        userId,
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
    return NextResponse.json(
      { error: "Missing chatRoomName" },
      { status: 400 }
    );
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

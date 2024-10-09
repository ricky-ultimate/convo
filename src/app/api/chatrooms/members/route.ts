import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "../../../../../auth";

// POST: Add a user to a chat room
export async function POST(req: NextRequest) {
  const session = await auth();
  const { chatRoomName, username } = await req.json();

  if (!session?.user || !chatRoomName || !username) {
    return NextResponse.json(
      { error: "All fields are required and the user must be logged in" },
      { status: 400 }
    );
  }

  try {
    // Ensure chat room exists
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 }
      );
    }

    // Find or create user to be added
    let user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          email: `${username}@example.com`,
          password: "password",
        },
      });
    }

    // Add user to the chat room
    await prisma.chatRoomMembership.create({
      data: {
        chatRoomId: chatRoom.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: `User ${username} added to room ${chatRoomName}` }, { status: 201 });
  } catch (error) {
    console.error("Error adding user to chat room:", error);
    return NextResponse.json(
      { error: "Failed to add user to chat room" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user from a chat room
export async function DELETE(req: NextRequest) {
  const session = await auth();
  const { chatRoomName, username } = await req.json();

  if (!session?.user || !chatRoomName || !username) {
    return NextResponse.json(
      { error: "All fields are required and the user must be logged in" },
      { status: 400 }
    );
  }

  try {
    // Find the chat room
    const chatRoom = await prisma.chatRoom.findUnique({
      where: { name: chatRoomName },
    });

    if (!chatRoom) {
      return NextResponse.json(
        { error: "Chat room not found" },
        { status: 404 }
      );
    }

    // Find the user to be removed
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Remove the user from the chat room
    await prisma.chatRoomMembership.deleteMany({
      where: {
        chatRoomId: chatRoom.id,
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: `User ${username} removed from room ${chatRoomName}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing user from chat room:", error);
    return NextResponse.json(
      { error: "Failed to remove user from chat room" },
      { status: 500 }
    );
  }
}

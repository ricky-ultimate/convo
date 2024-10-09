import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Validate if a user is a member of a chat room
export async function POST(req: NextRequest) {
  const { chatRoomName, username } = await req.json();

  if (!chatRoomName || !username) {
    return NextResponse.json(
      { error: "Chat room name and username are required" },
      { status: 400 }
    );
  }

  try {
    console.log("Validating user membership:", chatRoomName, username);

    // Check if the user is a member of the specified chat room
    const membership = await prisma.chatRoomMembership.findFirst({
      where: {
        chatRoom: { name: chatRoomName.toLowerCase() }, // Convert room name to lowercase
        user: { username: username.toLowerCase() }, // Convert username to lowercase
      },
    });

    if (!membership) {
      return NextResponse.json(
        { message: "User is not a member of this room" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User is a member of this room" }, { status: 200 });
  } catch (error) {
    console.error("Error validating membership:", error);
    return NextResponse.json(
      { error: "Failed to validate membership" },
      { status: 500 }
    );
  }
}

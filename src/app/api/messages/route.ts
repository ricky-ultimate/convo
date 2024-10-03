import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { content, userId, chatRoomId } = await req.json();

  if (!content || !userId || !chatRoomId) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  try {
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

export async function GET(req: NextRequest) {
  const chatRoomId = req.nextUrl.searchParams.get("chatRoomId");

  if (!chatRoomId) {
    return NextResponse.json({ error: "Missing chatRoomId" }, { status: 400 });
  }

  try {
    const messages = await prisma.message.findMany({
      where: { chatRoomId: Number(chatRoomId) },
      include: { user: true },
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

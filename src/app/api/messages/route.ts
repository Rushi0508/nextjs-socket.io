import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/authOptions";

// Fetch messages for the logged-in user
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const receiverId = url.searchParams.get("receiverId");

  if (!receiverId) {
    return NextResponse.json(
      { error: "Receiver ID is required" },
      { status: 400 }
    );
  }

  try {
    const senderId = session.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: senderId, receiverId: receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        receiverId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching messages" },
      { status: 500 }
    );
  }
}

// Send a new message
export async function POST(req: Request) {
  const body = await req.json();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        content: body.content,
        senderId: session.user.id,
        receiverId: body.receiverId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error sending message" },
      { status: 500 }
    );
  }
}

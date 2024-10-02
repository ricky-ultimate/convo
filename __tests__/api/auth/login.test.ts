import supertest from "supertest";
import { createServer } from "http";
import { POST as loginHandler } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { IncomingMessage, ServerResponse } from "http";

const prisma = new PrismaClient();

// Simulate the Next.js handler with explicit types for req and res
const requestHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });

  // Use a fully qualified URL with correct action parameter
  const absoluteUrl = `http://localhost/api/auth/callback/credentials`;
  const request = new NextRequest(absoluteUrl, {
    method: req.method!,
    body: JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  const response = await loginHandler(request) as NextResponse;

  // Convert Headers to a plain object
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  res.writeHead(response.status, headers);
  res.end(await response.text());
};

const request = supertest(createServer(requestHandler));

describe("POST /api/auth/login", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany();

    // Create a test user for login
    const hashedPassword = await bcrypt.hash("password123", 10);
    await prisma.user.create({
      data: {
        email: "testuser@example.com",
        username: "testuser",
        password: hashedPassword,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should log in with valid credentials", async () => {
    const credentials = {
      email: "testuser@example.com",
      password: "password123",
    };

    const response = await request.post("/api/auth/callback/credentials").send(credentials);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should fail with invalid credentials", async () => {
    const invalidCredentials = {
      email: "wrongemail@example.com",
      password: "wrongpassword",
    };

    const response = await request.post("/api/auth/callback/credentials").send(invalidCredentials);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });
});

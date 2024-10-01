// __tests__/api/auth/register.test.ts

import supertest from "supertest";
import { createServer } from "http";
import { POST as registerHandler } from "@/app/api/auth/register/route"; // Use named import for POST handler
import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { IncomingMessage, ServerResponse } from "http"; // Import types for req and res

const prisma = new PrismaClient();

// Simulate the Next.js handler with explicit types for req and res
const requestHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
  const body = await new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {  // Explicitly define chunk as Buffer
      data += chunk;
    });
    req.on('end', () => {
      resolve(JSON.parse(data));
    });
  });

  // Use a fully qualified URL
  const absoluteUrl = `http://localhost${req.url}`;
  const request = new NextRequest(absoluteUrl, { method: req.method!, body: JSON.stringify(body) });
  const response = await registerHandler(request);

  // Convert Headers to a plain object
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  res.writeHead(response.status, headers);
  res.end(await response.text());
};

const request = supertest(createServer(requestHandler));

describe("POST /api/auth/register", () => {
  beforeAll(async () => {
    // Clean up the user table
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a new user", async () => {
    const newUser = {
      email: "testuser@example.com",
      username: "testuser",
      password: "password123",
    };

    const response = await request.post("/api/auth/register").send(newUser);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.username).toBe(newUser.username);

    // Check if the user is in the database
    const dbUser = await prisma.user.findUnique({ where: { email: newUser.email } });
    expect(dbUser).not.toBeNull();
    expect(await bcrypt.compare(newUser.password, dbUser!.password)).toBe(true);
  });

  it("should return an error if user already exists", async () => {
    const existingUser = {
      email: "testuser@example.com",
      username: "testuser",
      password: "password123",
    };

    const response = await request.post("/api/auth/register").send(existingUser);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("User already exists");
  });
});

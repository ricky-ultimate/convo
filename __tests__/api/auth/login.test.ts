import supertest, { SuperTest, Test } from "supertest";
import { createServer } from "http";
import { POST as loginHandler } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { IncomingMessage, ServerResponse } from "http";

const prisma = new PrismaClient();

// Fetch CSRF token and cookie from the next-auth endpoint
const fetchCSRFToken = async (request: SuperTest<Test>) => {
    const response = await request.get("/api/auth/csrf");

    console.log("CSRF Response Headers:", response.headers);
    console.log("CSRF Response Body:", response.body);

    const setCookieHeader = response.headers["set-cookie"];

    if (!setCookieHeader) {
        throw new Error("CSRF token was not set in the response headers");
    }

    // Check if set-cookie is a single string or an array of strings
    const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    const csrfCookie = cookies.find((cookie) => cookie.includes("next-auth.csrf-token"));

    if (!csrfCookie) {
        throw new Error("CSRF cookie not found");
    }

    // Return both the CSRF token from the body and the cookie from the headers
    return { csrfToken: response.body.csrfToken, csrfCookie };
};

// Simulate the Next.js handler with explicit types for req and res
const requestHandler = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    let bodyData = '';

    // Use a Promise to capture the incoming data properly
    const body = await new Promise((resolve) => {
        req.on('data', (chunk: Buffer) => {
            bodyData += chunk.toString(); // Concatenate incoming data chunks as strings
        });
        req.on('end', () => {
            // Safely handle empty data or invalid JSON
            try {
                resolve(bodyData.length > 0 ? JSON.parse(bodyData) : {}); // Resolve empty object if no data
            } catch {
                resolve({}); // Resolve with an empty object on JSON parse error
            }
        });
    });

    // Ensure we pass the correct method (POST) to NextRequest
    const absoluteUrl = `http://localhost/api/auth/callback/credentials`;
    const request = new NextRequest(absoluteUrl, {
        method: "POST",  // Explicitly set the method as POST
        body: JSON.stringify(body), // Send the parsed body back as JSON
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

// Use a consistent `SuperTest<Test>` type for `request`
const request: SuperTest<Test> = supertest(createServer(requestHandler));

describe("POST /api/auth/login", () => {
    beforeAll(async () => {
        await prisma.user.deleteMany();

        // Create a test user for login
        const hashedPassword = await bcrypt.hash("password123", 10);
        await prisma.user.create({
            data: {
                email: "testuser1@example.com",
                username: "testuser",
                password: hashedPassword,
            },
        });
    });

    afterAll(async () => {
        await prisma.$disconnect();
        jest.clearAllTimers();  // Ensure there are no active timers left
    });

    // Increase Jest timeout for longer test execution time
    jest.setTimeout(20000);

    it("should log in with valid credentials", async () => {
        // Fetch CSRF token and cookie
        const { csrfToken, csrfCookie } = await fetchCSRFToken(request);

        const credentials = {
            email: "testuser1@example.com",
            password: "password123",
        };

        // Include the CSRF token and set the cookie in the login request
        const response = await request
            .post("/api/auth/callback/credentials")
            .set("Cookie", csrfCookie)  // Set the CSRF cookie safely
            .send({
                ...credentials,
                csrfToken,
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("token");
    }, 20000);

    it("should fail with invalid credentials", async () => {
        // Fetch CSRF token and cookie
        const { csrfToken, csrfCookie } = await fetchCSRFToken(request);

        const invalidCredentials = {
            email: "wrongemail@example.com",
            password: "wrongpassword",
        };

        const response = await request
            .post("/api/auth/callback/credentials")
            .set("Cookie", csrfCookie)  // Set the CSRF cookie safely
            .send({
                ...invalidCredentials,
                csrfToken,
            });

        expect(response.status).toBe(401);
        expect(response.body.error).toBe("Invalid credentials");
    }, 20000);
});

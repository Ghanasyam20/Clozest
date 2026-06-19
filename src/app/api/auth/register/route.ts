import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/schemas/auth";
import type { ApiResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email:        normalizedEmail,
        passwordHash,
        onboarded:    false,
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        onboarded: true,
        createdAt: true,
      },
    });

    return NextResponse.json<ApiResponse<typeof user>>(
      { data: user, error: null },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

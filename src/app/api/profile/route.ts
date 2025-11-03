import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { authConfig } from "@/lib/auth";
import prisma from "@/lib/db";
import { ProfileSchema } from "@/lib/validations/profile";


export async function PATCH(req: Request) {
  try {
      const session = await getServerSession(authConfig);
      const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Validate the input
    try {
      ProfileSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        return new NextResponse(JSON.stringify({ 
          error: "Validation failed", 
          details: error.issues 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      throw error; // Re-throw non-Zod errors
    }

    const { 
      name, 
      email, 
      dateOfBirth, 
      image, 
      bio, 
      bluesky, 
      linkedin, 
      github, 
      website 
    } = body;

    const updatedUser = await prisma.user.update({
  where: { id: userId },
      data: {
        email,
        profile: {
          upsert: {
            create: {
              name,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              image,
              bio,
              bluesky,
              linkedin,
              github,
              website,
              updatedAt: new Date(),
            },
            update: {
              name,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              image,
              bio,
              bluesky,
              linkedin,
              github,
              website,
              updatedAt: new Date(),
            }
          }
        },
      },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to update profile" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 
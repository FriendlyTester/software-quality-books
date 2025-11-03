import React from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";

import ProfileForm from "./ProfileForm";

import { authConfig } from "@/lib/auth";
import prisma from "@/lib/db";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: profileUserId } = await params
  const session = await getServerSession(authConfig);
    const userId = (session?.user && (session.user as { id?: string }).id) ?? undefined;
    const isOwnProfile = userId === profileUserId;

  const profile = await prisma.profile.findFirst({
    where: { userId: profileUserId },
    include: { user: true },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-6">{`${profile.name}'s Profile`}</h1>
        
        <div className="space-y-6">
          {/* Profile Image and Basic Info */}
          <div className="flex items-center gap-6 mb-8">
            {profile.image ? (
              <img 
                src={profile.image} 
                alt={profile.name || 'Profile'} 
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-400">
                  {profile.name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold">{profile.name || 'No name set'}</h2>
              {isOwnProfile ? <p className="text-gray-600">{profile.user.email}</p> : null}
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio ? <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div> : null}

          {/* Social Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            {profile.bluesky ? <a href={profile.bluesky} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-blue-500 hover:underline">
                <span>Bluesky</span>
              </a> : null}
            {profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-blue-500 hover:underline">
                <span>LinkedIn</span>
              </a> : null}
            {profile.github ? <a href={profile.github} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-blue-500 hover:underline">
                <span>GitHub</span>
              </a> : null}
            {profile.website ? <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                className="flex items-center gap-2 text-blue-500 hover:underline">
                <span>Website</span>
              </a> : null}
          </div>

          {/* Edit Button */}
          {isOwnProfile ? <div className="mt-6">
              <ProfileForm profile={profile} />
            </div> : null}
        </div>
      </div>
    </div>
  );
} 
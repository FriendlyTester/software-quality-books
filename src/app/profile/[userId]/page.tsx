import React from 'react'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ProfileForm from './ProfileForm'

export default async function ProfilePage({ params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions)
  const isOwnProfile = session?.user?.id === params.userId

  const profile = await prisma.profile.findFirst({
    where: { userId: params.userId },
    include: { user: true },
  })

  if (!profile) {
    console.log('[LOG] - Profile not found, triggering notFound()')
    notFound()
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-6">{`${profile.name}'s Profile`}</h1>

        <div className="space-y-6">
          {/* Profile Image and Basic Info */}
          <div className="flex items-center gap-6 mb-8">
            {profile.image ? (
              <img src={profile.image} alt={profile.name || 'Profile'} className="w-32 h-32 rounded-full" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-4xl text-gray-400">{profile.name?.[0]?.toUpperCase() || '?'}</span>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold">{profile.name || 'No name set'}</h2>
              {isOwnProfile && <p className="text-gray-600">{profile.user.email}</p>}
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Social Links */}
          <div className="flex flex-wrap gap-4 mb-6">
            {profile.bluesky && (
              <a
                href={profile.bluesky}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <span>Bluesky</span>
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <span>LinkedIn</span>
              </a>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <span>GitHub</span>
              </a>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Edit Button */}
          {isOwnProfile && (
            <div className="mt-6">
              <ProfileForm profile={profile} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";

import { Profile } from "@/types/profile";
import { ProfileSchema, type ProfileFormData } from "@/lib/validations/profile";

type FieldErrors = Partial<Record<keyof ProfileFormData, string>>;

interface ProfileFormProps {
  profile: Profile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setSuccessMessage('');

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const validatedData = ProfileSchema.parse({
        name: data.name || null,
        dateOfBirth: data.dateOfBirth || null,
        image: data.image || null,
        bio: data.bio || null,
        bluesky: data.bluesky || null,
        linkedin: data.linkedin || null,
        github: data.github || null,
        website: data.website || null,
      });

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccessMessage('Profile updated successfully!');
      router.refresh();

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: FieldErrors = {};
        for (const issue of error.issues) {
          const fieldKey = issue.path[0];
          if (fieldKey) {
            errors[fieldKey as keyof ProfileFormData] = issue.message;
          }
        }
        setFieldErrors(errors);
      } else {
        console.error('Profile update error:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {successMessage ? <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-md">
          {successMessage}
        </div> : null}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={profile.name || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.name ? <p className="text-sm text-red-500">{fieldErrors.name}</p> : null}
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium">
            Date of Birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.dateOfBirth ? <p className="text-sm text-red-500">{fieldErrors.dateOfBirth}</p> : null}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium">
            Profile Image URL
          </label>
          <input
            id="image"
            name="image"
            type="url"
            defaultValue={profile.image || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.image ? <p className="text-sm text-red-500">{fieldErrors.image}</p> : null}
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={profile.bio || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.bio ? <p className="text-sm text-red-500">{fieldErrors.bio}</p> : null}
        </div>

        <div>
          <label htmlFor="bluesky" className="block text-sm font-medium">
            Bluesky Username
          </label>
          <input
            id="bluesky"
            name="bluesky"
            type="text"
            defaultValue={profile.bluesky || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.bluesky ? <p className="text-sm text-red-500">{fieldErrors.bluesky}</p> : null}
        </div>

        <div>
          <label htmlFor="linkedin" className="block text-sm font-medium">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            name="linkedin"
            type="url"
            defaultValue={profile.linkedin || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.linkedin ? <p className="text-sm text-red-500">{fieldErrors.linkedin}</p> : null}
        </div>

        <div>
          <label htmlFor="github" className="block text-sm font-medium">
            GitHub URL
          </label>
          <input
            id="github"
            name="github"
            type="url"
            defaultValue={profile.github || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.github ? <p className="text-sm text-red-500">{fieldErrors.github}</p> : null}
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium">
            Personal Website
          </label>
          <input
            id="website"
            name="website"
            type="url"
            defaultValue={profile.website || ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
          />
          {fieldErrors.website ? <p className="text-sm text-red-500">{fieldErrors.website}</p> : null}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
} 
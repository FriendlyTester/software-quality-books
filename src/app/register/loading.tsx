import React from 'react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mr-4"></span>
      <span className="text-lg font-medium text-gray-700">Loading registration...</span>
    </div>
  );
}

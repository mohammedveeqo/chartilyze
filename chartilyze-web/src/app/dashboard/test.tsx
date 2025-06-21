// app/dashboard/test.tsx (or wherever you want to test)
'use client';

import { useUser } from "@clerk/nextjs";

export default function TestComponent() {
  const { user } = useUser();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Auth Test</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Clerk User Data:</h3>
        <pre className="bg-gray-800 p-4 rounded overflow-auto">
          {JSON.stringify({
            id: user?.id,
            email: user?.emailAddresses?.[0]?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName
          }, null, 2)}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}

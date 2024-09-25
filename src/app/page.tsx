"use client"
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<any>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data.users);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className='flex justify-between'>
        <h1 className="text-2xl font-bold mb-4">Welcome, {session?.user?.name}</h1>
        <p className='cursor-pointer' onClick={() => signOut()} >Logout</p>
      </div>
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Users</h2>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {users.map((user: any) => (
              <li key={user.id} className="flex items-center justify-between">
                <span>{user.name}</span>
                <Button onClick={() => router.push(`/chat/${user.id}`)}>
                  Chat
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
"use client"
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [auth, setAuth] = useState<string>("LOGIN");
    const router = useRouter();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (auth === "LOGIN") {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.ok) {
                router.push('/');
            } else {
                // Handle error
                console.error('Login failed');
            }
        } else {
            const resp = await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify({ name, email, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
            if (resp.id) {
                setAuth("LOGIN");
            }
        }
    };

    return (
        auth === "LOGIN" ?
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center">Login</h1>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <CardFooter className="flex justify-center mt-6 flex-col gap-4">
                                <Button type="submit" className="w-full">Login</Button>
                                <p>New Here? <span className="cursor-pointer" onClick={() => setAuth("REGISTER")} >Register</span></p>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
            :
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center">Register</h1>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <Input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <CardFooter className="flex justify-center mt-6 flex-col gap-4">
                                <Button type="submit" className="w-full">Register</Button>
                                <p>Already Registered? <span className='cursor-pointer' onClick={() => setAuth("LOGIN")} >Login</span></p>
                            </CardFooter>
                        </form>
                    </CardContent>
                </Card>
            </div>
    );
}
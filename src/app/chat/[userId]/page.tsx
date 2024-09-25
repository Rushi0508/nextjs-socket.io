'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { socket } from "@/lib/socket"

export default function ChatPage() {
    const { data: session } = useSession()
    const params = useParams()
    const userId = params.userId as string
    const [messages, setMessages] = useState<any>([])
    const [inputMessage, setInputMessage] = useState('')

    const fetchMessages = async () => {
        const res = await fetch(`/api/messages?receiverId=${userId}`)
        const data = await res.json()
        console.log(data);
        setMessages(data.messages)
    }

    useEffect(() => {
        fetchMessages();
        if (session?.user?.id && userId) {
            socket.emit('join', { userId: session.user.id, targetUserId: userId })

            socket.on('message', (message: any) => {
                setMessages((prevMessages: any) => [...prevMessages, message])
                console.log(message);
            })

            socket.on("connect", () => {
                console.log("connected")
            });
            socket.on("disconnect", () => {
                console.log("disconnected")
            });

            return () => {
                socket.off("connect");
                socket.off("disconnect");
                socket.off("message");
                socket.emit('leave', { userId: session.user.id, targetUserId: userId })
            };
        }
    }, [])

    const sendMessage = async () => {
        if (inputMessage.trim() && session?.user?.id) {
            if (socket) {
                const message = {
                    content: inputMessage,
                    senderId: session.user.id,
                    receiverId: userId,
                }
                socket.emit('message', message)
                setInputMessage('')

                await fetch('/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(message),
                });
            }
        }
    }

    return (
        <div className="container mx-auto p-4">
            <Card className="h-[80vh] flex flex-col">
                <CardHeader>
                    <h1 className="text-2xl font-bold">Chat with User {userId}</h1>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <ul className="space-y-2">
                        {messages.map((message: any, index: any) => (
                            <li
                                key={index}
                                className={`p-2 rounded ${message.senderId === session?.user?.id
                                    ? 'bg-blue-100 text-right'
                                    : 'bg-gray-100'
                                    }`}
                            >
                                {message.content}
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <div className="flex w-full">
                        <Input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-grow mr-2"
                        />
                        <Button onClick={sendMessage}>Send</Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
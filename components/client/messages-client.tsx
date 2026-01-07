'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, MessageCircle } from 'lucide-react'
import { format, isToday, isYesterday } from 'date-fns'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Message {
  id: string
  engagement_id: string
  sender_id: string
  content: string
  read: boolean
  created_at: string
  users?: {
    id: string
    full_name: string
    email: string
  }
}

interface MessagesClientProps {
  engagementId: string
  initialMessages: Message[]
  currentUserId: string
  consultantName: string
}

export function MessagesClient({
  engagementId,
  initialMessages,
  currentUserId,
  consultantName,
}: MessagesClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${engagementId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `engagement_id=eq.${engagementId}`,
        },
        async (payload) => {
          // Fetch the full message with user data
          const { data: newMessage } = await supabase
            .from('messages')
            .select(
              `
              *,
              users!messages_sender_id_fkey(id, full_name, email)
            `
            )
            .eq('id', payload.new.id)
            .single()

          if (newMessage) {
            setMessages((prev) => [...prev, newMessage])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [engagementId, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    try {
      const { error } = await supabase.from('messages').insert({
        engagement_id: engagementId,
        sender_id: currentUserId,
        content: newMessage.trim(),
        read: false,
      })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a')
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`
    } else {
      return format(date, 'MMM d, h:mm a')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="border-b bg-background px-4 py-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(consultantName)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-lg font-semibold">{consultantName}</h1>
              <p className="text-sm text-muted-foreground">Your consultant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="container max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No messages yet. Start a conversation with your consultant!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId
              const senderName = isOwnMessage
                ? 'You'
                : message.users?.full_name || consultantName

              return (
                <div
                  key={message.id}
                  className={cn('flex gap-3', isOwnMessage && 'flex-row-reverse')}
                >
                  <Avatar className="shrink-0">
                    <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      'flex flex-col gap-1 max-w-[80%] sm:max-w-[60%]',
                      isOwnMessage && 'items-end'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2',
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground px-1">
                      {formatMessageDate(new Date(message.created_at))}
                    </span>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-background px-4 py-4">
        <div className="container max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="min-h-[80px] resize-none"
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="shrink-0 h-[80px] w-[80px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

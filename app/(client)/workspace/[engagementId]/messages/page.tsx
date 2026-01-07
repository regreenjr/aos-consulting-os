import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BottomTabNav } from '@/components/client/bottom-tab-nav'
import { MessagesClient } from '@/components/client/messages-client'

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ engagementId: string }>
}) {
  const { engagementId } = await params
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch engagement to verify access
  const { data: engagement } = await supabase
    .from('engagements')
    .select(
      `
      *,
      clients!inner(
        id,
        user_id,
        consultant_id,
        company_name,
        users!inner(id, full_name, email)
      )
    `
    )
    .eq('id', engagementId)
    .single()

  // Verify user owns this engagement
  if (!engagement || engagement.clients.user_id !== user.id) {
    redirect('/login')
  }

  // Fetch initial messages
  const { data: messages } = await supabase
    .from('messages')
    .select(
      `
      *,
      users!messages_sender_id_fkey(id, full_name, email)
    `
    )
    .eq('engagement_id', engagementId)
    .order('created_at', { ascending: true })

  // Get consultant info
  const { data: consultant } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('id', engagement.clients.consultant_id)
    .single()

  return (
    <>
      <MessagesClient
        engagementId={engagementId}
        initialMessages={messages || []}
        currentUserId={user.id}
        consultantName={consultant?.full_name || 'Your Consultant'}
      />
      <BottomTabNav engagementId={engagementId} />
    </>
  )
}

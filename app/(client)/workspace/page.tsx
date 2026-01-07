import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowRight, Briefcase } from 'lucide-react'

export default async function ClientWorkspacePage() {
  const supabase = await createClient()

  // Get user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch client's engagements
  const { data: client } = await supabase
    .from('clients')
    .select(
      `
      id,
      user_id,
      company_name,
      industry,
      engagements(
        id,
        title,
        description,
        status,
        start_date,
        created_at
      )
    `
    )
    .eq('user_id', user.id)
    .single()

  // If no client record found, show message
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Active Engagements</CardTitle>
            <CardDescription>
              You don't have any active consulting engagements yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your consultant will set up your engagement soon. You'll receive an email
              notification when it's ready.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If client has engagements, redirect to the most recent active one
  if (client.engagements && client.engagements.length > 0) {
    const activeEngagement = client.engagements
      .filter((e: any) => e.status === 'active')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      || client.engagements[0]

    redirect(`/client/workspace/${activeEngagement.id}`)
  }

  // If no engagements, show selection page
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Engagements</h1>
          <p className="text-muted-foreground">
            Select an engagement to view your workspace
          </p>
        </div>

        {client.engagements && client.engagements.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {client.engagements.map((engagement: any) => (
              <Link
                key={engagement.id}
                href={`/client/workspace/${engagement.id}`}
              >
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{engagement.title}</CardTitle>
                      </div>
                      <Badge variant={engagement.status === 'active' ? 'default' : 'secondary'}>
                        {engagement.status}
                      </Badge>
                    </div>
                    {engagement.description && (
                      <CardDescription>{engagement.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Started {new Date(engagement.start_date || engagement.created_at).toLocaleDateString()}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Engagements Yet</CardTitle>
              <CardDescription>
                Your consultant will create your engagement soon.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </div>
  )
}

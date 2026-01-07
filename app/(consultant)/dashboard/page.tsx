import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Users, CheckCircle, Clock } from 'lucide-react'

export default async function ConsultantDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch dashboard stats
  const [
    { count: totalClients },
    { count: activeEngagements },
    { count: pendingApprovals },
    { data: recentEngagements }
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('consultant_id', user!.id),
    supabase.from('engagements')
      .select('*, clients!inner(consultant_id)', { count: 'exact', head: true })
      .eq('clients.consultant_id', user!.id)
      .eq('status', 'active'),
    supabase.from('proposals')
      .select('*, engagements!inner(*, clients!inner(consultant_id))', { count: 'exact', head: true })
      .eq('engagements.clients.consultant_id', user!.id)
      .in('status', ['draft', 'pending_review']),
    supabase.from('engagements')
      .select('*, clients!inner(id, user_id, users!inner(full_name))')
      .eq('clients.consultant_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  const stats = [
    {
      title: 'Total Clients',
      value: totalClients || 0,
      icon: Users,
      description: 'Active clients',
    },
    {
      title: 'Active Engagements',
      value: activeEngagements || 0,
      icon: FileText,
      description: 'In progress',
    },
    {
      title: 'Pending Approvals',
      value: pendingApprovals || 0,
      icon: Clock,
      description: 'Awaiting review',
      link: '/consultant/approvals',
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your clients.
          </p>
        </div>
        <Link href="/consultant/clients/new">
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                {stat.link && stat.value > 0 && (
                  <Link href={stat.link}>
                    <Button variant="link" size="sm" className="px-0 mt-2">
                      View all →
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Engagements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Engagements</CardTitle>
          <CardDescription>
            Your most recent consulting engagements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recentEngagements || recentEngagements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No engagements yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Get started by adding your first client
              </p>
              <Link href="/consultant/clients/new">
                <Button>Add Client</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentEngagements.map((engagement: any) => (
                <Link
                  key={engagement.id}
                  href={`/consultant/engagements/${engagement.id}`}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{engagement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {engagement.clients.users.full_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={engagement.status === 'active' ? 'default' : 'secondary'}>
                      {engagement.status}
                    </Badge>
                  </div>
                </Link>
              ))}
              <Link href="/consultant/engagements">
                <Button variant="outline" className="w-full">
                  View All Engagements
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, FileText, Calendar } from 'lucide-react'
import { format } from 'date-fns'

export default async function EngagementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch all engagements for this consultant
  const { data: engagements } = await supabase
    .from('engagements')
    .select(`
      *,
      clients!inner(
        id,
        company_name,
        users!inner(full_name, email)
      ),
      proposals(id, status),
      sessions(id, status)
    `)
    .eq('clients.consultant_id', user!.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'completed':
        return 'secondary'
      case 'draft':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Engagements</h1>
          <p className="text-muted-foreground">
            Manage your consulting engagements and client projects
          </p>
        </div>
        <Link href="/consultant/engagements/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Engagement
          </Button>
        </Link>
      </div>

      {/* Engagements Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Engagements</CardTitle>
          <CardDescription>
            View and manage your client engagements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!engagements || engagements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No engagements yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Create your first engagement to get started
              </p>
              <Link href="/consultant/engagements/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Engagement
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Proposals</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engagements.map((engagement: any) => {
                  const proposalCount = engagement.proposals?.length || 0
                  const sessionCount = engagement.sessions?.length || 0
                  const pendingProposal = engagement.proposals?.find(
                    (p: any) => p.status === 'draft' || p.status === 'pending_review'
                  )

                  return (
                    <TableRow key={engagement.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/consultant/engagements/${engagement.id}`}
                          className="hover:underline"
                        >
                          {engagement.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {engagement.clients.users.full_name}
                          </div>
                          {engagement.clients.company_name && (
                            <div className="text-sm text-muted-foreground">
                              {engagement.clients.company_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(engagement.status)}>
                          {engagement.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{proposalCount}</span>
                          {pendingProposal && (
                            <Badge variant="outline" className="text-xs">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{sessionCount}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(engagement.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/consultant/engagements/${engagement.id}/proposal`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

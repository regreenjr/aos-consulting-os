'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Loader2, Sparkles, Check, X, Copy } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface IntakeResponse {
  question: string
  answer: string
}

interface ProposalEditorProps {
  intakeResponses: IntakeResponse[]
  existingProposal?: {
    content: string
    status: string
  }
  onSave: (content: string) => Promise<void>
  onApprove: (content: string) => Promise<void>
  onRegenerate: () => Promise<void>
}

export function ProposalEditor({
  intakeResponses,
  existingProposal,
  onSave,
  onApprove,
  onRegenerate,
}: ProposalEditorProps) {
  const [content, setContent] = useState(existingProposal?.content || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
    } finally {
      setIsSaving(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove(content)
    } finally {
      setIsApproving(false)
    }
  }

  const handleRegenerate = async () => {
    setIsGenerating(true)
    try {
      await onRegenerate()
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
  }

  // Simple markdown to HTML for preview
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line) => {
        // Headings
        if (line.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-6 mb-3">${line.slice(3)}</h2>`
        }
        if (line.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold mt-4 mb-2">${line.slice(4)}</h3>`
        }
        // Blockquotes
        if (line.startsWith('> ')) {
          return `<blockquote class="border-l-4 border-primary pl-4 italic my-2">${line.slice(2)}</blockquote>`
        }
        // Lists
        if (line.startsWith('- ')) {
          return `<li class="ml-4">${line.slice(2)}</li>`
        }
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')

        // Regular paragraph
        if (line.trim()) {
          return `<p class="my-2">${line}</p>`
        }
        return '<br/>'
      })
      .join('\n')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Panel: Intake Responses */}
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Client Intake Responses</CardTitle>
          <CardDescription>
            Review the client's responses before approving the proposal
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {intakeResponses.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="font-medium text-sm">{item.question}</div>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                {item.answer || 'No response'}
              </div>
              {index < intakeResponses.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
          {intakeResponses.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              No intake responses available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel: Proposal Editor */}
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI-Generated Proposal</CardTitle>
              <CardDescription>
                Review, edit, and approve the proposal before sending to client
              </CardDescription>
            </div>
            {existingProposal?.status && (
              <Badge variant={existingProposal.status === 'approved' ? 'default' : 'outline'}>
                {existingProposal.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Tabs for Edit/Preview */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <TabsContent value="edit" className="flex-1 mt-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="AI-generated proposal will appear here..."
                className="min-h-[500px] font-mono text-sm"
                disabled={isGenerating}
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 mt-4">
              <div
                className="prose prose-sm max-w-none p-4 border rounded-md min-h-[500px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
              />
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating || isSaving || isApproving}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Regenerate with AI
                </>
              )}
            </Button>

            <div className="flex-1" />

            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!content || isGenerating || isSaving || isApproving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </Button>

            <Button
              onClick={handleApprove}
              disabled={!content || isGenerating || isSaving || isApproving}
            >
              {isApproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Approve & Send
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

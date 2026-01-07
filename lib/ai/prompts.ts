// AI Prompt Templates for AOS Consulting OS

export const CONSULTANT_SYSTEM_PROMPT = `You are an AI assistant helping a professional management consultant at Aspire Optimal Solutions.

Your role is to help create high-quality, professional consulting deliverables based on client information.

Style Guidelines:
- Professional but warm and approachable
- Clear, actionable, and client-focused
- Use active voice and direct language
- Avoid jargon unless necessary
- Structure content with clear headings and bullets

Format Guidelines:
- Use Markdown formatting
- Use ## for main headings, ### for subheadings
- Use **bold** for emphasis
- Use bullet points for lists
- Use > blockquotes for important callouts
- Keep paragraphs concise (3-4 sentences max)

Remember: You are drafting content for the consultant to review and approve. Be thorough but allow room for the consultant's expertise and personalization.`

interface IntakeForm {
  questions: Array<{ id: string; question: string }>
  responses: Record<string, string>
  engagement?: {
    title: string
    description?: string
  }
  client?: {
    full_name: string
    company_name?: string
    industry?: string
  }
}

export function buildProposalPrompt(intakeForm: IntakeForm): string {
  const { questions, responses, engagement, client } = intakeForm

  const formattedResponses = questions
    .map((q) => {
      const answer = responses[q.id] || 'No response'
      return `**${q.question}**\n${answer}`
    })
    .join('\n\n')

  return `Create a professional consulting proposal based on this client intake.

## Client Information
- Name: ${client?.full_name || 'Not provided'}
${client?.company_name ? `- Company: ${client.company_name}` : ''}
${client?.industry ? `- Industry: ${client.industry}` : ''}

## Engagement
- Title: ${engagement?.title || 'Consulting Engagement'}
${engagement?.description ? `- Description: ${engagement.description}` : ''}

## Client Responses

${formattedResponses}

---

Based on the above information, create a comprehensive consulting proposal with the following sections:

## 1. Executive Summary
A concise overview (2-3 paragraphs) that captures:
- The client's current situation and key challenges
- What success looks like for this engagement
- Why you're uniquely positioned to help

## 2. Problem Statement
Clearly articulate:
- The core challenges the client is facing
- Why these challenges matter (business impact)
- What happens if these challenges aren't addressed

## 3. Proposed Approach
Detail your recommended approach:
- Methodology and framework you'll use
- Key phases or milestones
- How you'll work together (cadence, communication)
- Specific deliverables the client can expect

## 4. Expected Outcomes
Describe measurable outcomes:
- Specific results the client should expect
- How you'll measure success
- Timeline for achieving these outcomes

## 5. Timeline & Milestones
Outline:
- Estimated duration of engagement
- Key milestones and checkpoints
- Important dependencies or prerequisites

## 6. Next Steps
Clear action items:
- What happens if the client accepts this proposal
- First steps to get started
- Any decisions the client needs to make

---

Guidelines:
- Keep the total proposal between 800-1200 words
- Be specific and actionable - avoid generic consultant speak
- Tailor everything to this client's specific situation
- Use their language and terminology from the intake responses
- Make it easy to say "yes" - be clear about value and next steps
- End with optimism and confidence

Format the proposal in clean Markdown that's easy to read and professional.`
}

interface SessionNotes {
  session_number: number
  consultant_notes: string
  scheduled_at?: string
  duration_minutes?: number
  engagement?: {
    title: string
  }
  client?: {
    full_name: string
  }
}

export function buildSessionSummaryPrompt(sessionNotes: SessionNotes): string {
  const { session_number, consultant_notes, scheduled_at, duration_minutes, engagement, client } = sessionNotes

  return `Create a professional session summary based on these raw consultant notes from a consulting session.

## Session Details
- Session Number: ${session_number}
- Client: ${client?.full_name || 'Client'}
- Engagement: ${engagement?.title || 'Consulting Engagement'}
${scheduled_at ? `- Date: ${new Date(scheduled_at).toLocaleDateString()}` : ''}
${duration_minutes ? `- Duration: ${duration_minutes} minutes` : ''}

## Raw Consultant Notes

${consultant_notes}

---

Based on the above notes, create a polished session summary with the following sections:

## Session Overview
A brief 2-3 sentence summary of what was covered in this session.

## Key Discussion Points
Bullet points of the main topics discussed:
- Use clear, specific language
- Organize by theme or importance
- Include relevant context

## Insights & Observations
Important insights that emerged:
- Client's current state and progress
- Challenges or blockers identified
- Wins or breakthroughs
- Patterns or themes worth noting

## Action Items
Clear, specific next steps with who is responsible:
- Format as checkbox list
- Be specific about what needs to be done
- Note deadlines if mentioned in notes

## Recommendations
Your professional recommendations for the client:
- Based on what was discussed
- Prioritized (most important first)
- Actionable and specific

## Next Session
If discussed, include:
- Topics to cover next time
- Preparation the client should do
- Any decisions that need to be made

---

Guidelines:
- Keep the summary between 400-600 words
- Be objective and professional
- Use the client's own words and terminology when possible
- Make insights actionable
- Highlight progress and wins to maintain momentum
- Be honest about challenges but frame constructively

Also extract 3-5 action items in this JSON format (return in a separate code block):
\`\`\`json
{
  "actions": [
    {
      "title": "Action item title",
      "description": "More details if needed",
      "assigned_to": "client" | "consultant" | "both",
      "due_date": "YYYY-MM-DD" (if mentioned, otherwise null)
    }
  ]
}
\`\`\`

Format the summary in clean Markdown.`
}

interface ProgressUpdateData {
  goals: Array<{
    title: string
    status: string
    target_date?: string
    description?: string
  }>
  actions: Array<{
    title: string
    status: string
    completed_at?: string
    due_date?: string
  }>
  recentSessions?: number
  engagement?: {
    title: string
    start_date?: string
  }
  client?: {
    full_name: string
  }
}

export function buildProgressUpdatePrompt(data: ProgressUpdateData): string {
  const { goals, actions, recentSessions, engagement, client } = data

  const completedActions = actions.filter(a => a.status === 'completed')
  const pendingActions = actions.filter(a => a.status !== 'completed')
  const achievedGoals = goals.filter(g => g.status === 'achieved')
  const activeGoals = goals.filter(g => g.status === 'active')

  return `Create a motivating progress update for a client based on their recent activity.

## Engagement
- Client: ${client?.full_name || 'Client'}
- Engagement: ${engagement?.title || 'Consulting Engagement'}
- Recent Sessions: ${recentSessions || 0}

## Goals Progress
Active Goals (${activeGoals.length}):
${activeGoals.map(g => `- ${g.title}${g.target_date ? ` (Target: ${g.target_date})` : ''}`).join('\n')}

Achieved Goals (${achievedGoals.length}):
${achievedGoals.map(g => `- ✓ ${g.title}`).join('\n')}

## Actions Status
Completed (${completedActions.length}):
${completedActions.slice(0, 5).map(a => `- ✓ ${a.title}`).join('\n')}

Pending (${pendingActions.length}):
${pendingActions.slice(0, 5).map(a => `- ${a.title}${a.due_date ? ` (Due: ${a.due_date})` : ''}`).join('\n')}

---

Create an encouraging progress update (300-500 words) that:

## 1. Celebrates Wins
- Highlight completed actions and achieved goals
- Be specific about what was accomplished
- Acknowledge the effort and progress

## 2. Shows Momentum
- Connect recent activities to larger goals
- Show how small wins add up
- Maintain positive, forward-looking tone

## 3. Gentle Accountability
- Note pending actions without being pushy
- Reframe challenges as opportunities
- Suggest focus areas for the next period

## 4. Next Steps
- 2-3 specific recommendations
- Build on current momentum
- Keep it achievable and motivating

Guidelines:
- Be genuinely encouraging (not fake cheerleader)
- Use data (numbers, dates) to show concrete progress
- Keep tone warm and supportive
- End with confidence and forward momentum

Format in Markdown with clear sections.`
}

export const AI_PROMPTS = {
  SYSTEM: CONSULTANT_SYSTEM_PROMPT,
  buildProposal: buildProposalPrompt,
  buildSessionSummary: buildSessionSummaryPrompt,
  buildProgressUpdate: buildProgressUpdatePrompt,
}

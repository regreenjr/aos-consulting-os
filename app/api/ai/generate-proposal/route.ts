import { createClient } from '@/lib/supabase/server'
import { AI_PROMPTS } from '@/lib/ai/prompts'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a consultant
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'consultant') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { intakeResponses, clientInfo, engagementInfo } = body

    // Build the prompt for Claude
    const intakeForm = {
      questions: intakeResponses.map((r: any, i: number) => ({
        id: `q${i}`,
        question: r.question,
      })),
      responses: intakeResponses.reduce((acc: any, r: any, i: number) => {
        acc[`q${i}`] = r.answer
        return acc
      }, {}),
      client: clientInfo,
      engagement: engagementInfo,
    }

    const userPrompt = AI_PROMPTS.buildProposal(intakeForm)

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      // Return a mock response for development
      console.warn('ANTHROPIC_API_KEY not configured, returning mock proposal')
      return NextResponse.json({
        content: generateMockProposal(clientInfo, engagementInfo, intakeResponses),
        mock: true,
      })
    }

    // Call Claude API
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: AI_PROMPTS.SYSTEM,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : ''

    // Log AI usage
    await supabase.from('ai_usage_logs').insert({
      operation: 'generate_proposal',
      prompt_tokens: message.usage.input_tokens,
      completion_tokens: message.usage.output_tokens,
      total_tokens: message.usage.input_tokens + message.usage.output_tokens,
      cost_usd: calculateCost(message.usage.input_tokens, message.usage.output_tokens),
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error generating proposal:', error)
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    )
  }
}

// Calculate cost based on Claude 3.5 Sonnet pricing
function calculateCost(inputTokens: number, outputTokens: number): number {
  const INPUT_COST_PER_1K = 0.003 // $3 per million
  const OUTPUT_COST_PER_1K = 0.015 // $15 per million

  const inputCost = (inputTokens / 1000) * INPUT_COST_PER_1K
  const outputCost = (outputTokens / 1000) * OUTPUT_COST_PER_1K

  return inputCost + outputCost
}

// Mock proposal generator for development without API key
function generateMockProposal(
  clientInfo: any,
  engagementInfo: any,
  intakeResponses: any[]
): string {
  return `## Executive Summary

Thank you for the opportunity to work with ${clientInfo.full_name}${
    clientInfo.company_name ? ` at ${clientInfo.company_name}` : ''
  } on ${engagementInfo.title}.

Based on our intake conversation, I understand you're looking to achieve meaningful progress in your business. This proposal outlines how we'll work together to make that happen.

## Problem Statement

From your responses, I've identified several key challenges:
${intakeResponses
  .slice(0, 3)
  .map((r) => `- **${r.question}**: ${r.answer.substring(0, 100)}${r.answer.length > 100 ? '...' : ''}`)
  .join('\n')}

These challenges are holding you back from reaching your full potential.

## Proposed Approach

I recommend a structured, collaborative approach:

1. **Discovery & Assessment** (Weeks 1-2)
   - Deep dive into your current situation
   - Identify quick wins and long-term opportunities
   - Establish clear success metrics

2. **Strategy Development** (Weeks 3-4)
   - Create actionable roadmap
   - Prioritize initiatives based on impact
   - Design implementation framework

3. **Implementation Support** (Ongoing)
   - Regular check-ins and accountability
   - Course correction as needed
   - Continuous progress tracking

## Expected Outcomes

By working together, you can expect:

- **Clarity**: A clear roadmap for achieving your goals
- **Progress**: Measurable improvements in key areas
- **Confidence**: Tools and frameworks to sustain momentum
- **Results**: Tangible business outcomes within 90 days

## Timeline & Milestones

- **Month 1**: Foundation and quick wins
- **Month 2**: Core strategy implementation
- **Month 3**: Optimization and handoff

Key checkpoint meetings every 2 weeks to ensure we're on track.

## Next Steps

If this approach resonates with you:

1. Review this proposal and share any questions
2. Schedule our kickoff session
3. Complete any pre-work assignments
4. Begin our engagement!

I'm excited about the opportunity to work together and confident we can achieve meaningful results.

---

**Note**: This is a MOCK proposal generated for development. Configure ANTHROPIC_API_KEY to use real AI generation.`
}

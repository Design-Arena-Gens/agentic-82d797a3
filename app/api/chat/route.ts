import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are an expert AI coding assistant. Your purpose is to help users with:
1. Writing code in any programming language
2. Debugging and fixing code issues
3. Explaining programming concepts
4. Providing best practices and optimizations
5. Answering technical questions

When writing code:
- Provide complete, working examples
- Include comments explaining key parts
- Use modern best practices
- Consider edge cases and error handling

When answering questions:
- Be clear and concise
- Use examples when helpful
- Explain complex concepts in simple terms

Always be helpful, accurate, and encouraging.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    // Build the conversation for Claude
    const conversationHistory = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content
    }))

    // Use Anthropic API
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: conversationHistory
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.content[0].text

    return NextResponse.json({ response: assistantMessage })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      })

      const data = await response.json()

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${data.error}`
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="w-full max-w-4xl flex flex-col h-screen">
        <header className="p-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            AI Coder Assistant
          </h1>
          <p className="text-gray-400 mt-2">Your personal coding companion</p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center mt-20">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-semibold text-gray-300 mb-2">
                Welcome to your AI Coder!
              </h2>
              <p className="text-gray-400">
                Ask me to code anything or answer your questions
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">💻 Write a function to sort an array</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">🚀 Create a REST API with Node.js</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">🎨 Build a responsive navbar</p>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">❓ Explain async/await in JavaScript</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-700">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to code something or ask a question..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

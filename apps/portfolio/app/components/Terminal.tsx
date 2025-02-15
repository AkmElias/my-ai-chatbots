"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface TerminalProps {
  input: string
  setInput: (value: string) => void
  output: string[]
  handleCommand: (command: string) => void
}

const Terminal: React.FC<TerminalProps> = ({ input, setInput, output, handleCommand }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output]) //Fixed unnecessary dependency

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleCommand(input.trim())
      setInput("")
    }
  }

  return (
    <div className="font-mono text-sm">
      <div ref={outputRef} className="h-[calc(100vh-60px)] overflow-y-auto">
        {output.map((line, index) => (
          <pre key={index} className="whitespace-pre-wrap">
            {line}
          </pre>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex items-center">
        <span className="mr-2">$</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-transparent outline-none"
          autoFocus
        />
      </form>
    </div>
  )
}

export default Terminal


"use client"

import { useState, useEffect } from "react"
import Terminal from "./components/Terminal"
import { fetchGitHubProjects } from "./utils/github"

const AVAILABLE_COMMANDS = "Available commands: help, about, skills, experience, projects, contact, play, clear"

const WORDS = ["javascript", "react", "nextjs", "typescript", "tailwind", "vercel", "github", "coding"]

export default function Home() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<string[]>([
    "Welcome to the terminal portfolio of A K M Elias",
    "Where code meets creativity!",
    'Type "help" to see available commands',
  ])
  const [githubProjects, setGithubProjects] = useState<any[]>([])
  const [gameState, setGameState] = useState<{
    isPlaying: boolean
    word: string
    guessedLetters: Set<string>
    attemptsLeft: number
  }>({ isPlaying: false, word: "", guessedLetters: new Set(), attemptsLeft: 10 })

  useEffect(() => {
    fetchGitHubProjects().then(setGithubProjects).catch(console.error)
  }, [])

  const handleCommand = (command: string) => {
    let newOutput: string[] = []

    if (gameState.isPlaying) {
      handleGameInput(command)
      return
    }

    switch (command.toLowerCase()) {
      case "help":
        newOutput = [AVAILABLE_COMMANDS]
        break
      case "about":
        newOutput = [
          "=== The Code Maestro's Overture ===",
          "A K M Elias - Senior Software Engineer at Authlab, Sylhet",
          "Experienced WordPress Plugin Developer with over 3 years of expertise",
          "Contributor to WordPress Core",
          "Specializes in API integrations",
        ]
        break
      case "skills":
        newOutput = [
          "=== The Developer's Toolkit ===",
          "Main Skills:",
          "- PHP",
          "- Laravel",
          "- Javascript",
          "- Vue",
          "- WordPress Plugin Development",
          "- API Integrations",
          "Additional Experience: React, NodeJs, C++, Python",
        ]
        break
      case "experience":
        newOutput = [
          "=== The Journey of a Code Craftsman ===",
          "Current: Senior Software Engineer at Authlab, Sylhet",
          "Specialization:",
          "- WordPress Plugin Development (3+ years)",
          "- API Integrations",
          "- Payment Gateway Integrations",
          "- WordPress Core Contributor",
          "- Developed Android Apps",
        ]
        break
      case "projects":
        newOutput = [
          "=== The Gallery of Digital Creations ===",
          "WordPress Plugin Development (3+ years of experience)",
          "API Integration Projects",
          "WordPress Core Contributions",
          "Top GitHub Projects:",
          ...githubProjects.map(
            (project, index) => `${index + 1}. ${project.name}: ${project.url} (Stars: ${project.stars})`,
          ),
          "For more projects, visit: https://github.com/AkmElias",
        ]
        break
      case "contact":
        newOutput = [
          "=== Let's Connect in the Digital Realm ===",
          "Email: akmelias11@gmail.com",
          "GitHub: https://github.com/AkmElias",
          "LinkedIn: https://www.linkedin.com/in/akm-elias/",
          "Twitter: https://x.com/EliasAkm",
        ]
        break
      case "play":
        startGame()
        return
      case "clear":
        setOutput([])
        return
      default:
        newOutput = [`Command not recognized: ${command}. Type "help" for available commands.`]
    }

    setOutput([...output, `$ ${command}`, ...newOutput])
  }

  const startGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    setGameState({ isPlaying: true, word: randomWord, guessedLetters: new Set(), attemptsLeft: 10 })
    setOutput([
      ...output,
      "=== Word Guessing Game ===",
      "I'm thinking of a word related to programming. Try to guess it!",
      "Type a letter to guess or 'quit' to end the game.",
      `Word: ${"_".repeat(randomWord.length)}`,
      `Attempts left: 10`,
    ])
  }

  const handleGameInput = (input: string) => {
    if (input.toLowerCase() === "quit") {
      setGameState({ isPlaying: false, word: "", guessedLetters: new Set(), attemptsLeft: 10 })
      setOutput([...output, "Game over. The word was: " + gameState.word, "Thanks for playing!"])
      return
    }

    if (input.length !== 1 || !/[a-z]/i.test(input)) {
      setOutput([...output, `$ ${input}`, "Please enter a single letter or 'quit' to end the game."])
      return
    }

    const letter = input.toLowerCase()
    const newGuessedLetters = new Set(gameState.guessedLetters).add(letter)
    let newAttemptsLeft = gameState.attemptsLeft

    if (!gameState.word.includes(letter)) {
      newAttemptsLeft--
    }

    const wordProgress = gameState.word
      .split("")
      .map((char) => (newGuessedLetters.has(char) ? char : "_"))
      .join("")

    const isWordGuessed = !wordProgress.includes("_")

    setGameState((prevState) => ({
      ...prevState,
      guessedLetters: newGuessedLetters,
      attemptsLeft: newAttemptsLeft,
    }))

    const responseMessage = [
      `$ ${input}`,
      `Word: ${wordProgress}`,
      `Attempts left: ${newAttemptsLeft}`,
      `Guessed letters: ${Array.from(newGuessedLetters).join(", ")}`,
    ]

    if (isWordGuessed) {
      responseMessage.push(`Congratulations! You've guessed the word: ${gameState.word}`)
      responseMessage.push("Game over. Type 'game' to play again!")
      setGameState({ isPlaying: false, word: "", guessedLetters: new Set(), attemptsLeft: 10 })
    } else if (newAttemptsLeft === 0) {
      responseMessage.push(`Game over. The word was: ${gameState.word}`)
      responseMessage.push("Type 'game' to play again!")
      setGameState({ isPlaying: false, word: "", guessedLetters: new Set(), attemptsLeft: 10 })
    }

    setOutput([...output, ...responseMessage])
  }

  return (
    <main className="min-h-screen">
      <Terminal input={input} setInput={setInput} output={output} handleCommand={handleCommand} />
    </main>
  )
}


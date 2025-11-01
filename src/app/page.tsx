"use client"

import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { About } from '@/components/About'
import { Footer } from '@/components/Footer'
import { AIChatbot } from '@/components/AIChatbot'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Footer />
      <AIChatbot />
    </div>
  )
}
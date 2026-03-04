import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { signupAction, loginAction } from "./actions"
import { LoginForm, SignupForm } from "@/components/auth-forms"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">
          SocialBridge
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link href="#login">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero Section */}
        <section className="py-24 px-6 text-center space-y-6 max-w-4xl mx-auto">
          <Badge>New: Video Smart Routing</Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Publish Once, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-500">Everywhere.</span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            SocialBridge analyzes your content and automatically distributes it to the platforms where it performs best.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="#login">
              <Button size="lg" className="h-12 px-8 text-lg">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg" className="h-12 px-8 text-lg">View Demo</Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6 bg-slate-100 dark:bg-slate-900/50">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Smart Analysis"
              description="We detect video duration, aspect ratio, and type to pick the perfect platforms."
              icon="🧠"
            />
            <FeatureCard
              title="Universal API"
              description="One simple API endpoint to replace all your social media integrations."
              icon="🔌"
            />
            <FeatureCard
              title="Scalable Queue"
              description="Built on BullMQ and Redis to handle millions of posts reliably."
              icon="🚀"
            />
          </div>
        </section>

        {/* Auth Section */}
        <section id="login" className="py-24 px-6 flex justify-center">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold mb-2">Join SocialBridge</h2>
              <p className="text-slate-500">Create an account to get your API Key.</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </div>
        </section>

      </main>

      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-200 dark:border-slate-800">
        © 2026 SocialBridge Inc. All rights reserved.
      </footer>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
      {children}
    </span>
  )
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}

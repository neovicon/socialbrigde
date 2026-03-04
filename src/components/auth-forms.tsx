"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { signupAction, loginAction } from "@/app/actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function LoginForm() {
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            const result = await loginAction(formData)
            if (result?.error) {
                toast.error(result.error)
            } else {
                // Success (redirect handled by action, but client side nav might need help if action returns undefined on success? 
                // Action uses redirect() which throws NEXT_REDIRECT, so we catch it?
                // No, redirect() in Server Action handles it.
                // But if we preventDefault, we need to ensure the action is called.
            }
        } catch (error) {
            // redirect throws an error, we should let it bubble if it's a redirect?
            // Actually client-side call to server action that redirects: the promise never resolves/rejects in a way that needs catch if redirect happens?
            // Wait, redirect() in Next.js Server Actions sends a redirect response. The client router handles it.
            // So await finishes.
            // If it doesn't redirect, we check result.
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your email to access your dashboard.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required disabled={loading} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

export function SignupForm() {
    const [loading, setLoading] = React.useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        const formData = new FormData(event.currentTarget)

        try {
            const result = await signupAction(formData)
            if (result?.error) {
                toast.error(result.error)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Get started with a new account.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" placeholder="John Doe" disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="you@example.com" required disabled={loading} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required minLength={6} disabled={loading} />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating account..." : "Sign Up"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}

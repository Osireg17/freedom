'use client'
import { useState } from "react"
import { useSignUp, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { CheckCircle2, XCircle, Mail, Lock, Eye, EyeOff, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

const signUpSchema = z
    .object({
        firstName: z
            .string()
            .min(2, { message: "First name must be at least 2 characters" })
            .max(50, { message: "First name must be less than 50 characters" }),
        lastName: z
            .string()
            .min(2, { message: "Last name must be at least 2 characters" })
            .max(50, { message: "Last name must be less than 50 characters" }),
        username: z
            .string()
            .min(3, { message: "Username must be at least 3 characters" })
            .max(30, { message: "Username must be less than 30 characters" })
            .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
        email: z.string().email({ message: "Please enter a valid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
            .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
            .regex(/[0-9]/, { message: "Password must contain at least one number" }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    })

type SignUpFormValues = z.infer<typeof signUpSchema>

export default function SignUp() {
    const { signUp } = useSignUp()
    const { setActive } = useClerk()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [code, setCode] = useState("")

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onBlur",
    })

    const watchPassword = form.watch("password")

    const passwordRequirements = [
        { id: "length", label: "At least 8 characters", regex: /.{8,}/ },
        { id: "uppercase", label: "One uppercase letter", regex: /[A-Z]/ },
        { id: "lowercase", label: "One lowercase letter", regex: /[a-z]/ },
        { id: "number", label: "One number", regex: /[0-9]/ },
    ]

    const onSubmit = async (values: SignUpFormValues) => {
        if (!signUp) return
        try {
            setIsLoading(true)
            const { error } = await signUp.password({
                firstName: values.firstName,
                lastName: values.lastName,
                username: values.username,
                emailAddress: values.email,
                password: values.password,
            })
            if (error) {
                toast.error(error.message)
                return
            }
            console.log('[onSubmit] signUp.status after password():', signUp.status)
            console.log('[onSubmit] signUp.verifications:', JSON.stringify(signUp.verifications, null, 2))
            console.log('[onSubmit] signUp.missingFields:', signUp.missingFields)
            await signUp.verifications.sendEmailCode()
            setVerifying(true)
        } catch (err: any) {
            toast.error(err?.message ?? "An error occurred during sign up. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const onVerify = async () => {
        if (!signUp) return
        try {
            setIsLoading(true)
            const verifyResult = await signUp.verifications.verifyEmailCode({ code })
            console.log('[onVerify] verifyEmailCode result:', JSON.stringify(verifyResult, null, 2))
            console.log('[onVerify] signUp.status after verify:', signUp.status)
            console.log('[onVerify] signUp.createdSessionId:', signUp.createdSessionId)
            if (verifyResult.error) {
                toast.error(verifyResult.error.message)
                return
            }
            console.log('[onVerify] calling setActive, sessionId:', signUp.createdSessionId)
            await setActive({ session: signUp.createdSessionId })
            console.log('[onVerify] setActive complete, pushing to dashboard')
            router.push('/dashboard')
        } catch (err: any) {
            toast.error(err?.message ?? "Verification failed. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (verifying) {
        return (
            <div data-testid="verify-email-container">
                <Card className="border-none shadow-none sm:border sm:shadow">
                    <CardContent className="p-0 sm:p-6 space-y-4">
                        <div className="flex flex-col space-y-2 text-center">
                            <Mail className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                We sent a verification code to your email. Enter it below.
                            </p>
                        </div>
                        <Input
                            placeholder="Enter verification code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            data-testid="verify-code-input"
                        />
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={onVerify}
                            disabled={isLoading || !code}
                            data-testid="verify-submit-button"
                        >
                            {isLoading ? "Verifying..." : "Verify email"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div data-testid="signup-form-container">
            <Card className="border-none shadow-none sm:border sm:shadow">
                <CardContent className="p-0 sm:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="signup-form">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="John"
                                                        className="pl-10"
                                                        {...field}
                                                        data-testid="signup-firstname-input"
                                                        aria-label="First name"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Doe"
                                                        className="pl-10"
                                                        {...field}
                                                        data-testid="signup-lastname-input"
                                                        aria-label="Last name"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    placeholder="johndoe"
                                                    className="pl-10"
                                                    {...field}
                                                    data-testid="signup-username-input"
                                                    aria-label="Username"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder="name@example.com"
                                                    className="pl-10"
                                                    {...field}
                                                    data-testid="signup-email-input"
                                                    aria-label="Email address"
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10"
                                                    {...field}
                                                    data-testid="signup-password-input"
                                                    aria-label="Password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1 h-8 w-8 p-0"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2 rounded-md bg-muted/50 p-3">
                                <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
                                <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                                    {passwordRequirements.map((req) => (
                                        <li key={req.id} className="flex items-center gap-2 text-xs">
                                            {watchPassword && req.regex.test(watchPassword) ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                            ) : (
                                                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                                            )}
                                            <span
                                                className={
                                                    watchPassword && req.regex.test(watchPassword) ? "text-foreground" : "text-muted-foreground"
                                                }
                                            >
                                                {req.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    className="pl-10 pr-10"
                                                    {...field}
                                                    data-testid="signup-confirm-password-input"
                                                    aria-label="Confirm password"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute right-1 top-1 h-8 w-8 p-0"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                                                </Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={isLoading}
                                data-testid="signup-submit-button"
                                aria-label="Create account"
                            >
                                {isLoading ? "Creating account..." : "Create account"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex flex-col items-center p-6 text-center">
                    <div className="text-xs text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link href="/terms" className="hover:text-primary underline underline-offset-4">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="hover:text-primary underline underline-offset-4">
                            Privacy Policy
                        </Link>
                        .
                    </div>
                    <div className="mt-4 text-sm">
                        Already have an account?{" "}
                        <Link href="/sign-in" className="font-medium text-primary hover:underline" data-testid="signup-signin-link">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

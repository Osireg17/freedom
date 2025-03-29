"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import Link from "next/link"
import { CheckCircle2, XCircle, Mail, Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useErrorLogging } from "@/hooks/use-error-logging"

// Define the sign-up form schema using zod
const signUpSchema = z
    .object({
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
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    // State variable to track if the toast has already been shown
    const { logError } = useErrorLogging()
    const supabase = createClient()

    const form = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
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
        try {
            setIsLoading(true);

            // Sign up with Supabase
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        email_confirmed: false,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data?.user) {
                // Success! Show notification and redirect to complete profile
                toast.success("Account created successfully! Please complete your profile.");

                // Navigate directly to complete profile
                router.push("/complete-profile");
            }
        } catch (error) {
            logError(error, { action: "signUp" });
            toast.error("An error occurred during sign up. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div data-testid="signup-form-container">
            <Card className="border-none shadow-none sm:border sm:shadow">
                <CardContent className="p-0 sm:p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="signup-form">
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

                            {/* Password requirements */}
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

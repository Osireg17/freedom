// src/components/interviews/job/job-interview-form.tsx
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase, Building2, FileText, Clock, AlarmClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useErrorLogging } from '@/hooks/use-error-logging';
import { Progress } from '@/components/ui/progress';

// Define the form validation schema
const jobInterviewSchema = z.object({
    jobTitle: z.string().min(2, {
        message: "Job title must be at least 2 characters."
    }),
    companyName: z.string().min(2, {
        message: "Company name must be at least 2 characters."
    }),
    jobDescription: z.string().min(50, {
        message: "Please provide a detailed job description (at least 50 characters) for better question generation."
    }),
    yearsExperience: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Please enter a valid number for years of experience."
    }),
    timeToAnswer: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Please select a valid answer time."
    }),
    prepTime: z.string().refine((val) => !isNaN(Number(val)), {
        message: "Please select a valid preparation time."
    }),
});

type JobInterviewFormValues = z.infer<typeof jobInterviewSchema>;

export default function JobInterviewForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formProgress, setFormProgress] = useState(0);
    const { logError } = useErrorLogging();

    // Define default values for the form
    const defaultValues: Partial<JobInterviewFormValues> = {
        jobTitle: "",
        companyName: "",
        jobDescription: "",
        yearsExperience: "3",
        timeToAnswer: "120",
        prepTime: "30"
    };

    // Initialize form with validation schema
    const form = useForm<JobInterviewFormValues>({
        resolver: zodResolver(jobInterviewSchema),
        defaultValues,
        mode: "onChange"
    });

    // Update progress bar based on form completion
    const updateProgress = () => {
        const values = form.getValues();
        const fields = Object.keys(defaultValues);
        const filledFields = fields.filter(field => {
            const value = values[field as keyof JobInterviewFormValues];
            return value && (typeof value !== 'string' || value.trim() !== '');
        });

        setFormProgress(Math.round((filledFields.length / fields.length) * 100));
    };

    // Update progress on form change
    form.watch(() => {
        updateProgress();
    });

    // Handle form submission
    async function onSubmit(values: JobInterviewFormValues) {
        setIsSubmitting(true);

        try {
            // Here we would make an API call to create the interview
            console.log("Form values:", values);

            // Simulate API call with progressive loading
            await new Promise(resolve => setTimeout(resolve, 500));
            setFormProgress(70);
            await new Promise(resolve => setTimeout(resolve, 500));
            setFormProgress(90);
            await new Promise(resolve => setTimeout(resolve, 500));
            setFormProgress(100);

            // Redirect to interviews page or newly created interview
            router.push('/dashboard/interviews');
        } catch (error) {
            logError(error, {
                context: 'JobInterviewForm.onSubmit',
                formValues: values,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Get character count for job description
    const jobDescriptionLength = form.watch('jobDescription')?.length || 0;
    const jobDescriptionMinLength = 250;
    const jobDescriptionColor = jobDescriptionLength < jobDescriptionMinLength ? 'text-destructive' : 'text-green-600';

    return (
        <>
            <Progress value={formProgress} className="h-2 mb-6" data-testid="form-progress" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                    data-testid="job-interview-form"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="jobTitle"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="flex items-center">
                                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                                        Job Title
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Front-end Developer"
                                            {...field}
                                            data-testid="job-title-input"
                                            className="border-primary/20 focus:border-primary"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Enter the exact title from the job posting
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="flex items-center">
                                        <Building2 className="h-4 w-4 mr-2 text-primary" />
                                        Company Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Acme Corporation"
                                            {...field}
                                            data-testid="company-name-input"
                                            className="border-primary/20 focus:border-primary"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        The company you&apos;re applying to
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="jobDescription"
                        render={({ field }) => (
                            <FormItem className="space-y-2">
                                <FormLabel className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-primary" />
                                    Job Description
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Textarea
                                            placeholder="Paste the full job description here..."
                                            className="min-h-[200px] border-primary/20 focus:border-primary resize-y"
                                            {...field}
                                            data-testid="job-description-textarea"
                                        />
                                        <div className={`absolute bottom-2 right-2 text-xs font-medium ${jobDescriptionColor}`}>
                                            {jobDescriptionLength}/{jobDescriptionMinLength}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Include responsibilities, requirements, and qualifications for more accurate questions
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                            control={form.control}
                            name="yearsExperience"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-primary" />
                                        Years of Experience
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger
                                                data-testid="years-experience-select"
                                                className="border-primary/20 focus:border-primary"
                                            >
                                                <SelectValue placeholder="Select years" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">Entry Level (0-1)</SelectItem>
                                                <SelectItem value="1">1 year</SelectItem>
                                                <SelectItem value="2">2 years</SelectItem>
                                                <SelectItem value="3">3 years</SelectItem>
                                                <SelectItem value="5">5 years</SelectItem>
                                                <SelectItem value="7">7+ years</SelectItem>
                                                <SelectItem value="10">10+ years</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Helps tailor question difficulty
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="prepTime"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="flex items-center">
                                        <AlarmClock className="h-4 w-4 mr-2 text-primary" />
                                        Prep Time (seconds)
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger
                                                data-testid="prep-time-select"
                                                className="border-primary/20 focus:border-primary"
                                            >
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No prep time</SelectItem>
                                                <SelectItem value="15">15 seconds</SelectItem>
                                                <SelectItem value="30">30 seconds</SelectItem>
                                                <SelectItem value="45">45 seconds</SelectItem>
                                                <SelectItem value="60">60 seconds (1 min)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Time to think before recording
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="timeToAnswer"
                            render={({ field }) => (
                                <FormItem className="space-y-2">
                                    <FormLabel className="flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-primary" />
                                        Answer Time (seconds)
                                    </FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger
                                                data-testid="time-to-answer-select"
                                                className="border-primary/20 focus:border-primary"
                                            >
                                                <SelectValue placeholder="Select time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="60">60 seconds</SelectItem>
                                                <SelectItem value="90">90 seconds</SelectItem>
                                                <SelectItem value="120">120 seconds (2 min)</SelectItem>
                                                <SelectItem value="180">180 seconds (3 min)</SelectItem>
                                                <SelectItem value="240">240 seconds (4 min)</SelectItem>
                                                <SelectItem value="300">300 seconds (5 min)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Time to record each answer
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg mt-8 relative overflow-hidden group"
                        disabled={isSubmitting}
                        data-testid="generate-interview-button"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating Your Interview...
                                </>
                            ) : (
                                <>Generate Interview Questions</>
                            )}
                        </span>
                        <span className="absolute bottom-0 left-0 h-1 bg-white/20 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </Button>
                </form>
            </Form>
        </>
    );
}
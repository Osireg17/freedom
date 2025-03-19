"use client"

import { Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FeatureItem {
    name: string
    free: boolean
    standard: boolean
    pro: boolean
    description?: string
}

export function FeatureComparison() {
    const features: FeatureItem[] = [
        {
            name: "Basic Question Library",
            free: true,
            standard: true,
            pro: true,
            description: "Access to our library of common interview questions",
        },
        {
            name: "Job Description-Based Questions",
            free: true,
            standard: true,
            pro: true,
            description: "Generate questions based on specific job postings",
        },
        {
            name: "Resume-Based Questions",
            free: true,
            standard: true,
            pro: true,
            description: "Generate questions based on your resume",
        },
        {
            name: "Basic STAR Method Scoring",
            free: true,
            standard: true,
            pro: true,
            description: "Evaluation of Situation, Task, Action, Result components",
        },
        {
            name: "Retry Attempts",
            free: false,
            standard: true,
            pro: true,
            description: "Ability to retry answers during practice",
        },
        {
            name: "Communication Quality Assessment",
            free: false,
            standard: true,
            pro: true,
            description: "Feedback on clarity, conciseness, and professionalism",
        },
        {
            name: "Content Quality Analysis",
            free: false,
            standard: true,
            pro: true,
            description: "Evaluation of relevance, specificity, and depth",
        },
        {
            name: "Detailed STAR Method Breakdown",
            free: false,
            standard: false,
            pro: true,
            description: "In-depth analysis of each STAR component",
        },
        {
            name: "Unlimited Response Storage",
            free: false,
            standard: false,
            pro: true,
            description: "Keep all your practice sessions indefinitely",
        },
        {
            name: "Full Question Library",
            free: false,
            standard: false,
            pro: true,
            description: "Access to our entire library of interview questions",
        },
    ]

    return (
        <div className="w-full overflow-x-auto" data-testid="pricing-feature-comparison">
            <Table className="w-full min-w-[600px]">
                <TableHeader>
                    <TableRow className="border-b">
                        <TableHead className="py-4 text-left font-medium text-base">Feature</TableHead>
                        <TableHead className="px-4 py-4 text-center font-medium text-base">Free</TableHead>
                        <TableHead className="px-4 py-4 text-center font-medium text-base">Standard</TableHead>
                        <TableHead className="px-4 py-4 text-center font-medium text-base">Pro</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {features.map((feature, index) => (
                        <TableRow
                            key={index}
                            className={index % 2 === 0 ? "bg-muted/30" : ""}
                            data-testid={`pricing-feature-row-${index}`}
                        >
                            <TableCell className="py-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{feature.name}</span>
                                                {feature.description && (
                                                    <span className="text-xs text-muted-foreground hidden md:inline-block">
                                                        {feature.description}
                                                    </span>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        {feature.description && (
                                            <TooltipContent className="md:hidden">
                                                <p className="max-w-xs">{feature.description}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                                {feature.free ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                                {feature.standard ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-center">
                                {feature.pro ? (
                                    <Check className="h-5 w-5 mx-auto text-primary" />
                                ) : (
                                    <X className="h-5 w-5 mx-auto text-muted-foreground" />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                    <TableRow className="border-b">
                        <TableCell className="py-3 font-medium">Monthly Interviews</TableCell>
                        <TableCell className="px-4 py-3 text-center">3</TableCell>
                        <TableCell className="px-4 py-3 text-center">10</TableCell>
                        <TableCell className="px-4 py-3 text-center">Unlimited</TableCell>
                    </TableRow>
                    <TableRow className="border-b">
                        <TableCell className="py-3 font-medium">Retry Attempts</TableCell>
                        <TableCell className="px-4 py-3 text-center">0</TableCell>
                        <TableCell className="px-4 py-3 text-center">2 per question</TableCell>
                        <TableCell className="px-4 py-3 text-center">3 per question</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    )
}


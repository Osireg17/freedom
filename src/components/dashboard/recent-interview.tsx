import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";

interface Interview {
    id: string;
    title: string;
    date: string;
    score: number;
    topStrength: string;
}

export function RecentInterviewsSection({ interviews }: { interviews: Interview[] }) {
    return (
        <div data-testid="recent-interviews-section">
            <h2 className="text-xl font-semibold mb-4">Recent Interviews</h2>
            <div className="grid gap-4">
                {interviews.map((interview) => (
                    <Card key={interview.id} className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center space-x-3">
                                <div>
                                    <div className="text-sm font-medium">{interview.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {new Date(interview.date).toLocaleDateString('en-GB', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-primary hover:underline flex items-center gap-1">
                                Feedback <ArrowRightIcon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="flex justify-between items-center text-sm">
                            <div>
                                <div className="text-muted-foreground">Score</div>
                                <div className="text-xl font-bold text-green-500">{interview.score}%</div>
                            </div>
                            <div className="text-right">
                                <div className="text-muted-foreground">Top Strength</div>
                                <Badge variant="outline" className="capitalize mt-1">{interview.topStrength}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

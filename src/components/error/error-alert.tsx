import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
    title?: string;
    message: string;
    variant?: 'default' | 'destructive';
    className?: string;
    testId?: string;
}

/**
 * Component for displaying error messages in a consistent format
 * Can be used for form errors, API errors, or any other error types
 */
export const ErrorAlert = ({
    title = "Error",
    message,
    variant = "destructive",
    className = "",
    testId = "error-alert"
}: ErrorAlertProps) => {
    return (
        <Alert
            variant={variant}
            className={className}
            data-testid={testId}
        >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
                {message}
            </AlertDescription>
        </Alert>
    );
};
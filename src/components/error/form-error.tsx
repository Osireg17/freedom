import { ErrorAlert } from "./error-alert";

interface FormErrorProps {
    error: string | null | undefined;
}

/**
 * Component for displaying form-level errors (as opposed to field-level errors)
 * Used when there's a general validation error or API error with the form
 */
export function FormError({ error }: FormErrorProps) {
    if (!error) return null;

    return (
        <div className="mb-4" data-testid="form-error-container">
            <ErrorAlert
                message={error}
                title="Form Error"
                testId="form-error-alert"
            />
        </div>
    );
}
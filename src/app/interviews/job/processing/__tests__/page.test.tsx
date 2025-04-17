import { render, screen } from "@testing-library/react";
import InterviewProcessingPage from "../page";
import { useSearchParams } from "next/navigation";

// Mock the next/navigation module
jest.mock("next/navigation", () => ({
    useSearchParams: jest.fn(),
}));

// Mock the JobStatusPoller component
jest.mock("@/components/interviews/job/job-status-poller", () => ({
    __esModule: true,
    default: jest.fn(() => <div data-testid="job-status-poller">Mocked Job Status Poller</div>),
}));

describe("InterviewProcessingPage", () => {
    const mockUseSearchParams = () => {
        return {
            get: jest.fn((param) => {
                if (param === "interviewId") return "mock-interview-id";
                if (param === "runId") return "mock-run-id";
                return null;
            }),
        };
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the processing page when valid parameters are provided", () => {
        (useSearchParams as jest.Mock).mockImplementation(mockUseSearchParams);

        render(<InterviewProcessingPage />);

        expect(screen.getByText("Generating Your Interview")).toBeInTheDocument();
        expect(screen.getByText(/We're creating personalised interview questions/)).toBeInTheDocument();
        expect(screen.getByTestId("interview-processing-page")).toBeInTheDocument();
        expect(screen.getByTestId("job-status-poller")).toBeInTheDocument();
    });

    it("renders error message when interviewId is missing", () => {
        (useSearchParams as jest.Mock).mockImplementation(() => ({
            get: (param: string) => (param === "runId" ? "mock-run-id" : null),
        }));

        render(<InterviewProcessingPage />);

        expect(screen.getByText("Invalid Interview Request")).toBeInTheDocument();
        expect(screen.getByText("The interview request is missing required parameters.")).toBeInTheDocument();
        expect(screen.getByText("Back to Interviews")).toBeInTheDocument();
    });

    it("renders error message when runId is missing", () => {
        (useSearchParams as jest.Mock).mockImplementation(() => ({
            get: (param: string) => (param === "interviewId" ? "mock-interview-id" : null),
        }));

        render(<InterviewProcessingPage />);

        expect(screen.getByText("Invalid Interview Request")).toBeInTheDocument();
        expect(screen.getByText("The interview request is missing required parameters.")).toBeInTheDocument();
        expect(screen.getByText("Back to Interviews")).toBeInTheDocument();
    });
});
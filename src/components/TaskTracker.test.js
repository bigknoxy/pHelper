import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TaskTracker from "./TaskTracker";
import * as apiTasks from '../api/tasks';
import { AuthContext } from '../context/AuthContext';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
// Helper to clear localStorage before each test
beforeEach(() => {
    localStorage.clear();
    jest.spyOn(apiTasks, 'getTasks').mockResolvedValue([]);
    jest.spyOn(apiTasks, 'addTask').mockImplementation(async (title, description) => ({
        id: Math.random().toString(),
        title,
        description,
        completed: false,
        createdAt: new Date().toISOString(),
    }));
    jest.spyOn(apiTasks, 'deleteTask').mockResolvedValue(undefined);
});
describe("TaskTracker", () => {
    function renderWithAuth(ui) {
        // Mock context value for logged-in user
        const mockAuth = {
            userId: 'test-user',
            token: 'test-token',
            loading: false,
            error: null,
            migrated: true,
            // ensure mocked auth functions return Promises to match AuthContextType
            login: jest.fn(async () => undefined),
            register: jest.fn(async () => undefined),
            logout: jest.fn(),
        };
        return render(_jsx(AuthContext.Provider, { value: mockAuth, children: _jsx(ChakraProvider, { value: defaultSystem, children: ui }) }));
    }
    it("renders add task form and empty list", async () => {
        renderWithAuth(_jsx(TaskTracker, {}));
        expect(await screen.findByLabelText(/task title/i)).toBeInTheDocument();
        expect(await screen.findByRole("button", { name: /add task/i })).toBeInTheDocument();
        // Since getTasks is mocked to [], there should be no task items
        expect(screen.queryByTestId("task-item")).not.toBeInTheDocument();
    });
    it("adds a new task and displays it", async () => {
        renderWithAuth(_jsx(TaskTracker, {}));
        fireEvent.change(await screen.findByLabelText(/task title/i), {
            target: { value: "Buy groceries" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
        // wait for the new task to appear after async state updates
        const added = await screen.findByText(/buy groceries/i);
        expect(added).toBeInTheDocument();
        expect(screen.getByTestId("task-item")).toBeInTheDocument();
    });
    it("marks a task as complete/incomplete", async () => {
        renderWithAuth(_jsx(TaskTracker, {}));
        fireEvent.change(await screen.findByLabelText(/task title/i), {
            target: { value: "Walk dog" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
        const button = await screen.findByRole("button", { name: /mark "walk dog" as complete/i });
        expect(button).toBeInTheDocument();
        fireEvent.click(button);
        await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Mark "Walk dog" as incomplete'));
        fireEvent.click(button);
        await waitFor(() => expect(button).toHaveAttribute('aria-label', 'Mark "Walk dog" as complete'));
    });
    it("deletes a task", async () => {
        renderWithAuth(_jsx(TaskTracker, {}));
        fireEvent.change(await screen.findByLabelText(/task title/i), {
            target: { value: "Read book" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
        expect(await screen.findByText(/read book/i)).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /delete/i }));
        // deletion should remove the item
        await waitFor(() => expect(screen.queryByText(/read book/i)).not.toBeInTheDocument());
    });
    it("shows added task in UI after submit", async () => {
        renderWithAuth(_jsx(TaskTracker, {}));
        fireEvent.change(await screen.findByLabelText(/task title/i), {
            target: { value: "Finish project" },
        });
        fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
        expect(await screen.findByText(/finish project/i)).toBeInTheDocument();
    });
});

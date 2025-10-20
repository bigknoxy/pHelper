import React from "react";
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
  function renderWithAuth(ui: React.ReactElement) {
    // Mock context value for logged-in user
    const mockAuth = {
      userId: 'test-user',
      token: 'test-token',
      loading: false,
      error: null,
      migrated: true,
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
    } as any;
    return render(
      <AuthContext.Provider value={mockAuth}>
        <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>
      </AuthContext.Provider>
    );
  }

  it("renders add task form and empty list", async () => {
    renderWithAuth(<TaskTracker />);
    expect(await screen.findByLabelText(/task title/i)).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /add task/i })).toBeInTheDocument();
    // Since getTasks is mocked to [], there should be no task items
    expect(screen.queryByTestId("task-item")).not.toBeInTheDocument();
  });

  it("adds a new task and displays it", async () => {
    renderWithAuth(<TaskTracker />);
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
    renderWithAuth(<TaskTracker />);
    fireEvent.change(await screen.findByLabelText(/task title/i), {
      target: { value: "Walk dog" },
    });
    fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
    const checkbox = await screen.findByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).toBeChecked());
    fireEvent.click(checkbox);
    await waitFor(() => expect(checkbox).not.toBeChecked());
  });

  it("deletes a task", async () => {
    renderWithAuth(<TaskTracker />);
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
    renderWithAuth(<TaskTracker />);
    fireEvent.change(await screen.findByLabelText(/task title/i), {
      target: { value: "Finish project" },
    });
    fireEvent.click(await screen.findByRole("button", { name: /add task/i }));
    expect(await screen.findByText(/finish project/i)).toBeInTheDocument();
  });
});

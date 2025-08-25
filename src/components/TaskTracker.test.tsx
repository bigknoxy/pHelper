import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TaskTracker from "./TaskTracker";

// Helper to clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe("TaskTracker", () => {
  it("renders add task form and empty list", () => {
    render(<TaskTracker />);
    expect(screen.getByLabelText(/task title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
    expect(screen.queryByTestId("task-item")).not.toBeInTheDocument();
  });

  it("adds a new task and displays it", () => {
    render(<TaskTracker />);
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Buy groceries" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getByText(/buy groceries/i)).toBeInTheDocument();
    expect(screen.getByTestId("task-item")).toBeInTheDocument();
  });

  it("marks a task as complete/incomplete", () => {
    render(<TaskTracker />);
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Walk dog" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("deletes a task", () => {
    render(<TaskTracker />);
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Read book" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getByText(/read book/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(screen.queryByText(/read book/i)).not.toBeInTheDocument();
  });

  it("persists tasks in localStorage", () => {
    render(<TaskTracker />);
    fireEvent.change(screen.getByLabelText(/task title/i), {
      target: { value: "Finish project" },
    });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(localStorage.getItem("tasks")).toContain("Finish project");
  });
});

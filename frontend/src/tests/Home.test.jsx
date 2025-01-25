import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { useChatStore } from "../store/useChatStore";

// Mock the store and components
vi.mock("../store/useChatStore");
vi.mock("../components/Sidebar", () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock("../components/NoChatSelected", () => ({
  default: () => <div data-testid="no-chat-selected">No Chat Selected</div>,
}));
vi.mock("../components/ChatContainer", () => ({
  default: () => <div data-testid="chat-container">Chat Container</div>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  describe("Core Component Rendering", () => {
    it("should always render Sidebar component regardless of user selection", () => {
      useChatStore.mockReturnValue({ selectedUser: null });
      render(<HomePage />);
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      cleanup();

      useChatStore.mockReturnValue({ selectedUser: { id: 1 } });
      render(<HomePage />);
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      cleanup();
    });
  });

  describe("Chat Display Logic", () => {
    it("should render NoChatSelected when no user is selected", () => {
      useChatStore.mockReturnValue({ selectedUser: null });
      render(<HomePage />);

      expect(screen.getByTestId("no-chat-selected")).toBeInTheDocument();
      expect(screen.queryByTestId("chat-container")).not.toBeInTheDocument();
      cleanup();
    });

    it("should render ChatContainer when a user is selected", () => {
      const mockUser = { id: 1, name: "Test User" };
      useChatStore.mockReturnValue({ selectedUser: mockUser });
      render(<HomePage />);
     
      expect(screen.getByTestId("chat-container")).toBeInTheDocument();
      expect(screen.queryByTestId("no-chat-selected")).not.toBeInTheDocument();
    });

    it("should handle different user object structures", () => {
      // Test with minimal user object
      useChatStore.mockReturnValue({ selectedUser: { id: 1 } });
      render(<HomePage />);
      
      expect(screen.getByTestId("chat-container")).toBeInTheDocument();
      cleanup();
      // Test with detailed user object
      useChatStore.mockReturnValue({
        selectedUser: {
          id: 2,
          name: "Test User",
          email: "test@example.com",
          avatar: "avatar.jpg",
        },
      });
      render(<HomePage />);
     
      expect(screen.getByTestId("chat-container")).toBeInTheDocument();
    });
  });
});

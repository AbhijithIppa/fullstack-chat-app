import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatHeader from "../components/ChatHeader";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

vi.mock("../store/useChatStore");
vi.mock("../store/useAuthStore");

describe("ChatHeader", () => {
  beforeEach(() => {
    useChatStore.mockReturnValue({
      selectedUser: {
        _id: "user1",
        fullName: "TestUser",
        profilePic: "/avatar.png",
      },
      setSelectedUser: vi.fn(),
    });

    useAuthStore.mockReturnValue({
      onlineUsers: ["user1"],
    });
  });

  it("should render selected user's name", () => {
    render(<ChatHeader />);
    expect(screen.getByText("TestUser")).toBeInTheDocument();
  });

  it("should show online status when user is online", () => {
    render(<ChatHeader />);
    const statusElement = screen.getByTestId("online-status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveTextContent("Online");
  });

  it("should show offline status when user is offline", () => {
    useAuthStore.mockReturnValue({
      onlineUsers: [],
    });
    render(<ChatHeader />);
    const statusElement = screen.getByTestId("offline-status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveTextContent("Offline");
  });
});

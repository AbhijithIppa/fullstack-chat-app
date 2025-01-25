import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatContainer from "../components/ChatContainer";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

vi.mock("../store/useChatStore");
vi.mock("../store/useAuthStore");

describe("ChatContainer", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  const mockMessages = [
    {
      _id: "1",
      text: "Hello",
      senderId: "user1",
      createdAt: new Date().toISOString(),
    },
    {
      _id: "2",
      text: "Hi there",
      senderId: "user2",
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useChatStore.mockReturnValue({
      messages: mockMessages,
      getMessages: vi.fn(),
      isMessagesLoading: false,
      selectedUser: {
        _id: "user2",
        username: "TestUser",
        profilePic: "/avatar.png",
      },
      subscribeToMessages: vi.fn(),
      unsubscribeFromMessages: vi.fn(),
    });

    useAuthStore.mockReturnValue({
      authUser: {
        _id: "user1",
        username: "CurrentUser",
        profilePic: "/avatar.png",
      },
      onlineUsers: ["user1", "user2"],
    });
  });

  it("should render messages", () => {
    render(<ChatContainer />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("Hi there")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    useChatStore.mockReturnValue({
      ...useChatStore(),
      isMessagesLoading: true,
    });
    render(<ChatContainer />);
    expect(screen.getByTestId("message-skeleton")).toBeInTheDocument();
  });

  it("should fetch messages on mount", () => {
    const getMessages = vi.fn();
    useChatStore.mockReturnValue({
      ...useChatStore(),
      getMessages,
    });
    render(<ChatContainer />);
    expect(getMessages).toHaveBeenCalled();
  });

  it("should handle message subscription", () => {
    const subscribeToMessages = vi.fn();
    const unsubscribeFromMessages = vi.fn();
    useChatStore.mockReturnValue({
      ...useChatStore(),
      subscribeToMessages,
      unsubscribeFromMessages,
    });

    const { unmount } = render(<ChatContainer />);
    expect(subscribeToMessages).toHaveBeenCalled();

    unmount();
    expect(unsubscribeFromMessages).toHaveBeenCalled();
  });
});

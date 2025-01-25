import { describe, it, expect, beforeEach, vi } from "vitest";
import { act } from "@testing-library/react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import axiosMockAdapter from "axios-mock-adapter";

// Mock useAuthStore
vi.mock("../store/useAuthStore", () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

describe("useChatStore", () => {
  let axiosMock;
  let mockSocket;

  beforeEach(() => {
    axiosMock = new axiosMockAdapter(axiosInstance);

    // Create mock socket
    mockSocket = {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    };

    // Mock useAuthStore.getState to return mock socket
    useAuthStore.getState.mockReturnValue({
      socket: mockSocket,
      authUser: { _id: "currentUser" },
    });

    // Reset store to initial state
    useChatStore.setState({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
    });
  });

  afterEach(() => {
    axiosMock.reset();
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should fetch users successfully", async () => {
      const mockUsers = [
        { _id: "1", fullName: "User 1" },
        { _id: "2", fullName: "User 2" },
      ];
      axiosMock.onGet("/messages/users").reply(200, mockUsers);

      await act(async () => {
        await useChatStore.getState().getUsers();
      });

      const state = useChatStore.getState();
      expect(state.users).toEqual(mockUsers);
      expect(state.isUsersLoading).toBe(false);
    });

    it("should handle users fetch error", async () => {
      axiosMock
        .onGet("/messages/users")
        .reply(500, { message: "Server error" });

      await act(async () => {
        await useChatStore.getState().getUsers();
      });

      const state = useChatStore.getState();
      expect(state.users).toEqual([]);
      expect(state.isUsersLoading).toBe(false);
    });
  });

  describe("getMessages", () => {
    it("should fetch messages successfully", async () => {
      const mockMessages = [
        { _id: "1", text: "Hello" },
        { _id: "2", text: "Hi" },
      ];
      const userId = "user123";
      axiosMock.onGet(`/messages/${userId}`).reply(200, mockMessages);

      await act(async () => {
        await useChatStore.getState().getMessages(userId);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual(mockMessages);
      expect(state.isMessagesLoading).toBe(false);
    });

    it("should handle messages fetch error", async () => {
      const userId = "user123";
      axiosMock
        .onGet(`/messages/${userId}`)
        .reply(500, { message: "Server error" });

      await act(async () => {
        await useChatStore.getState().getMessages(userId);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual([]);
      expect(state.isMessagesLoading).toBe(false);
    });
  });

  describe("sendMessage", () => {
    it("should send message successfully", async () => {
      const mockMessage = { _id: "1", text: "Hello" };
      const messageData = { text: "Hello" };
      const selectedUser = { _id: "user123" };

      useChatStore.setState({ selectedUser, messages: [] });
      axiosMock
        .onPost(`/messages/send/${selectedUser._id}`)
        .reply(200, mockMessage);

      await act(async () => {
        await useChatStore.getState().sendMessage(messageData);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual([mockMessage]);
    });

    it("should handle send message error", async () => {
      const messageData = { text: "Hello" };
      const selectedUser = { _id: "user123" };
      const initialMessages = [{ _id: "0", text: "Previous" }];

      useChatStore.setState({ selectedUser, messages: initialMessages });
      axiosMock
        .onPost(`/messages/send/${selectedUser._id}`)
        .reply(500, { message: "Server error" });

      await act(async () => {
        await useChatStore.getState().sendMessage(messageData);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual(initialMessages);
    });
  });

  describe("message subscriptions", () => {
    it("should subscribe to messages", () => {
      const selectedUser = { _id: "user123" };
      useChatStore.setState({ selectedUser });

      act(() => {
        useChatStore.getState().subscribeToMessages();
      });

      expect(mockSocket.on).toHaveBeenCalledWith(
        "newMessage",
        expect.any(Function)
      );
    });

    it("should not subscribe without selected user", () => {
      useChatStore.setState({ selectedUser: null });

      act(() => {
        useChatStore.getState().subscribeToMessages();
      });

      expect(mockSocket.on).not.toHaveBeenCalled();
    });

    it("should unsubscribe from messages", () => {
      act(() => {
        useChatStore.getState().unsubscribeFromMessages();
      });

      expect(mockSocket.off).toHaveBeenCalledWith("newMessage");
    });

    it("should handle new message from selected user", () => {
      const selectedUser = { _id: "user123" };
      const initialMessages = [{ _id: "1", text: "Hello" }];
      const newMessage = { _id: "2", text: "Hi", senderId: "user123" };

      useChatStore.setState({ selectedUser, messages: initialMessages });

      // Simulate socket message handler
      let messageHandler;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "newMessage") messageHandler = handler;
      });

      act(() => {
        useChatStore.getState().subscribeToMessages();
      });

      act(() => {
        messageHandler(newMessage);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual([...initialMessages, newMessage]);
    });

    it("should not add message from different user", () => {
      const selectedUser = { _id: "user123" };
      const initialMessages = [{ _id: "1", text: "Hello" }];
      const newMessage = { _id: "2", text: "Hi", senderId: "differentUser" };

      useChatStore.setState({ selectedUser, messages: initialMessages });

      let messageHandler;
      mockSocket.on.mockImplementation((event, handler) => {
        if (event === "newMessage") messageHandler = handler;
      });

      act(() => {
        useChatStore.getState().subscribeToMessages();
      });

      act(() => {
        messageHandler(newMessage);
      });

      const state = useChatStore.getState();
      expect(state.messages).toEqual(initialMessages);
    });
  });

  describe("selectedUser management", () => {
    it("should set selected user", () => {
      const user = { _id: "user123", fullName: "Test User" };

      act(() => {
        useChatStore.getState().setSelectedUser(user);
      });

      const state = useChatStore.getState();
      expect(state.selectedUser).toEqual(user);
    });

    it("should clear selected user", () => {
      useChatStore.setState({ selectedUser: { _id: "user123" } });

      act(() => {
        useChatStore.getState().setSelectedUser(null);
      });

      const state = useChatStore.getState();
      expect(state.selectedUser).toBeNull();
    });
  });
});

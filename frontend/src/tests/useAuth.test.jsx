import { beforeEach, describe, expect, it, vi } from "vitest";
import { act } from "@testing-library/react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import axiosMockAdapter from "axios-mock-adapter";
import { io } from "socket.io-client";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("socket.io-client", () => {
  const mockSocket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    on: vi.fn(),
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

describe("useAuthStore", () => {
  let axiosMock;
  let mockSocket;

  beforeEach(() => {
    axiosMock = new axiosMockAdapter(axiosInstance);

    // Create a mock socket with spy functions
    mockSocket = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      connected: true,
    };

    // Reset the io mock to return our mockSocket
    vi.mocked(io).mockReturnValue(mockSocket);

    useAuthStore.setState({
      authUser: null,
      isSigningUp: false,
      isLoggingIn: false,
      isUpdatingProfile: false,
      isCheckingAuth: true,
      onlineUsers: [],
      socket: null,
    });
  });

  it("should initialize with default state", () => {
    const state = useAuthStore.getState();
    expect(state.authUser).toBe(null);
    expect(state.isCheckingAuth).toBe(true);
    expect(state.isSigningUp).toBe(false);
    expect(state.isLoggingIn).toBe(false);
    expect(state.onlineUsers).toEqual([]);
  });

  it("should check authentication and update authUser", async () => {
    const mockUser = { _id: "user123", name: "Test User" };
    axiosMock.onGet("/auth/check").reply(200, mockUser);

    await act(async () => {
      await useAuthStore.getState().checkAuth();
    });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockUser);
    expect(state.isCheckingAuth).toBe(false);
    expect(io).toHaveBeenCalled();
  });

  it("should handle signup and update authUser", async () => {
    const mockUser = { _id: "user123", name: "Test User" };
    axiosMock.onPost("/auth/signup").reply(200, mockUser);

    await act(async () => {
      await useAuthStore
        .getState()
        .signup({ email: "test@test.com", password: "password" });
    });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockUser);
    expect(state.isSigningUp).toBe(false);
  });

  it("should handle login and update authUser", async () => {
    const mockUser = { _id: "user123", name: "Test User" };
    axiosMock.onPost("/auth/login").reply(200, mockUser);

    await act(async () => {
      await useAuthStore
        .getState()
        .login({ email: "test@test.com", password: "password" });
    });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(mockUser);
    expect(state.isLoggingIn).toBe(false);
  });

  it("should handle logout and reset authUser", async () => {
    // Set initial state with a socket
    useAuthStore.setState({
      authUser: { _id: "user123" },
      socket: mockSocket,
    });

    axiosMock.onPost("/auth/logout").reply(200);

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    const state = useAuthStore.getState();
    expect(state.authUser).toBe(null);
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it("should update profile information", async () => {
    const updatedUser = { _id: "user123", name: "Updated User" };
    axiosMock.onPut("/auth/update-profile").reply(200, updatedUser);

    await act(async () => {
      await useAuthStore.getState().updateProfile({ name: "Updated User" });
    });

    const state = useAuthStore.getState();
    expect(state.authUser).toEqual(updatedUser);
    expect(state.isUpdatingProfile).toBe(false);
  });

  it("should connect and disconnect socket", () => {
    // Set initial state with a user but no socket
    useAuthStore.setState({
      authUser: { _id: "user123" },
      socket: null,
    });

    const state = useAuthStore.getState();

    act(() => {
      state.connectSocket();
    });

    expect(io).toHaveBeenCalledWith(expect.any(String), {
      query: { userId: "user123" },
    });
    expect(mockSocket.connect).toHaveBeenCalled();

    act(() => {
      state.disconnectSocket();
    });

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});

// Sidebar.test.jsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";

vi.mock("../store/useChatStore");
vi.mock("../store/useAuthStore");

describe("Sidebar", () => {
  const mockUsers = [
    { _id: "1", fullName: "User1", profilePic: "/avatar.png" },
    { _id: "2", fullName: "User2", profilePic: "/avatar.png" },
  ];

  beforeEach(() => {
    useChatStore.mockReturnValue({
      users: mockUsers,
      getUsers: vi.fn(),
      isUsersLoading: false,
      setSelectedUser: vi.fn(),
      selectedUser: null,
    });

    useAuthStore.mockReturnValue({
      authUser: { _id: "currentUser", fullName: "CurrentUser" },
      onlineUsers: ["1"],
    });
  });


  it("should render user list", () => {
    render(<Sidebar />);
    expect(screen.getByText("User1")).toBeInTheDocument();
    expect(screen.getByText("User2")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    useChatStore.mockReturnValue({
      ...useChatStore(),
      isUsersLoading: true,
    });
    render(<Sidebar />);
    expect(screen.getByTestId("sidebar-skeleton")).toBeInTheDocument();
  });

  it("should handle user selection", () => {
    const setSelectedUser = vi.fn();
    useChatStore.mockReturnValue({
      users: mockUsers,
      getUsers: vi.fn(),
      isUsersLoading: false,
      setSelectedUser,
      selectedUser: null,
    });

    useAuthStore.mockReturnValue({
      authUser: { _id: "currentUser", username: "CurrentUser" },
      onlineUsers: ["1"],
    });

    render(<Sidebar />);
    
    // Use getByRole with name option to find the button
    const userButton = screen.getByRole('button', { name: /user1/i });
    fireEvent.click(userButton);
    
    expect(setSelectedUser).toHaveBeenCalledWith(mockUsers[0]);
  });
  it("should fetch users on mount", () => {
    const getUsers = vi.fn();
    useChatStore.mockReturnValue({
      ...useChatStore(),
      getUsers,
    });
    render(<Sidebar />);
    expect(getUsers).toHaveBeenCalled();
  });
});

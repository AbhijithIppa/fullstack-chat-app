import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent,act } from "@testing-library/react";
import MessageInput from "../components/MessageInput";
import { useChatStore } from "../store/useChatStore";

vi.mock("../store/useChatStore");

describe("MessageInput", () => {
  beforeEach(() => {
    useChatStore.mockReturnValue({
      sendMessage: vi.fn(),
      selectedUser: { _id: "user1" },
    });
  });

  it("should render input field", () => {
    render(<MessageInput />);
    expect(screen.getByPlaceholderText(/type a message/i)).toBeInTheDocument();
  });

  it("should handle message submission", async () => {
    const sendMessage = vi.fn().mockImplementation(() => Promise.resolve());
    useChatStore.mockReturnValue({
      selectedUser: { _id: "user1" },
      sendMessage,
    });

    render(<MessageInput />);
    const input = screen.getByPlaceholderText(/type a message/i);
    
    await act(async () => {
      fireEvent.change(input, { target: { value: "Hello" } });
    });

    await act(async () => {
      fireEvent.submit(screen.getByTestId("message-form"));
    });

    expect(sendMessage).toHaveBeenCalledWith({
      text: "Hello",
      image: null
    });
    
    expect(input.value).toBe("");
  });

  it("should not submit empty messages", () => {
    const sendMessage = vi.fn();
    useChatStore.mockReturnValue({
      ...useChatStore(),
      sendMessage,
    });

    render(<MessageInput />);
    fireEvent.submit(screen.getByTestId("message-form"));
    expect(sendMessage).not.toHaveBeenCalled();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NoChatSelected from "../components/NoChatSelected";

describe("NoChatSelected", () => {
  it("should render welcome message", () => {
    render(<NoChatSelected />);
    expect(screen.getByText("Welcome to Chatty!")).toBeInTheDocument();
  });

  it("should render instruction message", () => {
    render(<NoChatSelected />);
    expect(screen.getByText(/select a conversation/i)).toBeInTheDocument();
  });

 
});

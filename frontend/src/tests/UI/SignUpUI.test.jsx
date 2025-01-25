import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SignUpPage from "../../pages/SignUpPage";

// Helper function to render component with router
const renderSignUpPage = () => {
  return render(
    <BrowserRouter>
      <SignUpPage />
    </BrowserRouter>
  );
};

describe("SignUpPage UI Elements", () => {
  it("renders the signup form with title", () => {
    renderSignUpPage();
    expect(screen.getByText(/create account below/i)).toBeInTheDocument();
  });

  it("renders all form input fields", () => {
    renderSignUpPage();

    // Check for input fields
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    renderSignUpPage();
    expect(
      screen.getByRole("button", { name: /create account/i })
    ).toBeInTheDocument();
  });

  it("renders sign in link", () => {
    renderSignUpPage();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it("allows typing in input fields", () => {
    renderSignUpPage();

    const nameInput = screen.getByLabelText(/pull name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput.value).toBe("John Doe");
    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("toggles password visibility when eye icon is clicked", () => {
    renderSignUpPage();

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/toggle/i);

    expect(passwordInput.type).toBe("password");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("text");
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe("password");
  });
});

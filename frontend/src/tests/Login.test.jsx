import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { vi } from "vitest";
import { useAuthStore } from "../store/useAuthStore";
import LoginPage from "../pages/LoginPage";

// Mock useAuthStore
vi.mock("../store/useAuthStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("LoginPage", () => {
  let loginMock;

  beforeEach(() => {
    loginMock = vi.fn();
    useAuthStore.mockReturnValue({
      login: loginMock,
      isLoggingIn: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the login page correctly", () => {
    render(
      <Router>
        <LoginPage   />
      </Router>
    );

    const assertions = [
      {
        element: "Welcome Back",
        message:
          "Welcome Back heading is missing. Check if you have an <h1> or text element with exact text 'Welcome Back'",
      },
      {
        element: "Sign in to your account",
        message:
          "Sign in text is missing. Verify the text 'Sign in to your account' exists and is spelled correctly",
      },
      {
        element: "Email",
        message:
          "Email input field is missing. Ensure you have a label with text 'Email' and associated input field",
      },
      {
        element: "Password",
        message:
          "Password input field is missing. Ensure you have a label with text 'Password' and associated input field",
      },
    ];

    assertions.forEach(({ element, message }) => {
      try {
        expect(screen.getByText(element)).toBeInTheDocument();
      } catch (error) {
        throw new Error(`${message}\nAvailable elements: ${screen.debug()}`);
      }
    });

    try {
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    } catch (error) {
      throw new Error(
        "Sign in button is missing. Ensure you have a <button> element with text containing 'Sign in' (case insensitive). " +
          "Available buttons: " +
          screen
            .getAllByRole("button")
            .map((button) => button.textContent)
            .join(", ")
      );
    }
  });

  it("updates email and password fields when the user types", () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    try {
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(emailInput.value).toBe("test@example.com");
      expect(passwordInput.value).toBe("password123");
    } catch (error) {
      throw new Error(
        "Form inputs are not working correctly. Ensure:\n" +
          "1. Input fields have associated labels using htmlFor/id\n" +
          "2. Input fields are controlled components with onChange handlers\n" +
          "3. Form state is properly updated\n" +
          "Current DOM state: " +
          screen.debug()
      );
    }
  });

  it("calls login function with form data when form is submitted", () => {
    render(
      <Router>
        <LoginPage />
      </Router>
    );

    try {
      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      expect(loginMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    } catch (error) {
      throw new Error(
        "Form submission failed. Check:\n" +
          "1. Form has onSubmit handler or button has onClick\n" +
          "2. preventDefault() is called on form submission\n" +
          "3. login function from useAuthStore is properly imported and called\n" +
          "4. Form data is correctly passed to login function\n" +
          "Current mock calls: " +
          JSON.stringify(loginMock.mock.calls)
      );
    }
  });

  it("disables the submit button when isLoggingIn is true", () => {
    useAuthStore.mockReturnValue({
      login: loginMock,
      isLoggingIn: true,
    });

    render(
      <Router>
        <LoginPage />
      </Router>
    );

    try {
      const submitButton = screen.getByRole("button", { name: /loading/i });
      expect(submitButton).toBeDisabled();
    } catch (error) {
      throw new Error(
        "Loading state not handled correctly. Ensure:\n" +
          "1. Button text changes to 'Loading...' when isLoggingIn is true\n" +
          "2. Button is disabled when isLoggingIn is true\n" +
          "3. useAuthStore is properly integrated\n" +
          "Current button state: " +
          screen.getByRole("button").outerHTML
      );
    }
  });
});

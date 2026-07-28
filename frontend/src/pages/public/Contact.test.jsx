import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useInquirySubmission from "@/features/inquiries/hooks/useInquirySubmission";
import Contact from "./Contact";

vi.mock("@inertiajs/react", () => ({
  Head: () => null,
}));

vi.mock("../../components/common/TopNavbar", () => ({
  default: () => null,
}));

vi.mock("../../components/common/MainNavbar", () => ({
  default: () => null,
}));

vi.mock("../../components/common/AIRADSFooter", () => ({
  default: () => null,
}));

vi.mock("../../hooks/usePublicBrand", () => ({
  usePublicBrand: () => ({
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    secondary: "#0f172a",
    softBlue: "#eff6ff",
    borderBlue: "#dbeafe",
  }),
}));

vi.mock("@/features/inquiries/hooks/useInquirySubmission", () => ({
  default: vi.fn(),
}));

const hookState = (overrides = {}) => ({
  status: "idle",
  message: "",
  errors: {},
  isSubmitting: false,
  submit: vi.fn().mockResolvedValue({ ok: true, data: { inquiryId: 1 } }),
  resetFeedback: vi.fn(),
  ...overrides,
});

describe("Airads contact inquiry form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useInquirySubmission.mockReturnValue(hookState());
  });

  it("submits the controlled contact fields through the shared inquiry hook", async () => {
    const submit = vi.fn().mockResolvedValue({ ok: true, data: { inquiryId: 7 } });
    useInquirySubmission.mockReturnValue(hookState({ submit }));
    render(<Contact />);

    fireEvent.change(screen.getByPlaceholderText("Enter your full name"), {
      target: { value: "Mary Learner" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "mary@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "0715000222" },
    });
    fireEvent.change(screen.getByPlaceholderText("Tell us how we can help you..."), {
      target: { value: "Please send more information." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() => {
      expect(submit).toHaveBeenCalledWith({
        name: "Mary Learner",
        email: "mary@example.com",
        phone: "0715000222",
        subject: "General Inquiry",
        message: "Please send more information.",
        website: "",
        kind: "general",
        source: "contact_page",
      });
    });
  });

  it("disables the submit control while a request is in flight", () => {
    useInquirySubmission.mockReturnValue(
      hookState({ status: "submitting", isSubmitting: true }),
    );

    render(<Contact />);

    expect(screen.getByRole("button", { name: /Sending/i })).toBeDisabled();
  });

  it("shows the current campus addresses and contact numbers", () => {
    render(<Contact />);

    expect(screen.getByText("Kisumu City Campus")).toBeInTheDocument();
    expect(screen.getByText("Swan Centre, 2nd Floor")).toBeInTheDocument();
    expect(screen.getByText("0715 057 262")).toBeInTheDocument();
    expect(screen.getByText("Tradeworld Building, 2nd Floor")).toBeInTheDocument();
    expect(screen.getByText("0711 488 302")).toBeInTheDocument();
    expect(screen.getByText("Equity Bank Building, Opp. National Bank")).toBeInTheDocument();
    expect(screen.getByText("0719 818 645")).toBeInTheDocument();
    expect(screen.getByText("Supa Sacco Building, 2nd Floor, Opp. Huduma Centre")).toBeInTheDocument();
    expect(screen.getByText("0717 885 888")).toBeInTheDocument();
  });
});

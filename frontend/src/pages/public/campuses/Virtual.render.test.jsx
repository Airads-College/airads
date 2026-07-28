import { App as InertiaApp } from "@inertiajs/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ProviderWrapper from "../../../app/ProviderWrapper";
import ApplicationApply from "../ApplicationApply";
import Virtual from "./Virtual";
import VirtualCourses from "./VirtualCourses";

function renderInertiaPage(Component, props = {}, component = "Public/Virtual") {
  const page = {
    component,
    url: "/",
    version: null,
    props: {
      auth: { user: null },
      flash: {},
      ...props,
    },
  };

  return render(
    <ProviderWrapper>
      <InertiaApp
        initialPage={page}
        initialComponent={Component}
        resolveComponent={() => Promise.resolve(Component)}
      />
    </ProviderWrapper>,
  );
}

const virtualSiteContext = {
  entry: "virtual",
  isVirtualCampus: true,
  routes: {
    mainHome: "https://airads.ac.ke/",
    virtualHome: "/",
    virtualCourses: "/courses/",
    virtualApply: "/apply/",
  },
};

const virtualPageProps = {
  programs: [],
  siteContext: virtualSiteContext,
};

const virtualApplyProps = {
  campuses: [{ id: 1, name: "Virtual Campus", slug: "virtual", type: "virtual" }],
  programmes: [{ id: 1, name: "ICT", level: "certificate", category: "IT" }],
  educationLevels: ["KCPE", "KCSE"],
  intakes: ["Next Available Intake"],
  applicationContext: {
    studyMode: "virtual",
    isVirtual: true,
    lockedCampus: "Virtual Campus",
    source: "virtual_subdomain",
    submitUrl: "/apply/submit/",
  },
  siteContext: virtualSiteContext,
};

const virtualCoursesProps = {
  programs: [],
  filters: {},
  siteContext: virtualSiteContext,
};

const mainApplyProps = {
  campuses: [{ id: 2, name: "Eldoret Campus", slug: "eldoret", type: "physical" }],
  programmes: [
    { name: "Electrical Engineering" },
    { name: "KASNEB CPA" },
    { name: "NITA Welding Technology" },
    { name: "Driving School" },
    { name: "Computer Packages" },
  ],
  educationLevels: ["KCPE", "KCSE"],
  intakes: ["Next Available Intake"],
  applicationContext: {
    studyMode: "on_campus",
    isVirtual: false,
    lockedCampus: null,
    source: "main_website",
    submitUrl: "/admissions/apply/submit/",
  },
  siteContext: {
    entry: "main",
    isVirtualCampus: false,
    routes: {
      mainHome: "/",
      virtualHome: "https://virtual.airads.ac.ke/",
      virtualCourses: "https://virtual.airads.ac.ke/courses/",
      virtualApply: "https://virtual.airads.ac.ke/apply/",
    },
  },
};

describe("Public virtual campus pages", () => {
  test("renders the virtual landing page without invalid React children", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    renderInertiaPage(Virtual, virtualPageProps);

    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register/");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  }, 15000);

  test("renders the virtual course catalog without invalid React children", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    renderInertiaPage(VirtualCourses, virtualCoursesProps, "Public/VirtualCourses");

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("renders the virtual application form without invalid React children", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    renderInertiaPage(ApplicationApply, virtualApplyProps, "Public/ApplicationApply");

    expect(consoleError).not.toHaveBeenCalled();
    expect(screen.getAllByText("AFRICAN INSTITUTE").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Apply Now" })).toBeTruthy();
    expect(screen.getByText("Share your details and our admissions team will contact you.")).toBeTruthy();
    expect(screen.getByText("Course Preferences")).toBeTruthy();
    expect(screen.getAllByText(/Preferred course/i).length).toBeGreaterThan(0);
    expect(screen.queryByText("WhatsApp number")).toBeNull();
    expect(screen.queryByText("Programme Preferences")).toBeNull();
    expect(screen.queryByText(/Preferred programme/i)).toBeNull();
    expect(screen.queryByText("Visit AIRADS College")).toBeNull();
    consoleError.mockRestore();
  });

  test("renders the main application form without invalid React children", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  test("shows the matching KCSE grade field after KCSE is selected", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByLabelText("Education level"));
    fireEvent.click(screen.getByRole("option", { name: "KCSE" }));

    expect(screen.getByRole("combobox", { name: /KCSE mean grade/i })).toBeRequired();
    expect(screen.queryByLabelText("KCPE total marks")).toBeNull();
  });

  test("does not ask for marks when KCPE is selected", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByLabelText("Education level"));
    fireEvent.click(screen.getByRole("option", { name: "KCPE" }));

    expect(screen.queryByLabelText("KCPE total marks")).toBeNull();
    expect(screen.queryByRole("combobox", { name: /KCSE mean grade/i })).toBeNull();
  });
});

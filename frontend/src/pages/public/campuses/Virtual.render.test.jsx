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
    {
      code: "artisan-plumbing",
      name: "Artisan in Plumbing",
      route: "Artisan",
      minimumGrade: "E",
      eligibleEducationLevels: ["Primary", "Secondary"],
      requirementText: "KCPE or KCSE D- and below",
      additionalRequirement: "",
    },
    {
      code: "certificate-information-communication-technology",
      name: "Certificate in Information and Communication Technology (ICT)",
      route: "Certificate",
      minimumGrade: "D",
      eligibleEducationLevels: ["Secondary"],
      requirementText: "KCSE D or higher",
      additionalRequirement: "",
    },
    {
      code: "diploma-information-communication-technology",
      name: "Diploma in Information and Communication Technology (ICT)",
      route: "Diploma",
      minimumGrade: "C-",
      eligibleEducationLevels: ["Secondary"],
      requirementText: "KCSE C- or higher",
      additionalRequirement: "",
    },
    {
      code: "diploma-health-records-information-technology",
      name: "Diploma in Health Records and Information Technology",
      route: "Diploma",
      minimumGrade: "C",
      eligibleEducationLevels: ["Secondary"],
      requirementText: "KCSE C or higher",
      additionalRequirement: "",
    },
    {
      code: "kasneb-cpa-foundation",
      name: "CPA Foundation",
      route: "KASNEB",
      minimumGrade: "C+",
      eligibleEducationLevels: ["Secondary"],
      requirementText: "KCSE C+ or higher",
      additionalRequirement: "C+ in Mathematics and English is also required.",
    },
    {
      code: "driving-school",
      name: "Driving School",
      route: "Driving School",
      minimumGrade: null,
      eligibleEducationLevels: ["Primary", "Secondary"],
      requirementText: "Open entry",
      additionalRequirement: "",
    },
  ],
  educationLevels: ["Primary", "Secondary"],
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

  test("requires a grade for secondary applicants before enabling courses", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Education level/i }));
    fireEvent.click(screen.getByRole("option", { name: "Secondary" }));

    expect(screen.getByRole("combobox", { name: /KCSE mean grade/i })).toBeRequired();
    expect(screen.getByRole("combobox", { name: /Preferred course/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
  });

  test("primary applicants see artisan and open-entry courses without a grade", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Education level/i }));
    fireEvent.click(screen.getByRole("option", { name: "Primary" }));

    expect(screen.queryByRole("combobox", { name: /KCSE mean grade/i })).toBeNull();
    const courseSelect = screen.getByRole("combobox", { name: /Preferred course/i });
    expect(courseSelect).toBeEnabled();

    fireEvent.mouseDown(courseSelect);
    expect(screen.getByRole("option", { name: /Artisan in Plumbing/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Driving School/i })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /Diploma in Information and Communication/i })).toBeNull();
    expect(screen.queryByRole("option", { name: /Not Sure Yet/i })).toBeNull();
  });

  test("secondary course recommendations use cumulative KCSE eligibility", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Education level/i }));
    fireEvent.click(screen.getByRole("option", { name: "Secondary" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /KCSE mean grade/i }));
    fireEvent.click(screen.getByRole("option", { name: "C-" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Preferred course/i }));

    expect(screen.getByRole("option", { name: /Certificate in Information and Communication/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Diploma in Information and Communication/i })).toBeTruthy();
    expect(screen.getByRole("option", { name: /Artisan in Plumbing/i })).toBeTruthy();
    expect(screen.queryByRole("option", { name: /Diploma in Health Records/i })).toBeNull();
  });

  test("changing to a lower grade clears an ineligible course selection", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Education level/i }));
    fireEvent.click(screen.getByRole("option", { name: "Secondary" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /KCSE mean grade/i }));
    fireEvent.click(screen.getByRole("option", { name: "C-" }));
    const courseSelect = screen.getByRole("combobox", { name: /Preferred course/i });
    fireEvent.mouseDown(courseSelect);
    fireEvent.click(screen.getByRole("option", { name: /Diploma in Information and Communication/i }));
    expect(courseSelect).toHaveTextContent("Diploma in Information and Communication Technology");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /KCSE mean grade/i }));
    fireEvent.click(screen.getByRole("option", { name: "D" }));

    expect(courseSelect).not.toHaveTextContent("Diploma in Information and Communication Technology");
  });

  test("displays additional brochure requirements for a selected course", () => {
    renderInertiaPage(ApplicationApply, mainApplyProps, "Public/ApplicationApply");

    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Education level/i }));
    fireEvent.click(screen.getByRole("option", { name: "Secondary" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /KCSE mean grade/i }));
    fireEvent.click(screen.getByRole("option", { name: "C+" }));
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /Preferred course/i }));
    fireEvent.click(screen.getByRole("option", { name: /CPA Foundation/i }));

    expect(
      screen.getAllByText("C+ in Mathematics and English is also required.").length,
    ).toBeGreaterThan(0);
  });
});

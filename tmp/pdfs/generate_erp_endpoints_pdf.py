from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT_PATH = Path("output/pdf/required_erp_api_endpoints.pdf")

NAVY = colors.HexColor("#12304A")
BLUE = colors.HexColor("#176B87")
TEAL = colors.HexColor("#21A3A3")
PALE_BLUE = colors.HexColor("#EAF4F7")
PALE_GREY = colors.HexColor("#F5F7F9")
MID_GREY = colors.HexColor("#6B7785")
LINE = colors.HexColor("#D8E0E6")
WHITE = colors.white


def register_fonts():
    regular = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    bold = Path("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
    mono = Path("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf")

    if regular.exists() and bold.exists() and mono.exists():
        pdfmetrics.registerFont(TTFont("EndpointSans", str(regular)))
        pdfmetrics.registerFont(TTFont("EndpointSansBold", str(bold)))
        pdfmetrics.registerFont(TTFont("EndpointMono", str(mono)))
        return "EndpointSans", "EndpointSansBold", "EndpointMono"

    return "Helvetica", "Helvetica-Bold", "Courier"


FONT, FONT_BOLD, FONT_MONO = register_fonts()


SECTIONS = [
    (
        "Authentication and system",
        [
            ("POST", "/oauth2/token", "Issue a short-lived machine access token."),
            ("GET", "/api/v1/capabilities", "Return API version, supported resources, scopes, events and limits."),
            ("GET", "/api/v1/health", "Return API availability status."),
            ("GET", "/.well-known/openid-configuration", "Return OpenID Connect discovery metadata."),
            ("GET", "/oauth2/authorize", "Initiate student or staff single sign-on."),
            ("GET", "/oauth2/userinfo", "Return authenticated ERP identity claims."),
            ("POST", "/oauth2/logout", "End an ERP-backed single sign-on session."),
        ],
    ),
    (
        "Organization and academic structure",
        [
            ("GET", "/api/v1/organizations", "List campuses, schools, faculties and departments."),
            ("GET", "/api/v1/academic-periods", "List academic years, semesters, terms and intakes."),
            ("GET", "/api/v1/programs", "List official programmes and qualifications."),
            ("GET", "/api/v1/courses", "List official courses, subjects or units."),
            ("GET", "/api/v1/program-curricula", "List programme-to-unit curriculum mappings."),
            ("GET", "/api/v1/offerings", "List units delivered for a period, class, campus and study mode."),
            ("GET", "/api/v1/cohorts", "List official cohorts or classes."),
        ],
    ),
    (
        "Students, staff and admissions",
        [
            ("GET", "/api/v1/students", "List and incrementally synchronize students."),
            ("GET", "/api/v1/students/{student_id}", "Retrieve one student by immutable ERP ID."),
            (
                "GET",
                "/api/v1/students/by-admission-number/{admission_number}",
                "Retrieve a student by admission number.",
            ),
            ("GET", "/api/v1/staff", "List and incrementally synchronize staff."),
            ("GET", "/api/v1/staff/{staff_id}", "Retrieve one staff member."),
            ("POST", "/api/v1/applicants", "Create an applicant using an idempotency key."),
            ("GET", "/api/v1/applicants/{applicant_id}", "Retrieve applicant and admission-processing status."),
            (
                "GET",
                "/api/v1/applicants/by-external-reference/{reference}",
                "Retrieve an applicant using the originating external reference.",
            ),
        ],
    ),
    (
        "Registration, enrolment and teaching",
        [
            ("GET", "/api/v1/program-registrations", "List official student programme registrations."),
            ("GET", "/api/v1/enrollments", "List official student unit or offering enrolments."),
            ("GET", "/api/v1/teaching-assignments", "List instructor-to-offering assignments and roles."),
        ],
    ),
    (
        "Finance and clearance",
        [
            ("GET", "/api/v1/fee-structures", "List official fee structures and fee codes."),
            ("GET", "/api/v1/invoices", "List official student invoices and outstanding items."),
            (
                "GET",
                "/api/v1/students/{student_id}/account-summary",
                "Return invoiced, paid, balance, sponsorship and waiver totals.",
            ),
            ("GET", "/api/v1/receipts", "List official ERP receipts."),
            ("GET", "/api/v1/clearances", "List and incrementally synchronize clearance decisions."),
            (
                "GET",
                "/api/v1/students/{student_id}/clearance",
                "Return the current clearance decision for one student.",
            ),
        ],
    ),
    (
        "Payments and reversals",
        [
            ("POST", "/api/v1/payments", "Post a verified payment using an idempotency key."),
            ("GET", "/api/v1/payments/{erp_payment_id}", "Retrieve ERP payment status and receipt details."),
            (
                "GET",
                "/api/v1/payments/by-external-reference/{source_payment_id}",
                "Retrieve a payment using its originating payment reference.",
            ),
            ("POST", "/api/v1/payment-reversals", "Submit an approved payment reversal or refund."),
            (
                "GET",
                "/api/v1/payment-reversals/{reversal_id}",
                "Retrieve payment reversal status.",
            ),
            (
                "GET",
                "/api/v1/payment-reversals/by-external-reference/{reference}",
                "Retrieve a reversal using its originating reference.",
            ),
        ],
    ),
    (
        "Official results, attendance and completion",
        [
            ("GET", "/api/v1/result-definitions", "List accepted result structures and grading definitions."),
            ("POST", "/api/v1/results:bulk", "Submit approved final results in bulk."),
            ("GET", "/api/v1/results", "List submitted and official results."),
            ("GET", "/api/v1/results/{result_id}", "Retrieve result acceptance, rejection or final status."),
            ("POST", "/api/v1/attendance-summaries", "Submit approved attendance summaries."),
            (
                "GET",
                "/api/v1/attendance-summaries/{attendance_id}",
                "Retrieve attendance-summary processing status.",
            ),
            ("POST", "/api/v1/completions", "Submit verified programme, course or unit completion."),
            (
                "GET",
                "/api/v1/completions/{completion_id}",
                "Retrieve completion processing status.",
            ),
        ],
    ),
    (
        "Webhook endpoints",
        [
            ("POST", "/api/v1/webhook-subscriptions", "Register a webhook callback and subscribed event types."),
            ("GET", "/api/v1/webhook-subscriptions", "List configured webhook subscriptions."),
            (
                "DELETE",
                "/api/v1/webhook-subscriptions/{subscription_id}",
                "Remove a webhook subscription.",
            ),
            (
                "POST",
                "https://<lms-domain>/api/v1/integrations/ultimate-erp/webhooks",
                "LMS receiver for signed ERP change events.",
            ),
        ],
    ),
]


styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "Title",
    parent=styles["Title"],
    fontName=FONT_BOLD,
    fontSize=22,
    leading=27,
    textColor=NAVY,
    alignment=TA_LEFT,
    spaceAfter=3 * mm,
)
count_style = ParagraphStyle(
    "Count",
    parent=styles["Normal"],
    fontName=FONT_BOLD,
    fontSize=8.5,
    leading=11,
    textColor=BLUE,
    backColor=PALE_BLUE,
    borderPadding=(4, 8, 4, 8),
    alignment=TA_CENTER,
)
section_style = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontName=FONT_BOLD,
    fontSize=12,
    leading=15,
    textColor=NAVY,
    spaceBefore=2 * mm,
    spaceAfter=2.2 * mm,
)
header_cell_style = ParagraphStyle(
    "HeaderCell",
    parent=styles["Normal"],
    fontName=FONT_BOLD,
    fontSize=8.2,
    leading=10,
    textColor=WHITE,
)
method_style = ParagraphStyle(
    "Method",
    parent=styles["Normal"],
    fontName=FONT_BOLD,
    fontSize=7.8,
    leading=9.5,
    textColor=BLUE,
    alignment=TA_CENTER,
)
endpoint_style = ParagraphStyle(
    "Endpoint",
    parent=styles["Normal"],
    fontName=FONT_MONO,
    fontSize=7.6,
    leading=10,
    textColor=NAVY,
    wordWrap="CJK",
)
purpose_style = ParagraphStyle(
    "Purpose",
    parent=styles["Normal"],
    fontName=FONT,
    fontSize=8,
    leading=10.7,
    textColor=colors.HexColor("#263746"),
)


def endpoint_table(rows):
    data = [
        [
            Paragraph("METHOD", header_cell_style),
            Paragraph("ENDPOINT", header_cell_style),
            Paragraph("PURPOSE", header_cell_style),
        ]
    ]

    for method, endpoint, purpose in rows:
        data.append(
            [
                Paragraph(method, method_style),
                Paragraph(escape(endpoint), endpoint_style),
                Paragraph(purpose, purpose_style),
            ]
        )

    table = Table(
        data,
        colWidths=[19 * mm, 89 * mm, 71 * mm],
        repeatRows=1,
        hAlign="LEFT",
        splitByRow=1,
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), NAVY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 1), (0, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                ("TOPPADDING", (0, 1), (-1, -1), 5.5),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 5.5),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PALE_GREY]),
                ("GRID", (0, 0), (-1, -1), 0.4, LINE),
                ("LINEBELOW", (0, 0), (-1, 0), 1.2, TEAL),
            ]
        )
    )
    return table


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4

    canvas.setFillColor(NAVY)
    canvas.rect(0, height - 7 * mm, width, 7 * mm, fill=1, stroke=0)
    canvas.setFillColor(TEAL)
    canvas.rect(0, height - 7.8 * mm, width, 0.8 * mm, fill=1, stroke=0)

    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.5)
    canvas.line(15 * mm, 12.5 * mm, width - 15 * mm, 12.5 * mm)

    canvas.setFont(FONT, 7.4)
    canvas.setFillColor(MID_GREY)
    canvas.drawString(15 * mm, 8.3 * mm, "REQUIRED ERP API ENDPOINTS")
    canvas.drawRightString(width - 15 * mm, 8.3 * mm, f"PAGE {doc.page}")
    canvas.restoreState()


def make_document():
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    doc = BaseDocTemplate(
        str(OUTPUT_PATH),
        pagesize=A4,
        leftMargin=15 * mm,
        rightMargin=15 * mm,
        topMargin=17 * mm,
        bottomMargin=17 * mm,
        title="Required ERP API Endpoints",
        author="AIRADS",
        subject="ERP API endpoint catalogue",
    )

    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="main",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    doc.addPageTemplates(
        [PageTemplate(id="endpoint-pages", frames=[frame], onPage=header_footer)]
    )

    total_endpoints = sum(len(rows) for _, rows in SECTIONS)
    story = [
        Spacer(1, 2 * mm),
        Paragraph("Required ERP API Endpoints", title_style),
        Table(
            [[Paragraph(f"{total_endpoints} ENDPOINTS", count_style)]],
            colWidths=[37 * mm],
            hAlign="LEFT",
            style=TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), PALE_BLUE),
                    ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#B8D8E2")),
                    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ]
            ),
        ),
        Spacer(1, 4 * mm),
    ]

    page_groups = [
        SECTIONS[0:2],
        SECTIONS[2:4],
        SECTIONS[4:6],
        SECTIONS[6:8],
    ]

    for group_index, group in enumerate(page_groups):
        if group_index:
            story.append(PageBreak())
        for section_index, (heading, rows) in enumerate(group):
            if section_index:
                story.append(Spacer(1, 4.5 * mm))
            story.append(Paragraph(heading, section_style))
            story.append(endpoint_table(rows))

    doc.build(story)


if __name__ == "__main__":
    make_document()
    print(OUTPUT_PATH.resolve())

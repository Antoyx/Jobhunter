from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER

ACCENT = colors.HexColor("#2C5F8A")
LIGHT_GRAY = colors.HexColor("#666666")

def build_cv(output_path="cv.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=18*mm,
        rightMargin=18*mm,
        topMargin=16*mm,
        bottomMargin=16*mm,
    )

    styles = getSampleStyleSheet()

    name_style = ParagraphStyle("Name", fontSize=22, textColor=ACCENT, spaceAfter=2, leading=26)
    contact_style = ParagraphStyle("Contact", fontSize=9, textColor=LIGHT_GRAY, spaceAfter=6, leading=13)
    summary_style = ParagraphStyle("Summary", fontSize=9.5, spaceAfter=8, leading=14)
    section_style = ParagraphStyle("Section", fontSize=11, textColor=ACCENT, spaceBefore=10, spaceAfter=3, fontName="Helvetica-Bold")
    job_title_style = ParagraphStyle("JobTitle", fontSize=10, fontName="Helvetica-Bold", spaceAfter=0, leading=13)
    job_company_style = ParagraphStyle("JobCompany", fontSize=9, textColor=LIGHT_GRAY, spaceAfter=2, leading=12)
    bullet_style = ParagraphStyle("Bullet", fontSize=9, leftIndent=10, spaceAfter=1, leading=13, bulletIndent=4)
    normal_style = ParagraphStyle("Normal9", fontSize=9, spaceAfter=3, leading=13)

    story = []

    # Header
    story.append(Paragraph("Anto Leivategija", name_style))
    story.append(Paragraph(
        "+358405389337 &nbsp;|&nbsp; anto.leivategija@gmail.com &nbsp;|&nbsp; "
        "Sompasaarenlaituri 12, Helsinki, Finland &nbsp;|&nbsp; "
        "<a href='https://www.linkedin.com/in/anto-leivategija/' color='#2C5F8A'>LinkedIn</a>",
        contact_style
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=ACCENT, spaceAfter=6))

    # Summary
    story.append(Paragraph(
        "People oriented software professional with years of experience in hands-on development environments. "
        "I love to work cross-functionally and am able to fluently speak the languages of business, tech, and user experience. "
        "Business is people and being able to connect and translate people of different disciplines has proved to be invaluable in my work. "
        "I thrive in early phases of a project and one of my core strengths is the ability to steer forward in a controlled manner "
        "in uncertain environments. I am a strong believer in the fail fast, learn faster culture.",
        summary_style
    ))

    # Work Experience
    story.append(Paragraph("Work Experience", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=4))

    jobs = [
        ("Movement and Expedition Coach", "Freelance", "2024 – 2025", [
            "Led movement based training camps and outdoor adventure education expeditions — focusing on partner acrobatics, nature based expeditions and youthwork",
            "Implemented pedagogical best practices to plan, teach, and refine workshop activities",
            "Managed group dynamics in high risk settings, reinforcing quick decision-making and calm leadership under pressure",
        ]),
        ("Product Manager – Online Marketplace", "AutoVex", "2023 – 2024", [
            "Defined and executed the product roadmap",
            "Led a cross-disciplinary team to deliver high impact improvements",
            "Established and monitored KPIs to drive continuous improvement",
            "Organized A/B tests to validate impact of development activities",
        ]),
        ("Delivery Manager – Payments & Ecommerce", "Klarna", "2019 – 2022", [
            "Engaged in pitching and sales process towards ecommerce merchants",
            "Tailored customized solutions for shopping and payment products",
            "Managed technical implementation projects in diverse ecommerce environments",
            "Designed UX for optimized purchase flow and worked on improving conversion rates",
        ]),
        ("Application Manager – Product Lifecycle Management", "ABB", "2017 – 2019", [
            "Acted as global owner of a business critical software used in factories across the world",
            "Led a team of software experts in a complex environment of multiple stakeholders",
            "Managed the support, development, and release processes",
            "Acted as a steering committee member for various software projects",
            "Managed customer relations, budgeting, contracts",
        ]),
        ("Application Specialist – Product Lifecycle Management", "ABB", "2012 – 2016", [
            "Project manager in various software projects",
            "User requirement mapping and creation of technical specifications",
            "Testing & quality assurance of development activities",
            "Acted as a scrum master for the development team",
            "Provided technical support for engineers and was responsible for ticketing system",
        ]),
    ]

    for title, company, period, bullets in jobs:
        # Two-column: title+company left, period right
        header_data = [[
            Paragraph(f"<b>{title}</b>", job_title_style),
            Paragraph(period, ParagraphStyle("Period", fontSize=9, textColor=LIGHT_GRAY, alignment=2)),
        ]]
        t = Table(header_data, colWidths=["80%", "20%"])
        t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0), ("RIGHTPADDING", (0,0), (-1,-1), 0)]))
        story.append(t)
        story.append(Paragraph(company, job_company_style))
        for b in bullets:
            story.append(Paragraph(f"• {b}", bullet_style))
        story.append(Spacer(1, 4))

    # Education
    story.append(Paragraph("Education", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=4))
    story.append(Paragraph("• <b>2022</b> — Visual Designer training program, Turku Summer University", bullet_style))
    story.append(Paragraph("• <b>2007–2015</b> — Master of Science, Mechanical Engineering, Aalto University", bullet_style))

    # Skills
    story.append(Paragraph("Skills", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=4))
    skills = [
        "UX & Graphical Design methodologies",
        "Project Management",
        "Financials, budgeting, and accounting",
        "Product Lifecycle Management",
        "Ecommerce and payment industries & Online marketplace dynamics",
        "Agile methodologies, Release management, Testing & Quality assurance, Integrations & API",
        "AI-augmented development workflows and tooling",
    ]
    for s in skills:
        story.append(Paragraph(f"• {s}", bullet_style))

    # Languages
    story.append(Paragraph("Language Skills", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=4))
    lang_data = [
        [Paragraph("<b>Language</b>", normal_style), Paragraph("<b>Level</b>", normal_style)],
        [Paragraph("English", normal_style), Paragraph("Excellent", normal_style)],
        [Paragraph("Finnish", normal_style), Paragraph("Native", normal_style)],
        [Paragraph("Spanish", normal_style), Paragraph("Intermediate", normal_style)],
        [Paragraph("Estonian", normal_style), Paragraph("Native", normal_style)],
        [Paragraph("Swedish", normal_style), Paragraph("Basics", normal_style)],
    ]
    lang_table = Table(lang_data, colWidths=[40*mm, 60*mm])
    lang_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), ACCENT),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.HexColor("#F5F5F5"), colors.white]),
        ("GRID", (0,0), (-1,-1), 0.3, colors.HexColor("#CCCCCC")),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
    ]))
    story.append(lang_table)

    # Interests
    story.append(Paragraph("Interests & Hobbies", section_style))
    story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT, spaceAfter=4))
    story.append(Paragraph(
        "I enjoy having diverse, well-rounded interests in my life. I love sports and have a high focus on the wellbeing of my body and mind. "
        "I am most passionate about acroyoga — a practice of moving fluently from one acrobatic position to another with a partner. "
        "Acroyoga is all about finding mutual balance and flow, and it has provided me with invaluable insight in trust building and the softer skills needed in improving as a team.",
        normal_style
    ))

    story.append(Spacer(1, 4))
    story.append(Paragraph("<i>References available on request.</i>", ParagraphStyle("Ref", fontSize=8.5, textColor=LIGHT_GRAY)))

    doc.build(story)
    print(f"PDF written to {output_path}")

if __name__ == "__main__":
    build_cv("/workspaces/Jobhunter/cv.pdf")

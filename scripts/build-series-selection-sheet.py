"""Build the distributor reference sheet; the dated dimensions come from brochure pp. 14-19."""
from pathlib import Path

import reportlab
from PIL import Image
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "public/assets/product-series"
DESTINATION = ROOT / "public/downloads/mh-pipe-series-selection-en.pdf"
WIDTH, HEIGHT = A4
LEFT, RIGHT = 37, WIDTH - 37
NAVY, INK, MUTED, LINE = "#192F70", "#192937", "#475B6A", "#CBD5D8"
pdf = canvas.Canvas(str(DESTINATION), pagesize=A4, pageCompression=1, invariant=1)
font_dir = Path(reportlab.__file__).parent / "fonts"
pdfmetrics.registerFont(TTFont("Vera", font_dir / "Vera.ttf"))
pdfmetrics.registerFont(TTFont("Vera-Bold", font_dir / "VeraBd.ttf"))
pdf.setTitle("MH PIPE | Piping series selection sheet")
pdf.setAuthor("MH PIPE")


def text(x, y, words, size=10, bold=False, colour=INK):
    pdf.setFillColor(HexColor(colour))
    pdf.setFont("Vera-Bold" if bold else "Vera", size)
    pdf.drawString(x, HEIGHT - y, words)


def paragraph(x, top, words, width, size=10.5, leading=14.5, colour=INK):
    style = ParagraphStyle("Body", fontName="Vera", fontSize=size, leading=leading,
                           textColor=HexColor(colour))
    block = Paragraph(words, style)
    _, h = block.wrap(width, HEIGHT)
    block.drawOn(pdf, x, HEIGHT-top-h)


def rule(y, colour=LINE, thickness=.6):
    pdf.setStrokeColor(HexColor(colour))
    pdf.setLineWidth(thickness)
    pdf.line(LEFT, HEIGHT-y, RIGHT, HEIGHT-y)


def product(file, y):
    image = Image.open(ASSETS / file).convert("RGBA")
    image = image.crop(image.getchannel("A").getbbox())
    scale = min(72/image.width, 53/image.height)
    w, h = image.width*scale, image.height*scale
    pdf.drawImage(ImageReader(image), LEFT + (72-w)/2, HEIGHT-y-(h+53)/2,
                  width=w, height=h, mask="auto")


text(LEFT, 47, "MH PIPE", 23, True, NAVY)
text(RIGHT-104, 45, "November 2026  /  EN", 10, False, MUTED)
rule(62, NAVY, 1.4)
text(LEFT, 112, "Piping series selection sheet", 31, True, NAVY)
paragraph(LEFT, 130, "Compare the three systems, then specify the pipe and mating fitting for quotation.", RIGHT-LEFT, 12.2, 17)
text(LEFT, 185, "Series", 11, True, NAVY)
text(LEFT+253, 185, "What to specify", 11, True, NAVY)
rule(197)
rows = [
    ("Double-press", "press-coupling.webp", "Equal coupling shown",
     "Choose the fitting form and DN. Supply the mating pipe outside diameter and wall thickness. Request the matching press profile and product drawing."),
    ("Ring-press", "ring-coupling.webp", "Equal coupling shown",
     "Specify the ring-press connection and fitting form. Match the socket to the tube dimensions and request the application-specific seal and tooling information."),
    ("Thick-wall pipe", "thick-wall-end.webp", "Illustrative tube end",
     "Give the outside diameter, wall thickness and cut length in millimetres. Include the material grade, end preparation and mating connection drawing."),
]
for i, (name, image, caption, instructions) in enumerate(rows):
    top = 207 + 78*i
    product(image, top)
    text(LEFT+87, top+18, name, 16, True)
    text(LEFT+87, top+36, caption, 9, False, MUTED)
    paragraph(LEFT+253, top+3, instructions, RIGHT-LEFT-253, 10.3, 14.2)
    rule(top+68)

text(LEFT, 480, "Fitting sizes in the 2024 catalogue", 20, True, NAVY)
paragraph(LEFT, 494, "The following nominal sizes are listed for both double-press and ring-press fittings.", RIGHT-LEFT, 11, 15)
text(LEFT, 537, "Fitting form", 10, True, MUTED)
text(LEFT+235, 537, "Nominal size (DN)", 10, True, MUTED)
rule(547)
for j, (form, sizes) in enumerate([
    ("Equal coupling, equal tee, equal 90° elbow", "15, 20, 25, 32, 40, 50, 65, 80, 100"),
    ("Male or female threaded adapter", "15, 20, 25, 32, 40, 50"),
    ("Flange adapter", "25, 32, 40, 50, 65, 80, 100"),
]):
    y = 568+j*27
    text(LEFT, y, form)
    text(LEFT+235, y, sizes, 10.5, True)
    rule(y+9)
paragraph(LEFT, 644, "Source: MH PIPE company brochure (2024), printed pages 14-19. DN identifies the nominal size. Confirm actual mating dimensions and current supply for the specific model before ordering.", RIGHT-LEFT, 9.5, 13.5, MUTED)

pdf.setFillColor(HexColor("#EFF3F4"))
pdf.roundRect(LEFT, HEIGHT-758, RIGHT-LEFT, 67, 4, fill=1, stroke=0)
text(LEFT+13, 713, "For a drawing or quotation", 13, True, NAVY)
paragraph(LEFT+13, 719, "Send the series, fitting form, dimensions, quantity, medium, operating conditions and destination market. Include any required inspection records or project standards.", RIGHT-LEFT-26, 10.3)
rule(780)
text(LEFT, 800, "Sichuan Minhe Pipeline Construction Engineering Co., Ltd.", 9.4, True)
text(LEFT, 816, "Meishan, Sichuan, China", 9, False, MUTED)
email = "msmh_wj@163.com"
text(RIGHT-102, 808, email, 10.5, True, NAVY)
pdf.linkURL("mailto:"+email, (RIGHT-103, HEIGHT-812, RIGHT, HEIGHT-795), relative=0)
pdf.showPage()
pdf.save()

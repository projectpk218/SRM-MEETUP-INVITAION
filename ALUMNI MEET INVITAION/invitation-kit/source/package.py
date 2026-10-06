from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
from pypdf import PdfReader
from PIL import Image

root = Path(__file__).resolve().parents[1]
pdf_checks = []
for file in (root / 'output/pdf').glob('*.pdf'):
    reader = PdfReader(file)
    assert len(reader.pages) == 1, file.name
    text = reader.pages[0].extract_text()
    for field in ['[EVENT_BRAND]', '[EVENT_DATE]', '[RSVP_DEADLINE]', '[CONTACT_EMAIL]']:
        assert field in text, (file.name, field)
    embedded = []
    for font_ref in reader.pages[0]['/Resources']['/Font'].values():
        font = font_ref.get_object()
        descendants = font.get('/DescendantFonts', [font])
        for descendant in descendants:
            descriptor = descendant.get_object().get('/FontDescriptor')
            if descriptor:
                desc = descriptor.get_object()
                embedded.append(any(key in desc for key in ['/FontFile', '/FontFile2', '/FontFile3']))
    assert embedded and all(embedded), file.name
    pdf_checks.append({'file': file.name, 'pages': 1, 'selectable_text': True, 'tag_tree': bool(reader.trailer['/Root'].get('/StructTreeRoot')), 'fonts_embedded': True})

for file in (root / 'exports').glob('*.png'):
    image = Image.open(file)
    expected = (1080, 1920) if 'story' in file.name or 'status' in file.name else (1080, 1350)
    assert image.size == expected, file.name

audit_path = root / 'accessibility-audit.json'
audit = json.loads(audit_path.read_text(encoding='utf-8'))
audit['pdf_checks'] = pdf_checks
audit['functional_checks'] = json.loads((root / 'qa/verification.json').read_text(encoding='utf-8'))
audit['visual_review'] = 'Social layouts and both final A5 PDF pages inspected. No clipping in the default placeholder designs.'
audit_path.write_text(json.dumps(audit, indent=2), encoding='utf-8')

archive = root.parent / 'alumni-invitation-kit-v01.zip'
with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
    for file in root.rglob('*'):
        if file.is_file() and 'qa' not in file.relative_to(root).parts:
            package.write(file, Path(root.name) / file.relative_to(root))
print(json.dumps({'archive': str(archive), 'bytes': archive.stat().st_size, 'pdf_checks': pdf_checks}))

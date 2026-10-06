# Senior alumni invitation kit

Open `invitation-editor.html` in a browser. Premium / Formal is selected initially. Edit the event fields, choose a tone and format, and download the editable SVG, PNG, responsive email or saved event details. Your edits stay in the page until you save the details JSON; use Load details to resume. No data is sent to a server.

The three tones share the same event data. Tone changes update the voice, palette, typography and decorative treatment. Choose Portrait for Instagram and WhatsApp direct sharing; choose Story for Instagram Story and WhatsApp Status. Exported PNGs have the exact selected dimensions. Individual text and graphic elements remain editable in SVG.

## Files

- `exports/`: all three tones, four named PNG channel exports per tone, layered SVG masters, responsive email and plain-text fallbacks.
- `output/pdf/`: Premium / Formal A5 digital invitation and A5 print proof.
- `event-details.json`: all event variables, left unresolved as requested.
- `copy-sheet.md`: tone-specific copy, reminders, taglines and hashtag placeholders.
- `design-notes.md`, `alt-text-manifest.csv`, `accessibility-audit.json`: handoff notes and measured checks.
- `source/`: editable renderer and optional export tooling.

## Before distribution

Replace unresolved bracketed fields, supply the authentic institution logo and approved assets, and verify institution brand guidelines. The editor includes optional local logo, event-mark and hero-photo inputs. It does not fabricate logos or documentary photography. Approved colours and font overrides can be entered in the editor; recheck contrast after any change.

RSVP, map, contact and social links are enabled only when valid values are supplied. Missing links stay labelled placeholders, never pretend to be functioning destinations. Public exports always omit the private virtual link. Share joining instructions separately with confirmed recipients. The email is live text with a presentation-table layout; test it in your actual email platform and target clients before sending. No email has been sent and nothing has been published.

PNG files cannot contain clickable links. Send the actual RSVP URL in the accompanying message. Long URLs may not fit in compact artwork; use an institution-approved short URL. For accessible social distribution, add the full essential details in the caption or accompanying message.

The digital PDF has selectable text and Chromium-generated document tags, but PDF/UA conformance and assistive-technology reading order are not certified. Its unresolved link labels are intentionally inactive. The print PDF is a **proof**, not press-ready: the printer must supply the ICC profile, bleed, crop and PDF/X requirements before production. Fonts and page size are checked; colour conversion and press preflight remain outstanding.

## Refreshing the PDFs

Use **Print / Save A5 PDF** in the editor, choose Save as PDF, paper A5, no margins, background graphics enabled, and turn off browser headers/footers. Review for overflow after replacing placeholders. The supplied PDFs were exported from the checked default design. PDFs and prebuilt exports do not change automatically when you edit the master.

This is a standalone editable invitation kit. It is not an installed Codex Template Gallery skill.

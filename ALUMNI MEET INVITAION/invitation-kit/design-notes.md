# Design handoff

Premium / Formal leads the kit. Alternative tones are selectable in the editor and provided as PNG/email exports. Compact portrait artwork prioritises event name, date, time, location, speaker, three agenda highlights, dress, RSVP and contact. Full host/contact details remain in email and A5 PDF. Story adds the full description and address; supplied hero photography replaces the description region in the Story. The portrait is deliberately typographic.

No institutional identity, dates, people or venue have been invented. No image-generation, video, GitHub repository, publishing or messaging was required. Official logo, event mark and hero-photo slots await approved assets. Abstract linework signifies connection and is not a campus depiction.

VERIFY INSTITUTION BRAND GUIDELINES. Preserve official logo geometry, clear space and minimum size. The editor uses conservative space; final approval depends on the institution.

## Colour palettes
- Premium / Formal: ink #0B1F33; paper #F7F2E8; body #1F2933; accent #B08D57.
- Warm-Casual: ink #173A2B; paper #FFF8EB; body #5B4636; accent #A64B2A.
- Modern-MBA: ink #193B7A; paper #F8FAFC; body #334155; accent #0F766E.

## Typography
Premium / Formal and Warm-Casual: Georgia display with Arial body. Modern-MBA: Arial display and body. Native Windows fonts; no external font download. Respect font licensing when redistributing editable files. Approved font overrides require local installation.

## Remaining placeholders
- [INSTITUTION]
- [INSTITUTION_SHORT_NAME]
- [EVENT_BRAND]
- [EVENT_BRAND_MEANING]
- [EVENT_YEAR]
- [CLASS_YEARS_OR_COHORT]
- [EVENT_DATE]
- [EVENT_TIME]
- [TIME_ZONE]
- [VENUE_NAME]
- [VENUE_ADDRESS]
- [MAP_LINK]
- [EVENT_MODE]
- [VIRTUAL_LINK]
- [RSVP_URL]
- [RSVP_DEADLINE]
- [DRESS_CODE]
- [KEYNOTE_NAME]
- [KEYNOTE_TITLE]
- [HOSTS]
- [AGENDA_HIGHLIGHT_1]
- [AGENDA_HIGHLIGHT_2]
- [AGENDA_HIGHLIGHT_3]
- [CONTACT_NAME]
- [CONTACT_EMAIL]
- [CONTACT_PHONE]
- [SOCIAL_HANDLES]
- [SOCIAL_URL]
- [EVENT_HASHTAG]
- [INSTITUTION_LOGO_ASSET]
- [EVENT_MARK_ASSET]
- [HERO_IMAGE_ASSET]
- [HERO_IMAGE_ALT]
- [APPROVED_BRAND_COLORS]
- [APPROVED_FONTS]

SOCIAL_URL and HERO_IMAGE_ALT are supplemental fields to support clickable social links and descriptive image alternatives. Optional fields can be removed from the source after event content is finalised. Public outputs never include VIRTUAL_LINK.

## Production limitations
- Missing RSVP/map/contact/social destinations cannot be link-tested. Labels are inactive until supplied.
- Static social images require accessible accompanying captions and a separately clickable RSVP link.
- Uploaded images in email use relative assets paths; host them through the sending platform. Do not assume base64 image support in email.
- Email structure uses presentation tables and inline essential styles; actual Outlook/Gmail/device inbox testing remains.
- Digital PDF is tagged and selectable, not certified PDF/UA. Manual screen-reader review remains.
- Print output is an A5 RGB proof, no bleed, not PDF/X and not press-ready. Printer ICC profile, output intent, trim/bleed and preflight remain.
- Long replacement values and custom fonts require a fresh layout review; the editor flags detected vertical overflow.
- File slugs retain placeholders until real institution, event and date are supplied.

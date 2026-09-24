# Sean home services contact list - 2026-09-17

Request: Sean Boyle voice memo in Slack DM, 2026-09-16 16:48 EDT (14 sec):
"can you do me a favor and scrape another list? I want to have it be for like
I would say at this point like home service businesses if you can."

Dillon replied by voice at 17:10 committing to a home services scrape.

## Delivered
- 99 contacts / 84 businesses / 10 trades / 21 states
- Sent to Sean in DM D0A6ECLQ0S1 on 2026-09-17, file F0C2LEJFBMY
- Dillon approved the send in session.

## Method
1. Discovery via Exa search across trades x metros (independent local operators).
2. Direct crawl of each business site: /, /contact, /contact-us, /about.
3. Emails taken only from the live page. No pattern guessing.
4. MX or A record check on every address.
5. Deduped against SEAN-new-franchise-contacts-2026-09-15.csv (140 rows). Zero overlap.
6. Manual removal of 27 false positives: web design vendors, font/theme vendors,
   marketing agencies, Wix/theme placeholders (you@email.com, info@mysite.com),
   and customer references on a commercial roofer's page (schools and municipalities).
7. Capped at 3 contacts per business.

## Sources considered and rejected
- Texas TDLR bulk licensee files: 20,437 real A/C contractors, but the public
  export redacts phone and address and carries no email. Name plus county only.
- pageonepartner.com: 76,069 US local service business listings with name, type,
  city, state, phone and rating, but no business website and no email.
  Useful later as a phone-first seed.
- BBB, Angi, HomeAdvisor, Yellowpages, Manta, Thumbtack, Buildzoom: all block
  automated access or publish no email.
- Vibe Prospecting MCP (paid): object and boolean arguments were rejected by the
  server through this session, so no cost estimate could be produced. Not used,
  no spend incurred.

## Known gaps
- Phone column is empty. Fillable from the same pages on a second pass.
- Contact Name column is empty except where the address itself names the person.

## Google Sheet
https://docs.google.com/spreadsheets/d/1E8e_6Ell_Bij619nXcfMARary-GJ4XI1nLvHlcdIsR0/edit
Shared with seanb71797@gmail.com as writer on 2026-09-17. Link posted to DM D0A6ECLQ0S1.
Verified populated (99 data rows) by reading the file back before the link was sent.

Business Name column was cleaned after the CSV send: page titles replaced with real
company names across all 99 rows. The Sheet carries the cleaned names; the CSV on disk
was updated to match.

## Note on an empty duplicate
An earlier empty sheet was created while probing the Drive tool schema:
1wD1_Y9M2ndYfNahTtmhsqRtzjemT2ymyWIwyV80NnRw. Not shared with anyone. Safe to trash.

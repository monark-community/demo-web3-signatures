/**
 * Built-in sample documents. Their fingerprints are real SHA-256 digests of
 * these exact strings, so saving one as a UTF-8 .txt file and hashing it
 * anywhere gives the same 64 characters shown in the demo.
 * The documents stay in English on both locales: they are the parties'
 * artefacts, not interface copy.
 */

export interface SampleDoc {
  id: string
  fileName: string
  text: string
}

const msa = `MASTER SERVICES AGREEMENT
No. HF-TR-2026-014

Between Halden Freight Ltd., 2200 rue Notre-Dame Ouest, Montréal (QC) ("Halden") and Tessel Robotics Inc., 480 avenue Lafleur, Lachine (QC) ("Tessel").

1. Services. Halden will provide climate-controlled freight between Tessel's Lachine assembly plant and its distribution partners in Ontario and Québec, up to 14 departures per month.
2. Term. 24 months from 1 October 2026, renewable for 12 months by written notice.
3. Fees. CAD 48,000 per year, invoiced quarterly, net 30.
4. Service level. 97% on-time departures, measured monthly. Below 94%, the next quarterly invoice is reduced by 5%.
5. Liability. Capped at the fees paid in the previous 12 months, except for gross negligence.
6. Governing law. Québec.

Signed in three counterparts: Halden Freight (Commercial Director), Tessel Robotics (Head of Operations), Tessel Robotics (Chief Financial Officer).
`

const offer = `OFFER OF EMPLOYMENT

Tessel Robotics Inc. is pleased to offer Jonah Reyes the position of Senior Firmware Engineer, Motion Control team, reporting to the VP Engineering.

Start date: 2 November 2026
Location: Lachine (QC), hybrid, three days on site
Base salary: CAD 138,000 per year
Equity: 6,000 stock options, 4-year vesting, 1-year cliff
Vacation: 4 weeks per year

This offer is conditional on proof of eligibility to work in Canada and remains open until 9 October 2026.
`

const licence = `PHOTOGRAPHY LICENCE AGREEMENT
Ref. ID-2026-AUT

Licensor: Inès Duval, photographer, Montréal (QC)
Licensee: Tessel Robotics Inc.

Work: 18 photographs from the "Autumn catalogue" shoot of 3 September 2026.
Use: print catalogue, website and trade-show displays. No resale.
Territory: Canada and United States.
Term: 12 months from signature.
Licence fee: CAD 3,800, paid within 30 days.
Credit: "Photo: Inès Duval" next to each published image.
`

/** The same licence with one number changed, for the tamper demonstration. */
const licenceAltered = licence.replace("Licence fee: CAD 3,800", "Licence fee: CAD 8,300")

const resolution = `BOARD RESOLUTION 2026-07
Tessel Robotics Inc.

RESOLVED that the Corporation enter into a lease for the warehouse at 1150 rue Norman, Lachine (QC), 2,400 m², for a term of 5 years starting 1 December 2026, at a base rent of CAD 21,500 per month;

RESOLVED that the Chief Financial Officer is authorised to sign the lease and any related documents on behalf of the Corporation.

Adopted unanimously by written consent of the directors.
`

const nda = `MUTUAL NON-DISCLOSURE AGREEMENT

Between Tessel Robotics Inc. and Quillon Bio Inc.

Purpose: evaluating a joint lab-automation pilot.
Confidential information: any technical, commercial or financial information disclosed by either party, in any form.
Term: 5 years from signature.
Exclusions: information already public, independently developed, or received from a third party without restriction.
Governing law: Québec.
`

const grant = `APPLIED RESEARCH GRANT AGREEMENT
Fondation Boréale pour l'innovation — Grant FB-2026-031

Recipient: Tessel Robotics Inc.
Project: Low-power gripper control for cold-storage robotics.
Amount: CAD 120,000, paid in three instalments of CAD 40,000.
Duration: 18 months from 1 November 2026.
Reporting: progress report every 6 months; final report within 60 days of the end date.
Intellectual property: remains with the Recipient; the Foundation receives a non-exclusive research licence.
`

const consulting = `CONSULTING AGREEMENT

Between Tessel Robotics Inc. ("Client") and Mensah Studio, Kofi Mensah, industrial designer ("Consultant").

Scope: redesign of the teach-pendant housing for the TR-4 arm, from sketches to production-ready CAD, in three milestones.
Fees: CAD 16,500, paid per milestone (30% / 40% / 30%).
Schedule: final files by 15 January 2027.
Ownership: all deliverables are assigned to the Client on final payment.
Confidentiality: as per the parties' mutual NDA of 2 June 2026.
`

export const SAMPLE_DOCS: Record<string, SampleDoc> = {
  "msa-halden": { id: "msa-halden", fileName: "halden-tessel-msa-2026.txt", text: msa },
  "offer-reyes": { id: "offer-reyes", fileName: "offer-jonah-reyes.txt", text: offer },
  "licence-duval": { id: "licence-duval", fileName: "duval-photo-licence-autumn.txt", text: licence },
  "licence-duval-altered": { id: "licence-duval-altered", fileName: "duval-photo-licence-autumn.txt", text: licenceAltered },
  "resolution-2026-07": { id: "resolution-2026-07", fileName: "board-resolution-2026-07.txt", text: resolution },
  "nda-quillon": { id: "nda-quillon", fileName: "mutual-nda-quillon-bio.txt", text: nda },
  "grant-boreale": { id: "grant-boreale", fileName: "grant-fb-2026-031.txt", text: grant },
  "consulting-mensah": { id: "consulting-mensah", fileName: "consulting-mensah-studio.txt", text: consulting },
}

/** The one-word change between the licence and its altered copy, for highlighting. */
export const ALTERED_CHANGE = { before: "CAD 3,800", after: "CAD 8,300" }

export function docBytes(id: string): number {
  const doc = SAMPLE_DOCS[id]
  return doc ? new TextEncoder().encode(doc.text).length : 0
}

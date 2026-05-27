// Shared master-data definition for panels.
// Both the master-data page and the operational panels page read this seed.
// (Edits made on the master-data page are local to that page session — the
// operational page treats the seed as the source of truth for the prototype.)

export interface MasterPanel {
  id:          string;  // PNL-01 — primary key, referenced everywhere
  code:        string;  // short code, e.g. "A1-N"
  panelWeight: number;  // panel capacity in kg
}

export const MASTER_PANELS: MasterPanel[] = [
  { id: 'PNL-01', code: 'A1-N', panelWeight: 3000 },
  { id: 'PNL-02', code: 'A2-N', panelWeight: 3000 },
  { id: 'PNL-03', code: 'B1-C', panelWeight: 2500 },
  { id: 'PNL-04', code: 'B2-C', panelWeight: 2500 },
  { id: 'PNL-05', code: 'C1-S', panelWeight: 2000 },
  { id: 'PNL-06', code: 'C2-S', panelWeight: 2000 },
  { id: 'PNL-07', code: 'D1-W', panelWeight: 1800 },
  { id: 'PNL-08', code: 'D2-W', panelWeight: 1800 },
];

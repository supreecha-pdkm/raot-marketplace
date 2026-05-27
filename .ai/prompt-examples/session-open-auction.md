@CLAUDE.md

## Today's Goal

Build auction list page for buyer role

## Scope

Working in: features/auctions/, app/(dashboard)/buyer/auctions/
Do not touch: features/auth/, features/users/, shared/components/

## Task

Create AuctionList feature with React Query data fetching.
Buyer can only view auctions — apply CASL read permission gate.

## Requirements

- AntD Table with columns: auction name, date, status, price
- Status column uses StatusBadge component
- Search filter via nuqs URL state (key: "q")
- Loading, error, empty states handled
- Responsive: stack to cards below md breakpoint

## DO NOT

- Add bidding logic
- Add pagination yet
- Install new packages
- Touch seller auction features

## Output

Show file plan first. Wait for my approval before writing any code.

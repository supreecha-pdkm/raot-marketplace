'use client';

import Link from 'next/link';
import { Empty } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import {
  OFFICER_MENU_CATALOG, getMenuIcon,
  type MenuGroup, type MenuItem,
  MASTER_ONLY_KEYS,
} from '@/features/roles';

interface QuickAccessGridProps {
  /** Effective permissions of the current user. Master should pass `null`
   *  to bypass filtering and see every menu in the catalog. */
  perms: string[] | null;
}

/** Categorised grid of clickable cards. Each card navigates to /officer/<key>.
 *  Sections that have no granted items are hidden. Section header uses an
 *  editorial format (numeric index + label + item count) for a control-room
 *  feel that fits the operational context of officer work. */
export default function QuickAccessGrid({ perms }: QuickAccessGridProps) {
  const isMaster = perms === null;
  const granted = isMaster ? null : new Set(perms);

  const groups: MenuGroup[] = OFFICER_MENU_CATALOG
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => {
        // Master-only keys hidden from non-master rendering
        if (!isMaster && MASTER_ONLY_KEYS.has(i.key)) return false;
        return isMaster || granted!.has(i.key);
      }),
    }))
    .filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <Empty description="ไม่มีเมนูให้เข้าถึง" style={{ padding: 48 }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      {groups.map((group, idx) => (
        <GroupSection
          key={group.label}
          group={group}
          index={idx + 1}
          total={groups.length}
        />
      ))}
    </div>
  );
}

function GroupSection({
  group, index, total,
}: {
  group: MenuGroup;
  index: number;
  total: number;
}) {
  return (
    <section>
      {/* Eyebrow: index · label · count — editorial newsroom feel */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 14,
          paddingBottom: 10,
          borderBottom: '1px solid #ece8df',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
              fontSize: 11,
              color: '#b8b1a4',
              letterSpacing: '0.05em',
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 700,
              color: '#0f3d22',
              letterSpacing: '-0.005em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {group.label}
          </h2>
        </div>
        <span
          style={{
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            color: '#b8b1a4',
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {group.items.length} เมนู
        </span>
      </div>

      {/* Cards grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 10,
        }}
      >
        {group.items.map((item) => (
          <QuickCard key={item.key} item={item} />
        ))}
      </div>
    </section>
  );
}

function QuickCard({ item }: { item: MenuItem }) {
  return (
    <Link
      href={`/officer/${item.key}`}
      className="raot-quick-card"
      style={{
        position: 'relative',
        display: 'block',
        overflow: 'hidden',
        padding: '14px 16px',
        background: '#ffffff',
        border: '1px solid #ece8df',
        borderRadius: 6,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease',
      }}
    >
      {/* Left accent that slides in on hover (CSS via stylesheet below) */}
      <span aria-hidden className="raot-quick-card__accent" />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div
          className="raot-quick-card__icon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: 5,
            background: 'rgba(26, 124, 62, 0.08)',
            color: '#1a7c3e',
            fontSize: 16,
            transition: 'background 180ms ease, color 180ms ease',
          }}
        >
          {getMenuIcon(item.key)}
        </div>
        <ArrowRightOutlined
          className="raot-quick-card__arrow"
          style={{
            color: '#d8d3c8',
            fontSize: 12,
            transition: 'color 180ms ease, transform 180ms ease',
          }}
        />
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 600,
          color: '#1a1a1a',
          lineHeight: 1.35,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {item.label}
      </div>
    </Link>
  );
}

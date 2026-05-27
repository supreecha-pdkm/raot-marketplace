'use client';

import { use } from 'react';
import Link from 'next/link';
import {
  Card, Button, Result, Tag, Space, Typography, Descriptions, Avatar,
} from 'antd';
import {
  ArrowLeftOutlined, UserOutlined, EnvironmentOutlined, CalendarOutlined,
  PhoneOutlined, MailOutlined, IdcardOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { getSellerProfile } from '@/features/negotiated/services/negotiated-data';

const { Text, Title } = Typography;

export default function SellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const profile = getSellerProfile(id);

  if (!profile) {
    return (
      <Result
        status="404"
        title="ไม่พบข้อมูลผู้ขาย"
        subTitle={`ไม่พบผู้ขายรหัส ${id}`}
        extra={
          <Link href="/officer/negotiated">
            <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
              กลับ
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div>
        <Link href="/officer/negotiated">
          <Button type="text" icon={<ArrowLeftOutlined />} style={{ padding: 0, color: '#1a7c3e' }}>
            กลับไปยังรายการเจรจา
          </Button>
        </Link>
        <Title level={4} style={{ margin: '8px 0 0', color: '#0f3d22' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          ข้อมูลผู้ขาย — {profile.name}
        </Title>
        <Text type="secondary">รหัสผู้ขาย {profile.id}</Text>
      </div>

      {/* Overview card */}
      <Card>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Avatar size={72} icon={<UserOutlined />} style={{ background: '#1a7c3e', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#0f3d22' }}>{profile.name}</div>
            <div style={{ fontSize: 13, color: '#595959', marginTop: 2 }}>
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              {profile.farmName} · {profile.province}
            </div>
            <Space size={6} style={{ marginTop: 8 }} wrap>
              {profile.isEudr && (
                <Tag color="green" style={{ margin: 0 }}>
                  <SafetyCertificateOutlined style={{ marginRight: 4 }} />EUDR
                </Tag>
              )}
              <Tag color={profile.forestStatus === 'ไม่บุกรุก' ? 'success' : 'warning'} style={{ margin: 0 }}>
                {profile.forestStatus}
              </Tag>
            </Space>
          </div>
        </div>
      </Card>

      {/* Contact + business detail */}
      <Card title={<Space><IdcardOutlined style={{ color: '#1a7c3e' }} /><span>ข้อมูลทั่วไป</span></Space>}>
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label={<><IdcardOutlined /> เลขบัตรประชาชน</>} span={2}>
            <Text style={{ fontFamily: 'monospace' }}>{profile.nationalId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<><PhoneOutlined /> โทรศัพท์</>}>
            <Text>{profile.phone}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> อีเมล</>}>
            {profile.email ?? <Text type="secondary">—</Text>}
          </Descriptions.Item>
          <Descriptions.Item label={<><EnvironmentOutlined /> ที่อยู่</>} span={2}>
            <Text>{profile.address}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="จังหวัด">{profile.province}</Descriptions.Item>
          <Descriptions.Item label="ชื่อสวน/ฟาร์ม">{profile.farmName}</Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> วันที่ลงทะเบียน</>}>
            {profile.joinedAt}
          </Descriptions.Item>
          <Descriptions.Item label="ปริมาณที่ขายผ่านระบบ">
            <Text strong style={{ color: '#1a7c3e' }}>{profile.totalSold.toLocaleString()}</Text> กก.
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <div style={{ textAlign: 'center', padding: 8 }}>
        <Link href="/officer/negotiated">
          <Button type="primary" icon={<ArrowLeftOutlined />} style={{ background: '#1a7c3e', borderColor: '#1a7c3e' }}>
            กลับไปยังรายการเจรจา
          </Button>
        </Link>
      </div>
    </div>
  );
}

import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';

const { Title, Text } = Typography;

const DriverInfo = ({ driver }) => {
  if (!driver) return null;

  return (
    <Card
      style={{
        marginBottom: '16px',
        borderLeft: `4px solid ${driver.teamColour}`
      }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {driver.driverTLA}
          </Title>
          <Tag color={driver.teamColour} style={{ margin: 0 }}>
            #{driver.driverNumber}
          </Tag>
        </div>
        <Text type="secondary">{driver.teamName}</Text>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tag color="blue">Laps: {driver.laps?.length || 0}</Tag>
          {driver.hasTelemetry && <Tag color="green">Telemetry Available</Tag>}
        </div>
      </Space>
    </Card>
  );
};

export default DriverInfo; 
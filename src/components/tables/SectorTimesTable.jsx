import React from 'react';
import { Table } from 'antd';
import { useTelemetryContext } from '../../context/TelemetryContext';

function SectorTimesTable() {
  const {
    laps,
    selectedDrivers,
    drivers,
    isLoading
  } = useTelemetryContext();

  // Process data for the table
  const dataSource = laps
    .filter(lap => selectedDrivers.includes(lap.driver_number))
    .map(lap => ({
      key: `${lap.driver_number}-${lap.lap_number}`,
      driver: drivers[lap.driver_number]?.name || `Driver ${lap.driver_number}`,
      lapNumber: lap.lap_number,
      sector1: lap.sector1_time,
      sector2: lap.sector2_time,
      sector3: lap.sector3_time,
      total: lap.lap_time
    }));

  const columns = [
    {
      title: 'Driver',
      dataIndex: 'driver',
      key: 'driver',
      render: (text, record) => (
        <span style={{ color: drivers[record.key.split('-')[0]]?.color }}>
          {text}
        </span>
      )
    },
    {
      title: 'Lap',
      dataIndex: 'lapNumber',
      key: 'lapNumber'
    },
    {
      title: 'Sector 1',
      dataIndex: 'sector1',
      key: 'sector1',
      render: (time) => time ? `${time.toFixed(3)}s` : '-'
    },
    {
      title: 'Sector 2',
      dataIndex: 'sector2',
      key: 'sector2',
      render: (time) => time ? `${time.toFixed(3)}s` : '-'
    },
    {
      title: 'Sector 3',
      dataIndex: 'sector3',
      key: 'sector3',
      render: (time) => time ? `${time.toFixed(3)}s` : '-'
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (time) => time ? `${time.toFixed(3)}s` : '-'
    }
  ];

  return (
    <Table
      dataSource={dataSource}
      columns={columns}
      loading={isLoading}
      pagination={false}
      size="small"
      title={() => 'Sector Times'}
    />
  );
}

export default SectorTimesTable; 
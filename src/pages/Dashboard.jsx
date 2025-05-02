import React from 'react';
import { Layout, Row, Col, Spin, Alert } from 'antd';
import { useTelemetryContext } from '../context/TelemetryContext';
import CircuitSelector from '../components/selectors/CircuitSelector';
import SessionSelector from '../components/selectors/SessionSelector';
import DriverSelector from '../components/selectors/DriverSelector';
import LapSelector from '../components/selectors/LapSelector';
import TrackMap from '../components/charts/TrackMap';
import SpeedChart from '../components/charts/SpeedChart';
import ThrottleBrakeChart from '../components/charts/ThrottleBrakeChart';
import SectorTimesTable from '../components/tables/SectorTimesTable';
import PitStopTable from '../components/tables/PitStopTable';
import DriverInfo from '../components/DriverInfo';

const { Content } = Layout;

function Dashboard() {
  const {
    selectedCircuit,
    selectedSession,
    selectedDrivers,
    selectedLap,
    isLoading,
    error,
    drivers,
    laps,
    carData,
    isDarkMode
  } = useTelemetryContext();

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }} className={isDarkMode ? 'bg-gray-900' : 'bg-white'}>
      <Content style={{ padding: '24px' }}>
        <Spin spinning={isLoading}>
          <Row gutter={[16, 16]}>
            {/* Selectors */}
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <CircuitSelector />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <SessionSelector />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <DriverSelector />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <LapSelector />
                </Col>
              </Row>
            </Col>

            {/* Track Map */}
            <Col span={24}>
              <TrackMap />
            </Col>

            {/* Driver Info */}
            <Col span={24}>
              <Row gutter={[16, 16]}>
                {selectedDrivers.map(driverId => (
                  <Col key={driverId} xs={24} sm={12} md={8} lg={6}>
                    <DriverInfo driver={drivers[driverId]} />
                  </Col>
                ))}
              </Row>
            </Col>

            {/* Charts */}
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <SpeedChart />
                </Col>
                <Col xs={24} lg={12}>
                  <ThrottleBrakeChart />
                </Col>
              </Row>
            </Col>

            {/* Tables */}
            <Col span={24}>
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <SectorTimesTable />
                </Col>
                <Col xs={24} lg={12}>
                  <PitStopTable />
                </Col>
              </Row>
            </Col>
          </Row>
        </Spin>
      </Content>
    </Layout>
  );
}

export default Dashboard; 
import React from 'react';
import { Select } from 'antd';
import { useTelemetryContext } from '../../context/TelemetryContext';

const { Option } = Select;

function CircuitSelector() {
  const {
    selectedCircuit,
    setSelectedCircuit,
    circuits,
    isLoading
  } = useTelemetryContext();

  const handleChange = (value) => {
    setSelectedCircuit(value);
  };

  return (
    <Select
      style={{ width: '100%' }}
      placeholder="Select Circuit"
      value={selectedCircuit}
      onChange={handleChange}
      loading={isLoading}
      disabled={isLoading}
    >
      {circuits.map(circuit => (
        <Option key={circuit} value={circuit}>
          {circuit}
        </Option>
      ))}
    </Select>
  );
}

export default CircuitSelector; 
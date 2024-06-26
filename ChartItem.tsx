import React, { useEffect, useState } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import Box from '@mui/material/Box';
import { Select, MenuItem, FormControl } from '@mui/material';

interface ChartItemProps {
  makeDrinkData: any[];
}

const ChartsOverviewDemo: React.FC<ChartItemProps> = ({ makeDrinkData }) => {
  const [selectedUserId, setSelectedUserId] = useState<string | 'total'>(
    'total',
  );
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { label: string; data: number[]; color: string }[];
  }>({ labels: [], datasets: [] });
  const [userIds, setUserIds] = useState<string[]>([]);

  const getRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 70) + 30;
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  useEffect(() => {
    const uniqueUserIds = [
      ...new Set(makeDrinkData.map((item) => `User${item.userId}`)),
    ];
    setUserIds(uniqueUserIds);

    const aggregatedData = makeDrinkData.reduce((acc, item) => {
      const userIdKey = `User${item.userId}`;
      if (!acc[item.recipeName]) {
        acc[item.recipeName] = {
          count: 0,
          ...Object.fromEntries(uniqueUserIds.map((id) => [id, 0])),
        };
      }
      acc[item.recipeName].count += 1;
      acc[item.recipeName][userIdKey] += 1;
      return acc;
    }, {});

    const labels = Object.keys(aggregatedData);
    const dataValues = labels.map((label) => aggregatedData[label].count);
    const userValues = uniqueUserIds.reduce(
      (acc, userId) => {
        acc[userId] = labels.map((label) => aggregatedData[label][userId]);
        return acc;
      },
      {} as Record<string, number[]>,
    );

    let datasets: { label: string; data: number[]; color: string }[] = [
      {
        label: 'Total Amount of Coffee',
        data: dataValues,
        color: getRandomColor(),
      },
    ];

    if (selectedUserId !== 'total') {
      datasets.push({
        label: `User ${selectedUserId}`,
        data: userValues[selectedUserId],
        color: getRandomColor(),
      });
    }

    setChartData({
      labels,
      datasets,
    });
  }, [makeDrinkData, selectedUserId]);

  const handleUserChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedUserId(event.target.value as string);
  };

  const chartWidth = Math.max(1000, chartData.labels.length * 175);

  return (
    <Box className="chart-box">
      <FormControl className='select-dropdown-user' fullWidth>
        <Select
          labelId="user-select-label"
          value={selectedUserId}
          onChange={handleUserChange}
          label="Select User"
        >
          <MenuItem value="total">Total of Amount</MenuItem>
          {userIds.map((userId) => (
            <MenuItem key={userId} value={userId}>
              {userId}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <BarChart
        className='custom-bar-chart'
        series={chartData.datasets.map((dataset) => ({
          data: dataset.data,
          color: dataset.color,
        }))}
        height={600}
        width={chartWidth}
        xAxis={[
          {
            scaleType: 'band',
            data: chartData.labels,
            categoryGapRatio: 0.6,
            barGapRatio: 0.1
          }]}

      />
    </Box>
  );
};

export default ChartsOverviewDemo;

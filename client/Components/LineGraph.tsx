import React, { useEffect } from "react";
import { FC, useState } from 'react';
import { Line } from 'react-chartjs-2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData, 
  CartesianScaleOptions,
  CartesianScaleTypeRegistry,
  CoreScaleOptions,
  Filler,
} from 'chart.js';
import { time } from "console";
import { setConstantValue } from "typescript";
import { linearBuckets } from "prom-client";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type MetricProps = {
  query: string,
  label: string,
  backgroundColor: string,
  borderColor: string,
  yAxisType: string,
}

const initialData: ChartData<'line'> = {
  datasets: [],
}

const LineGraph: FC<MetricProps> = (props) => {
  const [chartLoaded, setChartLoaded] = useState(false);
  const [data, setData] = useState(initialData);
  const [loadError, setLoadError] = useState(false);

  const options: ChartOptions<'line'> = {
    animation: {
      easing: "easeInCubic",
      duration: 1200,
      // delay: 2000,
    },
    responsive: true,
    interaction: {
      intersect: false
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
      filler: {
        drawTime: 'beforeDatasetsDraw',
        propagate: true,
      },
      // displays data labels inside the chart
      datalabels: {
        display: false,
      }
    },
    scales: { // <-- ScaleChartOptions
      y: {  // <-- ScaleOptionsByType
        display: true, // <-- any options within CartesianScaleTypeRegistry
        axis: 'y',
        title: {
          display: true,
          text: props.yAxisType,
        },
      },
      x: {  // <-- ScaleOptionsByType
        display: true, // <-- any options within CartesianScaleTypeRegistry
        axis: 'y',
        title: {
          display: true,
          text: 'Time',
        },
      },
    }
  }

  useEffect(() => {
    fetch(props.query)
    .then(res => res.json())
    .then(data => {
      // removes unnecessary data
      const usefulData = data.data.result[0].values;
      console.log('usefulData', usefulData);
      // creates a date display when the day changes
      let displayDate = true;
      let prevDate = '';
      // maps the xAxis label
      const xAxisLabels = usefulData.map((value: [number, string]) => {
        // logic for converting timestamp to human-readable time
        const currentDate = new Date(value[0] * 1000);
        let timeString = currentDate.toLocaleString('en-GB');
        // if (timeString.slice(0, 10) !== prevDate.slice(0,10)) displayDate = true;
        // prevDate = timeString;
        // if (!displayDate) {
          const iOfComma = timeString.indexOf(',') + 1;
          timeString = timeString.slice(iOfComma).trim();
        // }
        // displayDate = false;
        return timeString;
      });
      console.log('xAxisLabels:', xAxisLabels);
      console.log('Useful data:', usefulData);
      console.log(props.yAxisType)
      let yAxisValues: number[] = []       
      switch(props.yAxisType) {
        case 'gigabytes': 
          yAxisValues = usefulData.map((value: [number, string]) => Number(value[1]) / 1000000000)
          break;
        case 'kilobytes':
          yAxisValues = usefulData.map((value: [number, string]) => Number(value[1]) / 1000000)
        default:
          yAxisValues = usefulData.map((value: [number, string]) => Number(value[1]))
      }

      console.log('yAxisValues', yAxisValues);
      
      const newData: ChartData<'line'> = {
        labels: xAxisLabels,
        datasets: [{
          label: props.label,
          data: yAxisValues,
          backgroundColor: props.backgroundColor,
          borderColor: props.borderColor,
          borderWidth: 1.5,
          pointRadius: 1,
          tension: 0.3,
          pointBorderWidth: 1,
          pointHoverRadius: 4,
          fill: true,
          capBezierPoints: true,
        }]
      }
      setData(newData);
      // setOptions(newOptions);
      setChartLoaded(true);
    })
    .catch(err => {
      console.log(err);
      setLoadError(true);
    });
  }, [])

  // demos 1 sec load, comment out lines 102, 103, and or statement in 105 to remove
  // const [oneSecPassed, setOneSecPassed] = useState(false);
  // setTimeout(() => setOneSecPassed(true), 1000);
  
  if (loadError) {
    return (
      <div className="error">
        <WarningAmberIcon sx={{ fontSize: "60px" }} className="warning-icon" />
        <h5>Error loading graph</h5>
        <h5 className="error-bottom">Check out our <a href="/error">troubleshooting page</a></h5>
      </div>
    )
  } else if (!chartLoaded) {
    return (
      <div className="loading">
        <CircularProgress />
      </div>
    )
  } else {  
    return (
      <div className="graph">
        <Line options={options} data={data} />
      </div>
    )
  }
}

export default LineGraph;
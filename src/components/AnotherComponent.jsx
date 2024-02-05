import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from "chart.js/auto"
import 'chartjs-adapter-date-fns';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';



function AnotherComponent({ selectedDevices, messages }) {
    const [data, setData] = useState([]);
    // Filter messages based on selected devices
    const token = localStorage.getItem('token');

    const fetchData = () => {
        axios.get(`${import.meta.env.VITE_API_URI}/api/data/test_SLM_MQTT_${selectedDevices}`, { headers: { Authorization: token } })
            .then(response => {
                
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    };

    useEffect(() => {
        // Fetch data initially
        fetchData();

        // Set up interval to fetch data every 5 seconds (adjust as needed)
        const intervalId = setInterval(fetchData, 20000);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(intervalId);
        };
    }, [selectedDevices]);
    const chartData = {

        labels: data.map(record => record.timestamp),

        datasets: [
            {
                label: 'Sound Level',
                fill: true,
                lineTension: 0.1,
                backgroundColor: 'rgba(172,53,32,0.7)',
                borderColor: 'rgba(86,26,16,1)',
                // borderCapStyle: 'butt',
                borderDash: [],
                borderWidth: 0,
                borderDashOffset: 0.0,
                borderJoinStyle: 'miter',
                pointBorderColor: 'rgba(86,26,16,1)',
                pointBackgroundColor: '#fff',
                pointBorderWidth: 0,
                pointHoverRadius: 0,
                pointHoverBackgroundColor: 'rgba(86,26,16,1)',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                pointHoverBorderWidth: 0,
                pointRadius: 0,
                pointHitRadius: 0,
                data: data.map(record => record.value),

            }

        ]
    };

    const config = {

        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            x: {

                type: 'time',
                time: {
                    unit: 'second',
                    tooltipFormat: 'HH:mm:ss'
                },
                // min: new Date().toISOString().split('T')[0]+'T03:00:00.000Z',
                // max: new Date().toISOString().split('T')[0]+'T15:00:00.000Z',
                display: true,
                title: {
                    display: true,
                    text: 'Time',
                    font: {
                        size: 16,
                    },
                    padding: { top: 10, left: 0, right: 0, bottom: 10 }
                },
                ticks: {
                    font: {
                        size: 12
                    },
                    // For a category axis, the val is the index so the lookup via getLabelForValue is needed
                    callback: function (val, index) {
                        // Hide every 2nd tick label
                        return index % 10 === 0 ? this.getLabelForValue(val) : '';
                    },
                }
            },
            y: {
                min: 30,
                display: true,
                title: {
                    display: true,
                    text: 'Sound Level (dBA)',
                    font: {
                        size: 16,
                    },
                    padding: { top: 0, left: 0, right: 0, bottom: 10 }
                },
                ticks: {
                    font: {
                        size: 12
                    }
                }
            }
        }

    };

    return (
        <div>
            <Line className="chart" data={chartData} options={config} width={100} height={450} />
        </div>


    )
}

export default AnotherComponent

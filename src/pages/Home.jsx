import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import DeviceList from '../components/DeviceList';
import DeviceMap from '../components/DeviceMap';
import AnotherComponent from '../components/AnotherComponent';
import noiseEvent from '../components/noiseEvent';
import axios from 'axios';
import "leaflet/dist/leaflet.css";
import "./Home.css";
import { jwtDecode } from "jwt-decode";



const OFFLINE_THRESHOLD = 50000;

function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const decoded = jwtDecode(token);
  const username = decoded.username;
  const role = decoded.role
  const [loginMessage, setLoginMessage] = useState('');
  const [devices, setDevices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedDevice, setSelectedDevice] = useState('');


  const fetchLogin = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/home`, { headers: { Authorization: token } });
      setLoginMessage(response.data.loginMessage);
    } catch (error) {
      handleFetchError(error);
    }
  }

  const fetchDevice = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/Devices/${username}`, { headers: { Authorization: token } });
      setDevices(response.data);
    } catch (error) {
      handleFetchError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleFetchError = (error) => {
    console.error('Failed to fetch data:', error.response ? error.response.data.loginMessage : error.message);

    if (error.response && (error.response.status === 401 || error.response.status === 400)) {
      navigate('/');
    }
  }

  useEffect(() => {
    fetchLogin();
    fetchDevice();
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_URI}`, [token]);

    socket.onmessage = (event) => {
      const receivedMessages = JSON.parse(event.data).map((message) => ({
        ...message,
        status: checkStatus(message),
      }));

      const filterMessage = receivedMessages.filter((el) => {
        return devices.some((f) => {
          if (f.serial === el.serial) {
            el.lat = f.lat;
            el.lon = f.lon;
          }
          return f.serial === el.serial;
        });
      });

      setMessages(filterMessage);
    };

    return () => {
      socket.close();
    };

  }, [devices]);

  function checkStatus(device) {
    const currentTimestamp = new Date();
    const deviceTimestamp = new Date(device.timestamp.replace(/(\d{2})\/(\d{2})\/(\d{4}), (\d{2}:\d{2}:\d{2})/, '$3-$2-$1T$4'));

    if (currentTimestamp - deviceTimestamp > OFFLINE_THRESHOLD) {
      return 'Offline';
    } else {
      return 'Online';
    }
  }

  const handleItemClick = (name) => {
    setSelectedDevice(name);
  };

  return (
    <div>
      <NavBar />
      <Row style={{ margin: '5px' }}>
        <Col lg={4} style={{ marginTop: '10px' }}>
          <Card>
            <Card.Header>Devices List</Card.Header>
            <Card.Body>
              <DeviceList messages={messages} onItemClicked={handleItemClick} loading={loading} />
              {/* {role === 'admin' && (
                <Button variant="primary" style={{ marginTop: '10px' }}>
                  <Link style={{ color: 'white', textDecoration: 'none' }} to={"/devices"}>Devices Manager</Link>
                </Button>
              )} */}
            </Card.Body>
          </Card>
        </Col>
        <Col sm style={{ marginTop: '10px' }}>
          <Card>
            <Card.Header>Map</Card.Header>
            <Card.Body>
              <DeviceMap messages={messages} selectedDevice={selectedDevice} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row style={{ margin: '5px' }}>
        <Col sm style={{ marginTop: '10px' }}>
          <Card>
            <Card.Header>{selectedDevice} Graph</Card.Header>
            <Card.Body>
              <AnotherComponent selectedDevices={selectedDevice} messages={messages} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* <Row style={{ margin: '5px' }}>
        <Col sm style={{ marginTop: '10px' }}>
          <Card>
            <Card.Header> Event</Card.Header>
            <Card.Body>
              <noiseEvent />
            </Card.Body>
          </Card>
        </Col>
      </Row> */}
    </div>
  );
}

export default Home;

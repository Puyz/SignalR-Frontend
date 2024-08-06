import React, { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Input, Flex, Space } from 'antd';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

function App() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const gonder = () => {

    const userData = {
      Email: email,
      Message: message
    };
    axios.post("https://localhost:7047/api/messages", userData);
  };
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:7047/messagehub")
    .withAutomaticReconnect()
    .build();

    connection.start();
    connection.on("receiveMessage", message => {
      toast.success(message);
    });
  }, []);

  return (
    <div>
      <ToastContainer />
      <Space>
        <Input placeholder='Email' style={{ width: 300 }} onChange={(e) => setEmail(e.target.value)} value={email} />
        <Input placeholder='Mesaj' style={{ width: 300 }} onChange={(e) => setMessage(e.target.value)} value={message} />
        <Button onClick={gonder}>Gönder</Button>
      </Space>
    </div>
  );
}

export default App;

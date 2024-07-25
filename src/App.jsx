import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const [hubConnection, setHubConnection] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);

  // onreconnecting: Yeniden bağlanma girişimlerini başlatmadan önce tetiklenen fonksiyondur.
  // onreconnected: Yeniden bağlantı gerçekleştirildiğinde tetiklenen fonksiyondur.
  // onclose: Yeniden bağlantı girişimlerinin sonuçsuz kaldığı durumlarda tetiklenen fonksiyondur. 

  useEffect(() => {
    const createHubConnection = async () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7047/myhub")
        .withAutomaticReconnect() // 0, 2, 10, 30 saniye periyotlarında bağlanma isteği atıyor. Bu metot bağlanma yapıldıktan sonra eğer bağlantı koparsa çalışır. Hiç bağlantı kurulmadığı taktirde bu metot çalışmaz. Süreleri parametre vererek değiştirmemiz mümkün. örnek: [1000,2000,5000,10000,40000]
        .build();

      // eğer hiç bağlantı kurulmadıysa ve tekrar bağlanma isteği atmak istiyorsak kendimiz bir fonksiyon oluşturmalıyız.
      const tryConnect = async () => {
        try {
          await connection.start();
          setHubConnection(connection);
        } catch (error) {
          setTimeout(() => tryConnect(), 2000);
        }
      }

      tryConnect();

      connection.onreconnecting(error => {
        toast.info("Bağlantı kuruluyor.");
      });

      connection.onreconnected(connectionId => {
        toast.success("Bağlantı kuruldu.");
      });

      connection.onclose(connectionId => {
        toast.error("Bağlantı kurulamadı.");
      });

      connection.on("receiveMessage", message => {
        setMessages(prevMessages => [message, ...prevMessages]);
      });

      connection.on("userConnected", connectionId => {
        toast.success(`Sunucuya katıldı: ${connectionId}`);
      });

      connection.on("userDisconnected", connectionId => {
        toast.error(`Sunucudan ayrıldı: ${connectionId}`);
      });

      connection.on("clients", clientsData => {
        setClients(clientsData);
      });

    };

    createHubConnection();

  }, []);


  const gonder = () => {
    hubConnection.invoke("SendMessageAsync", text).catch((error) => toast.error(`Hata: ${error}`));
  }
  return (
    <div className="chat-container">
      <ToastContainer />
      <div className="chat-sidebar">
        <h3>Bağlı Kullanıcılar</h3>
        <ul>
          {clients.map((client, index) => (
            <li key={index} className="client-item">
              {client}
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-main">
        <div className="chat-header">
          <h2>Chat</h2>
        </div>
        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              {msg}
            </div>
          ))}
        </div>
        <div className="chat-footer">
          <input
            type="text"
            className="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Bir mesaj yaz..."
          />
          <button className="chat-button" onClick={gonder}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

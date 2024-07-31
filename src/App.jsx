import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chat from './Chat';

function App() {
  const [hubConnection, setHubConnection] = useState(null);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [clients, setClients] = useState([]);
  const [connectionId, setConnectionId] = useState("");
  const [blacklist, setBlacklist] = useState([]);
  const [blacklistInputVal, setBlacklistInputVal] = useState("");
  const [groupName, setGroupName] = useState(null);
  const [groupList, setGrouplist] = useState([]);
  const [grouplistInputVal, setGrouplistInputVal] = useState("");


  // onreconnecting: Yeniden bağlanma girişimlerini başlatmadan önce tetiklenen fonksiyondur.
  // onreconnected: Yeniden bağlantı gerçekleştirildiğinde tetiklenen fonksiyondur.
  // onclose: Yeniden bağlantı girişimlerinin sonuçsuz kaldığı durumlarda tetiklenen fonksiyondur. 

  useEffect(() => {
    const createHubConnection = async () => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7047/messagehub")
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

      connection.on("getConnectionId", connectionId => {
        //toast.success(`Sunucuya katıldı: ${connectionId}`);
        setConnectionId(connectionId);
      });

      connection.on("userDisconnected", connectionId => {
        //toast.error(`Sunucudan ayrıldı: ${connectionId}`);
        setConnectionId("");
      });

      connection.on("clients", clientsData => {
        setClients(clientsData);
      });

    };

    //createHubConnection();

  }, []);


  const sendMessage = () => {
    // hubConnection.invoke("SendMessageAsync", text, blacklist).catch((error) => toast.error(`Hata: ${error}`));
    hubConnection.invoke("SendMessageAsync", text, groupName).catch((error) => toast.error(`Hata: ${error}`));
    // hubConnection.invoke("SendMessageAsync", text, groupName, blacklist).catch((error) => toast.error(`Hata: ${error}`));
    //hubConnection.invoke("SendMessageAsync", text, groupList).catch((error) => toast.error(`Hata: ${error}`));
  }

  const joinGroup = () => {
    hubConnection.invoke("AddGroupAsync", groupName, connectionId).catch((error) => toast.error(`Hata: ${error}`));
  }
  /*return (
    <div className="chat-container">
      <ToastContainer />
      <div className="chat-sidebar">
        <h3>Bağlantı Kimliğin: {connectionId}</h3>
        <h3>Bağlı Kullanıcılar</h3>
        <ul>
          {clients.map((client, index) => (
            <li key={index} className="client-item">
              {client}
            </li>
          ))}
        </ul>


        <h3>Gruplar</h3>
        <input type="radio" name="group" value="A" onChange={(e) => setGroupName(e.target.value)} />A <br />
        <input type="radio" name="group" value="B" onChange={(e) => setGroupName(e.target.value)} />B <br />
        <input type="radio" name="group" value="C" onChange={(e) => setGroupName(e.target.value)} />C <br />
        <button onClick={joinGroup}>Gruba gir</button>

        <h3>Kara Liste Kullanıcılar</h3>
        <input
          id='blacklist-input'
          type="text"
          className="blacklist-input"
          value={blacklistInputVal}
          onChange={(e) => setBlacklistInputVal(e.target.value)}
          placeholder="Bağlantı Kimliği"
        />
        <button className="blacklist-button" onClick={() => { setBlacklist(prev => [blacklistInputVal, ...prev]), setBlacklistInputVal("") }}>
          Ekle
        </button>

        <h3 style={{ marginTop: 10 }}>Toplu Grup Mesajı Gönder</h3>
        <input
          id='blacklist-input'
          type="text"
          className="blacklist-input"
          value={grouplistInputVal}
          onChange={(e) => setGrouplistInputVal(e.target.value)}
          placeholder="Grup Adı"
        />
        <button className="blacklist-button" onClick={() => { setGrouplist(prev => [grouplistInputVal, ...prev]), setGrouplistInputVal("") }}>
          Ekle
        </button>
        <ul>
          {groupList.map((groupName, index) => (
            <li key={index} className="client-item">
              {groupName}
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
          <button className="chat-button" onClick={sendMessage}>
            Gönder
          </button>
        </div>
      </div>
    </div>
  );
  */
 return (
  <Chat />
 );
}

export default App;

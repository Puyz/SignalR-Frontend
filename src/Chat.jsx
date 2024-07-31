import { Avatar, Badge, Button, Card, Col, Divider, Flex, Input, List, Row, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import * as signalR from '@microsoft/signalr';
import Room from './Room';

const Chat = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [addGroupInput, setAddGroupInput] = useState("");
    const [hubConnection, setHubConnection] = useState(undefined);
    const [selectedUser, setSelectedUser] = useState(undefined);
    const [selectedGroup, setSelectedGroup] = useState(undefined);

    useEffect(() => {
        const createHubConnection = async () => {
            const connection = new signalR.HubConnectionBuilder()
                .withUrl("https://localhost:7047/chathub")
                .withAutomaticReconnect()
                .build();

            const tryConnect = async () => {
                try {
                    await connection.start();
                    setHubConnection(connection);
                } catch (error) {
                    setTimeout(() => tryConnect(), 2000);
                }
            }

            tryConnect();

            connection.on("clientJoined", username => {
                toast.success(`${username} katıldı.`);
            });


            connection.on("clients", clients => {
                setUsers(clients);
            });

            connection.on("receiveMessage", (message, sender) => {
                setAllMessages(prevMessages => [{ message, sender }, ...prevMessages]);
            });

            connection.on("groups", groups => {
                setGroups(groups);
            });


        }

        createHubConnection();
    }, []);

    const login = () => {
        hubConnection.invoke("GetUsername", username).then(() => {
            toast.success("Giriş başarılı");
            setIsLoggedIn(true);
        }).catch(error => console.log(error));
    }

    const addGroup = () => {
        hubConnection.invoke("AddGroup", addGroupInput).then(() => {
            setAddGroupInput("");
        }).catch(error => console.log(error));
    }


    const sendMessage = () => {
        hubConnection.invoke("SendMessageAsync", message, selectedUser).then(() => {
            setAllMessages(prevMessages => [{ message, sender: { username: "Sen" } }, ...prevMessages]);
            setMessage("");
        }).catch((error) => toast.error(error));
    }
    const sendMessageToGroup = () => {
        console.log(selectedGroup);
        hubConnection.invoke("SendMessageToGroupAsync", message, selectedGroup.groupName).then(() => {
            setMessage("");
        }).catch((error) => toast.error(error));
    }

    const selectAllGroup = () => {
        setSelectedGroup(undefined);
        hubConnection.invoke("GetAllClients").catch(error => console.log(error));
    }


    return (
        <>
            <ToastContainer />
            <Row style={{ margin: 20 }}>
                {isLoggedIn ?
                    <>
                        <Col span={6} style={{ padding: "0 20px" }}>
                            <Input placeholder='Oda adı' style={{ width: 150 }} onChange={(e) => setAddGroupInput(e.target.value)} value={addGroupInput} />
                            <Button style={{ marginLeft: 10 }} onClick={addGroup}>Oda oluştur</Button>
                            <Divider>Odalar</Divider>
                            <Button onClick={selectAllGroup}>Tümü olarak seç</Button>
                            <List dataSource={groups} renderItem={(group, index) =>
                                <Room group={group} index={index} hubConnection={hubConnection} setSelectedGroup={setSelectedGroup}/>
                            }>

                            </List>
                        </Col>
                        <Col span={10} style={{ padding: "0 20px" }}>
                            <div>
                                {selectedUser && <Badge style={{ marginBottom: 10 }} status='success' text={selectedUser.username} />}

                                <Input.TextArea onChange={e => setMessage(e.target.value)} value={message} />
                                <Button style={{ float: "right", marginTop: 10 }} onClick={sendMessage}>Gönder</Button>
                                <Button style={{ float: "right", marginTop: 10, marginRight: 10 }} onClick={sendMessageToGroup}>Gruba Gönder</Button>

                            </div>

                            <List style={{ marginTop: 50 }} dataSource={allMessages} renderItem={(msg, index) =>
                                <List.Item key={index}>
                                    <List.Item.Meta
                                        avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                        title={msg.sender.username}
                                        description={msg.message}

                                    />
                                </List.Item>
                            } />







                        </Col>

                        <Col span={8} style={{ padding: "0 20px" }}>
                            <Divider>Kullanıcılar</Divider>
                            <Button onClick={() => setSelectedUser(undefined)}>Tümü olarak seç</Button>
                            <List dataSource={users} renderItem={(user, index) =>
                                <List.Item key={index} onClick={() => setSelectedUser(user)} style={selectedUser && (selectedUser.connectionId === user.connectionId ? { boxShadow: "0 0 10px #B4BEC9", borderRadius: 10 } : {})}>
                                    <List.Item.Meta
                                        style={{ justifyContent: "center", alignItems: "center" }}
                                        avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                                        title={user.username}
                                        description={user.connectionId}

                                    />
                                </List.Item>
                            }>
                            </List>
                        </Col>
                    </>

                    :
                    <>
                        <Input style={{ width: 200 }} onChange={(e) => setUsername(e.target.value)} />
                        <Button style={{ marginLeft: 10 }} onClick={login}>Giriş yap</Button>
                    </>
                }
            </Row >



        </>
    );
}

export default Chat

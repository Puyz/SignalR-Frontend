import { Avatar, Button, List } from 'antd';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const Room = ({ group, index, hubConnection,setSelectedGroup }) => {

    const [clientJoined, setClientJoined] = useState(false);

    const joinGroup = (groupName) => {
        hubConnection.invoke("AddClientToGroup", groupName).then(() => {
            toast.success(`${groupName} odasına girildi`);
            
            setClientJoined(true);
        }).catch(error => console.log(error));
    }

    const viewGroup = () => {
        hubConnection.invoke("GetClientsInGroup", group.groupName).catch(error => console.log(error));
        setSelectedGroup(group);
    }

    return (
        <List.Item key={index}>
            <List.Item.Meta
                style={{ justifyContent: "center", alignItems: "center" }}
                avatar={<Avatar src={`https://xsgames.co/randomusers/assets/avatars/pixel/${index}.jpg`} />}
                title={group.groupName}
            />
            {!clientJoined ?
                <Button onClick={() => joinGroup(group.groupName)}>+</Button>
                :
                <Button onClick={viewGroup}>Görüntüle</Button>
            }
        </List.Item>
    )
}

export default Room
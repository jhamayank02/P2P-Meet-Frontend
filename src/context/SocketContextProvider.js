import { createContext, useMemo } from "react";
import io from 'socket.io-client';

const SocketContext = createContext();

const SocketProvider = ({children})=>{
    const socket = useMemo(()=> io('http://localhost:80/'), []);
    // const socket = useMemo(()=> io('https://p2p-meet.onrender.com/'), []);

    return <SocketContext.Provider value={socket}>
        {children}
    </SocketContext.Provider>
}

export {SocketContext, SocketProvider};
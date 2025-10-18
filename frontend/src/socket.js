import { io } from "socket.io-client";
const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL, { autoConnect: false });

// connect after login
export function connectSocket(){
  const token = localStorage.getItem('token');
  if(!token) return;
  socket.auth = { token };
  socket.connect();
  return socket;
}

export default socket;

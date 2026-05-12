import { useState, useEffect } from 'react';

export const useWebSocket = (onMessage: (data: any) => void) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const wsUrl = apiUrl.replace('http', 'ws');
    const ws = new WebSocket(`${wsUrl}/api/v1/ws?token=${token}`);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('Failed to parse WS message:', e);
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from WebSocket');
      setConnected(false);
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnected(false);
    }

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [onMessage]);

  return { socket, connected };
};

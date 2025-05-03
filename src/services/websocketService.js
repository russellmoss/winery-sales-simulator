import { EventEmitter } from 'events';

class WebSocketClient extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second delay
  }

  connect() {
    const serverUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin.replace('http', 'ws')
      : 'ws://localhost:5000';
    
    console.log('Attempting WebSocket connection:', {
      serverUrl,
      env: process.env.NODE_ENV,
      currentLocation: window.location.href
    });

    try {
      this.ws = new WebSocket(serverUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connection established successfully');
        this.emit('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.emit('message', data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error, 'Raw message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        this.emit('disconnected');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.emit('error', error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay);

      // Exponential backoff
      this.reconnectDelay *= 2;
    } else {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

const wsClient = new WebSocketClient();
export default wsClient; 
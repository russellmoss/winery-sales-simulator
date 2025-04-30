const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

class ClaudeAPI {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = 'claude-3-opus-20240229';
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(endpoint, data, method = 'POST') {
    let attempts = 0;
    let lastError = null;

    while (attempts < this.maxRetries) {
      try {
        const response = await axios({
          method,
          url: `${this.baseUrl}${endpoint}`,
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'anthropic-beta': 'messages-2023-12-15'
          },
          data: {
            model: this.model,
            ...data
          }
        });

        return response.data;
      } catch (error) {
        lastError = error;
        attempts++;

        if (!this.shouldRetry(error) || attempts >= this.maxRetries) {
          throw this.formatError(error);
        }

        await this.sleep(this.retryDelay * attempts);
      }
    }

    throw this.formatError(lastError);
  }

  shouldRetry(error) {
    if (!error.response) return true; // Network error
    const status = error.response.status;
    return status >= 500 || status === 429; // Retry on server errors or rate limits
  }

  formatError(error) {
    const formattedError = new Error(error.message);
    formattedError.status = error.response?.status || 500;
    formattedError.claudeError = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    };
    formattedError.originalError = error;
    return formattedError;
  }

  async sendMessage(messages) {
    try {
      // Ensure messages is an array
      if (!Array.isArray(messages)) {
        throw new Error('Messages must be an array');
      }

      // Extract system message if present
      let systemMessage = '';
      const userMessages = messages.filter(msg => {
        if (msg.role === 'system') {
          systemMessage = msg.content;
          return false;
        }
        return true;
      });

      // Ensure each message has role and content
      userMessages.forEach((msg, index) => {
        if (!msg.role || !msg.content) {
          throw new Error(`Message at index ${index} is missing required fields (role, content)`);
        }
      });

      const response = await this.makeRequest('/messages', {
        messages: userMessages,
        system: systemMessage,
        max_tokens: 1000
      });

      if (!response.content || !response.content[0] || !response.content[0].text) {
        throw new Error('Invalid response format from Claude API');
      }

      return {
        success: true,
        messageId: uuidv4(),
        model: this.model,
        response: response.content[0].text,
        usage: response.usage || {},
        audio: null
      };
    } catch (error) {
      console.error('Claude API Error:', {
        message: error.message,
        status: error.status,
        claudeError: error.claudeError
      });
      throw error;
    }
  }

  async healthCheck() {
    try {
      await this.makeRequest('/messages', {
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      }, 'POST');
      return true;
    } catch (error) {
      console.error('Claude API Health Check Failed:', {
        message: error.message,
        status: error.status,
        claudeError: error.claudeError
      });
      return false;
    }
  }
}

module.exports = new ClaudeAPI(); 
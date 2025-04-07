import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ChatExport = ({ messages, scenario, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const exportToPDF = async () => {
    if (!messages || messages.length === 0) {
      setExportError('No conversation to export. Please start a new simulation.');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    
    try {
      // Create a temporary div to render the chat for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '750px';
      tempDiv.style.padding = '40px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // Add title and scenario info
      const titleDiv = document.createElement('div');
      titleDiv.innerHTML = `
        <h1 style="font-size: 24px; text-align: center; margin-bottom: 20px; color: #333;">Winery Sales Conversation Transcript</h1>
        <div style="margin-bottom: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>Scenario:</strong> ${scenario?.title || 'Winery Sales'}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          <p style="margin: 5px 0;"><strong>Description:</strong> ${scenario?.description || 'A conversation with a potential customer about wine purchases'}</p>
        </div>
      `;
      tempDiv.appendChild(titleDiv);
      
      // Add chat messages
      const chatDiv = document.createElement('div');
      chatDiv.style.marginBottom = '20px';
      
      messages.forEach((message, index) => {
        const messageDiv = document.createElement('div');
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.display = 'flex';
        messageDiv.style.flexDirection = 'column';
        
        const isUser = message.type === 'user';
        const isSystem = message.type === 'system';
        
        // Message container
        const messageContainer = document.createElement('div');
        messageContainer.style.display = 'flex';
        messageContainer.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
        messageContainer.style.marginBottom = '5px';
        
        // Message bubble
        const messageBubble = document.createElement('div');
        messageBubble.style.maxWidth = '80%';
        messageBubble.style.padding = '10px 15px';
        messageBubble.style.borderRadius = '8px';
        messageBubble.style.whiteSpace = 'pre-wrap';
        
        if (isSystem) {
          messageBubble.style.backgroundColor = '#f0f0f0';
          messageBubble.style.color = '#666';
          messageBubble.style.fontSize = '12px';
        } else if (isUser) {
          messageBubble.style.backgroundColor = '#6b46c1'; // Purple
          messageBubble.style.color = 'white';
        } else {
          messageBubble.style.backgroundColor = '#f0f0f0';
          messageBubble.style.color = '#333';
          
          // Add role indicator for assistant messages
          const roleIndicator = document.createElement('div');
          roleIndicator.style.fontSize = '11px';
          roleIndicator.style.fontWeight = 'bold';
          roleIndicator.style.color = '#047857'; // Green
          roleIndicator.style.backgroundColor = '#d1fae5';
          roleIndicator.style.padding = '2px 8px';
          roleIndicator.style.borderRadius = '4px';
          roleIndicator.style.marginBottom = '5px';
          roleIndicator.style.display = 'inline-block';
          roleIndicator.textContent = scenario?.title.includes('Wine Club') ? 'Wine Club Member' : 'Visitor';
          messageBubble.appendChild(roleIndicator);
        }
        
        // Message content
        const messageContent = document.createElement('div');
        messageContent.textContent = message.content;
        messageBubble.appendChild(messageContent);
        
        // Timestamp
        const timestamp = document.createElement('div');
        timestamp.style.fontSize = '10px';
        timestamp.style.color = '#888';
        timestamp.style.marginTop = '5px';
        timestamp.style.textAlign = isUser ? 'right' : 'left';
        
        const messageDate = new Date(message.timestamp);
        timestamp.textContent = messageDate.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        
        messageContainer.appendChild(messageBubble);
        messageDiv.appendChild(messageContainer);
        messageDiv.appendChild(timestamp);
        chatDiv.appendChild(messageDiv);
      });
      
      tempDiv.appendChild(chatDiv);
      
      // Add footer
      const footerDiv = document.createElement('div');
      footerDiv.style.marginTop = '30px';
      footerDiv.style.paddingTop = '15px';
      footerDiv.style.borderTop = '1px solid #eee';
      footerDiv.style.fontSize = '12px';
      footerDiv.style.color = '#666';
      footerDiv.style.textAlign = 'center';
      footerDiv.innerHTML = `
        <p>Generated by Winery Sales Simulator</p>
        <p>© ${new Date().getFullYear()} Winery Sales Training</p>
      `;
      tempDiv.appendChild(footerDiv);
      
      // Add the temporary div to the document
      document.body.appendChild(tempDiv);
      
      // Generate PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Remove the temporary div
      document.body.removeChild(tempDiv);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });
      
      // Add the canvas to the PDF
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 1.0),
        'JPEG',
        0,
        0,
        canvas.width / 2,
        canvas.height / 2
      );
      
      // Save the PDF
      pdf.save(`winery-sales-conversation-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      setExportError('Failed to export conversation. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Export Conversation</h2>
        
        {exportError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {exportError}
          </div>
        )}
        
        <p className="mb-4">
          Export your conversation as a PDF document. The export will include all messages, 
          timestamps, and scenario information.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center"
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export as PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatExport; 
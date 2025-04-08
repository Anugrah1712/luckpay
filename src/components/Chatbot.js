import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import "./DeveloperConsole.css";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import DeveloperConsole from "./DeveloperConsole";
import SendIcon from "@mui/icons-material/Send";
import RestoreIcon from "@mui/icons-material/Restore";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hello! 👋",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      text: "How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTimestamp = (date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
    setShowSettings(false);
    setShowDeveloperConsole(false);
  };

  const openChatbot = () => {
    setIsOpen(true);
  };

  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  const handleResetHistory = () => {
    setMessages([
      {
        text: "Hello! 👋",
        sender: "bot",
        timestamp: new Date(),
      },
      {
        text: "How can I help you?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const handleAdminSubmit = () => {
    if (adminKey === "admin123") {
      setAccessGranted(true);
      setShowSettings(false);
      setShowDeveloperConsole(true);
    } else {
      alert("Incorrect Admin Key!");
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === "" || isBotResponding) return;

    const newUserMessage = {
      text: inputText,
      sender: "user",
      timestamp: new Date(),
    };

    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setInputText("");
    setIsBotResponding(true);

    try {
      const response = await fetch("https://rag-chatbot-web.shop/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ prompt: inputText }),
      });

      const data = await response.json();

      const botMessage = {
        text: response.ok ? data.response : "Error: " + data.detail,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setMessages([
        ...newMessages,
        {
          text: "Error connecting to server.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsBotResponding(false);
    }
  };

  return (
    <div className="chatbot-container">
      <button className="chat-icon" onClick={toggleChatbot}>
        💬
      </button>

      {isOpen && (
        <div className="chatbox">
          <div className="chat-header">
            <span>AI Chat Assistant</span>
            <div className="icons">
              <RestoreIcon
                className="icon"
                onClick={handleResetHistory}
                titleAccess="Reset Chat History"
              />
              <SettingsIcon className="icon" onClick={handleSettingsClick} />
              <CloseIcon className="icon" onClick={toggleChatbot} />
            </div>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {showDeveloperConsole ? (
              <DeveloperConsole
                closeConsole={() => {
                  setAccessGranted(false);
                  setShowDeveloperConsole(false);
                }}
                openChatbot={openChatbot}
              />
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={msg.sender === "bot" ? "bot-message" : "user-message"}>
                  <div>{msg.text}</div>
                  <div className="timestamp">{formatTimestamp(new Date(msg.timestamp))}</div>
                </div>
              ))
            )}
          </div>

          {!showDeveloperConsole && (
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder={
                  isBotResponding
                    ? "You can type, but wait for bot’s reply..."
                    : "Type a message..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isBotResponding && handleSendMessage()}
              />
              <button
                className="send-button"
                onClick={handleSendMessage}
                disabled={isBotResponding}
                title={isBotResponding ? "Please wait for the bot to respond..." : "Send"}
              >
                <SendIcon />
              </button>
            </div>
          )}

          {showSettings && (
            <div className="admin-modal">
              <div className="admin-modal-content">
                <div className="admin-header">
                  <h3>Enter Admin Key</h3>
                  <CloseIcon className="close-icon" onClick={() => setShowSettings(false)} />
                </div>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter admin key"
                  className="admin-input"
                />
                <button className="admin-submit" onClick={handleAdminSubmit}>
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Chatbot;

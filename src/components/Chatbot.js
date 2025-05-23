// Chatbot.js

import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css";
import "./DeveloperConsole.css";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import DeveloperConsole from "./DeveloperConsole";
import SendIcon from "@mui/icons-material/Send";
import { AiOutlineReload } from "react-icons/ai";
import MicIcon from "@mui/icons-material/Mic";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import PauseIcon from '@mui/icons-material/Pause';


function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [showDeveloperConsole, setShowDeveloperConsole] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! 👋", sender: "bot", timestamp: new Date() },
    { text: "How can I help you today?", sender: "bot", timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const chatBodyRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prevText) => prevText + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("SpeechRecognition API not supported in this browser.");
    }
  }, []);

  const formatTimestamp = (date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleSpeak = (text, index) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";

    utterance.onend = () => {
      setSpeakingIndex(null);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeakingIndex(index);
  };

  const handlePause = () => {
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);
  };

  const toggleChatbot = () => {
    setIsOpen((prev) => !prev);
    setShowSettings(false);
    setShowDeveloperConsole(false);
  };

  const openChatbot = () => setIsOpen(true);

  const handleSettingsClick = () => setShowSettings(true);

  const handleResetHistory = () => {
    setMessages([
      { text: "Hello! 👋", sender: "bot", timestamp: new Date() },
      { text: "How can I help you today?", sender: "bot", timestamp: new Date() },
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

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
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
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: inputText,
          project_name: "https://rag-chatbot-frontend-three.vercel.app",
      }),
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
              <AiOutlineReload className="icon" onClick={handleResetHistory} title="Reset Chat History" />
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
                  <div className="message-content">
                    <span>{msg.text}</span>
                  </div>
                  <div className="message-meta">
                    <span className="timestamp">{formatTimestamp(new Date(msg.timestamp))}</span>
                    {msg.sender === "bot" && (
                      <>
                        <button
                          className="speaker-button"
                          onClick={() => handleSpeak(msg.text, index)}
                          title="Play aloud"
                          style={{ display: speakingIndex === index ? "none" : "inline-block" }}
                        >
                          <VolumeUpIcon fontSize="small" />
                        </button>
                        <button
                          className="pause-button"
                          onClick={handlePause}
                          title="Pause"
                          style={{ display: speakingIndex === index ? "inline-block" : "none" }}
                        >
                          <PauseIcon fontSize="small" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {!showDeveloperConsole && (
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder={isBotResponding ? "You can type, but wait for bot’s reply..." : "Type or hold mic to speak..."}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isBotResponding && handleSendMessage()}
              />
              <button
                className={`mic-button ${isRecording ? "recording" : ""}`}
                onMouseDown={startRecording}
                onMouseUp={stopRecording}
                onTouchStart={startRecording}
                onTouchEnd={stopRecording}
                title="Hold to record"
              >
                <MicIcon />
              </button>
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

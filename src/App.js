import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Chatbot } from 'rag-chatbot-ui-luckpay'
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <h1 className="welcome-text">Demo Chatbot for LuckPay</h1>
      </div>
      <Chatbot/>
    </Router>
  );
}

export default App;

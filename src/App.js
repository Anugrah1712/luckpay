import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Chatbot } from 'rag-chatbot-ui-bajaj'
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <h1 className="welcome-text">Welcome to My Website</h1>
      </div>
      <Chatbot/>
    </Router>
  );
}

export default App;

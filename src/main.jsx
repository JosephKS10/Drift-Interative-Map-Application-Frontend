import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { DriftProvider } from "./context/DriftContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DriftProvider>
      <App />
    </DriftProvider>
  </React.StrictMode>
);

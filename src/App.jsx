// src/App.jsx
import React from "react";
import { DataProvider } from "./contexts/DataContext";
import FarmerAssistant from "./components/FarmerAssistant";


function App() {
  return (
    <DataProvider>
      <FarmerAssistant />
    </DataProvider>
  );
}

export default App;

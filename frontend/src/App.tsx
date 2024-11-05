import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Welcome from "./components/Welcome";
import Main from "./components/Main";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/welcome" element={<Welcome />} />
      </Routes>
    </Router>
  );
}

export default App;

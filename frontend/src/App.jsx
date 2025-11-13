import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import Mypage from "./pages/Mypage";
// import Regions from "./pages/Regions";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/register" element={<RegisterPage />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/regions" element={<Regions />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

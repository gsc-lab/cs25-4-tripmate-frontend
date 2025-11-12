import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
import Mypage from "./pages/Mypage";
// import Choose_Regions from "./pages/Choose_Regions";

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route path="/api/v1/auth/login" element={<LoginPage />} /> */}
        {/* <Route path="/api/v1/users" element={<RegisterPage />} /> */}
        <Route path="/api/v1/users/me" element={<Mypage />} />
        {/* <Route path="/api/v1/regions" element={<Choose_Regions />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

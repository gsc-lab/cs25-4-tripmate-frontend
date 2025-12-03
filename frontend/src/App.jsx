import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Register from "./pages/Register";
import Mypage from "./pages/Mypage";
import Regions from "./pages/Regions";
import View from "./pages/View";
import Trip from "./pages/Trip";
// import EditTrip from "./pages/EditTrip";


function App() {
  return (
    <>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/viewpage" element={<View />} />
        <Route path="/regions" element={<Regions />} />
        <Route path="/trip" element={<Trip />} />
        {/* <Route path="/edittrip" element={<EditTrip />} /> */}
      </Routes>
    </Router>
    </>
  );
}

export default App;

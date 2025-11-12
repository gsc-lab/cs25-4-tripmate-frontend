import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Regions.css"

const navigate = useNavigate()


function Regions() {
  return (
    <div className="frame">
      <div className="inner">
        <header className="frame_header">
          <div className="header_top">
            <h1>지역 검색</h1>
          </div>
        </header>

        <main className="frame_main">
          <div className="frame_content">
            <p>여행 지역 검색 창</p>
          </div>
        </main>

        <div className="button_area">
          <button className="make_button"
          onClick={() => navigate("/")}>여행일정 생성</button>
        </div>
      </div>
    </div>
  );
}

export default Regions;

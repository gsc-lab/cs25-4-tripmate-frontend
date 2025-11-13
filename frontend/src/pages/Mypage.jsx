import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mypage.css"

function Mypage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("로그인이 필요한 페이지입니다.");
    navigate("/api/v1/auth/login");
    return;
  }

  // 로그아웃 함수
  async function Logout_func() {
    try {
      const req = await axios.post( "http://localhost:8080/api/v1/auth/logout", null,
        { headers: { Authorization: `Bearer ${token}`, }, }
      );
      
      // 서버로부터 받은 응답
      const response = req.data;

      if (req?.status === 204) {
        localStorage.removeItem("access_token");
        alert("로그아웃 되었습니다.");
        navigate("/login");
        return;
      } 

      // 에러 코드 401 - 인증이 없을 시, 인증이 필요하다는 에러 문구 출력
      if (response?.error?.code === "UNAUTHORIZED") {
        alert("인증이 필요합니다.");
        return;
      }

    } catch (err) {
      console.error(err);
    }
  };

// 회원 탈퇴 모달
function DelUser() {
  return 
}

  // 회원탈퇴 함수
  async function Del_User_func() {
    try {
      const req = await axios.delete( "http://localhost:8080/api/v1/users/me",
        { headers: { Authorization: `Bearer ${token}`, }, }
      );
      
      // 서버로부터 받은 응답
      const response = req.data;

      if (req?.status === 204) {
        localStorage.removeItem("access_token");
        alert("탈퇴 되었습니다.");
        navigate("/login");
        return;
      } 

      // 에러 코드 409 - 응답 실패
      if (response?.error?.code === "CONFLICT") {
        alert("현재 상태에서는 탈퇴할 수 없습니다.");
        return;
      }

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="frame">
      <div className="inner">
        <header className="frame_header">
          <div className="header_top">
            <h1>마이페이지</h1>
            <button className="logout_button"
            onClick={() => Logout_func()}>로그아웃</button>
          </div>
        </header>

        <main className="frame_main">
          <div className="frame_content">
            <p>페이지별 알고리즘 구현부</p>
          </div>
        </main>

        <div className="button_area">
          <button className="del_button" 
          onClick={() => Del_User_func()}>회원탈퇴</button>

          <button className="make_button"
          onClick={() => navigate("/regions")}>일정짜기</button>
        </div>
      </div>
    </div>
  );
}

export default Mypage;
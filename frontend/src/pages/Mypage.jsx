import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mypage.css"

function Mypage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  if (!token) {
    alert("로그인이 필요한 페이지입니다.");
    navigate("/api/v1/auth/login");
  }

  // 로그아웃 함수
  async function Logout_func() {
    try {
      const req = await axios.post( "http://localhost:5000/api/v1/auth/logout", null,
        { headers: { Authorization: `Bearer ${token}`, }, }
      );
      
      // 서버로부터 받은 응답
      const response = req.data;

      if (response?.success) {
        localStorage.removeItem("access_token");
        alert("로그아웃 되었습니다.");
        navigate("/api/v1/auth/login");
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

// 내 정보 확인 및 회원 탈퇴 모달
function UserModal() {
  return 
}

  // 회원탈퇴 함수
  async function del_user() {
    try {
      const req = await axios.delete( "http://localhost:5000/api/v1/users/me", null,
        { headers: { Authorization: `Bearer ${token}`, }, }
      );
      
      // 서버로부터 받은 응답
      const response = req.data;

      if (response?.status === 204) {
        localStorage.removeItem("access_token");
        alert("탈퇴 되었습니다.");
        navigate("/api/v1/auth/login");
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
          <h1>마이페이지</h1>
        </header>

        <main className="frame_main">
          <div className="frame_content">
            <p>
             페이지별 알고리즘 구현부
            </p>
          </div>
        </main>

        <div className="frame_button_area">
          <button className="frame_button">일정짜기</button>
        </div>
      </div>
    </div>
  );
}

export default Mypage;
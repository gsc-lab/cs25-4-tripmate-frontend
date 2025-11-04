import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <>
    <header>
      <h1>마이페이지</h1>
      <button onClick={Logout_func}>로그아웃</button>
    </header>
    <body>
      <h2>생성된 여행 목록</h2>
    </body>
    <footer>
      <button onClick={del_user}>회원 탈퇴</button>
      <button onClick={() => navigate("/api/v1/regions")}>일정 생성</button>
    </footer>
    </>
  );
}

export default Mypage;
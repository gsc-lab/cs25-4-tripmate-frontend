import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./form_design.css";
import logo from "../assets/TripMate_Logo.png";

function Register() {
  // 페이지 이동을 위한 네비게이션 함수
  const navigate = useNavigate();

  // 입력 값 저장
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 입력한 사용자 값을 초기화 하지 않기 위한 함수
  async function handleRegister(e) {
    e.preventDefault();

    // 지정된 조건에 맞게 입력하지 않으면, 경고 메시지 출력
    if (email.length > 255) { alert("이메일은 255자 이하로 입력해주세요."); return; }
    if (!password || password.length < 8 || password.length > 128) {
      alert("비밀번호는 8~128자 사이로 입력해주세요."); return;
    }
    if (nickname.length > 50) { alert("닉네임은 50자 이내로 입력해주세요."); return; }

    // 사용자가 입력 한 값을 저장한 변수
    const input_value = { email, password, nickname };

    try { // 서버에 axios로 입력한 데이터를 보냄
      const req = await axios.post("http://210.101.236.165:8080/api/v1/users", input_value, {
        headers: { "Content-Type": "application/json", Accept: "application/json" }
      });

      // 서버로 부터 받은 값
      const response = req.data;
      
      // 회원가입 완료 시, 로그인 화면으로 이동
      if (req?.status === 204) {
        alert("회원가입 완료! 로그인 페이지로 이동합니다.");
        navigate("/login");
        return;
      }

      // 오류 응답 - 사용중인 이메일 일 경우, 에러
      if (response?.error?.code === "DUPLICATE_EMAIL") {
        alert("이미 사용 중인 이메일입니다.");
        return;
      }

      // 그 외의 에러 시
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main className="form-signin w-100 m-auto text-center">
      <form onSubmit={handleRegister}>
        <img
          className="logo"
          src={logo}
          width="300"
          height="80"
        />

        <h1 className="h3 mb-3 fw-normal">회원가입</h1>

        <div className="form-floating">
          <input
            type="text"
            className="form-control"
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
          <label htmlFor="nickname">닉네임(50자 이내)</label>
        </div>

        <div className="form-floating">
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email">이메일 주소</label>
        </div>

        <div className="form-floating">
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="password">비밀번호 (8~128자)</label>
        </div>

        <button className="btn btn-primary w-100 py-2 mt-3" type="submit">
          회원가입
        </button>

        <div className="mt-3">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-decoration-none">
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}

export default Register;
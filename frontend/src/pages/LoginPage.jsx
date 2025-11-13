import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import axios from "axios";

function LoginPage() {

  // 페이지 이동을 위한 네비게이션 함수
  const navigate = useNavigate();

  // 입력 값 저장
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 입력한 사용자 값을 초기화 하지 않기 위한 함수
  async function handleLogin(e) {
    e.preventDefault();

    // 지정된 조건에 맞게 입력하지 않으면, 경고 메시지 출력
    if (!email || !password) { alert("이메일 혹은 비밀번호를 입력해 주세요."); return; }

    // 사용자가 입력 한 값을 저장한 변수
    const input_value = { email, password };

    try { // 서버에 axios로 입력한 데이터를 보냄
      const req = await axios.post( "http://localhost:8080/api/v1/auth/login", input_value, { 
          headers: { "Content-Type": "application/json", Accept: "application/json" }
        }
      );

      // 서버로 부터 받은 값
      const response = req.data;
      
      // 로그인 완료 시, 토큰 저장 후 마이페이지 화면으로 이동
      if (response?.success) { const token = response?.data?.access_token;
        if (token) {
          localStorage.setItem("access_token", token);
        }
        navigate("/mypage");
        return;
      }

      // 에러 코드 401 - 이메일 및 비밀번호 일치하지 않을 시
      if (response?.error?.code === "AUTH_FAILED") {
        alert("이메일 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      // 에러 코드 422 - 입력 값이 유효하지 않을 시
      if (response?.error?.code === "VALIDATION_ERROR") {
        alert("입력값이 유효하지 않습니다.");
        return;
      }

      // 그 외의 실패
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <AuthLayout title="로그인" onSubmit={handleLogin}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          size="medium"
          InputProps={{
            sx: {
              bgcolor: "#e9e7e7",
              "& fieldset": { border: "none" },
            },
          }}
        />

        <TextField
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="medium"
          InputProps={{
            sx: {
              bgcolor: "#e9e7e7",
              "& fieldset": { border: "none" },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 1,
            height: 48,
            bgcolor: "#38aef3",
            fontWeight: 600,
            "&:hover": { bgcolor: "#2597da" },
          }}
        >
          로그인
        </Button>

        <Button
          type="button"
          variant="outlined"
          fullWidth
          sx={{
            height: 48,
            borderColor: "#38aef3",
            color: "#000",
            fontWeight: 600,
            bgcolor: "#ffffff",
            "&:hover": {
              borderColor: "#2597da",
              bgcolor: "#f5fbff",
            },
          }}
          onClick={() => navigate("/register")}
        >
          회원가입
        </Button>
      </Box>
    </AuthLayout>
  );
}



export default LoginPage;
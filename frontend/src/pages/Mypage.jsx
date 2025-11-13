import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";

function Mypage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  
  // if (!token) {
  //   alert("로그인이 필요한 페이지입니다.");
  //   navigate("/login");
  //   return;
  // }

  // 로그아웃
  async function Logout_func() {
    try {
      const req = await axios.post(
        "http://localhost:8080/api/v1/auth/logout",
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req?.status === 204) {
        localStorage.removeItem("access_token");
        alert("로그아웃 되었습니다.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  }

  // 회원 탈퇴
  async function Del_User_func() {
    try {
      const req = await axios.delete(
        "http://localhost:8080/api/v1/users/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req?.status === 204) {
        localStorage.removeItem("access_token");
        alert("탈퇴되었습니다.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <PageLayout
      title="각 파트 별 제목"
      actionLabel="일정짜기"
      onAction={() => navigate("/regions")}
    >

      <Typography
        sx={{
          fontSize: 26,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        알고리즘 구현부
      </Typography>

      
      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
        }}
      >
        <Button
          variant="contained"
          onClick={Logout_func}
          sx={{
            background: "#ffffff99",
            color: "#000",
            fontWeight: 600,
            "&:hover": { background: "#ffffffdd" },
          }}
        >
          로그아웃
        </Button>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 20,
          left: 20,
        }}
      >
        <Button
          variant="contained"
          onClick={Del_User_func}
          sx={{
            background: "#ffcccc",
            color: "#a00000",
            fontWeight: 600,
            "&:hover": { background: "#ffbbbb" },
          }}
        >
          회원탈퇴
        </Button>
      </Box>
    </PageLayout>
  );
}

export default Mypage;
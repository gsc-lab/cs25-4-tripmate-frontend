import { useState, useEffect } from "react";
import { Box, Button, Typography, Modal, TextField, Pagination, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";

function Mypage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  const [tripList, setTripList] = useState([]);
  const [page, setPage] = useState(1);

  // 여행 일정 목록 불러오기
  useEffect(() => {
    tripsList();
  }, []);

  async function tripsList() {
    try {
      const req = await axios.get("http://210.101.236.165:8000/api/v1/trips", 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("작성된 글 불러오기 성공", req.data.data);
      const items = req.data.data;
      setTripList(Array.isArray(items) ? items : []);

    } catch (err) {
      
      const status = err.response?.status;
      if (status === 401) {
        alert("인증이 필요합니다.");
        return;
      }
      if (status === 422) {
        alert("요청 데이터가 유효하지 않습니다.");
        return;
      }
      console.error(err);
    }
  }

  // 회원탈퇴 모달 상태
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const handleOpenDeleteModal = () => setOpenDeleteModal(true);
  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setDeletePassword("");
  };

  // 로그아웃
  async function Logout_func() {
    try {
      const req = await axios.post( "http://210.101.236.165:8000/api/v1/auth/logout", null,
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
  };

  // 회원탈퇴
  async function Del_User_func() {
    if (!deletePassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    try {
      const req = await axios.delete( "http://210.101.236.165:8000/api/v1/users/me",
        { headers: { Authorization: `Bearer ${token}` }, data: { password: deletePassword } }
      );

      if (req?.status === 204) {
        localStorage.removeItem("access_token");
        alert("탈퇴 되었습니다.");
        handleCloseDeleteModal();
        navigate("/login");
        return;
      }
    } catch (err) {
      
      const status = err.response?.status;

      if (status === 404) {
        alert("해당 유저를 찾을 수 없습니다.");
        return;
      }
      if (status === 422) {
        alert("입력값이 유효하지 않습니다.");
        return;
      }
      if (status === 401) {
        alert("인증이 필요합니다.");
        return;
      }
      console.error(err);
    }
  };

  async function delTrip(trip_id) {
    try{
      const req = await axios.delete(`http://210.101.236.165:8000/api/v1/trips/${trip_id}`,
        { headers: { Authorization: `Bearer ${token}`} }
      );

      if (req.status === 204) {
        console.log("게시글 삭제 완료");
        await tripsList();
      }

    } catch(err) {
      const status = err.response?.status;

      if (status === 401) {
        alert("인증이 필요합니다.");
        return;
      }
      if (status === 403) {
        alert("접근 권한이 없습니다.");
        return;
      }
      if (status === 404) {
        alert("리소스를 찾을 수 없습니다.");
        return;
      }
    }
  };

  const perPage = 5;
  const totalPages = Math.max(1, Math.ceil(tripList.length / perPage));
  const paginatedTrips = tripList.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);   
    }
  }, [page, totalPages]);

  return (
    <PageLayout
      title="마이페이지"
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
        생성된 여행 일정
      </Typography>

      <Box sx={{ mt: 3 }}>
        {paginatedTrips.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "#666" }}>
            생성된 여행 일정이 없습니다.
          </Typography>
        ) : (
          <>
            <Stack spacing={1.5}>
              {paginatedTrips.map((trip) => (
                <Box
                  key={trip.trip_id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: 16,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {trip.title}
                      </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mt: 0.5 }}
                    >
                      {trip.region_name} | {trip.start_date} ~ {trip.end_date}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      navigate("/viewpage", {
                        state: {
                          tripId: trip.trip_id,
                          regionName: trip.region_name,
                        },
                      })
                    }
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    상세보기
                  </Button>

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => delTrip(trip.trip_id)}
                    sx={{
                      background: "#ff4d4d",
                      color: "#fff",
                      fontWeight: 600,
                      "&:hover": {
                        background: "#e04444",
                      },
                    }}
                  >
                    X
                  </Button>
                </Box>
              ))}
            </Stack>

            <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          </>
        )}
      </Box>

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
            background: "#ffffff",
            color: "#000",
            fontWeight: 600,
            boxShadow: "none",
            border: "1px solid #d0d0d0",
            "&:hover": {
              background: "#f7f7f7",
            },
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
          onClick={handleOpenDeleteModal}
          sx={{
            background: "#f7dcdc",
            color: "#cf3c3c",
            fontWeight: 600,
            boxShadow: "none",
            border: "1px solid #e36e6e",
            "&:hover": {
              background: "#f3c0c0",
            },
          }}
        >
          회원탈퇴
        </Button>
      </Box>

      <Modal
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        aria-labelledby="delete-user-title"
        aria-describedby="delete-user-description"
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              backdropFilter: "blur(3px)", 
            },
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 520,
            bgcolor: "#bfbfbf",
            boxShadow: 24,
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography
            id="delete-user-title"
            variant="h4"
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: 40,
              textDecoration: "underline",
              textDecorationThickness: "4px",
              textDecorationColor: "#1e73be",
              textUnderlineOffset: "8px",
            }}
          >
            회원탈퇴
          </Typography>

          <Typography
            id="delete-user-description"
            sx={{
              mb: 4,
              fontSize: 16,
              lineHeight: 1.6,
            }}
          >
            회원 탈퇴를 하시려면, 비밀번호를 입력하세요
          </Typography>

          <TextField
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            fullWidth
            placeholder="비밀번호"
            InputProps={{
              sx: {
                bgcolor: "#e5e5e5",
                "& fieldset": { border: "none" },
              },
            }}
            sx={{ mb: 4 }}
          />

          <Button
            variant="contained"
            onClick={Del_User_func}
            sx={{
              background: "#f7dcdc",
              color: "#cf3c3c",
              fontWeight: 600,
              boxShadow: "none",
              border: "1px solid #e36e6e",
              px: 4,
              "&:hover": {
                background: "#f3c0c0",
              },
            }}
          >
            회원탈퇴
          </Button>
        </Box>
      </Modal>
    </PageLayout>
  );
}

export default Mypage;

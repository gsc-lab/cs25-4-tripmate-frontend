import { useState, useRef, useEffect } from "react";
import { Box, Typography, Grid, Paper, Button, Stack, Chip, Divider } from "@mui/material"; 
import { useLocation, useNavigate } from "react-router-dom";
import { Wrapper } from "@googlemaps/react-wrapper";
import axios from "axios";
import PageLayout from "../components/PageLayout";

function GoogleMap({ lat, lng }) {
  const mapRef = useRef(null);
  const mapPoint = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    mapPoint.current = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 16,
    });
  }, []);

  useEffect(() => {
    if (!mapPoint.current) return;

    const newCenter = new window.google.maps.LatLng(lat, lng);
    mapPoint.current.setCenter(newCenter);

    new window.google.maps.Marker({
      map: mapPoint.current,
      position: newCenter,
    });
  }, [lat, lng]);

  return (
    <Box sx={{ width: "100%", height: "100%", mt: 1 }}>
      <div
        ref={mapRef}
        id="map"
        style={{ width: "100%", height: "100%", minHeight: "500px" }}
      />
    </Box>
  );
}

function View() {
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    const { state } = useLocation();
    const trip_id = state?.tripId;
    const region_name = state?.regionName
    const [trip, setTrip] = useState(null);
    const [days, setDays] = useState([]);
    const [scheduleItems, setScheduleItems] = useState([]);
    const [selectedDayNo, setSelectedDayNo] = useState(null);
    const [lat, setLat] = useState(35.896);
    const [lng, setLng] = useState(128.6219); 

    useEffect(() => {
        tripView();
        getDays();
    }, []);

    const tripView = async () => {
        try {
            const req = await axios.get(`http://localhost:8080/api/v1/trips/${trip_id}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("tripView의 응답 값: ", req.data.data);
            setTrip(req.data.data);

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
            if (status === 401) {
                alert("리소스를 찾을 수 없습니다.");
                return;
            }
            console.log(err.response);
        }
    };

    const getDays = async () => {
        try {
        const req = await axios.get(`http://localhost:8080/api/v1/trips/${trip_id}/days`, 
            { headers: { Authorization: `Bearer ${token}` } }
        )

        if (req.status === 200) {
            console.log("일차 목록 조회 성공", req.data.data);
            setDays(req.data.data);
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

    const getSchedule = async (targetDayNo) => {
        try {
        const req = await axios.get(
            `http://localhost:8080/api/v1/trips/${trip_id}/days/${targetDayNo}/items`,
            { params: { page: 1, size: 20 }, headers: { Authorization: `Bearer ${token}` } }
        );

        if (req.status === 200) {
            console.log("일정 아이템 목록 조회 성공", req.data.data.items);
            setScheduleItems(req.data.data.items);
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
        if (status === 422) {
            alert("요청 데이터가 유효하지 않습니다.");
            return;
        }
        console.log(err.response);
        }
    };

    const checkLocationUnit = async (placeId) => {
        try {
            const req = await axios.get(`http://localhost:8080/api/v1/places/${placeId}`, 
                { headers: { Accept: "application/json" } }
            );

            console.log("장소 단건 조회 완료!", req.data.data);
            const place = req.data.data;
            setLat(place.lat);
            setLng(place.lng);

        } catch(err) {
            const status = err.response?.status;

            if (status === 422) {
                alert("입력값이 유효하지 않습니다.");
                return;
            }
        }
    };
    
    return (
      <PageLayout
        title="글 상세보기"
        actionLabel="마이페이지로"
        onAction={() => navigate("/mypage")}
      >
        <Button
          variant="contained"
          onClick={() => navigate("/trip")}
          sx={{
            background: "#7467feff",
            color: "#ffffffff",
            fontWeight: 600,
            boxShadow: "none",
            border: "1px solid #d0d0d0",
            "&:hover": {
              background: "#f7f7f7",
            },
          }}
        >
          게시글 수정
        </Button>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={3}
              sx={{
                height: "100%",
                borderRadius: 2,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="h5" gutterBottom sx={{width: "1200px", whiteSpace: "normal", overflowWrap: "break-word",}}>
                  {trip?.title || "제목 없음"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>지역:</strong> {region_name || "-"}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  <strong>여행 날짜:</strong>{" "}
                  {trip?.start_date} ~ {trip?.end_date}
                </Typography>
                {trip?.memo && (
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", mt: 1 }}
                  >
                    {trip.memo}
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
                  <GoogleMap lat={lat} lng={lng} />
                </Wrapper>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={2}
              sx={{
                height: "100%",
                borderRadius: 2,
                p: 2,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" gutterBottom>
                일자별 일정
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Day를 선택하면 해당 일차의 일정이 아래에 표시됩니다.
              </Typography>

              <Divider sx={{ mb: 1 }} />

              <Box sx={{ flex: 1, overflowY: "auto" }}>
                <Stack spacing={2}>
                  {days.map((day) => (
                    <Box
                      key={day.trip_day_id}
                      sx={{
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor:
                          selectedDayNo === day.day_no ? "primary.main" : "grey.300",
                        p: 1.5,
                        bgcolor:
                          selectedDayNo === day.day_no ? "grey.50" : "background.paper",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          mb: 1,
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={`Day ${day.day_no}`}
                            color="primary"
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            메모: {day.memo || "메모 없음"}
                          </Typography>
                        </Box>
                        <Button
                          size="small"
                          variant={
                            selectedDayNo === day.day_no ? "contained" : "outlined"
                          }
                          onClick={() => {
                            setSelectedDayNo(day.day_no);
                            getSchedule(day.day_no);
                          }}
                        >
                          일정 보기
                        </Button>
                      </Box>

                      {selectedDayNo === day.day_no && (
                        <Box sx={{ mt: 1 }}>
                          {scheduleItems.length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              등록된 일정이 없습니다.
                            </Typography>
                          ) : (
                            <Stack spacing={1}>
                              {scheduleItems.map((item) => (
                                <Box
                                  key={item.schedule_item_id}
                                  sx={{
                                    p: 1,
                                    borderRadius: 1.5,
                                    bgcolor: "grey.100",
                                  }}
                                >
                                  <Typography variant="body2">
                                    <strong>{item.seq_no}.</strong>{" "}
                                    <span
                                      onClick={() => checkLocationUnit(item.place_id)}
                                      style={{
                                        cursor: "pointer",
                                        textDecoration: "underline",
                                      }}
                                    >
                                      {item.place_name && `[${item.place_name}] `}
                                    </span>
                                    {item.memo ?? "(메모 없음)"}
                                  </Typography>
                                  {item.visit_time && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      방문 시간: {item.visit_time}
                                    </Typography>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      )}
                    </Box>
                  ))}

                  {days.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      등록된 일차가 없습니다.
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </PageLayout>
    );
}

export default View;
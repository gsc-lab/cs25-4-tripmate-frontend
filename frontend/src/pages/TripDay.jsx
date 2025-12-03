import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wrapper } from "@googlemaps/react-wrapper";
import axios from "axios";

import PageLayout from "../components/PageLayout";
import { Box, Grid, Paper, Typography, Button, TextField, Stack, IconButton, Divider, Chip } from "@mui/material";
import { Delete, Edit, Add } from "@mui/icons-material";

function GoogleMap({ setPlace_Id }) {
  const token = localStorage.getItem("access_token");
  const mapRef = useRef(null);
  const mapPoint = useRef(null);
  const [inputPlace, setInputPlace] = useState("");
  const [lat, setLat] = useState(35.896);
  const [lng, setLng] = useState(128.6219);


  useEffect(() => {
    autoSearching(inputPlace);
  }, [inputPlace]);

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

  const searchPlace = async () => {
    try {
      const req = await axios.get( "http://210.101.236.165:8000/api/v1/places/external-search", 
        { params: { place: inputPlace }, headers: { Accept: "application/json" }, }
      );

      if (req.status === 200) {
        console.log("외부 지도 기반 장소 검색 성공");
        const point = req.data.data.data[0];
        
        try {
          const inputValue = {
            external_ref: point.place_id,
            name: point.name,
            category: point.category,
            address: point.address,
            lat: point.lat,
            lng: point.lng
          }

          const req2 = await axios.post("http://210.101.236.165:8000/api/v1/places/from-external", inputValue,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );

          const res = reqForSave.data;
          let realPoint = null;
          if (res?.success) {
            realPoint = res.data;
            setLat(realPoint.lat);
            setLng(realPoint.lng);
            setPlace_Id(realPoint.place_id);
          };


        } catch(err) {
          const status = err.response?.status;

          if (status === 401) {
            alert("인증이 필요합니다.");
            return;
          }
          if (status === 422) {
            alert("입력값이 유효하지 않습니다.22");
            return;
          }
        }
      }

    } catch (err) {
      const status = err.response?.status;

      if (status === 500) {
        alert("외부 API 호출에 실패했습니다.");
        return;
      }
      if (status === 422) {
        alert("입력값이 유효하지 않습니다.");
        return;
      }
    }
  };

  return (
    <>
      <input
        value={inputPlace}
        onChange={(e) => setInputPlace(e.target.value)}
        placeholder="장소명을 입력하세요"
        style={{
          width: "1000px",
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          boxSizing: "border-box"
        }}
      />
      <button onClick={searchPlace}>검색</button>

      <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
        <div style={{ width: "100%" }}>
          <div
            ref={mapRef}
            id="map"
            style={{ width: "100%", height: "600px" }}
          />
        </div>
      </div>
    </>
  );
}

function TripDay() {
  const navigate = useNavigate();
  const location = useLocation();
  const trip_id = location.state?.trip_id;
  const token = localStorage.getItem("access_token");
  const [days, setDays] = useState([]);
  const [dayNo, setDayNo] = useState(1);

  const [place_id, setPlace_Id] = useState();
  const [placeView, setPlaceView] = useState();
  const [dayMemo, setDayMemo] = useState(""); 

  const [scheNo, setScheNo] = useState(1);
  const [scheTime, setScheTime] = useState("");
  const [scheMemo, setScheMemo] = useState("");

  const [scheduleItems, setScheduleItems] = useState([]);
  const [selectedDayNo, setSelectedDayNo] = useState(null);

  useEffect(() => {
    getDays();
  }, []);

  const getDays = async () => {
    try {
      const req = await axios.get(`http://210.101.236.165:8000/api/v1/trips/${trip_id}/days`, 
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

  const addDay = async () => {

    const inputValue = { day_no: dayNo, memo: dayMemo ?? "" };
    try{
      const req = await axios.post(`http://210.101.236.165:8000/api/v1/trips/${trip_id}/days`, inputValue ,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      )

      if (req.status === 201) {
        console.log("일차 생성 성공");
        await getDays();
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
      if (status === 409) {
        alert("해당 일차가 이미 존재합니다.");
        return;
      }
      if (status === 422) {
        alert("요청 데이터가 유효하지 않습니다.");
        return;
      }
      console.log(err);
    }
  };

  const delDay = async (targetDayNo) => {
    try {
      const req = await axios.delete(
        `http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${targetDayNo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req.status === 204) {
        console.log("일차 삭제 완료");
        await getDays();
      }
    } catch (err) {
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

  const editDayMemo = async (day) => {
    const newMemo = window.prompt("새 메모를 입력하세요.", day.memo || "");
    if (newMemo === null) {
      return;
    }
    const inputValue = { memo: newMemo };
    try {
      const req = await axios.patch(`http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${day.day_no}`, inputValue, 
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", } }
      );

      if (req.status === 200) {
        await getDays();
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
        console.log(err.response);
        return;
      }
      if (status === 422) {
        alert("요청 데이터가 유효하지 않습니다.");
        return;
      }
      console.log(err.response);
    }
  }
  
  const selectPlaceView = async () => {
    try {
      const req = await axios.get(`http://210.101.236.165:8000/api/v1/places/${place_id}`,
        { headers: { Accept: "application/json" } }
      )

      if (req.status === 200) {
        setPlaceView(req.data.data);
      }
    } catch (err) {
      const status = err.response?.status;

      if (status === 422) {
        alert("입력값이 유효하지 않습니다.");
        return;
      }
    }
  };

  const addSchedule = async () => {
    
    const inputValue = {
      place_id: place_id,
      seq_no: scheNo,
      visit_time: null,
      memo: scheMemo || null,
    };

    try {
      const req = await axios.post(
        `http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${selectedDayNo}/items`, inputValue,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", } }
      );

      if (req.status === 201) {
        const newItem = {
          ...req.data.data,
          place_name: placeView?.name || "",
        };
        setScheduleItems((prev) => [...prev, newItem]);
        setScheNo(1);
        setScheTime("");
        setScheMemo("");
      }
    } catch (err) {
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

  const getSchedule = async (targetDayNo) => {
    try {
      const req = await axios.get(
        `http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${targetDayNo}/items`,
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

  const delSchedule = async (targetDayNo, scheduleItemId) => {
    try {
      const req = await axios.delete(
        `http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${targetDayNo}/items/${scheduleItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req.status === 204) {
        console.log("일정 스케줄 삭제 성공");
        await getSchedule(targetDayNo);
      }
    } catch (err) {
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
      console.log(err.response);
    }
  };

  const editSchedule = async (dayNo, item) => {
    const newMemo = window.prompt("새 스케줄 메모를 입력하세요.", item.memo || "");
    if (newMemo === null) {
      return;
    }

    const inputValue = { memo: newMemo };

    try {
      const req = await axios.patch(`http://210.101.236.165:8000/api/v1/trips/${trip_id}/days/${dayNo}/items/${item.schedule_item_id}`, inputValue,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", }, }
      );

      if (req.status === 200) {
        console.log("스케줄 메모 수정 성공");
        await getSchedule(dayNo);  
      }
    } catch (err) {
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

  return (
    <PageLayout
      title="여행 스케줄 짜기"
      actionLabel="마이페이지로"
      onAction={() => navigate("/mypage")}
    >
      <Grid container spacing={2} sx={{ height: "calc(100vh - 120px)" }}>
        {/* 왼쪽: 지도 영역 */}
        <Grid item xs={12} md={9} sx={{ height: { height: "100%" } }}>
          <Paper
            elevation={3}
            sx={{
              height: "100%",
              minHeight: 550,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box sx={{ height: "100%" }}>
              <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
                <GoogleMap setPlace_Id={setPlace_Id} />
              </Wrapper>
            </Box>
          </Paper>
        </Grid>

        {/* 오른쪽: 스케줄 영역 */}
        <Grid item xs={12} md={3} sx={{ height: "100%" }}>
          <Stack spacing={2} sx={{ height: "100%" }}>
            {/* 제목 */}
            <Box>
              <Typography variant="h5" gutterBottom>
                일자별 스케줄
              </Typography>
            </Box>

            {/* Day 리스트 */}
            <Paper
              elevation={2}
              sx={{
                flex: 1,
                p: 2,
                borderRadius: 2,
                overflowY: "auto",
              }}
            >
              <Stack spacing={2}>
                {days.map((day) => (
                  <Box
                    key={day.trip_day_id}
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      p: 1.5,
                      bgcolor:
                        selectedDayNo === day.day_no ? "grey.50" : "background.paper",
                    }}
                  >
                    {/* Day 헤더 */}
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={`Day ${day.day_no}`}
                          color="primary"
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          메모: {day.memo || "메모 없음"}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => editDayMemo(day)}
                        >
                          메모 수정
                        </Button>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => delDay(day.day_no)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* 일정 리스트 */}
                    {selectedDayNo === day.day_no && (
                      <Box mt={1.5}>
                        <Divider sx={{ mb: 1 }} />
                        <Stack spacing={1}>
                          {scheduleItems.map((item) => (
                            <Box
                              key={item.schedule_item_id}
                              sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: "grey.100",
                              }}
                            >
                              <Box sx={{ flex: 1, mr: 1 }}>
                                <Typography variant="body2">
                                  <strong>{item.seq_no}.</strong>{" "}
                                  {item.place_name && `[${item.place_name}] `}
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

                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    editSchedule(day.day_no, item)
                                  }
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() =>
                                    delSchedule(day.day_no, item.schedule_item_id)
                                  }
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* 일정 추가 버튼 */}
                    <Box mt={1.5}>
                      <Button
                        size="small"
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedDayNo(day.day_no);
                          setDayNo(day.day_no);
                          getSchedule(day.day_no);
                          selectPlaceView();
                        }}
                      >
                        일정 추가
                      </Button>
                    </Box>
                  </Box>
                ))}

                {days.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    아직 등록된 Day가 없습니다. 아래에서 일차를 먼저 추가해 주세요.
                  </Typography>
                )}
              </Stack>
            </Paper>

            {/* 선택된 장소에 일정 추가 패널 */}
            {placeView && selectedDayNo && (
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Day {selectedDayNo} 에 추가할 일정
                </Typography>
                <Typography variant="body2">
                  <strong>장소 이름:</strong> {placeView.name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>장소 주소:</strong> {placeView.address}
                </Typography>

                <Stack spacing={1.5} mt={1.5}>
                  <TextField
                    label="순서 (번호)"
                    type="number"
                    size="small"
                    fullWidth
                    value={scheNo}
                    onChange={(e) => setScheNo(e.target.value)}
                  />
                  <TextField
                    label="방문 시간"
                    type="time"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={scheTime || ""}
                    onChange={(e) => setScheTime(e.target.value)}
                  />
                  <TextField
                    label="스케줄 메모"
                    size="small"
                    fullWidth
                    value={scheMemo || ""}
                    onChange={(e) => setScheMemo(e.target.value)}
                    placeholder="스케줄 메모를 입력하세요."
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={addSchedule}
                  >
                    일정 추가
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Day 추가 영역 */}
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Day 추가
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  label="일차 (숫자)"
                  type="number"
                  size="small"
                  value={dayNo}
                  onChange={(e) => setDayNo(e.target.value)}
                  sx={{ width: "35%" }}
                />
                <TextField
                  label="메모"
                  size="small"
                  value={dayMemo}
                  onChange={(e) => setDayMemo(e.target.value)}
                  placeholder="메모를 입력하세요."
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addDay}
                >
                  추가
                </Button>
              </Stack>
            </Paper>


          </Stack>
        </Grid>
      </Grid>
    </PageLayout>
  );
}


export default TripDay;
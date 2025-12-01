import { useState, useRef, useEffect } from "react";
import { Box,Typography } from "@mui/material"; 
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
    <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
      <div style={{ width: "70%" }}>
        <div
          ref={mapRef}
          id="map"
          style={{ width: "100%", height: "600px" }}
        />
      </div>
    </div>
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
            <Box sx={{ p: 2 }}>
                <Typography variant="h4" gutterBottom>
                제목: {trip?.title}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                지역: {region_name}
                </Typography>
                <Typography sx={{ mb: 1 }}>
                여행 날짜: {trip?.start_date} ~ {trip?.end_date}
                </Typography>
                <Typography sx={{ whiteSpace: "pre-line" }}>
                {trip?.memo}
                </Typography>
            </Box>
            
            <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
                <GoogleMap lat={lat} lng={lng} />
            </Wrapper>
            
            <ul>
            {days.map((day) => {
                return (
                <li key={day.trip_day_id}>
                    <strong>Day {day.day_no}</strong>
                    <button
                    onClick={() => {
                        setSelectedDayNo(day.day_no);
                        getSchedule(day.day_no);
                    }}
                    >
                    일정 보기
                    </button>

                    {selectedDayNo === day.day_no && (
                    <ul>
                        {scheduleItems.map((item) => (
                        <li key={item.schedule_item_id}>
                            {item.seq_no}.{" "}
                            <span
                            onClick={() => checkLocationUnit(item.place_id)}
                            style={{ cursor: "pointer", textDecoration: "underline" }}
                            >
                            {item.place_name && `[${item.place_name}] `}
                            </span>
                            {item.memo ?? "(메모 없음)"}
                            {item.visit_time && ` (${item.visit_time})`}
                        </li>
                        ))}
                    </ul>
                    )}

                    <div>메모: {day.memo}</div>
                </li>
                );
            })}
            </ul>

        </PageLayout>

        
    );
}

export default View;
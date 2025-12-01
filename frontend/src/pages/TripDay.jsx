import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Wrapper } from "@googlemaps/react-wrapper";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GoogleMap({ setPlace_Id }) {
  const token = localStorage.getItem("access_token");
  const mapRef = useRef(null);
  const mapPoint = useRef(null);
  const [inputPlace, setInputPlace] = useState("");
  const [lat, setLat] = useState(35.896);
  const [lng, setLng] = useState(128.6219);

  const [suggestions, setSuggestions] = useState([]);
  
  const autoSearching = async () => {
    try {
      let sessionToken = crypto.randomUUID();
      
      const reqForAuto = await axios.get("http://localhost:8080/api/v1/places/autocomplete", 
        { params: { input: inputPlace, session_token: sessionToken } }
      );
      
      console.log("자동 완성 성공", reqForAuto);
      
    } catch(err) {
      console.log(err);
    }
  };

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
      const req = await axios.get( "http://localhost:8080/api/v1/places/external-search", 
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

          const reqForSave = await axios.post("http://localhost:8080/api/v1/places/from-external", inputValue,
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
      />
      <button onClick={searchPlace}>검색</button>

      <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
        <div style={{ width: "70%" }}>
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

  const addDay = async () => {

    const inputValue = { day_no: dayNo, memo: dayMemo ?? "" };
    try{
      const req = await axios.post(`http://localhost:8080/api/v1/trips/${trip_id}/days`, inputValue ,
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
        `http://localhost:8080/api/v1/trips/${trip_id}/days/${targetDayNo}`,
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
      const req = await axios.patch(`http://localhost:8080/api/v1/trips/${trip_id}/days/${day.day_no}`, inputValue, 
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
      const req = await axios.get(`http://localhost:8080/api/v1/places/${place_id}`,
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
        `http://localhost:8080/api/v1/trips/${trip_id}/days/${selectedDayNo}/items`, inputValue,
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

  const delSchedule = async (targetDayNo, scheduleItemId) => {
    try {
      const req = await axios.delete(
        `http://localhost:8080/api/v1/trips/${trip_id}/days/${targetDayNo}/items/${scheduleItemId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req.status === 204) {
        console.log("일정 스케줄 삭제 성공");

        // 화면에서 바로 지워주기
        setScheduleItems((prev) =>
          prev.filter((item) => item.schedule_item_id !== scheduleItemId)
        );
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
      const req = await axios.patch(`http://localhost:8080/api/v1/trips/${trip_id}/days/${dayNo}/items/${item.schedule_item_id}`, inputValue,
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
    <>
      <h1>여행 스케줄 짜기</h1>
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
        <GoogleMap setPlace_Id={setPlace_Id} />
      </Wrapper>
      <div>
        <h2>일자별 스케줄</h2>
        <ul>
          {days.map((day) => {
            return (
              <li key={day.trip_day_id}>
                <button onClick={() => delDay(day.day_no)}>x</button>
                <strong>Day {day.day_no}</strong>
                <button
                  onClick={() => {
                    setSelectedDayNo(day.day_no);
                    setDayNo(day.day_no);
                    getSchedule(day.day_no);
                    selectPlaceView();
                  }}
                >
                  일정 추가
                </button>

                {selectedDayNo === day.day_no && (
                  <ul>
                    {scheduleItems.map((item) => (
                      <li key={item.schedule_item_id}>
                        <button
                          onClick={() => delSchedule(day.day_no, item.schedule_item_id)}
                          >x</button>
                        {item.seq_no}.{" "}
                        {item.place_name && `[${item.place_name}] `}
                        {item.memo ?? "(메모 없음)"}
                        {item.visit_time && ` (${item.visit_time})`}
                        <button onClick={() => editSchedule(day.day_no, item)}
                          >수정</button>
                      </li>
                    ))}
                  </ul>
                )}

                <div>메모: {day.memo}</div>
                <button onClick={() => editDayMemo(day)}>메모 수정</button>
              </li>
            );
          })}
        </ul>

        <div style={{ flex: 1 }}>
          {placeView && selectedDayNo && (
            <div
              style={{
                backgroundColor: "#eee",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <p>Day {selectedDayNo} 에 추가할 일정</p>
              <p>장소 이름: {placeView.name}</p>
              <p>장소 주소: {placeView.address}</p>

              <input
                type="number"
                value={scheNo}
                onChange={(e) => setScheNo(e.target.value)}
              />
              <input
                type="time"
                value={scheTime || ""}
                onChange={(e) => setScheTime(e.target.value)}
              />
              <input
                value={scheMemo || ""}
                onChange={(e) => setScheMemo(e.target.value)}
                placeholder="스케줄 메모 입력"
              />
              <button onClick={addSchedule}>일정 추가요</button>
            </div>
          )}
        </div>

        <input
          type="number"
          value={dayNo}
          onChange={(e) => setDayNo(e.target.value)}
          placeholder="추가할 일차를 입력하세요."
        />
        <input
          value={dayMemo}
          onChange={(e) => setDayMemo(e.target.value)}
          placeholder="메모를 입력하세요."
        />
        <button onClick={addDay}>+</button>
      </div>

      <button onClick={() => navigate('/mypage')}>일정 짜기 완료</button>
    </>
  );
}

export default TripDay;
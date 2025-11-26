import { use, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Wrapper } from "@googlemaps/react-wrapper";
import axios from "axios";

function GoogleMap() {
  const token = localStorage.getItem("access_token");
  const mapRef = useRef(null);
  const mapPoint = useRef(null);
  const [inputPlace, setInputPlace] = useState("");
  const [lat, setLat] = useState(35.896);
  const [lng, setLng] = useState(128.6219);
  const [place_id, setPlace_Id] = useState();
  const [selectPlace, setSelectPlace] = useState();
  const [memo, setMemo] = useState(""); 

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
        // console.log("외부 지도 기반 장소 검색 결과값",point);
        
        try {
          const inputValue = {
            external_ref: point.place_id,
            name: point.name,
            category: point.category,
            address: point.address,
            lat: point.lat,
            lng: point.lng
          }

          const req2 = await axios.post("http://localhost:8080/api/v1/places/from-external", inputValue,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
          );

          const res = req2.data;
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

  const selectedPlace = async () => {
    try {
      const req = await axios.get(`http://localhost:8080/api/v1/places/${place_id}`,
        { headers: { Accept: "application/json" } }
      )
      
      if (req.status === 200) {
        setSelectPlace(req.data.data);
      }
    } catch (err) {
      const status = err.response?.status;

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
      <button onClick={selectedPlace}> 장소 보기</button>

      <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
        <div style={{ width: "70%" }}>
          <div
            ref={mapRef}
            id="map"
            style={{ width: "100%", height: "600px" }}
          />
        </div>

        <div style={{ flex: 1 }}>
          {selectPlace && (
            <div
              style={{
                backgroundColor: "#eee",
                padding: "16px",
                borderRadius: "8px",
              }}
            >
              <p>장소 이름: {selectPlace.name}</p>
              <p>장소 주소: {selectPlace.address}</p>
              <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요."
              />
              <button>일자에 추가</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function TripDay() {
  const location = useLocation();
  const trip_id = location.state?.trip_id;
  const token = localStorage.getItem("access_token");
  const [days, setDays] = useState([]);
  const [dayNo, setDayNo] = useState(1);
  const day_no = dayNo;
  const [memo, setMemo] = useState(""); 

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

    const inputValue = { day_no: dayNo, memo: memo ?? "" };
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

  const delDay = async () => {

    try {
      const req = await axios.delete(`http://localhost:8080/api/v1/trips/${trip_id}/days/${day_no}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (req.status === 204 || null) {
        console.log("일차 삭제 완료");
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
        return;
      }
    }
  };

  return (
    <>
      <h1>여행 스케줄 짜기</h1>
      <Wrapper apiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
        <GoogleMap />
      </Wrapper>
      <div>
        <h2>일자별 스케줄</h2>
        <ul>
          {days.map((day) => {
            return(
                <li key={day.trip_day_id}>
                  <button onClick={delDay}>x</button>
                  <strong>Day {day.day_no}</strong>
                  {}
                  <div>메모: {day.memo}</div>
                  <button>메모 수정</button>
                </li>
                )
              }
            )
          }
        </ul>
          <input
            type="number"
            value={dayNo}
            onChange={(e) => setDayNo(e.target.value)}
            placeholder="추가할 일차를 입력하세요."
          />
          <input
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요."
          />
          <button onClick={addDay}>+</button>
      </div>
    </>
  );
}

export default TripDay;
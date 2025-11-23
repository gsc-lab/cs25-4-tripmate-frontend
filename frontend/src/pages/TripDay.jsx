import { useEffect, useRef } from "react";

function TripDay() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google || !window.google.maps) {
      console.error("Google Maps JS 로드 안 됨");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const userLocation = { lat: latitude, lng: longitude };

        new window.google.maps.Map(mapRef.current, {
          center: userLocation,
          zoom: 14,
        });
      },
      (err) => {
        console.error("위치 가져오기 실패:", err);
      }
    );
  }, []);

  return (
    <>
      <h1>여행 스케줄 짜기</h1>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "400px",
        }}
      />
    </>
  );
}

export default TripDay;
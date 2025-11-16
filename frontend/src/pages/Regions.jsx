import React, { useState } from "react";
import { Box, Button, Typography, Modal, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";

function Regions() {
  const navigate = useNavigate();

  async function Load_Regions() {
    try {
      const req = await axios.get(
        "http://localhost:8080/api/v1/regions/search",
        { headers: { Accept: application/json } }
      );


    } catch (err) {
      const status = err.response
      

      console.error(err);
    }
  }

  return (
    <PageLayout
      title="여행지역 선택"
      actionLabel="일자 선택"
      onAction={() => navigate("/tripday")}
    >
      <Typography
        sx={{
          fontSize: 26,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        여행지 검색
      </Typography>

    </PageLayout>
  );
}

export default Regions;
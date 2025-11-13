import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import logo from "../assets/TripMate_Logo.png"; 

function AuthLayout({ title, onSubmit, children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to bottom, #4cc2ff, #e8f7ff)",
        position: "relative",
        fontFamily: `"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif`,
      }}
    >
      {/* 좌측 상단 로고 */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 24,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <img
          src={logo}
          alt="TripMate Logo"
          style={{ height: 40 }}
        />
      </Box>

      {/* 가운데 카드 */}
      <Paper
        component="form"
        onSubmit={onSubmit}
        elevation={8}
        sx={{
          borderRadius: "40px",
          px: 8,
          py: 7,
          minWidth: 360,
          maxWidth: 420,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxShadow: "0 18px 25px rgba(0,0,0,0.15)",
          bgcolor: "#ffffff",
        }}
      >
        {/* 제목 */}
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800, mb: 5 }}
        >
          {title}
        </Typography>

        {children}
      </Paper>
    </Box>
  );
}

export default AuthLayout;
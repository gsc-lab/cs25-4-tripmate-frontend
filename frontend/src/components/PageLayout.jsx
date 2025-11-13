import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";

function PageLayout({
  title,              
  children,           
  actionLabel,        
  onAction,           
}) {
  return (
    <Box
    sx={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, #4cc2ff, #e8f7ff)",
        fontFamily: `"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif`,
        p: 4,
        boxSizing: "border-box",
        position: "relative", 
    }}
    >
      {/* 상단 제목 */}
      <Typography
        variant="h3"
        color="black"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        {title}
      </Typography>

      {/* 가운데 큰 박스 (내용 영역) */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          sx={{
            width: "100%",
            maxWidth: "1000px",
            minHeight: "400px",
            bgcolor: "#e0e0e0",
            p: 6,
            boxSizing: "border-box",
          }}
        >
          {children}
        </Paper>
      </Box>

      {/* 오른쪽 아래 버튼 (옵션) */}
      {actionLabel && onAction && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onAction}
            sx={{
              bgcolor: "#d0d0d0",
              color: "#000",
              "&:hover": {
                bgcolor: "#bcbcbc",
              },
            }}
          >
            {actionLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default PageLayout;
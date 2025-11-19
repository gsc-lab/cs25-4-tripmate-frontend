import { useState } from "react";
import { styled } from '@mui/material/styles';
import { TextField, Box, Typography, Paper, Grid } from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";


function Trip() {
    const navigate = useNavigate();
    const location = useLocation();
    const { regionId, regionName } = location.state || {}

    const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: (theme.vars ?? theme).palette.text.secondary,
    ...theme.applyStyles('dark', {
        backgroundColor: '#1A2027',
    }),
    }));

  return (
    <PageLayout
      title="여행지역 선택"
      actionLabel="일자 선택"
    //   onAction={handleSendRegion}
    >
    
    <Grid container spacing={2}>

    <Grid size={8}>
        <Item>
            <TextField
            label="여행글 제목"
            fullWidth
            />
        </Item>
    </Grid>

    <Grid size={4}>
        <Item>
            <Typography>여행 지역: <br />{regionName}</Typography>
        </Item>
    </Grid>

    <Grid size={6}>
        <Item>시작날짜
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar />
            </LocalizationProvider>
        </Item>
    </Grid>

    <Grid size={6}>
        <Item>종료날짜
            <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar />
            </LocalizationProvider>
        </Item>
    </Grid>

    </Grid>
    
    </PageLayout>
  );
}

export default Trip;
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { styled } from '@mui/material/styles';
import { TextField, Typography, Paper, Grid } from "@mui/material";
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs from 'dayjs';

import axios from "axios";
import PageLayout from "../components/PageLayout";

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

function Trip() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("access_token");
    const { regionId, regionName } = location.state || {}
    
    const [tripTitle, setTripTitle] = useState("");
    const [startDate, setStartDate] = useState(dayjs());
    const [endDate, setEndDate] = useState(dayjs());

    if (!token) {
        alert("토큰이 존재하지 않습니다.");
        return;
    }

    async function handleTrip() {
        
        const inputValue = { 
            title: tripTitle,
            region_id: regionId,
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD") }

        try {
            const req = await axios.post("http://210.101.236.165:8000/api/v1/trips", inputValue,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );

            if (req.status === 201){
                navigate("/tripday", {
                    state: { trip_id: req.data?.data?.trip_id }
                });
            }

        } catch(err) {
            const status = err.response?.status

            if (status === 401) {
                alert("인증이 필요합니다.");
                return;
            }

            if (status === 422) {
                alert("입력값이 유효하지 않습니다.");
                return;
            }
        }
    }
        

    return (
    <PageLayout
    title="여행일자 선택"
    actionLabel="스케줄 선택"
    onAction={handleTrip}
    >
        
    <Grid container spacing={2}>
            
        <Grid size={8}>
            <Item>
                <TextField
                    label="여행글 제목 (100자 이하)"
                    value={tripTitle}
                    onChange={(e) => setTripTitle(e.target.value)}
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
            <Item>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateCalendar', 'DateCalendar']}>
                        <DemoItem label="시작 날짜">
                            <DateCalendar value={startDate} onChange={(newValue) => setStartDate(newValue)} />
                            </DemoItem>
                    </DemoContainer>
                </LocalizationProvider>
            </Item>
        </Grid>

        <Grid size={6}>
            <Item>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateCalendar', 'DateCalendar']}>
                        <DemoItem label="종료 날짜">
                            <DateCalendar value={endDate} onChange={(newValue) => setEndDate(newValue)} />
                            </DemoItem>
                    </DemoContainer>
                </LocalizationProvider>
            </Item>
        </Grid>

    </Grid>

    </PageLayout>
    );
}


export default Trip;
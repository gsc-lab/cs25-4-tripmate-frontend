import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { styled } from '@mui/material/styles';
import { TextField, Typography, Paper, Grid, CircularProgress } from "@mui/material";
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import Autocomplete from "@mui/material/Autocomplete";
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

function EditTrip() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("access_token");
    const { 
        tripId,
        title: basicTitle,
        regionId,
        regionName,
        startDate: basicStartDate,
        endDate: basicEndDate,
        } = location.state || {};
    
    const [tripTitle, setTripTitle] = useState(basicTitle);
    const [startDate, setStartDate] = useState(basicStartDate ? dayjs(basicStartDate) : dayjs());
    const [endDate, setEndDate] = useState(basicEndDate ? dayjs(basicEndDate) : dayjs());
    
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    const [chooseRegion, setChooseRegion] = useState(
    regionId && regionName
        ? { region_id: regionId, name: regionName }
        : null
    );

    const [country] = useState("KR");
    const [query] = useState(null);

    const handleOpen = async () => {
        setOpen(true);
        setLoading(true);

        const input_value = { country, query };

        try {
            const res = await axios.get("http://210.101.236.165:8000/api/v1/regions", {
                params: input_value,
                headers: { Accept: "application/json" },
            });

            if (res.status === 200) {
            setOptions(res.data.data ?? []);
            }
        } catch (err) {
            const status = err.response?.status;

            if (status === 422) {
            alert("입력값이 유효하지 않습니다. (422)");
            return;
            }

            if (status === 429) {
            alert("요청 한도를 초과했습니다. (429)");
            return;
            }

            console.error(err);
        } finally {
            setLoading(false);
        }
        };
        
        const handleClose = () => {
        setOpen(false);
        setOptions([]);
        };

    if (!token) {
        alert("토큰이 존재하지 않습니다.");
        return;
    }

    async function reEditTrip() {

        const inputValue = { 
            title: tripTitle,
            region_id: chooseRegion?.region_id ?? regionId,
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD") }

        try {
            const req = await axios.patch(`http://210.101.236.165:8000/api/v1/trips/${tripId}`, inputValue,
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            
            if (req.data?.success) {
            alert("여행 정보가 수정되었습니다.");
            navigate("/mypage");    
            }

        } catch(err) {
            const status = err.response?.status
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
            console.error(err);
        }
    }
        

    return (
    <PageLayout
        title="여행 수정"
        actionLabel="수정 완료"
        onAction={reEditTrip}
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
                <Autocomplete
                sx={{ width: "100%" }}
                open={open}
                onOpen={handleOpen}
                onClose={handleClose}
                options={options}
                loading={loading}
                value={chooseRegion}
                onChange={(_, newValue) => {
                    setChooseRegion(newValue);
                }}
                isOptionEqualToValue={(option, value) =>
                    option.region_id === value.region_id
                }
                getOptionLabel={(option) => option.name ?? ""}
                renderInput={(params) => (
                    <TextField
                    {...params}
                    label="여행 지역"
                    slotProps={{
                        input: {
                        ...params.InputProps,
                        endAdornment: (
                            <>
                            {loading ? (
                                <CircularProgress color="inherit" size={20} />
                            ) : null}
                            {params.InputProps.endAdornment}
                            </>
                        ),
                        },
                    }}
                    />
                )}
                />
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


export default EditTrip;
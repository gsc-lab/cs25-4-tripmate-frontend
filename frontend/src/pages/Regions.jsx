import { useState } from "react";
import { TextField, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PageLayout from "../components/PageLayout";

function Regions() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [country] = useState("KR");
  const [query] = useState(null);

  const [chooseRegion, setChooseRegion] = useState(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);

    const input_value = { country, query };

    try {
      const res = await axios.get("http://localhost:8080/api/v1/regions", 
        { params: input_value, headers: { Accept: "application/json" } }
      );

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

  const handleSendRegion = () => {
    if (!chooseRegion){
      alert("지역을 선택해 주세요.");
      return;
    }
    
    navigate("/trip", {
      state: {
        regionId: ChooseRegion.region_id,
        regionName: ChooseRegion.name
      },
    });
  };


  return (
    <PageLayout
      title="여행지역 선택"
      actionLabel="일자 선택"
      onAction={handleSendRegion}
    >
      <Autocomplete
        sx={{ width: 900 }}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        options={options}
        loading={loading}
        value={chooseRegion}
        onChange={(event, newValue) => { setChooseRegion(newValue); }}
        isOptionEqualToValue={(option, value) => option.region_id === value.region_id}
        getOptionLabel={(option) => option.name ?? ""}
        renderInput={(params) => (
          <TextField
            {...params}
            label="여행지 목록"
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
    </PageLayout>
  );
}

export default Regions;
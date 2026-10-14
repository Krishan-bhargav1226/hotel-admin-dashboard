import { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import MainContainer from "../../components/ui/container/MainContainer";
import PageTitle from "../../components/ui/container/PageTitle";
import { APP_TEXT } from "../../utils/text/DefaultAppText.utils";
import HotelInfo from "./hotel-info/HotelInfo";
import RoomType from "./room-type/RoomType";
import RatePlan from "./rate-plan/RatePlan";
import Backup from "./backup/Backup";

const Setting = () => {
  const [tab, setTab] = useState(0);
  const { HOTEL_INFO, ROOM_TYPES, RATE_PLANS, BACKUP } = APP_TEXT.settings;

  return (
    <MainContainer>
      <PageTitle title={APP_TEXT.titles.SETTINGS} />
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} variant="scrollable" scrollButtons="auto" sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        <Tab label={RATE_PLANS} />
        <Tab label={ROOM_TYPES} />
        <Tab label={HOTEL_INFO} />
        <Tab label={BACKUP} />
      </Tabs>
      <Box>
        {tab === 0 && <RatePlan />}
        {tab === 1 && <RoomType />}
        {tab === 2 && <HotelInfo />}
        {tab === 3 && <Backup />}
      </Box>
    </MainContainer>
  );
};

export default Setting;

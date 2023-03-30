import React from "react";

const funtion = () => {
  const convertToPacificTime = (isTime, timezone) => {
    const isDateTime = new Date(isTime);
    var pacificDateTime;
    //correspond to UTC+5:30 Used in INDIA/SRI lANKA AND OTHER NEARBY REGION
    if (timeZone == "Asia/Kolkata") {
      pacificDateTime = new Date(
        isDateTime.getTime() - (12 * 60 * 60 * 1000 + 30 * 60 * 1000)
      );
    }
    //correspond to UTC time
    else if (timeZone == "Africa/Sao_Tome") {
      pacificDateTime = new Date(isDateTime.getTime() - 7 * 60 * 60 * 1000);
    } else {
      pacificDateTime = isDateTime;
    }
    return pacificDateTime;
  };
  return <div></div>;
};

export default funtion;

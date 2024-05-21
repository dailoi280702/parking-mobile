import dayjs from "dayjs";
import AlertHelper from "./AlertHelper";

const DateTimeHelper = {
  formatDate: (date: Date) => dayjs(date).format("DD/MM/YYYY"),
  formatTime: (time: Date) => dayjs(time).format("HH:mm"),
  getRoundUpDate: (minutes: number, d = new Date()) => {
    const ms = 1000 * 60 * minutes;
    const roundedDate = new Date(Math.ceil(d.getTime() / ms) * ms);
    return roundedDate;
  },
  convertToHour: (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hour = minutes / 60;
    return hour > 1 ? `${hour} hours` : `${hour} hour`;
  },
};

export { DateTimeHelper, AlertHelper, UploadHelper };

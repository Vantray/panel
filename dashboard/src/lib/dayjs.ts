import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";

import "dayjs/locale/ru";
import "dayjs/locale/fa";
import "dayjs/locale/zh-cn";

dayjs.extend(utc);
dayjs.extend(duration);

export default dayjs;
export type { ManipulateType } from "dayjs";

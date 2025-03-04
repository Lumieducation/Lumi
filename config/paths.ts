import path from "path";
import { app } from "electron";

export interface LumiPaths {
  library_path: string;
  content_path: string;
  temp_path: string;
}

const content_path = path.join(app.getPath("userData"), "content");
const library_path = path.join(app.getPath("userData"), "libraries");
const temp_path = path.join(app.getPath("userData"), "tmp");

export default {
  library_path,
  content_path,
  temp_path,
} as LumiPaths;

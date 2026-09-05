import { createPlaywrightConfig } from "./playwright.config";

export default createPlaywrightConfig("npm run build && npm run start -- --hostname 127.0.0.1");

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CLEAN_BASE = API_BASE.replace(/\/$/, "");

export const USER_API_END_POINT = `${CLEAN_BASE}/api/v1/user`;
export const Company_API_END_POINT = `${CLEAN_BASE}/api/v1/company`;
export const JOB_API_END_POINT = `${CLEAN_BASE}/api/v1/job`;
export const Application_API_END_POINT = `${CLEAN_BASE}/api/v1/application`;
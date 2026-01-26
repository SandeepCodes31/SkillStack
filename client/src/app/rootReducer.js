import { combineReducers } from "@reduxjs/toolkit";
import { authApi } from "../features/api/authApi";
import authReducer from "../features/authSlice";
import { courseApi } from "@/features/api/courseApi";
import { purchaseApi } from "@/features/api/purchaseApi";
import { courseProgressApi } from "@/features/api/courseProgressApi";

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [courseApi.reducerPath]: courseApi.reducer,
  [purchaseApi.reducerPath]:purchaseApi.reducer,
  [courseProgressApi.reducerPath]:courseProgressApi.reducer,
  auth: authReducer,
});
export default rootReducer;




import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice.js";
import rootReducer from "./rootReducer.js";
import { authApi } from "@/features/api/authApi.js";
import { courseApi } from "@/features/api/courseApi.js";
import { purchaseApi } from "@/features/api/purchaseApi.js";
import { courseProgressApi } from "@/features/api/courseProgressApi.js";

export const appStore = configureStore({
    reducer: rootReducer,
    middleware:(defaultMiddleware) =>
    defaultMiddleware().concat(authApi.middleware, courseApi.middleware, purchaseApi.middleware, courseProgressApi.middleware)

});

const initializeApp = async () => {
    await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}));
}

initializeApp();



// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../features/authSlice.js";
// import { authApi } from "@/features/api/authApi.js";
// import { courseApi } from "@/features/api/courseApi.js";

// export const appStore = configureStore({
//   reducer: {
//     auth: authReducer,
//     [authApi.reducerPath]: authApi.reducer,
//     [courseApi.reducerPath]: courseApi.reducer,
//   },
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware().concat(
//       authApi.middleware,
//       courseApi.middleware
//     ),
// });


// const initializeApp = async () => {
//     await appStore.dispatch(authApi.endpoints.loadUser.initiate({},{forceRefetch:true}));
// }

// initializeApp();
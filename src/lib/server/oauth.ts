import { Google } from "arctic";
import * as dotenv from 'dotenv';
dotenv.config();

export const google = new Google(
    process.env.VITE_GOOGLE_CLIENT_ID!, 
    process.env.VITE_GOOGLE_CLIENT_SECRET!, 
    `${process.env.VITE_APP_URL!}/callback`
);

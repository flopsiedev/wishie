import { Google } from "arctic";
import * as dotenv from 'dotenv';
dotenv.config();

export const google = new Google(
    process.env.GOOGLE_CLIENT_ID!, 
    process.env.GOOGLE_CLIENT_SECRET!, 
    `${process.env.PUBLIC_APP_URL!}/callback`
);

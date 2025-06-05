import { MailtrapClient } from "mailtrap";
import "dotenv/config";



const TOKEN = process.env.MAILTRAP_API_KEY;;

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Marwan Code",
};



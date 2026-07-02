import nodemailer from "nodemailer";
import { MAIL_PASS, MAIL_USER } from "../../../config/config.service.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 587,
  secure: false,
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});
async function sendMail({ to, subject, text, html, attachments }) {
  await transporter.sendMail({
    from: `Yassen <${MAIL_USER}>`, // sender address
    to,
    subject,
    text,
    html,
  });
}
export default sendMail;

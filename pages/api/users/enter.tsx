// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import withHandler, { ResponseType } from "@libs/server/withHandler";
import type { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import twilio from "twilio";

const nodemailer = require("nodemailer");

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { phone, email } = req.body;
  const user = phone ? { phone } : email ? { email } : null;
  if (!user) return res.status(400).json({ ok: false });
  const payload = Math.floor(100000 + Math.random() * 900000) + "";
  const transporter = nodemailer.createTransport({
    service: "naver",
    host: "smtp.naver.com",
    port: 587,
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASS,
    },
  });

  const token = await client.token.create({
    data: {
      payload,
      user: {
        connectOrCreate: {
          create: {
            name: "Anonymous",
            ...user,
          },
          where: {
            ...user,
          },
        },
      },
    },
  });

  if (phone) {
    await twilioClient.messages.create({
      messagingServiceSid: process.env.TWILIO_MESSAGE,
      to: process.env.MY_PHONE!,
      body: `typing on your screen! your token is ${payload}`,
    });
  } else if (email) {
    await transporter.sendMail({
      from: process.env.MY_EMAIL,
      to: email,
      subject: "Typing on your screen!",
      html: `
        <p>Your token is <h2 style="color: #ff7300">${payload}</h2></p>
        <br />
        <h3>please, typing on your secreen.</h3>
      `,
    });
  }

  return res.status(200).json({
    ok: true,
  });
}

export default withHandler({ methods: ["POST"], handler, isPrivate: false });

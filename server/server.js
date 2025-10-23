import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/sendmail", async (req, res) => {
  const { name, email, msg } = req.body;

  if (!name || !email || !msg) {
    return res.status(400).json({ error: "Tüm alanlar zorunlu." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const info = await transporter.sendMail({
      from: `"Portföy Formu" <${process.env.SMTP_USER}>`,
      to: "mail@yavuzselimyigit.com",
      subject: `Yeni Mesaj - ${name}`,
      text: `Ad Soyad: ${name}\nE-posta: ${email}\n\nMesaj:\n${msg}`,
      html: `
        <h3>Yeni İletişim Mesajı</h3>
        <p><b>Ad Soyad:</b> ${name}</p>
        <p><b>E-posta:</b> ${email}</p>
        <p><b>Mesaj:</b></p>
        <p>${msg}</p>
      `
    });

    console.log("Mail gönderildi:", info.messageId);
    res.json({ success: true });
  } catch (err) {
    console.error("Mail hatası:", err);
    res.status(500).json({ error: "Mail gönderimi başarısız." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server ${PORT} portunda çalışıyor`));

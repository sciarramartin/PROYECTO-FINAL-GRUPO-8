// utils/mailHelper.js
const nodemailer = require('nodemailer');

class MailHelper {

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }

    async enviarRecuperacion(mail, token) {
        const link = `http://localhost:5173/resetear-contrasena?token=${token}`;

        await this.transporter.sendMail({
            from: `"Campus Plataforma Académica" <${process.env.MAIL_USER}>`,
            to: mail,
            subject: 'Recuperación de contraseña',
            html: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Recuperar contraseña</h2>
                    <p>Recibimos una solicitud para restablecer tu contraseña.</p>
                    <p>Hacé click en el siguiente botón para continuar. El link expira en <strong>1 hora</strong>.</p>
                    <a href="${link}" style="
                        display: inline-block;
                        margin-top: 16px;
                        padding: 12px 24px;
                        background-color: #5b6af5;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                    ">Restablecer contraseña</a>
                    <p style="margin-top: 24px; color: #888; font-size: 13px;">
                        Si no solicitaste esto, podés ignorar este mail.
                    </p>
                </div>
            `
        });
    }
}

module.exports = { MailHelper };
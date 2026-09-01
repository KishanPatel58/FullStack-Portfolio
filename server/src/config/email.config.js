import nodemailer from 'nodemailer';

const transport = nodemailer.createTransport({
    port: process.env.SMTP_PORT,
    host: process.env.SMTP_HOST,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
})

const sendMail = async ({ email, html, text, subject }) => {
    try {
        await transport.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            text: text,
            subject: subject,
            html: html
        })
    } catch (error) {
        console.log(`Failed to Send Mail: ${error}`);
        throw new Error("Failed to Send Email...")
    }
}

export default sendMail;
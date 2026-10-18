const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.log(`[Dev Mail Mock] To: ${email} | Subject: ${title}`);
            console.log(`[Notice] MAIL_PASS is not set in backend/.env. Simulated email without sending via Gmail.`);
            return { messageId: 'dev-mock-id' };
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS.replace(/\s+/g, '') // remove spaces from app password if present
            }
        });

        const info = await transporter.sendMail({
            from: `"LiveCode" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body
        });

        console.log('Real email successfully sent via Gmail to:', email);
        return info;
    }
    catch (error) {
        console.error('Error while sending mail (mailSender):', error.message);
    }
}

module.exports = mailSender;
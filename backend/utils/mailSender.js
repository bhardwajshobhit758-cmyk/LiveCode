const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.log(`[Dev Mail Mock] To: ${email} | Subject: ${title}`);
            console.log(`[Dev Mail Mock Body Preview]: ${body.replace(/<[^>]+>/g, ' ').slice(0, 150)}...`);
            return { messageId: 'dev-mock-id' };
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: 'LearnX || by Uday Deshwal',
            to: email,
            subject: title,
            html: body
        });

        // console.log('Info of sent mail - ', info);
        return info;
    }
    catch (error) {
        console.log('Error while sending mail (mailSender) - ', email);
    }
}

module.exports = mailSender;
const nodemailer = require("nodemailer");

const mailSender = async(email, title, body) =>{
    try {
        // Create Transporter
        let transporter = nodemailer.createTransport({
            host:process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        // Send mail using transporter
        let info = await transporter.sendMail({
            from: 'StudyWave',
            to: `${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        console.log(info);
        return info;

    } catch (error) {
        console.log(error.message);
        return error.message
    }
}


module.exports = mailSender;
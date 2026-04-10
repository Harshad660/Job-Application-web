import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendApplicationEmail = async (userEmail, recruiterEmail, userName, jobTitle, companyName) => {
    try {
        // Email to Recruiter
        await transporter.sendMail({
            from: `"JobHunt Platform" <${process.env.EMAIL_USER}>`,
            to: recruiterEmail,
            subject: "New Application Received",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #333;">New Application for ${jobTitle}</h2>
                    <p>Hello,</p>
                    <p>You have received a new application from <strong>${userName}</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
                    <p>Check your dashboard to view the applicant's profile.</p>
                    <br>
                    <a href="http://localhost:5173/admin/jobs" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Applications</a>
                </div>
            `,
        });

        // Email to User
        await transporter.sendMail({
            from: `"JobHunt Platform" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Application Submitted Successfully",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #28a745;">Success!</h2>
                    <p>Dear ${userName},</p>
                    <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been submitted successfully.</p>
                    <p>The recruiter will review your application and update the status soon.</p>
                    <br>
                    <p>Best of luck!</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending application emails:", error);
    }
};

export const sendStatusEmail = async (userEmail, userName, jobTitle, status) => {
    try {
        const isSelected = status === "selected";
        const subject = isSelected ? "Congratulations! Application Update" : "Application Update";
        const message = isSelected 
            ? `We are pleased to inform you that you have been <strong>selected</strong> for the position of <strong>${jobTitle}</strong>.`
            : `We regret to inform you that your application for <strong>${jobTitle}</strong> was <strong>not selected</strong> at this time.`;

        await transporter.sendMail({
            from: `"JobHunt Platform" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: ${isSelected ? '#28a745' : '#dc3545'};">${isSelected ? 'Congratulations!' : 'Update regarding your application'}</h2>
                    <p>Dear ${userName},</p>
                    <p>${message}</p>
                    <p>Thank you for your interest in our platform.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending status email:", error);
    }
};

export const sendAdminEmail = async (userEmail, userName, adminAction, reason = "") => {
    try {
        await transporter.sendMail({
            from: `"JobHunt Platform Support" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: "Account Action Notification",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: #dc3545;">Account Notification</h2>
                    <p>Dear ${userName},</p>
                    <p>This is to inform you that an administrative action has been taken on your account: <strong>${adminAction}</strong>.</p>
                    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
                    <p>If you have any questions, please contact support.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending admin action email:", error);
    }
};

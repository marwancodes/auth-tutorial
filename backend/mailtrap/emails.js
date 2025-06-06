import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
import { mailtrapClient, sender } from './mailtrap.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try {
		const response = await mailtrapClient.send({
			from: sender,
			to: recipient,
			subject: "Verify your email",
			html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
			category: "Email Verification",
		});

		console.log("Email sent successfully", response);
	} catch (error) {
		console.error(`Error sending verification`, error);

		throw new Error(`Error sending verification email: ${error}`);
	}
};


export const sendWelcomeEmail = async (email, name) => {
    const recipients = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            template_uuid: "081125fc-ee97-4dd2-b903-ca2d5ef3c5cc",
            template_variables: {
                "company_info_name": "Marwan Auth Company",
                "name": name
            }
        });

        console.log("Welcome email sent successfully", response);

    } catch (err) {
        console.error(`Error sending welcome email`, err);
        throw new Error(`Error sending welcome email: ${err}`);
    };
};

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipients = [{email}];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            subject: "Password Reset Request",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset",
        });

        console.log("Password reset email sent successfully", response);

    } catch (err) {
        console.error(`Error sending password reset email`, err);
        throw new Error(`Error sending password reset email: ${err}`);
    };
};

export const sendResetSuccessEmail = async (email) => {
    const recipients = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            subject: "Password Reset Successfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset",
        });

        console.log("Password reset success email sent successfully", response);

    } catch (err) {
        console.error(`Error sending password reset success email`, err);
        throw new Error(`Error sending password reset success email: ${err}`);
    };
};
import sgMail from '@sendgrid/mail';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  console.log('🔧 SendGrid API Key:', process.env.SENDGRID_API_KEY ? 'Set' : 'Missing');
  console.log('🔧 From Email:', process.env.SENDGRID_FROM_EMAIL);
  console.log('🔧 To Email:', options.to);
  
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  
  const msg = {
    to: options.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || '',
      name: process.env.SENDGRID_FROM_NAME || 'Wood Ward'
    },
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  try {
    console.log('📧 Attempting to send email...');
    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
  } catch (error: any) {
    console.error('❌ SendGrid Error:', error);
    if (error.response) {
      console.error('❌ SendGrid Response Error:', JSON.stringify(error.response.body, null, 2));
    }
    throw new Error('Failed to send email');
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    We received a request to reset your password for your Wood Ward account. Click the button below to create a new password:
                  </p>

                  <!-- Button -->
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Reset Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #1E63F3; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                    ${resetUrl}
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    <strong>This link will expire in 1 hour</strong> for security reasons.
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px; line-height: 18px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    We received a request to reset your password for your Wood Ward account.

    Click the link below to reset your password:
    ${resetUrl}

    This link will expire in 1 hour for security reasons.

    If you didn't request a password reset, please ignore this email.

    Best regards,
    Wood Ward Team
  `;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Wood Ward',
    text,
    html,
  });
};

export const sendEmailVerification = async (
  email: string,
  name: string,
  verificationToken: string
): Promise<void> => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Verify Your Email Address</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Welcome to Wood Ward! We're excited to have you on board. To get started, please verify your email address by clicking the button below:
                  </p>

                  <!-- Button -->
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #1E63F3; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                    ${verificationUrl}
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    <strong>This link will expire in 24 hours</strong> for security reasons.
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    If you didn't create an account with Wood Ward, please ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px; line-height: 18px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    Welcome to Wood Ward! We're excited to have you on board.

    To get started, please verify your email address by clicking the link below:
    ${verificationUrl}

    This link will expire in 24 hours for security reasons.

    If you didn't create an account with Wood Ward, please ignore this email.

    Best regards,
    Wood Ward Team
  `;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Wood Ward',
    text,
    html,
  });
};

export const sendCoachInvitationEmail = async (
  email: string,
  name: string,
  companyName: string,
  invitationToken: string
): Promise<void> => {
  const setupUrl = `${process.env.FRONTEND_URL}/coach-setup?token=${invitationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Wood Ward</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome as a Coach!</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    You've been invited to set up your coaching account for <strong>${companyName}</strong> on Wood Ward! To get started, please set up your account by clicking the button below:
                  </p>

                  <!-- Button -->
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${setupUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Set Up My Account
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #1E63F3; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                    ${setupUrl}
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    <strong>This link will expire in 7 days</strong> for security reasons.
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    If you didn't expect this invitation, please ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px; line-height: 18px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    You've been invited to set up your coaching account for ${companyName} on Wood Ward!

    To get started, please set up your account by clicking the link below:
    ${setupUrl}

    This link will expire in 7 days for security reasons.

    If you didn't expect this invitation, please ignore this email.

    Best regards,
    Wood Ward Team
  `;

  await sendEmail({
    to: email,
    subject: `You're invited to join ${companyName} as a Coach on Wood Ward`,
    text,
    html,
  });
};

export const sendRepInvitationEmail = async (
  email: string,
  name: string,
  companyName: string,
  invitationToken: string
): Promise<void> => {
  const setupUrl = `${process.env.FRONTEND_URL}/rep-setup?token=${invitationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Wood Ward</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Welcome to the Team!</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    You've been invited to join <strong>${companyName}</strong> on Wood Ward! To get started, please set up your account by clicking the button below:
                  </p>

                  <!-- Button -->
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${setupUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Set Up My Account
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #1E63F3; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                    ${setupUrl}
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    <strong>This link will expire in 7 days</strong> for security reasons.
                  </p>

                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    If you didn't expect this invitation, please ignore this email.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
                  </p>
                  <p style="color: #999; margin: 10px 0 0 0; font-size: 12px; line-height: 18px; text-align: center;">
                    This is an automated email, please do not reply.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const text = `
    Hi ${name},

    You've been invited to join ${companyName} on Wood Ward!

    To get started, please set up your account by clicking the link below:
    ${setupUrl}

    This link will expire in 7 days for security reasons.

    If you didn't expect this invitation, please ignore this email.

    Best regards,
    Wood Ward Team
  `;

  await sendEmail({
    to: email,
    subject: `You're invited to join ${companyName} on Wood Ward`,
    text,
    html,
  });
};

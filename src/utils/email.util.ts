import sgMail from '@sendgrid/mail';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
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
    await sgMail.send(msg);
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

export const sendAccountSuspendedEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Suspended</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #dc2626; margin: 0 0 20px 0; font-size: 24px;">Account Suspended</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Your Wood Ward account has been suspended by an administrator.
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    You will not be able to access your account until it is reactivated. If you believe this is a mistake, please contact support.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
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

  const text = `Hi ${name},\n\nYour Wood Ward account has been suspended by an administrator.\n\nYou will not be able to access your account until it is reactivated. If you believe this is a mistake, please contact support.\n\nBest regards,\nWood Ward Team`;

  await sendEmail({
    to: email,
    subject: 'Your Wood Ward Account Has Been Suspended',
    text,
    html,
  });
};

export const sendAccountActivatedEmail = async (
  email: string,
  name: string
): Promise<void> => {
  const loginUrl = `${process.env.FRONTEND_URL}/login`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Activated</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #16a34a; margin: 0 0 20px 0; font-size: 24px;">Account Activated</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Good news! Your Wood Ward account has been activated and you can now access all features.
                  </p>
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Login to Your Account
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px 40px; background-color: #f7faff; border-top: 1px solid #eee; border-radius: 0 0 8px 8px;">
                  <p style="color: #999; margin: 0; font-size: 12px; line-height: 18px; text-align: center;">
                    © ${new Date().getFullYear()} Wood Ward. All rights reserved.
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

  const text = `Hi ${name},\n\nGood news! Your Wood Ward account has been activated and you can now access all features.\n\nLogin here: ${loginUrl}\n\nBest regards,\nWood Ward Team`;

  await sendEmail({
    to: email,
    subject: 'Your Wood Ward Account Has Been Activated',
    text,
    html,
  });
};

export const sendUpgradeEmail = async (
  email: string,
  name: string,
  plan: string,
  billingCycle: string,
  paymentUrl: string
): Promise<void> => {
  const planPrice = plan === 'Pro' 
    ? (billingCycle === 'Yearly' ? '$490/year' : '$49/month')
    : (billingCycle === 'Yearly' ? '$1,990/year' : '$199/month');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Upgrade Your Plan</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7faff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 40px 20px 40px; text-align: center;">
                  <h1 style="color: #1E63F3; margin: 0; font-size: 28px;">Wood Ward</h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">Sales Coaching Platform</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 20px 40px;">
                  <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">🎉 Upgrade Your Plan</h2>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Hi ${name},
                  </p>
                  <p style="color: #666; margin: 0 0 20px 0; font-size: 16px; line-height: 24px;">
                    Your administrator has approved an upgrade to the <strong>${plan} Plan (${billingCycle})</strong> for your account!
                  </p>
                  <div style="background-color: #f7faff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1E63F3; margin: 0 0 10px 0; font-size: 18px;">Plan Details:</h3>
                    <p style="color: #666; margin: 5px 0; font-size: 14px;">Plan: <strong>${plan}</strong></p>
                    <p style="color: #666; margin: 5px 0; font-size: 14px;">Billing: <strong>${billingCycle}</strong></p>
                    <p style="color: #666; margin: 5px 0; font-size: 14px;">Price: <strong>${planPrice}</strong></p>
                  </div>
                  <p style="color: #666; margin: 20px 0; font-size: 16px; line-height: 24px;">
                    To complete your upgrade, please click the button below to proceed with payment:
                  </p>
                  <table role="presentation" style="margin: 30px 0;">
                    <tr>
                      <td style="border-radius: 4px; background-color: #1E63F3;">
                        <a href="${paymentUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold;">
                          Complete Payment
                        </a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #1E63F3; margin: 0 0 20px 0; font-size: 14px; word-break: break-all;">
                    ${paymentUrl}
                  </p>
                  <p style="color: #666; margin: 20px 0; font-size: 14px; line-height: 21px;">
                    Once payment is complete, your account will be upgraded immediately and you'll have access to all ${plan} features!
                  </p>
                </td>
              </tr>
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

    Your administrator has approved an upgrade to the ${plan} Plan (${billingCycle}) for your account!

    Plan Details:
    - Plan: ${plan}
    - Billing: ${billingCycle}
    - Price: ${planPrice}

    To complete your upgrade, please click the link below to proceed with payment:
    ${paymentUrl}

    Once payment is complete, your account will be upgraded immediately!

    Best regards,
    Wood Ward Team
  `;

  await sendEmail({
    to: email,
    subject: `Upgrade to ${plan} Plan - Complete Payment`,
    text,
    html,
  });
};

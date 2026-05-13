import nodemailer from 'nodemailer';

export interface EmailData {
    to: string;
    subject: string;
    fullName: string;
    domain: string;
    username: string;
    password?: string;
    projectName?: string;
    installedModules?: string[];
}

/**
 * Service to handle sending emails
 */
export class EmailService {
    private static transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    /**
     * Send an email when the server is ready
     */
    static async sendServerReadyEmail(data: EmailData) {
        try {
            const { to, subject, fullName, domain, username, password = 'admin', projectName, installedModules } = data;

            const htmlContent = `
                <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: none; padding: 0; border-radius: 12px; overflow: hidden; border: 1px solid #eef2f7; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px 20px; text-align: center; color: white;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">منصة CERP</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">نظامك الجديد أصبح جاهزاً للاستخدام!</p>
                    </div>

                    <!-- Body -->
                    <div style="padding: 40px 30px; background-color: #ffffff;">
                        <p style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">عزيزي/عزيزتي ${fullName}،</p>
                        <p style="margin-bottom: 30px; color: #4b5563;">يسعدنا إبلاغك بأن عملية تهيئة السيرفر الخاص بك قد اكتملت بنجاح. يمكنك الآن البدء في استخدام المنصة وإدارة عملياتك بكل سهولة.</p>
                        
                        <!-- Info Card -->
                        <div style="background-color: #f8fafc; border-radius: 16px; padding: 30px; border: 1px solid #e2e8f0; margin-bottom: 35px;">
                            <h2 style="margin-top: 0; font-size: 16px; color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 20px; font-weight: 800; text-transform: uppercase;">تفاصيل الدخول للنظام</h2>
                            
                            <table style="width: 100%; border-collapse: collapse;">
                                ${projectName ? `
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">اسم المشروع:</td>
                                    <td style="padding: 10px 0; font-weight: bold; color: #0f172a;">${projectName}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">رابط المنصة:</td>
                                    <td style="padding: 10px 0; font-weight: bold; color: #2563eb;"><a href="${domain}" style="color: #2563eb; text-decoration: none;">${domain}</a></td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px;">اسم المستخدم:</td>
                                    <td style="padding: 10px 0; font-weight: bold; font-family: monospace; background: #eef2f7; padding: 4px 8px; border-radius: 4px; color: #0f172a;">${username}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px;">كلمة المرور:</td>
                                    <td style="padding: 10px 0; font-weight: bold; font-family: monospace; background: #fff7ed; padding: 4px 8px; border-radius: 4px; color: #9a3412;">${password}</td>
                                </tr>
                                ${installedModules && installedModules.length > 0 ? `
                                <tr>
                                    <td style="padding: 10px 0; color: #64748b; font-size: 14px; vertical-align: top;">الأنظمة المفعلة:</td>
                                    <td style="padding: 10px 0; font-weight: bold; color: #0f172a; font-size: 13px;">${installedModules.join(', ')}</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>

                        <!-- CTA Button -->
                        <div style="text-align: center; margin-bottom: 30px;">
                            <a href="${domain}" style="background: #2563eb; color: #ffffff; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">دخول المنصة الآن</a>
                        </div>

                        <div style="padding: 20px; border-radius: 12px; background-color: #fffbeb; border-right: 4px solid #f59e0b;">
                            <p style="margin: 0; font-size: 13px; color: #92400e;"><b>ملاحظة أمان:</b> نوصي بتغيير كلمة المرور الخاصة بك فور تسجيل الدخول لأول مرة لضمان أقصى درجات الأمان لبياناتكم.</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f8fafc; padding: 30px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #eef2f7;">
                        <p style="margin: 0;">هذه رسالة تلقائية، يرجى عدم الرد عليها.</p>
                        <p style="margin: 5px 0 0 0;">جميع الحقوق محفوظة &copy; 2026 منصة CERP - أحد منتجات شركة نمو البرمجيات.</p>
                    </div>
                </div>
            `;

            const mailOptions = {
                from: `"منصة CERP" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                html: htmlContent,
            };

            const info = await this.transporter.sendMail(mailOptions);
            // console.log('Email sent: ' + info.response);
            return { success: true, messageId: info.messageId };
        } catch (error: any) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }
    }
}

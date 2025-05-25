// src/app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { otpStore, generateOTP } from '@/lib/otpStore';
import { resendApiKey, isDevelopment } from '@/lib/config';

// Initialize Resend with API key from config
const resend = new Resend(resendApiKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'signup' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!resendApiKey) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP using shared store
    const emailKey = email.toLowerCase().trim();
    otpStore.set(emailKey, { otp, expires, attempts: 0 });

    // Email template
    const emailTemplate = {
      subject: 'Your SafeShare Account Verification Code',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0078d4; font-size: 24px; margin: 0;">SafeShare</h1>
          </div>
          
          <h2 style="color: #323130; font-size: 20px; margin-bottom: 20px;">
            ${type === 'signup' ? 'Verify your email address' : 'Your verification code'}
          </h2>
          
          ${type === 'signup' ? `
            <p style="color: #605e5c; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              To complete your account setup, please use this verification code:
            </p>
          ` : ''}
          
          <div style="background-color: #f3f2f1; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
            <div style="font-size: 32px; font-weight: bold; color: #323130; letter-spacing: 5px; font-family: monospace;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #605e5c; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
            This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #edebe9; margin: 30px 0;">
          
          <p style="color: #a19f9d; font-size: 12px; text-align: center;">
            This is an automated message from SafeShare. Please do not reply to this email.
          </p>
        </div>
      `
    };

    try {
      // Send email using Resend
      const { data, error } = await resend.emails.send({
        from: 'SafeShare <onboarding@resend.dev>',
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Verification code sent to your email',
        // Only include debug info in development
        debug: isDevelopment ? { 
          otp: otp,
          email: emailKey,
          expires: new Date(expires).toISOString(),
          resendId: data?.id,
          storeSize: otpStore.getSize(),
          note: 'Debug info - only shown in development'
        } : undefined
      });

    } catch (emailError) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to send verification code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
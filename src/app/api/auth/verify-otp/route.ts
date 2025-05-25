// src/app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP, otpStore } from '@/lib/otpStore';
import { isDevelopment } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP using the shared store
    const isValidOtp = verifyOTP(email, otp);

    if (!isValidOtp) {
      return NextResponse.json(
        { 
          error: 'Invalid or expired verification code',
          // Only include debug info in development
          debug: isDevelopment ? {
            storeSize: otpStore.getSize(),
            note: 'Check server logs for detailed debugging info'
          } : undefined
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP verified successfully',
      // Only include debug info in development
      debug: isDevelopment ? {
        email: email.toLowerCase(),
        timestamp: new Date().toISOString(),
        note: 'OTP verification completed successfully'
      } : undefined
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to verify OTP',
        details: isDevelopment ? (error instanceof Error ? error.message : 'Unknown error') : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
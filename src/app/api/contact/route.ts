import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log the contact form submission (in production, you'd save to database/send email)
    console.log('Contact form submission:', {
      name: data.name,
      email: data.email,
      inquiryType: data.inquiryType,
      propertyId: data.propertyId,
      propertyTitle: data.propertyTitle,
      submittedAt: data.submittedAt
    });

    // Simulate success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry! We will get back to you within 24 hours.'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  propertyId: z.string().optional(),
  propertyTitle: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  type: z.enum(['general', 'property_inquiry', 'investment', 'callback']).default('general'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validatedData = contactSchema.parse(body);
    
    // In a real application, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Integrate with CRM
    // 4. Send auto-response email to user
    
    // For now, we'll simulate processing
    console.log('📧 Contact form submission:', validatedData);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Thank you for your inquiry. We will get back to you within 24 hours.',
      submissionId: `INQ_${Date.now()}`,
    });
    
  } catch (error) {
    console.error('❌ Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Please check your form data',
          errors: error.issues.reduce((acc, err) => {
            const key = String(err.path[0]);
            acc[key] = err.message;
            return acc;
          }, {} as Record<string, string>),
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Something went wrong. Please try again later.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Contact API is working',
  });
}

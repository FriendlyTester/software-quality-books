
import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
	// Allow all requests through. Add custom logic if needed.
	return NextResponse.next();
}
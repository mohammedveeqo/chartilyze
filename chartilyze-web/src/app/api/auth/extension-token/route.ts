import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  console.log('🔍 === EXTENSION TOKEN API CALLED ===')
  
  try {
    const { clerkSessionId, clerkUserId, clerkToken } = await request.json()
    
    console.log('📋 Extension token request:', {
      hasSessionId: !!clerkSessionId,
      hasUserId: !!clerkUserId,
      hasToken: !!clerkToken
    })
    
    // Get the current user's session from Clerk
    const { userId, getToken } = await auth()
    
    if (!userId) {
      console.log('❌ No userId found - user not authenticated')
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }
    
    // Verify the user matches
    if (userId !== clerkUserId) {
      console.log('❌ User ID mismatch')
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      )
    }
    
    // Get a Convex token for the extension
    const convexToken = await getToken({ template: 'convex' })
    
    if (!convexToken) {
      console.log('❌ Failed to generate Convex token')
      return NextResponse.json(
        { error: 'Failed to generate token' },
        { status: 500 }
      )
    }
    
    console.log('✅ Extension token generated successfully')
    
    return NextResponse.json({
      extensionToken: convexToken,
      userId: userId
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
    
  } catch (error) {
    console.error('❌ Extension token error:', error)
    return NextResponse.json(
      { error: 'Failed to create extension token' },
      { status: 500 }
    )
  }
}

// Handle CORS for extension requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
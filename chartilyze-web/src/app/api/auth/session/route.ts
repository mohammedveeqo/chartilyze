import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  console.log('🔍 === SESSION CHECK API CALLED ===')
  console.log('📋 Request URL:', request.url)
  console.log('📋 Request headers:', Object.fromEntries(request.headers.entries()))
  console.log('📋 User-Agent:', request.headers.get('user-agent'))
  console.log('📋 Origin:', request.headers.get('origin'))
  console.log('📋 Referer:', request.headers.get('referer'))
  
  try {
    console.log('🔧 Attempting to get Clerk auth...')
    
    // Get the current user's session from Clerk
    const { userId, getToken } = await auth()
    
    console.log('📊 Clerk auth result:')
    console.log('  - userId:', userId)
    console.log('  - hasGetToken:', typeof getToken === 'function')
    
    if (!userId) {
      console.log('❌ No userId found - user not authenticated')
      return NextResponse.json(
        { 
          error: 'No active session',
          authenticated: false,
          details: 'No userId found in Clerk session'
        },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        }
      )
    }

    console.log('✅ User authenticated, getting Convex token...')
    
    // Get a Convex token for the user
    let token = null
    try {
      token = await getToken({ template: 'convex' })
      console.log('📋 Convex token result:')
      console.log('  - token length:', token ? token.length : 0)
      console.log('  - token preview:', token ? `${token.substring(0, 20)}...` : 'null')
    } catch (tokenError) {
      console.error('❌ Error getting Convex token:', tokenError)
    }
    
    const response = {
      userId,
      token,
      authenticated: true,
      timestamp: new Date().toISOString(),
      details: 'Session found and token generated successfully'
    }
    
    console.log('✅ === SESSION CHECK SUCCESSFUL ===')
    console.log('📋 Response data:', {
      userId: response.userId,
      hasToken: !!response.token,
      authenticated: response.authenticated
    })
    
    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  } catch (error) {
    console.error('❌ === SESSION CHECK ERROR ===')
    console.error('Error details:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        error: 'Failed to check session',
        authenticated: false,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    )
  }
}

// Handle CORS for extension requests
export async function OPTIONS(request: NextRequest) {
  console.log('🔧 CORS preflight request received')
  console.log('📋 Origin:', request.headers.get('origin'))
  
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
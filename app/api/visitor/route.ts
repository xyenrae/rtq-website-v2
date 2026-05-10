import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Ambil IP dari header (support reverse proxy / Vercel)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : (request.headers.get('x-real-ip') ?? 'unknown')

    const userAgent = request.headers.get('user-agent') ?? undefined
    const body = await request.json().catch(() => ({}))
    const halaman: string = (body as { halaman?: string }).halaman ?? '/'

    const { error } = await supabase.rpc('catat_pengunjung', {
      p_ip: ip,
      p_agent: userAgent,
      p_halaman: halaman,
    })

    if (error) {
      console.error('[visitor] rpc error:', error.message)
      return NextResponse.json({ ok: false }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[visitor] unexpected error:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

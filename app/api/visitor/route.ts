import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // ambil IP user
    const forwarded = request.headers.get('x-forwarded-for')

    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('x-real-ip') ?? 'unknown'

    // browser / device info
    const userAgent = request.headers.get('user-agent') ?? null

    // body request
    const body = await request.json().catch(() => ({}))

    const halaman =
      typeof body.halaman === 'string'
        ? body.halaman
        : '/'

    // panggil postgres function
    const { error } = await supabase.rpc(
      'catat_pengunjung',
      {
        p_ip: ip,
        p_agent: userAgent,
        p_halaman: halaman,
      }
    )

    if (error) {
      console.error(
        '[visitor] rpc error:',
        error
      )

      return NextResponse.json(
        {
          ok: false,
          message: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
    })
  } catch (error) {
    console.error(
      '[visitor] unexpected:',
      error
    )

    return NextResponse.json(
      {
        ok: false,
        message: 'internal server error',
      },
      { status: 500 }
    )
  }
}

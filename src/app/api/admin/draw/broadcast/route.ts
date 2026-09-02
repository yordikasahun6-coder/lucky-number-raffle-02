import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const { draw_id } = await request.json()

  const { data: draw } = await supabaseAdmin.from('draws').select('*').eq('id', draw_id).single()
  if (!draw) return NextResponse.json({ error: 'Draw not found.' }, { status: 404 })

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return NextResponse.json({ error: 'Telegram bot not configured.' }, { status: 500 })

  const { data: chatRows } = await supabaseAdmin
    .from('payments')
    .select('telegram_chat_id')
    .not('telegram_chat_id', 'is', null)

  const uniqueChatIds = Array.from(new Set((chatRows || []).map((r) => r.telegram_chat_id)))

  const winnerText =
    `🎉🏆 *WE HAVE A WINNER!* 🏆🎉\n\n` +
    `The winning number is *#${draw.ticket_number}*\n\n` +
    `Congratulations to our lucky winner! Thank you to everyone who played — we'll be back with another round soon. 🍀`

  let sent = 0
  for (const chatId of uniqueChatIds) {
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: winnerText, parse_mode: 'Markdown' })
      })
      sent++
    } catch {
      // skip individual send failures, keep going for the rest
    }
  }

  await supabaseAdmin.from('draws').update({ broadcasted: true, broadcasted_at: new Date().toISOString() }).eq('id', draw_id)

  return NextResponse.json({ success: true, sent, total: uniqueChatIds.length })
}
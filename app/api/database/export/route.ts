import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/simple-database'

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Получаем все данные из localStorage (это будет сделано на клиенте)
    return NextResponse.json({ 
      success: true,
      message: 'Экспорт готов к загрузке'
    })

  } catch (error) {
    console.error('Ошибка экспорта:', error)
    return NextResponse.json({ error: 'Ошибка экспорта данных' }, { status: 500 })
  }
}

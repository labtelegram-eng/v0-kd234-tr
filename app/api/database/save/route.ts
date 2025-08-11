import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/simple-database'

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const currentUser = getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
    }

    // Имитируем сохранение базы данных
    const saveTime = new Date().toISOString()
    
    return NextResponse.json({ 
      success: true,
      message: `База данных успешно сохранена пользователем ${currentUser.username}`,
      savedBy: currentUser.username,
      saveTime: saveTime
    })

  } catch (error) {
    console.error('Ошибка сохранения:', error)
    return NextResponse.json({ error: 'Ошибка сохранения базы данных' }, { status: 500 })
  }
}

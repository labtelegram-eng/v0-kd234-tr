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

    const body = await request.json()
    
    // Валидация структуры бэкапа
    if (!body.metadata || !body.data) {
      return NextResponse.json({ error: 'Неверный формат файла бэкапа' }, { status: 400 })
    }

    if (body.metadata.type !== 'thailand-travel-guide-backup') {
      return NextResponse.json({ error: 'Неподдерживаемый тип бэкапа' }, { status: 400 })
    }

    // Импорт будет выполнен на клиенте
    return NextResponse.json({ 
      success: true,
      message: `Данные успешно импортированы пользователем ${currentUser.username}`,
      importedBy: currentUser.username,
      importDate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Ошибка импорта:', error)
    return NextResponse.json({ error: 'Ошибка импорта данных' }, { status: 500 })
  }
}

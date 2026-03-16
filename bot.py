import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.enums import ParseMode

# Настройка логирования
logging.basicConfig(level=logging.INFO)

# Токен бота (ВСТАВЬТЕ СВОЙ ТОКЕН)
BOT_TOKEN = "8613747361:AAHz3fnew8gGNORgGtF804iZ9fVydcB5uGk"

# URL вашего Mini App (который загрузили в BotFather)
WEB_APP_URL = "https://ваш-урл-от-botfathera.com"

# Инициализация бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """
    Обработчик команды /start
    Отправляет приветственное сообщение с кнопкой открытия Mini App
    """
    
    # Создаем клавиатуру с кнопкой Web App
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(
                text="🎮 ОТКРЫТЬ ПРИЛОЖЕНИЕ", 
                web_app=WebAppInfo(url=WEB_APP_URL)
            )]
        ]
    )
    
    # Приветственное сообщение
    welcome_text = (
        "❄️ **Добро пожаловать в TC CASES!** ❄️\n\n"
        "🎯 Открывай кейсы\n"
        "💎 Получай алмазы\n"
        "🎁 Забирай скины\n\n"
        "Нажми кнопку ниже, чтобы начать!"
    )
    
    await message.answer(
        welcome_text,
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN
    )

@dp.message()
async def echo(message: types.Message):
    """
    Обработчик всех остальных сообщений
    Просто напоминает про команду /start
    """
    await message.answer(
        "❓ Используй /start чтобы открыть приложение"
    )

async def main():
    """
    Главная функция запуска бота
    """
    logging.info("Бот запущен...")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())
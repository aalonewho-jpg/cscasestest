import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.enums import ParseMode
import json

BOT_TOKEN = "8608235653:AAHorckGUSl8_tdIOzrfCX_gK0-FXdCvVMo"  # ВСТАВЬТЕ СВОЙ ТОКЕН
CHANNEL_ID = "@alonewhat"  # Ваш канал

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: types.Message):
    # Проверяем реферальный параметр (если кто-то перешел по ссылке с рефералом)
    args = message.text.split()
    ref_id = args[1] if len(args) > 1 else None
    
    # ВАША ССЫЛКА НА MINI APP
    WEB_APP_URL = "https://aalonewho-jpg.github.io/cscasestest/"
    
    # Если есть реферал, добавляем его в ссылку
    if ref_id:
        web_app_url = f"{WEB_APP_URL}?start={ref_id}"
    else:
        web_app_url = WEB_APP_URL
    
    # Создаем кнопку с WebApp
    keyboard = InlineKeyboardMarkup(
        inline_keyboard=[[
            InlineKeyboardButton(
                text="🎮 ОТКРЫТЬ ПРИЛОЖЕНИЕ",
                web_app=WebAppInfo(url=web_app_url)
            )
        ]]
    )
    
    await message.answer(
        "❄️ **TC CASES** ❄️\n\n"
        "🎯 Открывай кейсы\n"
        "💎 Получай алмазы\n"
        "⬆️ Улучшай скины\n"
        "👥 Приглашай друзей\n\n"
        "Нажми кнопку ниже, чтобы начать!",
        reply_markup=keyboard,
        parse_mode=ParseMode.MARKDOWN
    )

@dp.message()
async def web_app_data(message: types.Message):
    """Обработка данных из WebApp"""
    if message.web_app_data:
        data = json.loads(message.web_app_data.data)
        
        if data['action'] == 'check_sub':
            # Проверяем подписку на канал
            user_id = data['user_id']
            try:
                member = await bot.get_chat_member(CHANNEL_ID, user_id)
                is_subscribed = member.status not in ['left', 'kicked']
                
                # Отправляем результат обратно в WebApp
                await message.answer(json.dumps({
                    'subscribed': is_subscribed
                }))
            except Exception as e:
                await message.answer(json.dumps({
                    'subscribed': False,
                    'error': str(e)
                }))
        
        elif data['action'] == 'pay':
            # Обработка оплаты звездами
            crystals = data['crystals']
            stars = data['stars']
            user_id = data['user_id']
            
            # Здесь можно создать инвойс для оплаты звездами
            # Но пока просто подтверждаем
            await message.answer(json.dumps({
                'success': True,
                'crystals': crystals,
                'stars': stars
            }))

async def main():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

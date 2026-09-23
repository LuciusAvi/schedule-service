import os

from dotenv import load_dotenv
from supabase import create_client

from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    CallbackQueryHandler,
    ContextTypes
)

load_dotenv()

TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    result = supabase.table("groups").select("*").order("name").execute()

    groups = result.data

    text = "📚 Выберите вашу группу:\n\n"

    for group in groups:
        text += f"{group['id']}. {group['name']}\n"

    await update.message.reply_text(text)
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    result = (
        supabase
        .table("groups")
        .select("*")
        .order("name")
        .execute()
    )

    keyboard = []

    for group in result.data:

        keyboard.append([
            InlineKeyboardButton(
                group["name"],
                callback_data=f"group_{group['id']}"
            )
        ])

    await update.message.reply_text(
        "📚 Выберите вашу группу:",
        reply_markup=InlineKeyboardMarkup(keyboard)
    )
from datetime import datetime

async def today(update: Update, context: ContextTypes.DEFAULT_TYPE):

    group_id = context.user_data.get("group_id")

    if not group_id:
        await update.message.reply_text(
            "Сначала выберите группу через /start"
        )
        return

    day = datetime.now().isoweekday()

    result = (
        supabase
        .table("schedule")
        .select("*")
        .eq("group_id", group_id)
        .eq("day_of_week", day)
        .order("lesson_number")
        .execute()
    )

    lessons = result.data

    if not lessons:
        await update.message.reply_text(
            "📚 Сегодня пар нет."
        )
        return

    text = "📅 Расписание на сегодня:\n\n"

    for lesson in lessons:

        text += (
            f"{lesson['lesson_number']}. "
            f"{lesson['subject_name']}\n"
            f"🕐 {lesson['time_start']} — "
            f"{lesson['time_end']}\n\n"
        )

    await update.message.reply_text(text)
def main():

    app = Application.builder().token(
        TELEGRAM_TOKEN
    ).build()

    app.add_handler(
        CommandHandler("start", start)
    )

    app.add_handler(
        CommandHandler("today", today)
    )

    app.add_handler(
        CommandHandler("now", now)
    )

    app.add_handler(
        CallbackQueryHandler(select_group)
    )

    print("Бот запущен!")

    app.run_polling()


if __name__ == "__main__":
    main()
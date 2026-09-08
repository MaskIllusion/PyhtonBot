from aiogram import types
from aiogram.filters import Command

from database_db import db
from loader import dp


@dp.message(Command("start"))
async def start_command(message: types.Message) -> None:
    user = message.from_user
    if user is None:
        return

    first_name = user.first_name or "User"
    db.add_user(user.id, first_name, user.last_name, user.username)

    welcome_text = (
        f"👋 Привет, {first_name}!\n\n"
        "✅ Ты успешно зарегистрирован в базе данных!\n"
        "📊 Используй /users чтобы увидеть всех пользователей\n"
        "👤 Используй /me чтобы увидеть свою информацию"
    )
    await message.answer(welcome_text)


@dp.message(Command("users"))
async def list_users(message: types.Message) -> None:
    users = db.get_all_users()
    if not users:
        await message.answer("📭 В базе данных пока нет пользователей.")
        return

    lines = ["📊 Список пользователей:", ""]
    for user in users:
        lines.append(f"👤 {user[2]} (ID: {user[1]})")
        if user[3]:
            lines.append(f"   Фамилия: {user[3]}")
        if user[4]:
            lines.append(f"   Username: @{user[4]}")
        lines.append(f"   📅 {str(user[5])[:16]}")
        lines.append("")

    await message.answer("\n".join(lines))


@dp.message(Command("me"))
async def my_info(message: types.Message) -> None:
    user_info = db.get_user(message.from_user.id)
    if not user_info:
        await message.answer("❌ Вы не зарегистрированы. Используйте /start")
        return

    lines = [
        "📝 Ваша информация:",
        "",
        f"👤 Имя: {user_info[2]}",
    ]
    if user_info[3]:
        lines.append(f"📛 Фамилия: {user_info[3]}")
    if user_info[4]:
        lines.append(f"🔹 Username: @{user_info[4]}")
    lines.extend(
        [
            f"🆔 ID: {user_info[1]}",
            f"📅 Зарегистрирован: {str(user_info[5])[:16]}",
        ]
    )
    await message.answer("\n".join(lines))


@dp.message()
async def echo_message(message: types.Message) -> None:
    user = message.from_user
    if user is None:
        return

    user_info = db.get_user(user.id)
    if user_info:
        await message.answer(
            f"😊 Привет, {user_info[2]}! Используй /start, /users или /me"
        )
    else:
        await message.answer("👋 Используй /start для регистрации")
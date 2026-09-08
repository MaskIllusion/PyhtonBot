import asyncio

import handler_user
from database_db import db
from loader import bot, dp


async def main() -> None:
    db.create_table()
    print("✅ Database initialized")
    print("🚀 Bot is running!")
    print("👤 Registration bot")
    await dp.start_polling(bot, skip_updates=True)


if __name__ == "__main__":
    asyncio.run(main())
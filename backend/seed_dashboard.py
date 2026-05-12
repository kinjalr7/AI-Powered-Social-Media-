import asyncio
from datetime import datetime, timedelta
import random
from sqlalchemy import select
from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.social_account import SocialAccount
from app.models.post import Post

async def seed():
    async with SessionLocal() as db:
        # 1. Get or create user
        result = await db.execute(select(User).limit(1))
        user = result.scalars().first()
        if not user:
            print("No user found. Please register first.")
            return

        # 2. Get or create company
        result = await db.execute(select(Company).where(Company.user_id == user.id))
        company = result.scalars().first()
        if not company:
            company = Company(name="TechCorp", user_id=user.id)
            db.add(company)
            await db.commit()
            await db.refresh(company)

        # 3. Get or create social accounts
        platforms = ['twitter', 'linkedin', 'facebook', 'instagram']
        accounts = []
        for p in platforms:
            result = await db.execute(select(SocialAccount).where(SocialAccount.company_id == company.id, SocialAccount.platform == p))
            acc = result.scalars().first()
            if not acc:
                acc = SocialAccount(platform=p, access_token="mock_token", company_id=company.id)
                db.add(acc)
                accounts.append(acc)
            else:
                accounts.append(acc)
        await db.commit()

        # 4. Add posts spread across time
        # Delete existing posts to start fresh if requested, but here we just add more
        sentiments = ['Positive', 'Neutral', 'Negative']
        contents = [
            "AI is the future of productivity!",
            "Great session today on social media trends.",
            "Our new feature is live! Check it out.",
            "Analyzing data has never been easier.",
            "Social intelligence is key to growth.",
            "Join our webinar next week.",
            "Is AI overhyped? Let's discuss.",
            "New partnership announced today.",
        ]

        now = datetime.now()
        for i in range(100):
            # Random date in the last year
            days_ago = random.randint(0, 365)
            created_at = now - timedelta(days=days_ago)
            
            post = Post(
                social_id=random.choice(accounts).id,
                content=random.choice(contents) + f" ({i})",
                likes=random.randint(10, 5000),
                sentiment=random.choice(sentiments),
                created_at=created_at
            )
            db.add(post)
        
        await db.commit()
        print("Seeded 100 posts across the last year.")

if __name__ == "__main__":
    asyncio.run(seed())

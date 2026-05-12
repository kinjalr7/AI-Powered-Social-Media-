import asyncio
from app.db.session import SessionLocal
from app.models.user import User
from app.models.company import Company
from app.models.social_account import SocialAccount
from app.models.post import Post
from app.core.security import get_password_hash
from sqlalchemy import select
from datetime import datetime, timedelta
import random

async def seed():
    async with SessionLocal() as db:
        # 1. Ensure User exists
        email = "test@example.com"
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            user = User(
                email=email,
                hashed_password=get_password_hash("password"),
                full_name="Test User",
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"Created user: {email}")
        else:
            print(f"User {email} already exists.")

        # 2. Ensure Company exists
        result = await db.execute(select(Company).where(Company.user_id == user.id))
        company = result.scalars().first()
        if not company:
            company = Company(name="Demo Company", user_id=user.id)
            db.add(company)
            await db.commit()
            await db.refresh(company)
            print("Created company.")
        
        # 3. Ensure Social Accounts exist
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
        print("Ensured social accounts.")

        # 4. Add Posts spread across time
        # Clear old posts for this user to ensure timeframe changes are visible
        # First get account IDs
        acc_ids = [a.id for a in accounts]
        # We don't delete to avoid accidental data loss, just add more
        
        sentiments = ['Positive', 'Neutral', 'Negative']
        contents = [
            "AI is transforming social media strategy.",
            "Our latest campaign reached 1M people!",
            "Customer sentiment is trending upwards.",
            "New post alert: How to use AI in business.",
            "Social intelligence dashboard is live.",
        ]

        now = datetime.now()
        posts_added = 0
        for i in range(150):
            # 50 in last week, 50 in last month, 50 in last year
            if i < 50:
                days_ago = random.randint(0, 6)
            elif i < 100:
                days_ago = random.randint(7, 29)
            else:
                days_ago = random.randint(30, 360)
                
            created_at = now - timedelta(days=days_ago)
            
            post = Post(
                social_id=random.choice(acc_ids),
                content=random.choice(contents) + f" #{i}",
                likes=random.randint(100, 10000),
                sentiment=random.choice(sentiments),
                created_at=created_at
            )
            db.add(post)
            posts_added += 1
        
        await db.commit()
        print(f"Seeded {posts_added} posts for {email} with proper time distribution.")

if __name__ == "__main__":
    asyncio.run(seed())

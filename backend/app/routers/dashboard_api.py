from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.company import Company
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Calculate start date
    now = datetime.now()
    if timeframe == "week":
        start_date = now - timedelta(days=7)
    elif timeframe == "month":
        start_date = now - timedelta(days=30)
    else: # year
        start_date = now - timedelta(days=365)

    # Total Engagement
    engagement_query = await db.execute(
        select(func.sum(Post.likes))
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    total_engagement = engagement_query.scalar() or 0
    
    # Total Posts
    posts_query = await db.execute(
        select(func.count(Post.id))
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    total_posts = posts_query.scalar() or 0
    
    # Average Reach (engagement * 15 fallback)
    avg_reach = total_engagement * 15
    
    # Sentiment Score
    positive_query = await db.execute(
        select(func.count(Post.id))
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.sentiment == 'Positive')
        .where(Post.created_at >= start_date)
    )
    positive_count = positive_query.scalar() or 0
    sentiment_score = (positive_count / total_posts * 100) if total_posts > 0 else 0

    return [
        { "title": 'Total Engagement', "value": f"{total_engagement:,}", "trend": 12.5, "description": f'vs last {timeframe}', "icon": 'Zap' },
        { "title": 'Average Reach', "value": f"{avg_reach:,}", "trend": 8.2, "description": f'vs last {timeframe}', "icon": 'Users' },
        { "title": 'Sentiment Score', "value": f"{sentiment_score:.1f}%", "trend": 4.1, "description": 'Positive growth', "icon": 'Smile' },
        { "title": 'Total Posts', "value": str(total_posts), "trend": 5.4, "description": f'vs last {timeframe}', "icon": 'Target' },
    ]

@router.get("/engagement")
async def get_engagement_data(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Mocking daily data for simplicity, but in real it would group by date
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    if timeframe == 'month':
        days = ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    elif timeframe == 'year':
        days = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']
        
    data = []
    base_val = 2000 if timeframe == 'week' else (8000 if timeframe == 'month' else 25000)
    for day in days:
        data.append({
            "name": day,
            "engagement": base_val + (len(day) * 500),
            "reach": (base_val * 2.5) + (len(day) * 1200)
        })
    return data

@router.get("/reach")
async def get_platform_reach(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    if timeframe == "week":
        start_date = now - timedelta(days=7)
    elif timeframe == "month":
        start_date = now - timedelta(days=30)
    else: # year
        start_date = now - timedelta(days=365)

    result = await db.execute(
        select(SocialAccount.platform, func.count(Post.id))
        .join(Post)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
        .group_by(SocialAccount.platform)
    )
    rows = result.all()
    
    colors = {
        'twitter': '#3b82f6',
        'linkedin': '#22d3a5',
        'facebook': '#7c3aed',
        'instagram': '#f97316'
    }
    
    return [
        {"name": row[0].capitalize(), "value": row[1], "color": colors.get(row[0].lower(), "#ffffff")}
        for row in rows
    ]

@router.get("/sentiment")
async def get_sentiment_overview(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    if timeframe == "week":
        start_date = now - timedelta(days=7)
    elif timeframe == "month":
        start_date = now - timedelta(days=30)
    else: # year
        start_date = now - timedelta(days=365)

    result = await db.execute(
        select(Post.sentiment, func.count(Post.id))
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
        .group_by(Post.sentiment)
    )
    rows = result.all()
    
    sentiment_counts = {row[0]: row[1] for row in rows if row[0]}
    total = sum(sentiment_counts.values()) or 1
    
    return {
        "positive": int(sentiment_counts.get('Positive', 0) / total * 100),
        "neutral": int(sentiment_counts.get('Neutral', 0) / total * 100),
        "negative": int(sentiment_counts.get('Negative', 0) / total * 100)
    }

@router.get("/topics")
async def get_top_topics(
    timeframe: str = "week",
    current_user: User = Depends(get_current_user)
):
    # This would normally involve NLP on post content
    return [
        { "topic": '#AIInnovation', "count": '12.4K', "growth": '+15%' },
        { "topic": 'TechTrends2024', "count": '8.2K', "growth": '+8%' },
        { "topic": 'SocialStrategy', "count": '5.1K', "growth": '+2%' },
        { "topic": 'DataInsights', "count": '3.9K', "growth": '-1%' },
    ]

@router.get("/posts")
async def get_recent_posts(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    now = datetime.now()
    if timeframe == "week":
        start_date = now - timedelta(days=7)
    elif timeframe == "month":
        start_date = now - timedelta(days=30)
    else: # year
        start_date = now - timedelta(days=365)

    result = await db.execute(
        select(Post, SocialAccount.platform)
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
        .order_by(Post.created_at.desc())
        .limit(5)
    )
    rows = result.all()
    
    return [
        {
            "id": row[0].id,
            "platform": row[1].capitalize(),
            "content": row[0].content,
            "likes": f"{row[0].likes:,}",
            "comments": row[0].likes // 10, # Mocked
            "time": row[0].created_at.strftime("%Y-%m-%d %H:%M")
        }
        for row in rows
    ]

@router.get("/alerts")
async def get_live_alerts(
    current_user: User = Depends(get_current_user)
):
    """
    Get live alert notifications.
    """
    return [
        {"id": 1, "type": "engagement_spike", "message": "High engagement on your latest Twitter post!", "time": "5m ago"},
        {"id": 2, "type": "mention", "message": "@TechCorp mentioned you in a post.", "time": "12m ago"}
    ]

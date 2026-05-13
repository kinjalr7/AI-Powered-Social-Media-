from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import functools
import time
import asyncio

from app.db.session import get_db
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.company import Company
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

# Simple in-memory cache for dashboard metrics
_cache = {}
CACHE_TTL = 300 # 5 minutes

def get_cache_key(user_id: int, timeframe: str, endpoint: str):
    return f"{endpoint}:{user_id}:{timeframe}"

def check_cache(key: str):
    if key in _cache:
        data, expiry = _cache[key]
        if time.time() < expiry:
            return data
    return None

def set_cache(key: str, data: any):
    _cache[key] = (data, time.time() + CACHE_TTL)

@router.get("/stats")
async def get_dashboard_stats(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cache_key = get_cache_key(current_user.id, timeframe, "stats")
    cached_data = check_cache(cache_key)
    if cached_data:
        return cached_data

    now = datetime.now()
    if timeframe == "week":
        start_date = now - timedelta(days=7)
    elif timeframe == "month":
        start_date = now - timedelta(days=30)
    else: # year
        start_date = now - timedelta(days=365)

    # Optimized single query for all stats
    query = (
        select(
            func.sum(Post.likes).label("total_engagement"),
            func.count(Post.id).label("total_posts"),
            func.sum(case((Post.sentiment == 'Positive', 1), else_=0)).label("positive_count")
        )
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    
    result = await db.execute(query)
    row = result.one()
    
    total_engagement = row.total_engagement or 0
    total_posts = row.total_posts or 0
    positive_count = row.positive_count or 0
    
    avg_reach = total_engagement * 15
    sentiment_score = (positive_count / total_posts * 100) if total_posts > 0 else 0

    data = [
        { "title": 'Total Engagement', "value": f"{total_engagement:,}", "trend": 12.5, "description": f'vs last {timeframe}', "icon": 'Zap' },
        { "title": 'Average Reach', "value": f"{avg_reach:,}", "trend": 8.2, "description": f'vs last {timeframe}', "icon": 'Users' },
        { "title": 'Sentiment Score', "value": f"{sentiment_score:.1f}%", "trend": 4.1, "description": 'Positive growth', "icon": 'Smile' },
        { "title": 'Total Posts', "value": str(total_posts), "trend": 5.4, "description": f'vs last {timeframe}', "icon": 'Target' },
    ]
    
    set_cache(cache_key, data)
    return data

@router.get("/engagement")
async def get_engagement_data(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
    return [
        { "topic": '#AIInnovation', "count": '12.4K', "growth": '+15%' },
        { "topic": 'TechTrends2024', "count": '8.2K', "growth": '+8%' },
        { "topic": 'SocialStrategy', "count": '5.1K', "growth": '+2%' },
        { "topic": 'DataInsights', "count": '3.9K', "growth": '-1%' },
    ]

@router.get("/posts")
async def get_recent_posts(
    timeframe: str = "week",
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=50),
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

    offset = (page - 1) * limit

    result = await db.execute(
        select(Post, SocialAccount.platform)
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
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
    return [
        {"id": 1, "type": "engagement_spike", "message": "High engagement on your latest Twitter post!", "time": "5m ago"},
        {"id": 2, "type": "mention", "message": "@TechCorp mentioned you in a post.", "time": "12m ago"}
    ]

@router.get("/dashboard-summary")
async def get_full_dashboard_summary(
    timeframe: str = "week",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Consolidated endpoint fetched sequentially to ensure session safety and reliable delivery."""
    # Running sequentially is much safer with SQLAlchemy AsyncSession
    stats = await get_dashboard_stats(timeframe, db, current_user)
    engagement = await get_engagement_data(timeframe, db, current_user)
    reach = await get_platform_reach(timeframe, db, current_user)
    sentiment = await get_sentiment_overview(timeframe, db, current_user)
    topics = await get_top_topics(timeframe, current_user)
    posts = await get_recent_posts(timeframe, 1, 5, db, current_user)
    
    return {
        "stats": stats,
        "engagement": engagement,
        "reach": reach,
        "sentiment": sentiment,
        "topics": topics,
        "posts": posts
    }

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, case, desc, extract
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import asyncio
import re

from app.db.session import get_db
from app.models.post import Post
from app.models.social_account import SocialAccount
from app.models.company import Company
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

def get_timeframe_delta(timeframe: str) -> timedelta:
    days_map = {"week": 7, "month": 30, "year": 365}
    return timedelta(days=days_map.get(timeframe, 7))

@router.get("/engagement-trend")
async def get_engagement_trend(
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get engagement trend data (line chart).
    """
    now = datetime.now()
    start_date = now - get_timeframe_delta(timeframe)

    query = (
        select(
            func.date(Post.created_at).label("date"),
            func.sum(Post.likes).label("engagement"),
            func.count(Post.id).label("reach_factor")
        )
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    
    if platform and platform.lower() != 'all':
        query = query.where(SocialAccount.platform == platform.lower())
        
    query = query.group_by(func.date(Post.created_at)).order_by(func.date(Post.created_at))
    
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        # If no data in DB, return empty list (frontend will handle demo fallback if in demo mode)
        return []

    return [
        {
            "name": row.date.strftime("%b %d"),
            "engagement": int(row.engagement or 0),
            "reach": int(row.reach_factor or 0) * 15, # Mock reach as post count * factor
            "date": row.date.strftime("%Y-%m-%d")
        }
        for row in rows
    ]

@router.get("/platform-distribution")
async def get_platform_distribution(
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get reach distribution across platforms (donut chart).
    """
    now = datetime.now()
    start_date = now - get_timeframe_delta(timeframe)

    query = (
        select(SocialAccount.platform, func.sum(Post.likes).label("engagement"))
        .join(Post)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    
    if platform and platform.lower() != 'all':
        query = query.where(SocialAccount.platform == platform.lower())
        
    query = query.group_by(SocialAccount.platform)
    
    result = await db.execute(query)
    rows = result.all()
    
    colors = {
        'twitter': '#8b5cf6',   # Indigo
        'linkedin': '#06b6d4',  # Cyan
        'facebook': '#3b82f6',  # Blue
        'instagram': '#ec4899', # Rose
        'youtube': '#f59e0b'    # Amber
    }
    
    if not rows:
        return []
        
    return [
        {
            "name": row[0].capitalize(), 
            "value": int(row[1] or 0), 
            "color": colors.get(row[0].lower(), "#64748b")
        }
        for row in rows
    ]

@router.get("/sentiment-breakdown")
async def get_sentiment_breakdown(
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get sentiment breakdown (pie/bar chart).
    """
    now = datetime.now()
    start_date = now - get_timeframe_delta(timeframe)

    query = (
        select(Post.sentiment, func.count(Post.id))
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    
    if platform and platform.lower() != 'all':
        query = query.where(SocialAccount.platform == platform.lower())
        
    query = query.group_by(Post.sentiment)
    
    result = await db.execute(query)
    rows = result.all()
    
    if not rows:
        return {"overall": 0, "segments": [], "trends": []}

    sentiment_map = {row[0]: row[1] for row in rows if row[0]}
    total = sum(sentiment_map.values()) or 1
    
    # Simple overall score: (Positive / Total) * 100
    overall = int((sentiment_map.get('Positive', 0) / total) * 100)
        
    return {
        "overall": overall,
        "segments": [
            {"name": "Positive", "value": sentiment_map.get('Positive', 0), "color": "#10b981"},
            {"name": "Neutral", "value": sentiment_map.get('Neutral', 0), "color": "#64748b"},
            {"name": "Negative", "value": sentiment_map.get('Negative', 0), "color": "#ef4444"}
        ],
        "trends": [] # Optional: could add time-series sentiment here
    }

@router.get("/top-topics")
async def get_top_topics(
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get top topics based on hashtag extraction from posts.
    """
    now = datetime.now()
    start_date = now - get_timeframe_delta(timeframe)

    query = (
        select(Post.content)
        .join(SocialAccount)
        .join(Company)
        .where(Company.user_id == current_user.id)
        .where(Post.created_at >= start_date)
    )
    
    if platform and platform.lower() != 'all':
        query = query.where(SocialAccount.platform == platform.lower())
        
    result = await db.execute(query)
    posts = result.scalars().all()
    
    if not posts:
        return []

    # Simple hashtag extraction
    hashtags = {}
    for content in posts:
        found = re.findall(r"#(\w+)", content)
        for tag in found:
            hashtags[tag] = hashtags.get(tag, 0) + 1
            
    # Sort and take top 5
    sorted_tags = sorted(hashtags.items(), key=lambda x: x[1], reverse=True)[:5]
    
    import random
    return [
        { "topic": f"#{tag}", "count": count, "growth": random.randint(-5, 20) }
        for tag, count in sorted_tags
    ]

@router.get("/comparison")
async def get_comparison_data(
    type: str = "platform", # platform or trend
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get comparison data.
    """
    now = datetime.now()
    delta = get_timeframe_delta(timeframe)
    start_date = now - delta
    
    if type == "platform":
        query = (
            select(
                SocialAccount.platform, 
                func.sum(Post.likes).label("engagement"),
                func.count(Post.id).label("posts")
            )
            .join(Post)
            .join(Company)
            .where(Company.user_id == current_user.id)
            .where(Post.created_at >= start_date)
            .group_by(SocialAccount.platform)
        )
        result = await db.execute(query)
        rows = result.all()
        return [
            {
                "name": row.platform.capitalize(), 
                "engagement": int(row.engagement or 0), 
                "reach": int(row.posts or 0) * 100, 
                "posts": int(row.posts or 0)
            }
            for row in rows
        ]
    else: # trend comparison (current vs previous)
        # Current period
        current_query = (
            select(func.date(Post.created_at).label("date"), func.sum(Post.likes).label("val"))
            .join(SocialAccount).join(Company)
            .where(Company.user_id == current_user.id)
            .where(Post.created_at >= start_date)
        )
        
        # Previous period
        prev_start = start_date - delta
        prev_query = (
            select(func.date(Post.created_at).label("date"), func.sum(Post.likes).label("val"))
            .join(SocialAccount).join(Company)
            .where(Company.user_id == current_user.id)
            .where(Post.created_at >= prev_start)
            .where(Post.created_at < start_date)
        )

        if platform and platform.lower() != 'all':
            current_query = current_query.where(SocialAccount.platform == platform.lower())
            prev_query = prev_query.where(SocialAccount.platform == platform.lower())

        current_query = current_query.group_by(func.date(Post.created_at))
        prev_query = prev_query.group_by(func.date(Post.created_at))
        
        res_curr = await db.execute(current_query)
        res_prev = await db.execute(prev_query)
        
        curr_data = {row.date.strftime("%Y-%m-%d"): row.val for row in res_curr.all()}
        prev_data = {row.date.strftime("%Y-%m-%d"): row.val for row in res_prev.all()}
        
        results = []
        for i in range(delta.days):
            curr_day = (start_date + timedelta(days=i)).strftime("%Y-%m-%d")
            prev_day = (prev_start + timedelta(days=i)).strftime("%Y-%m-%d")
            
            results.append({
                "name": (start_date + timedelta(days=i)).strftime("%a"),
                "current": int(curr_data.get(curr_day, 0)),
                "previous": int(prev_data.get(prev_day, 0))
            })
        return results

@router.get("/full-data")
async def get_full_charts_data(
    timeframe: str = "week",
    platform: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch all charts data in one go.
    """
    results = await asyncio.gather(
        get_engagement_trend(timeframe, platform, db, current_user),
        get_platform_distribution(timeframe, platform, db, current_user),
        get_sentiment_breakdown(timeframe, platform, db, current_user),
        get_top_topics(timeframe, platform, db, current_user),
        get_comparison_data("platform", timeframe, platform, db, current_user),
        get_comparison_data("trend", timeframe, platform, db, current_user)
    )
    
    return {
        "engagement": results[0],
        "distribution": results[1],
        "sentiment": results[2],
        "topics": results[3],
        "platformComparison": results[4],
        "trendComparison": results[5]
    }


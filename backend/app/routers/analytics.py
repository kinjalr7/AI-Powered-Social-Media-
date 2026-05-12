from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.db.session import get_db
from app.models.company import Company
from app.models.social_account import SocialAccount
from app.models.post import Post
from app.models.analysis import Analysis
from app.models.user import User
from app.core.security import get_current_user
from app.services.analysis import sentiment_analysis, compute_engagement, detect_hiring_keywords
from app.schemas.analysis import AnalysisRead

router = APIRouter()

@router.post("/companies/{company_id}/analyze", response_model=AnalysisRead)
async def analyze_company_data(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Run AI analysis on all available posts for a company.
    Updates post sentiments and aggregates results into an Analysis record.
    """
    # 1. Verify company exists and belongs to the current user
    result = await db.execute(
        select(Company).where(Company.id == company_id, Company.user_id == current_user.id)
    )
    company = result.scalars().first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Company not found or access denied"
        )
    
    # 2. Fetch all posts associated with this company
    result = await db.execute(
        select(Post)
        .join(SocialAccount)
        .where(SocialAccount.company_id == company_id)
    )
    posts = result.scalars().all()
    
    if not posts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="No posts found for this company. Please ingest data first."
        )
    
    total_engagement = 0.0
    all_hiring_signals = set()
    
    # 3. Perform analysis on each post
    for post in posts:
        # Run sentiment analysis (updates the post record in the session)
        post.sentiment = sentiment_analysis(post.content)
        
        # Calculate engagement contribution
        # Note: In a real app, you might have comments/shares fields too
        total_engagement += compute_engagement(likes=post.likes)
        
        # Detect hiring signals
        signals = detect_hiring_keywords(post.content)
        if signals:
            for signal in signals.split(", "):
                all_hiring_signals.add(signal)
    
    # 4. Aggregate results and store in Analysis table
    avg_engagement = total_engagement / len(posts)
    hiring_signals_str = ", ".join(all_hiring_signals) if all_hiring_signals else None
    
    db_analysis = Analysis(
        company_id=company_id,
        engagement_score=avg_engagement,
        hiring_signals=hiring_signals_str
    )
    
    db.add(db_analysis)
    await db.commit()
    await db.refresh(db_analysis)
    
    return db_analysis

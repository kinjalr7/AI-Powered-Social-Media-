import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.post import Post
from typing import List, Dict, Any

async def fetch_posts(db: AsyncSession, platform: str, token: str, social_id: int) -> List[Post]:
    """
    Fetch posts from a social platform using the provided token and create Post records.
    Uses httpx for async requests.
    """
    # This is a stub for real platform API calls (e.g., Twitter API, LinkedIn API)
    # For demonstration, we'll simulate fetching posts.
    
    posts_data = []
    
    async with httpx.AsyncClient() as client:
        # In a real scenario, you'd call:
        # response = await client.get(f"https://api.{platform}.com/v2/posts", headers={"Authorization": f"Bearer {token}"})
        # posts_data = response.json()
        
        # Mocking the response for now
        if platform == "twitter":
            posts_data = [
                {"content": "Just launched our new AI platform! #AI #Tech", "likes": 120},
                {"content": "Check out our latest blog post on machine learning.", "likes": 85}
            ]
        elif platform == "linkedin":
            posts_data = [
                {"content": "We are proud to announce our partnership with Global Tech.", "likes": 450},
                {"content": "Looking for talented engineers to join our team!", "likes": 320}
            ]
        else:
            # Generic mock data
            posts_data = [
                {"content": f"Sample post from {platform}", "likes": 10}
            ]

    new_posts = []
    for data in posts_data:
        post = Post(
            social_id=social_id,
            content=data["content"],
            likes=data.get("likes", 0)
        )
        db.add(post)
        new_posts.append(post)
    
    await db.commit()
    
    # Refresh to get IDs for the response
    for post in new_posts:
        await db.refresh(post)
        
    return new_posts

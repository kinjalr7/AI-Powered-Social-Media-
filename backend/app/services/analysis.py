_sentiment_pipeline = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        from transformers import pipeline
        # Initialize the sentiment analysis pipeline on CPU
        # Using a lightweight model for better CPU performance
        _sentiment_pipeline = pipeline(
            "sentiment-analysis", 
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=-1
        )
    return _sentiment_pipeline

def sentiment_analysis(content: str) -> str:
    """
    Analyze the sentiment of a given text content using Transformers.
    """
    if not content or content.strip() == "":
        return "NEUTRAL"
    
    # Truncate content to fit model's typical 512 token limit
    truncated_content = content[:512]
    
    try:
        pipeline = get_sentiment_pipeline()
        result = pipeline(truncated_content)
        if result and len(result) > 0:
            return result[0]['label']
    except Exception as e:
        # Log error or handle gracefully
        return "NEUTRAL"
    
    return "NEUTRAL"

def compute_engagement(likes: int, comments: int = 0, shares: int = 0) -> float:
    """
    Compute a basic engagement score based on social metrics.
    """
    # Simple weighted formula
    score = (likes * 1.0) + (comments * 2.0) + (shares * 3.0)
    return float(score)

def detect_hiring_keywords(content: str) -> str:
    """
    Detect hiring-related keywords in the content and return as a string.
    """
    keywords = [
        "hiring", "job", "career", "join our team", "vacancy", 
        "recruiting", "we are looking for", "open position", "internship",
        "hiring now", "we're hiring"
    ]
    
    found = []
    content_lower = content.lower()
    for kw in keywords:
        if kw in content_lower:
            found.append(kw)
    
    return ", ".join(found) if found else ""

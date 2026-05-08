from fastapi import APIRouter, HTTPException
import httpx
import xml.etree.ElementTree as ET
import cache

router = APIRouter()

FEEDS = {
    "news": "https://www.espn.com/espn/rss/nba/news",
    "injuries": "https://www.espn.com/espn/rss/nba/news",
    "transactions": "https://www.espn.com/espn/rss/nba/news",
}
def parse_rss(xml_text: str) -> list[dict]:
    root = ET.fromstring(xml_text)
    channel = root.find("channel")
    items = []
    for item in channel.findall("item")[:20]:
        title = item.findtext("title", "")
        description = item.findtext("description", "")
        link = item.findtext("link", "")
        pub_date = item.findtext("pubDate", "")
        items.append({
            "title": title,
            "description": description,
            "link": link,
            "pubDate": pub_date,
        })
    return items

@router.get("/{feed_type}", summary="Get NBA news, injuries, or transactions")
async def get_news(feed_type: str):
    if feed_type not in FEEDS:
        raise HTTPException(status_code=400, detail=f"Invalid feed type. Choose from: {list(FEEDS.keys())}")

    key = f"news_{feed_type}"
    cached = cache.get(key)
    if cached:
        return cached

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            res = await client.get(FEEDS[feed_type], headers={"User-Agent": "Mozilla/5.0"})
            res.raise_for_status()
            items = parse_rss(res.text)
            cache.set(key, items, ttl=300)  # cache 5 mins
            return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")
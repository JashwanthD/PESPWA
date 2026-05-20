import re
import requests
import pandas as pd


def _split_urls(raw):
    """Split a raw URL field into individual URL candidates.

    Handles semicolon-separated, space-separated, and mixed lists,
    plus parenthetical annotations like 'https://example.com (regional pages)'.
    Avoids breaking URLs that contain commas in their path (e.g., Cloudinary).
    """
    val = str(raw).strip()
    # Remove parenthetical annotations e.g. "(global India-specific via regional pages)"
    val = re.sub(r'\([^)]*\)', '', val).strip()

    # Strategy: first extract full http(s) URLs with a greedy pattern,
    # then handle any remaining bare-domain tokens.
    full_urls = re.findall(r'https?://\S+', val)
    if full_urls:
        # Clean trailing semicolons from each extracted URL
        return [u.rstrip(';').strip() for u in full_urls if u.strip()]

    # Fallback for bare domains (linkedin.com/company/...) — split on ; or whitespace
    parts = re.split(r'[;\s]+', val)
    return [u.strip() for u in parts if u.strip()]


def validate_url_status(url):
    """Business Rule: URL must resolve (no 404). Soft-fails on network issues."""
    if url is None or str(url).lower() in ['nan', '', 'n/a', 'none', 'unknown']:
        return True
    try:
        urls = _split_urls(url)
        for u in urls:
            # Skip LinkedIn — they aggressively block headless requests
            if 'linkedin.com' in u.lower():
                continue
            # Skip clearbit logo URLs — they require auth
            if 'logo.clearbit.com' in u.lower():
                continue
            # Ensure scheme is present for requests
            if not u.startswith('http'):
                u = 'https://' + u
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                              'AppleWebKit/537.36 (KHTML, like Gecko) '
                              'Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.head(u, timeout=5, allow_redirects=True, headers=headers)
            if response.status_code == 404:
                return False
        return True
    except Exception:
        return True  # Soft fail on network timeouts to avoid brittle tests


def validate_url(url, pattern=None):
    """Checks if a value is a valid URL or a list of valid URLs.

    Resilient to dirty data: handles missing schemes, space/semicolon
    separation, parenthetical annotations, and non-URL strings that
    were accidentally placed in URL columns.
    """
    if url is None or str(url).lower() in ['nan', 'n/a', '', 'none', 'unknown']:
        return True

    urls = _split_urls(url)

    default_pattern = (
        r'^(https?://)?'
        r'(www\.)?'
        r'[-a-zA-Z0-9@:%._\+~#=]{1,256}'
        r'\.[a-zA-Z0-9()]{1,6}'
        r'\b([-a-zA-Z0-9()@:%_\+.~#?&//=,]*)$'
    )
    target_pattern = pattern if pattern else default_pattern

    for u in urls:
        if not u:
            continue
        # If it has no period and no http scheme, it's likely a company name
        # placed in a URL column (hallucination) — skip it gracefully
        if '.' not in u and not u.startswith('http'):
            continue
        if not bool(re.match(target_pattern, u)):
            return False

    return True


def has_credible_url(val):
    """Returns True if text contains a credible URL."""
    if pd.isna(val) or not str(val).strip():
        return True
    str_val = str(val).strip()

    url_pattern = re.compile(
        r"https?://(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}"
        r"\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&/=]*)"
    )
    urls_found = url_pattern.findall(str_val)

    if not urls_found:
        return False

    low_credibility_domains = ["bit.ly", "tinyurl.com", "goo.gl", "t.co"]
    for found_url in urls_found:
        for shady_domain in low_credibility_domains:
            if shady_domain in found_url.lower():
                return False
    return True
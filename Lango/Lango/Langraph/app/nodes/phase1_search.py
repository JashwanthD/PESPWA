import os
import requests
import json
from app.models.state import AgentState
from app.models.prompt_schema import MAPPED_SCHEMA

def web_search_node(state: AgentState) -> AgentState:
    """
    Phase 1: Web Search
    Uses Tavily to search the web for company information based on schema categories.
    Falls back to Gemini with Google Search if Tavily returns no results.
    """
    company_name = state["company_name"]
    tavily_api_key = os.environ.get("TAVILY_API_KEY")
    
    # Do 3 broad searches instead of 25 category searches to avoid huge context and rate limits
    categories = [
        "Company Overview, Products, and Business Model",
        "Financials, Leadership, and Funding",
        "Company Culture, ESG, and Tech Stack"
    ]
    
    all_snippets = []
    
    for category in categories:
        query = f"{company_name} {category}"
        category_snippets = []
        
        # Try Tavily first
        if tavily_api_key:
            print(f"Searching Tavily for: {query}")
            try:
                response = requests.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": tavily_api_key,
                        "query": query,
                        "search_depth": "basic",
                        "include_answer": False,
                        "max_results": 3
                    },
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
                data = response.json()
                
                for result in data.get("results", []):
                    snippet = result.get("content", "")
                    if snippet:
                        category_snippets.append(f"[{category}] {snippet}")
            except Exception as e:
                print(f"Error searching Tavily for {category}: {e}")
        
        # Fallback to Gemini if Tavily failed or returned no results for this category
        if not category_snippets:
            print(f"Tavily returned no results for {category}. Falling back to Gemini...")
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.1)
                
                prompt = f"Find comprehensive information about {company_name} regarding: {category}. Provide a detailed summary with facts."
                
                try:
                    # Try with search tools if possible
                    response = llm.invoke(prompt, tools=[{"google_search": {}}])
                except Exception as e:
                    print(f"Gemini with search tool failed ({e}), trying without tools...")
                    response = llm.invoke(prompt)
                
                if response.content:
                    category_snippets.append(f"[{category}] [Gemini Search] {response.content}")
            except Exception as gemini_e:
                print(f"Error calling Gemini for {category}: {gemini_e}")
        
        all_snippets.extend(category_snippets)

    # Combine snippets into a single text block
    search_context = "\n\n".join(all_snippets)
    
    # If search failed to return anything, fallback to company_context
    if not search_context.strip():
        search_context = state.get("company_context", "")
        
    state["search_snippets"] = search_context
    return state

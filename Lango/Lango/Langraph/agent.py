"""
LangSmith Studio Entry Point
============================

This file simply imports the compiled graph from the existing
workflow and exposes it as the `graph` variable so the 
LangGraph CLI can serve it to LangSmith Studio.
"""

from app.graph import app as graph

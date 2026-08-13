import streamlit as st
import pandas as pd
import numpy as np
import requests
import json

# Page config
st.set_page_config(
    page_title="CYBERTOOL Dashboard",
    page_icon="🛡️",
    layout="wide"
)

st.title("🛡️ CYBERTOOL Security Dashboard")

# Sidebar
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Overview", "Security Stats", "Audit Logs", "Settings"])

if page == "Overview":
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total Scans", "1,234", "+12%")
    with col2:
        st.metric("Vulnerabilities Found", "45", "-3%")
    with col3:
        st.metric("Threats Blocked", "678", "+8%")
    with col4:
        st.metric("System Status", "🟢 Online", "Stable")
    
    # Chart
    st.subheader("Security Trends")
    data = pd.DataFrame({
        'Day': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'Threats': np.random.randint(10, 50, 7),
        'Scans': np.random.randint(100, 300, 7)
    })
    st.line_chart(data.set_index('Day'))

elif page == "Security Stats":
    st.subheader("Security Statistics")
    
    # Sample data
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Threat Categories")
        categories = pd.DataFrame({
            'Category': ['Malware', 'Phishing', 'Ransomware', 'DDoS', 'Other'],
            'Count': [145, 98, 67, 45, 32]
        })
        st.bar_chart(categories.set_index('Category'))
    
    with col2:
        st.subheader("Security Score")
        score = 85
        st.progress(score / 100)
        st.write(f"Overall Security Score: {score}%")

elif page == "Audit Logs":
    st.subheader("Recent Audit Logs")
    
    # Sample logs
    logs = pd.DataFrame({
        'Timestamp': pd.date_range('2026-08-12', periods=10, freq='H'),
        'User': ['admin', 'user1', 'user2', 'admin', 'user3', 'user1', 'admin', 'user2', 'user3', 'admin'],
        'Action': ['Login', 'Scan', 'Report', 'Delete', 'Login', 'Scan', 'Settings', 'Report', 'Login', 'Scan'],
        'Status': ['Success', 'Success', 'Failed', 'Success', 'Success', 'Warning', 'Success', 'Success', 'Failed', 'Success']
    })
    st.dataframe(logs)

elif page == "Settings":
    st.subheader("Settings")
    
    st.checkbox("Enable Auto-Scan")
    st.slider("Scan Frequency (hours)", 1, 24, 6)
    st.selectbox("Log Level", ["DEBUG", "INFO", "WARNING", "ERROR"])
    
    if st.button("Save Settings"):
        st.success("Settings saved successfully!")
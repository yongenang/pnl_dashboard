# shopify_report_app.py
import requests
import pandas as pd
from flask import Flask, render_template, request, jsonify
import matplotlib.pyplot as plt
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)

# Shopify Credentials (loaded from .env)
SHOPIFY_STORE = os.getenv("SHOPIFY_STORE")
SHOPIFY_TOKEN = os.getenv("SHOPIFY_TOKEN")
API_VERSION = os.getenv("SHOPIFY_API_VERSION", "2025-07")

# Directory to store generated plots
os.makedirs("static", exist_ok=True)

def fetch_shopify_orders():
    url = f"https://{SHOPIFY_STORE}.myshopify.com/admin/api/{API_VERSION}/orders.json"
    headers = {"X-Shopify-Access-Token": SHOPIFY_TOKEN}

    orders = []
    limit = 250
    params = {"limit": limit, "status": "any", "order": "created_at desc"}

    while url:
        response = requests.get(url, headers=headers, params=params)
        data = response.json()
        batch = data.get("orders", [])
        orders.extend(batch)

        # Pagination
        link_header = response.headers.get("Link", "")
        next_url = None
        if 'rel="next"' in link_header:
            parts = link_header.split(",")
            for part in parts:
                if 'rel="next"' in part:
                    next_url = part.split(";")[0].strip()[1:-1]
                    break
        url = next_url
        params = {}

    # Parse data
    data = []
    for order in orders:
        if "created_at" not in order:
            continue #skip if no date
          
        customer = order.get("customer", {})
        full_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}".strip()
        customer_name = full_name if full_name else customer.get("email", "Guest")
    
    data.append({
        "Order #": order.get("order_number", "N/A"),
        "Date": order("created_at"),
        "Customer": customer_name,
        "Email": customer.get("email", "Guest"),
        "Total Price": float(order("total_price", 0)),
        "Financial Status": order.get("financial_status", "unknown"),
        "Currency": order.get("currency", "N/A")
        })

    #Build DataFrame
    df = pd.DataFrame(data)
    if df.empty:
        return df
    
    df["Date"] = pd.to_datetime(df["Date"], utc=True)
    df["Month"] = df["Date"].dt.strftime("%Y-%m")
    return df

@app.route("/")
def index():
    df = fetch_shopify_orders()
    print("Orders DataFrame preview:\n", df.head())  # 👈 Shows the first 5 rows
    print("Extracted months list:\n", df['Month'].unique())  # 👈 Shows available months
    months = sorted(df["Month"].unique(), reverse=True)
    return render_template("index.html", months=months)

@app.route("/chart", methods=["POST"])
def generate_chart():
    month = request.json.get("month")
    df = fetch_shopify_orders()
    df_month = df[df["Month"] == month]

    if df_month.empty:
        return jsonify({"error": f"No data found for {month}"}), 404

    df_month["Day"] = df_month["Date"].dt.strftime("%Y-%m-%d")
    daily_sales = df_month.groupby("Day")["Total Price"].sum().reset_index()

    # Plot
    plt.figure(figsize=(12, 6))
    plt.plot(daily_sales["Day"], daily_sales["Total Price"], marker='o', color='royalblue')
    plt.title(f"Daily Sales for {month}")
    plt.xlabel("Day")
    plt.ylabel("Revenue (MYR)")
    plt.xticks(rotation=45)
    plt.grid(True)
    plot_path = f"static/chart_{month}.png"
    plt.tight_layout()
    plt.savefig(plot_path)
    plt.close()

    return jsonify({"chart_url": plot_path})

if __name__ == '__main__':
    app.run(debug=True)
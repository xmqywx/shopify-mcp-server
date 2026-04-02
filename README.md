# shopify-store-mcp

[![npm version](https://img.shields.io/npm/v/@xmqywxkris/shopify-store-mcp.svg)](https://www.npmjs.com/package/@xmqywxkris/shopify-store-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Model Context Protocol (MCP) server that lets AI agents (Claude, GPT, etc.) manage Shopify stores. Products, orders, inventory, customers, and analytics — all through natural language.

## What It Does

Connect your Shopify store to Claude Desktop, Cursor, or any MCP-compatible AI tool and manage your store with natural language:

- "Show me my top-selling products"
- "Create a new product called 'Summer T-Shirt' at $29.99"
- "How many orders did I get this week?"
- "Adjust inventory for SKU-123, add 50 units"
- "Give me a complete store overview"

## Available Tools (16)

### Products

| Tool | Description |
|------|-------------|
| `list_products` | List products with filters (title, type, status) |
| `get_product` | Get detailed product info |
| `create_product` | Create new products with variants |
| `update_product` | Update product details |
| `delete_product` | Remove a product |
| `count_products` | Get total product count |

### Orders

| Tool | Description |
|------|-------------|
| `list_orders` | List orders with status/date filters |
| `get_order` | Get full order details |
| `count_orders` | Count orders by status |

### Inventory

| Tool | Description |
|------|-------------|
| `list_inventory` | View inventory levels |
| `adjust_inventory` | Adjust stock quantities |
| `list_locations` | List warehouse locations |

### Customers

| Tool | Description |
|------|-------------|
| `list_customers` | Search and list customers |
| `count_customers` | Get total customer count |

### Analytics

| Tool | Description |
|------|-------------|
| `get_shop_info` | Store info (plan, currency, etc.) |
| `store_overview` | Full dashboard with stats |

## Quick Start

### 1. Get Your Shopify Access Token

Go to your Shopify Admin > Settings > Apps and sales channels > Develop apps > Create an app > Configure Admin API scopes.

Required scopes:
- `read_products`, `write_products`
- `read_orders`
- `read_inventory`, `write_inventory`
- `read_customers`

### 2. Install

```bash
npm install -g @xmqywxkris/shopify-store-mcp
```

Or use directly with npx:

```bash
npx @xmqywxkris/shopify-store-mcp
```

### 3. Configure with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": ["-y", "@xmqywxkris/shopify-store-mcp"],
      "env": {
        "SHOPIFY_STORE_DOMAIN": "your-store.myshopify.com",
        "SHOPIFY_ACCESS_TOKEN": "shpat_your_token_here"
      }
    }
  }
}
```

### 4. Configure with Claude Code

```bash
claude mcp add shopify -- npx -y shopify-store-mcp \
  --env SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \
  --env SHOPIFY_ACCESS_TOKEN=shpat_your_token
```

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SHOPIFY_STORE_DOMAIN` | Yes | Your store domain (e.g., `mystore.myshopify.com`) |
| `SHOPIFY_ACCESS_TOKEN` | Yes | Admin API access token |
| `SHOPIFY_API_VERSION` | No | API version (default: `2025-01`) |

## Usage Examples

**List all active products:**
> "Show me all active products in my store"

**Create a product with variants:**
> "Create a product called 'Classic Hoodie' with sizes S, M, L, XL at $49.99"

**Inventory management:**
> "Check inventory for all products at the main warehouse and flag anything below 10 units"

**Store analytics:**
> "Give me a store overview — total products, recent orders, and revenue this month"

**Bulk operations:**
> "Update all products in the 'Winter' collection to have a 20% discount"

## Use Cases

### For Store Owners
- Manage products and inventory through AI chat
- Get quick store analytics and summaries
- Bulk operations via natural language

### For Developers
- Build AI-powered Shopify automation
- Integrate store management into AI workflows
- Create custom AI agents for e-commerce

### For Agencies
- Manage multiple client stores via AI
- Automate routine store operations
- Generate reports and insights

## Development

```bash
git clone https://github.com/xmqywx/shopify-store-mcp.git
cd shopify-store-mcp
npm install
npm run dev
```

## Cursor Plugin

Install directly in Cursor IDE:

1. Open Cursor → Settings → Plugins
2. Search "shopify-store-mcp"
3. Click Install
4. Add your Shopify credentials in the MCP server settings

Or manually: clone this repo and open it in Cursor — the plugin auto-discovers.

## License

MIT

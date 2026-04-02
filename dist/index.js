#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient, listProducts, getProduct, createProduct, updateProduct, deleteProduct, getProductCount, listOrders, getOrder, getOrderCount, listInventoryLevels, adjustInventory, listLocations, listCustomers, getCustomerCount, getShopInfo, } from "./shopify-client.js";
const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-01";
if (!storeDomain || !accessToken) {
    console.error("Error: SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables are required.");
    console.error("Example:");
    console.error('  SHOPIFY_STORE_DOMAIN="mystore.myshopify.com"');
    console.error('  SHOPIFY_ACCESS_TOKEN="shpat_xxxxx"');
    process.exit(1);
}
const client = createClient({ storeDomain, accessToken, apiVersion });
const server = new McpServer({
    name: "shopify-store-mcp",
    version: "1.0.0",
});
// ============================================================
// PRODUCTS
// ============================================================
server.tool("list_products", "List products in the Shopify store with optional filters", {
    limit: z.number().min(1).max(250).optional().describe("Max products to return (1-250, default 50)"),
    title: z.string().optional().describe("Filter by product title"),
    product_type: z.string().optional().describe("Filter by product type"),
    status: z.enum(["active", "archived", "draft"]).optional().describe("Filter by status"),
}, async (params) => {
    const { limit, ...rest } = params;
    const products = await listProducts(client, { limit: limit || 50, ...rest });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(products.map((p) => ({
                    id: p.id,
                    title: p.title,
                    status: p.status,
                    product_type: p.product_type,
                    vendor: p.vendor,
                    variants_count: p.variants?.length || 0,
                    price_range: p.variants?.length > 0
                        ? `${Math.min(...p.variants.map((v) => Number(v.price)))} - ${Math.max(...p.variants.map((v) => Number(v.price)))}`
                        : "N/A",
                    created_at: p.created_at,
                    updated_at: p.updated_at,
                })), null, 2),
            },
        ],
    };
});
server.tool("get_product", "Get detailed information about a specific product", { product_id: z.string().describe("The product ID") }, async ({ product_id }) => {
    const product = await getProduct(client, product_id);
    return { content: [{ type: "text", text: JSON.stringify(product, null, 2) }] };
});
server.tool("create_product", "Create a new product in the Shopify store", {
    title: z.string().describe("Product title"),
    body_html: z.string().optional().describe("Product description in HTML"),
    vendor: z.string().optional().describe("Product vendor"),
    product_type: z.string().optional().describe("Product type/category"),
    tags: z.string().optional().describe("Comma-separated tags"),
    status: z.enum(["active", "draft", "archived"]).optional().describe("Product status (default: draft)"),
    variants: z
        .array(z.object({
        price: z.string().describe("Variant price"),
        sku: z.string().optional().describe("SKU"),
        inventory_quantity: z.number().optional().describe("Initial stock quantity"),
        option1: z.string().optional().describe("Option 1 value (e.g., size)"),
        option2: z.string().optional().describe("Option 2 value (e.g., color)"),
    }))
        .optional()
        .describe("Product variants with pricing"),
}, async (params) => {
    const product = await createProduct(client, {
        ...params,
        status: params.status || "draft",
    });
    return {
        content: [
            {
                type: "text",
                text: `Product created successfully!\nID: ${product.id}\nTitle: ${product.title}\nStatus: ${product.status}\nURL: https://${storeDomain}/admin/products/${product.id}`,
            },
        ],
    };
});
server.tool("update_product", "Update an existing product's information", {
    product_id: z.string().describe("The product ID to update"),
    title: z.string().optional().describe("New title"),
    body_html: z.string().optional().describe("New description in HTML"),
    vendor: z.string().optional().describe("New vendor"),
    product_type: z.string().optional().describe("New product type"),
    tags: z.string().optional().describe("New comma-separated tags"),
    status: z.enum(["active", "draft", "archived"]).optional().describe("New status"),
}, async ({ product_id, ...updates }) => {
    const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
    const product = await updateProduct(client, product_id, filtered);
    return {
        content: [
            {
                type: "text",
                text: `Product ${product.id} updated successfully.\nTitle: ${product.title}\nStatus: ${product.status}`,
            },
        ],
    };
});
server.tool("delete_product", "Delete a product from the store (irreversible)", { product_id: z.string().describe("The product ID to delete") }, async ({ product_id }) => {
    await deleteProduct(client, product_id);
    return {
        content: [{ type: "text", text: `Product ${product_id} deleted successfully.` }],
    };
});
server.tool("count_products", "Get the total number of products in the store", {}, async () => {
    const count = await getProductCount(client);
    return { content: [{ type: "text", text: `Total products: ${count}` }] };
});
// ============================================================
// ORDERS
// ============================================================
server.tool("list_orders", "List orders with optional filters for status, date range, etc.", {
    limit: z.number().min(1).max(250).optional().describe("Max orders to return (default 50)"),
    status: z.enum(["open", "closed", "cancelled", "any"]).optional().describe("Order status filter"),
    financial_status: z
        .enum(["authorized", "pending", "paid", "partially_paid", "refunded", "voided", "any"])
        .optional()
        .describe("Payment status filter"),
    fulfillment_status: z
        .enum(["shipped", "partial", "unshipped", "unfulfilled", "any"])
        .optional()
        .describe("Fulfillment status filter"),
    created_at_min: z.string().optional().describe("Show orders created after date (ISO 8601)"),
    created_at_max: z.string().optional().describe("Show orders created before date (ISO 8601)"),
}, async (params) => {
    const { limit: orderLimit, ...orderRest } = params;
    const orders = await listOrders(client, { limit: orderLimit || 50, ...orderRest });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(orders.map((o) => ({
                    id: o.id,
                    order_number: o.order_number,
                    name: o.name,
                    total_price: o.total_price,
                    currency: o.currency,
                    financial_status: o.financial_status,
                    fulfillment_status: o.fulfillment_status,
                    customer: o.customer
                        ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim()
                        : "Guest",
                    items_count: o.line_items?.length || 0,
                    created_at: o.created_at,
                })), null, 2),
            },
        ],
    };
});
server.tool("get_order", "Get detailed information about a specific order", { order_id: z.string().describe("The order ID") }, async ({ order_id }) => {
    const order = await getOrder(client, order_id);
    return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }] };
});
server.tool("count_orders", "Get order counts by status", {
    status: z.enum(["open", "closed", "cancelled", "any"]).optional().describe("Filter by status"),
    financial_status: z
        .enum(["authorized", "pending", "paid", "partially_paid", "refunded", "voided", "any"])
        .optional(),
}, async (params) => {
    const count = await getOrderCount(client, params);
    return {
        content: [
            {
                type: "text",
                text: `Orders count: ${count}${params.status ? ` (status: ${params.status})` : ""}${params.financial_status ? ` (financial: ${params.financial_status})` : ""}`,
            },
        ],
    };
});
// ============================================================
// INVENTORY
// ============================================================
server.tool("list_inventory", "List inventory levels for items or locations", {
    location_ids: z.string().optional().describe("Comma-separated location IDs"),
    inventory_item_ids: z.string().optional().describe("Comma-separated inventory item IDs"),
    limit: z.number().min(1).max(250).optional().describe("Max results"),
}, async (params) => {
    const levels = await listInventoryLevels(client, params);
    return { content: [{ type: "text", text: JSON.stringify(levels, null, 2) }] };
});
server.tool("adjust_inventory", "Adjust inventory quantity for an item at a location", {
    inventory_item_id: z.string().describe("Inventory item ID"),
    location_id: z.string().describe("Location ID"),
    adjustment: z.number().describe("Quantity adjustment (positive to add, negative to remove)"),
}, async ({ inventory_item_id, location_id, adjustment }) => {
    const level = await adjustInventory(client, inventory_item_id, location_id, adjustment);
    return {
        content: [
            {
                type: "text",
                text: `Inventory adjusted. Item ${level.inventory_item_id} at location ${level.location_id}: available = ${level.available}`,
            },
        ],
    };
});
server.tool("list_locations", "List all warehouse/fulfillment locations", {}, async () => {
    const locations = await listLocations(client);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(locations.map((l) => ({
                    id: l.id,
                    name: l.name,
                    address: `${l.address1 || ""}, ${l.city || ""}, ${l.country || ""}`.trim(),
                    active: l.active,
                })), null, 2),
            },
        ],
    };
});
// ============================================================
// CUSTOMERS
// ============================================================
server.tool("list_customers", "List customers with optional search query", {
    limit: z.number().min(1).max(250).optional().describe("Max customers to return"),
    query: z.string().optional().describe("Search query (name, email, etc.)"),
}, async (params) => {
    const { limit: custLimit, ...custRest } = params;
    const customers = await listCustomers(client, { limit: custLimit || 50, ...custRest });
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(customers.map((c) => ({
                    id: c.id,
                    name: `${c.first_name || ""} ${c.last_name || ""}`.trim(),
                    email: c.email,
                    orders_count: c.orders_count,
                    total_spent: c.total_spent,
                    created_at: c.created_at,
                })), null, 2),
            },
        ],
    };
});
server.tool("count_customers", "Get total customer count", {}, async () => {
    const count = await getCustomerCount(client);
    return { content: [{ type: "text", text: `Total customers: ${count}` }] };
});
// ============================================================
// SHOP INFO & ANALYTICS
// ============================================================
server.tool("get_shop_info", "Get general information about the Shopify store (name, domain, plan, currency, etc.)", {}, async () => {
    const shop = await getShopInfo(client);
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    name: shop.name,
                    domain: shop.domain,
                    myshopify_domain: shop.myshopify_domain,
                    email: shop.email,
                    plan_name: shop.plan_name,
                    currency: shop.currency,
                    country: shop.country_name,
                    timezone: shop.timezone,
                    created_at: shop.created_at,
                }, null, 2),
            },
        ],
    };
});
server.tool("store_overview", "Get a comprehensive overview of the store including product count, order count, customer count, and shop info", {}, async () => {
    const [shop, productCount, orderCount, customerCount] = await Promise.all([
        getShopInfo(client),
        getProductCount(client),
        getOrderCount(client, { status: "any" }),
        getCustomerCount(client),
    ]);
    const overview = {
        store_name: shop.name,
        domain: shop.domain,
        plan: shop.plan_name,
        currency: shop.currency,
        country: shop.country_name,
        stats: {
            total_products: productCount,
            total_orders: orderCount,
            total_customers: customerCount,
        },
    };
    return { content: [{ type: "text", text: JSON.stringify(overview, null, 2) }] };
});
// ============================================================
// START SERVER
// ============================================================
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Shopify MCP Server running for store: ${storeDomain}`);
}
main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});

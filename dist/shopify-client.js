import { createAdminRestApiClient } from "@shopify/admin-api-client";
export function createClient(config) {
    const client = createAdminRestApiClient({
        storeDomain: config.storeDomain,
        accessToken: config.accessToken,
        apiVersion: config.apiVersion || "2025-01",
    });
    return client;
}
// --- Product Operations ---
export async function listProducts(client, params = {}) {
    const query = new URLSearchParams();
    if (params.limit)
        query.set("limit", String(params.limit));
    if (params.since_id)
        query.set("since_id", params.since_id);
    if (params.title)
        query.set("title", params.title);
    if (params.product_type)
        query.set("product_type", params.product_type);
    if (params.status)
        query.set("status", params.status);
    const qs = query.toString();
    const response = await client.get(`products.json${qs ? `?${qs}` : ""}`);
    const body = (await response.json());
    return body.products;
}
export async function getProduct(client, productId) {
    const response = await client.get(`products/${productId}.json`);
    const body = (await response.json());
    return body.product;
}
export async function createProduct(client, product) {
    const response = await client.post("products.json", {
        data: { product },
    });
    const body = (await response.json());
    return body.product;
}
export async function updateProduct(client, productId, updates) {
    const response = await client.put(`products/${productId}.json`, {
        data: { product: { id: Number(productId), ...updates } },
    });
    const body = (await response.json());
    return body.product;
}
export async function deleteProduct(client, productId) {
    await client.delete(`products/${productId}.json`);
    return { success: true, id: productId };
}
export async function getProductCount(client) {
    const response = await client.get("products/count.json");
    const body = (await response.json());
    return body.count;
}
// --- Order Operations ---
export async function listOrders(client, params = {}) {
    const query = new URLSearchParams();
    if (params.limit)
        query.set("limit", String(params.limit));
    if (params.status)
        query.set("status", params.status);
    if (params.financial_status)
        query.set("financial_status", params.financial_status);
    if (params.fulfillment_status)
        query.set("fulfillment_status", params.fulfillment_status);
    if (params.since_id)
        query.set("since_id", params.since_id);
    if (params.created_at_min)
        query.set("created_at_min", params.created_at_min);
    if (params.created_at_max)
        query.set("created_at_max", params.created_at_max);
    const qs = query.toString();
    const response = await client.get(`orders.json${qs ? `?${qs}` : ""}`);
    const body = (await response.json());
    return body.orders;
}
export async function getOrder(client, orderId) {
    const response = await client.get(`orders/${orderId}.json`);
    const body = (await response.json());
    return body.order;
}
export async function getOrderCount(client, params = {}) {
    const query = new URLSearchParams();
    if (params.status)
        query.set("status", params.status);
    if (params.financial_status)
        query.set("financial_status", params.financial_status);
    const qs = query.toString();
    const response = await client.get(`orders/count.json${qs ? `?${qs}` : ""}`);
    const body = (await response.json());
    return body.count;
}
// --- Inventory Operations ---
export async function listInventoryLevels(client, params) {
    const query = new URLSearchParams();
    if (params.location_ids)
        query.set("location_ids", params.location_ids);
    if (params.inventory_item_ids)
        query.set("inventory_item_ids", params.inventory_item_ids);
    if (params.limit)
        query.set("limit", String(params.limit));
    const qs = query.toString();
    const response = await client.get(`inventory_levels.json${qs ? `?${qs}` : ""}`);
    const body = (await response.json());
    return body.inventory_levels;
}
export async function adjustInventory(client, inventoryItemId, locationId, adjustment) {
    const response = await client.post("inventory_levels/adjust.json", {
        data: {
            location_id: Number(locationId),
            inventory_item_id: Number(inventoryItemId),
            available_adjustment: adjustment,
        },
    });
    const body = (await response.json());
    return body.inventory_level;
}
export async function listLocations(client) {
    const response = await client.get("locations.json");
    const body = (await response.json());
    return body.locations;
}
// --- Customer Operations ---
export async function listCustomers(client, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.limit)
        queryParams.set("limit", String(params.limit));
    if (params.since_id)
        queryParams.set("since_id", params.since_id);
    if (params.query)
        queryParams.set("query", params.query);
    const qs = queryParams.toString();
    const response = await client.get(`customers.json${qs ? `?${qs}` : ""}`);
    const body = (await response.json());
    return body.customers;
}
export async function getCustomerCount(client) {
    const response = await client.get("customers/count.json");
    const body = (await response.json());
    return body.count;
}
// --- Analytics / Shop Info ---
export async function getShopInfo(client) {
    const response = await client.get("shop.json");
    const body = (await response.json());
    return body.shop;
}

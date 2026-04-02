export interface ShopifyConfig {
    storeDomain: string;
    accessToken: string;
    apiVersion?: string;
}
export declare function createClient(config: ShopifyConfig): import("@shopify/admin-api-client").AdminRestApiClient;
export type ShopifyClient = ReturnType<typeof createClient>;
export declare function listProducts(client: ShopifyClient, params?: {
    limit?: number;
    since_id?: string;
    title?: string;
    product_type?: string;
    status?: string;
}): Promise<any>;
export declare function getProduct(client: ShopifyClient, productId: string): Promise<any>;
export declare function createProduct(client: ShopifyClient, product: Record<string, any>): Promise<any>;
export declare function updateProduct(client: ShopifyClient, productId: string, updates: Record<string, any>): Promise<any>;
export declare function deleteProduct(client: ShopifyClient, productId: string): Promise<{
    success: boolean;
    id: string;
}>;
export declare function getProductCount(client: ShopifyClient): Promise<any>;
export declare function listOrders(client: ShopifyClient, params?: {
    limit?: number;
    status?: string;
    financial_status?: string;
    fulfillment_status?: string;
    since_id?: string;
    created_at_min?: string;
    created_at_max?: string;
}): Promise<any>;
export declare function getOrder(client: ShopifyClient, orderId: string): Promise<any>;
export declare function getOrderCount(client: ShopifyClient, params?: {
    status?: string;
    financial_status?: string;
}): Promise<any>;
export declare function listInventoryLevels(client: ShopifyClient, params: {
    location_ids?: string;
    inventory_item_ids?: string;
    limit?: number;
}): Promise<any>;
export declare function adjustInventory(client: ShopifyClient, inventoryItemId: string, locationId: string, adjustment: number): Promise<any>;
export declare function listLocations(client: ShopifyClient): Promise<any>;
export declare function listCustomers(client: ShopifyClient, params?: {
    limit?: number;
    since_id?: string;
    query?: string;
}): Promise<any>;
export declare function getCustomerCount(client: ShopifyClient): Promise<any>;
export declare function getShopInfo(client: ShopifyClient): Promise<any>;

import { sql } from "@/lib/db";

let statusTimestampMigration: Promise<void> | null = null;

export function ensureOrderStatusTimestamps() {
    if (!statusTimestampMigration) {
        statusTimestampMigration = (async () => {
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ`;
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ`;
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ`;
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ`;
            await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ`;

            await sql`
                UPDATE orders
                SET
                    placed_at = COALESCE(placed_at, created_at),
                    confirmed_at = CASE
                        WHEN order_status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED')
                        THEN COALESCE(confirmed_at, created_at)
                        ELSE confirmed_at
                    END,
                    shipped_at = CASE
                        WHEN order_status IN ('SHIPPED', 'DELIVERED')
                        THEN COALESCE(shipped_at, created_at)
                        ELSE shipped_at
                    END,
                    delivered_at = CASE
                        WHEN order_status = 'DELIVERED'
                        THEN COALESCE(delivered_at, created_at)
                        ELSE delivered_at
                    END,
                    cancelled_at = CASE
                        WHEN order_status = 'CANCELLED'
                        THEN COALESCE(cancelled_at, created_at)
                        ELSE cancelled_at
                    END
                WHERE placed_at IS NULL
                   OR (order_status IN ('CONFIRMED', 'SHIPPED', 'DELIVERED') AND confirmed_at IS NULL)
                   OR (order_status IN ('SHIPPED', 'DELIVERED') AND shipped_at IS NULL)
                   OR (order_status = 'DELIVERED' AND delivered_at IS NULL)
                   OR (order_status = 'CANCELLED' AND cancelled_at IS NULL)
            `;
        })().catch((error) => {
            statusTimestampMigration = null;
            throw error;
        });
    }

    return statusTimestampMigration;
}
export function getSellingPrice(price: unknown, discountPrice: unknown) {
    return Number(price) - Number(discountPrice || 0);
}

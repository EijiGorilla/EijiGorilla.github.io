function calculateTotalPriceJS(product, quantity, discount) {
    const priceWithoutDiscount = product.type * quantity;
    const discountAmount = priceWithoutDiscount * discount;
    return priceWithoutDiscount - discountAmount;
}
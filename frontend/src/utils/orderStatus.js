export function getOrderStatus(order) {
    if (order.isDelivered) return 'Delivered'
    if (order.isPaid) return 'Shipped'
    return 'Being Processed'
}

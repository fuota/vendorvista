from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from base.models import Order, OrderItem, ShippingAddress, Product
from base.serializers import OrderSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def addOrderItems(request):
    user = request.user
    data = request.data
    orderItems = data['orderItems']

    if not orderItems:
        return Response({'detail': 'No Order Items'}, status=status.HTTP_400_BAD_REQUEST)

    order = Order.objects.create(
        user=user,
        paymentMethod=data['paymentMethod'],
        taxPrice=data['taxPrice'],
        shippingPrice=data['shippingPrice'],
        totalPrice=data['totalPrice'],
    )

    ShippingAddress.objects.create(
        order=order,
        address=data['shippingAddress']['address'],
        city=data['shippingAddress']['city'],
        postalCode=data['shippingAddress']['postalCode'],
        country=data['shippingAddress']['country'],
        shippingPrice=data['shippingPrice'],
    )

    for i in orderItems:
        product = Product.objects.get(_id=i['product'])
        OrderItem.objects.create(
            product=product,
            order=order,
            name=product.name,
            qty=i['qty'],
            price=i['price'],
            image=i['image'],
        )

        product.countInStock -= int(i['qty'])
        if product.countInStock <= 0:
            product.countInStock = 0
            product.isSold = True
        product.save()

    serializer = OrderSerializer(order, many=False)
    return Response(serializer.data)


def _is_seller_of(order, user):
    return order.orderitem_set.filter(product__user=user).exists()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyOrders(request):
    orders = Order.objects.filter(user=request.user).order_by('-createdAt')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMySales(request):
    orders = Order.objects.filter(orderitem__product__user=request.user).distinct().order_by('-createdAt')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrderById(request, pk):
    user = request.user
    try:
        order = Order.objects.get(_id=pk)
    except Order.DoesNotExist:
        return Response({'detail': 'Order does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if user.is_staff or order.user == user or _is_seller_of(order, user):
        serializer = OrderSerializer(order, many=False)
        return Response(serializer.data)

    return Response({'detail': 'Not authorized to view this order'}, status=status.HTTP_403_FORBIDDEN)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateOrderToPaid(request, pk):
    user = request.user
    try:
        order = Order.objects.get(_id=pk)
    except Order.DoesNotExist:
        return Response({'detail': 'Order does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if not (user.is_staff or order.user == user):
        return Response({'detail': 'Not authorized to update this order'}, status=status.HTTP_403_FORBIDDEN)

    order.isPaid = True
    order.paidAt = timezone.now()
    order.save()

    serializer = OrderSerializer(order, many=False)
    return Response(serializer.data)

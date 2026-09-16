from django.contrib.auth.models import User
from django.db.models import Avg
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from base.models import Product, OrderItem, SellerRating
from base.serializers import ProductSerializer, get_avatar_url


def _has_bought_from(buyer, seller):
    return OrderItem.objects.filter(order__user=buyer, product__user=seller).exists()


@api_view(['GET'])
def getSellerProfile(request, pk):
    try:
        seller = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Seller does not exist'}, status=status.HTTP_404_NOT_FOUND)

    name = seller.first_name or seller.email
    listingsCount = Product.objects.filter(user=seller).count()
    ratingResult = SellerRating.objects.filter(seller=seller).aggregate(avg=Avg('rating'))
    ratingAverage = round(ratingResult['avg'], 1) if ratingResult['avg'] is not None else None
    ratingCount = SellerRating.objects.filter(seller=seller).count()

    canRate = False
    myRating = None
    if request.user.is_authenticated and request.user != seller:
        canRate = _has_bought_from(request.user, seller)
        existing = SellerRating.objects.filter(seller=seller, buyer=request.user).first()
        if existing:
            myRating = {'rating': existing.rating, 'comment': existing.comment}

    return Response({
        'id': seller.id,
        'name': name,
        'email': seller.email,
        'avatar': get_avatar_url(seller),
        'dateJoined': seller.date_joined,
        'listingsCount': listingsCount,
        'ratingAverage': ratingAverage,
        'ratingCount': ratingCount,
        'canRate': canRate,
        'myRating': myRating,
    })


@api_view(['GET'])
def getSellerListings(request, pk):
    try:
        seller = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Seller does not exist'}, status=status.HTTP_404_NOT_FOUND)

    products = Product.objects.filter(user=seller, isSold=False).order_by('-createdAt')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def rateSeller(request, pk):
    try:
        seller = User.objects.get(id=pk)
    except User.DoesNotExist:
        return Response({'detail': 'Seller does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if request.user == seller:
        return Response({'detail': "You can't rate yourself"}, status=status.HTTP_400_BAD_REQUEST)

    if not _has_bought_from(request.user, seller):
        return Response({'detail': 'You can only rate sellers you have bought from'}, status=status.HTTP_403_FORBIDDEN)

    rating = request.data.get('rating')
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        rating = None
    if rating is None or rating < 1 or rating > 5:
        return Response({'detail': 'Rating must be an integer from 1 to 5'}, status=status.HTTP_400_BAD_REQUEST)

    comment = request.data.get('comment', '')

    SellerRating.objects.update_or_create(
        seller=seller,
        buyer=request.user,
        defaults={'rating': rating, 'comment': comment},
    )

    return Response({'detail': 'Rating submitted'})

from django.db import transaction
from django.db.models import Avg, Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


from base.models import Product, ProductImage, ProductVideo, OrderItem, Review, SellerRating
from base.serializers import ProductSerializer

ALLOWED_VIDEO_EXTENSIONS = ('.mp4', '.mov', '.webm', '.ogg')
PRODUCT_NAME_MAX_LENGTH = 80


def _is_allowed_video(file):
    content_type_ok = (file.content_type or '').startswith('video/')
    extension_ok = file.name.lower().endswith(ALLOWED_VIDEO_EXTENSIONS)
    return content_type_ok and extension_ok


@api_view()
def getProducts(request):
    keyword = request.query_params.get('keyword')
    category = request.query_params.get('category')
    products = Product.objects.filter(isSold=False).select_related('user').prefetch_related('images', 'videos')

    if keyword:
        products = products.filter(
            Q(name__icontains=keyword) |
            Q(brand__icontains=keyword) |
            Q(category__icontains=keyword) |
            Q(description__icontains=keyword)
        )

    if category:
        products = products.filter(category=category)

    products = products.order_by('-createdAt')

    rating_stats = SellerRating.objects.values('seller').annotate(avg=Avg('rating'), count=Count('id'))
    rating_map = {row['seller']: (row['avg'], row['count']) for row in rating_stats}

    serializer = ProductSerializer(products, many=True, context={'rating_map': rating_map})
    return Response(serializer.data)


@api_view()
def getProduct(request, pk):
    product = Product.objects.get(_id=pk)
    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyListings(request):
    products = Product.objects.filter(user=request.user).order_by('-createdAt')
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProduct(request):
    data = request.data
    images = request.FILES.getlist('images')
    videos = request.FILES.getlist('videos')

    if not images:
        return Response({'detail': 'At least one photo is required'}, status=status.HTTP_400_BAD_REQUEST)

    if len(data.get('name') or '') > PRODUCT_NAME_MAX_LENGTH:
        return Response({'detail': f'Title must be {PRODUCT_NAME_MAX_LENGTH} characters or fewer'}, status=status.HTTP_400_BAD_REQUEST)

    for video in videos:
        if not _is_allowed_video(video):
            return Response({'detail': f'Unsupported video file: {video.name}'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        product = Product.objects.create(
            user=request.user,
            name=data.get('name'),
            brand=data.get('brand', ''),
            category=data.get('category', ''),
            condition=data.get('condition'),
            color=data.get('color', ''),
            description=data.get('description', ''),
            price=data.get('price') or 0,
            countInStock=data.get('countInStock') or 1,
            image=images[0],
        )

        for image in images:
            image.seek(0)
            ProductImage.objects.create(product=product, image=image)

        for video in videos:
            ProductVideo.objects.create(product=product, video=video)

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Listing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if product.user != request.user:
        return Response({'detail': 'Not authorized to edit this listing'}, status=status.HTTP_403_FORBIDDEN)

    images = request.FILES.getlist('images')
    videos = request.FILES.getlist('videos')
    data = request.data

    if 'name' in data and len(data.get('name') or '') > PRODUCT_NAME_MAX_LENGTH:
        return Response({'detail': f'Title must be {PRODUCT_NAME_MAX_LENGTH} characters or fewer'}, status=status.HTTP_400_BAD_REQUEST)

    for video in videos:
        if not _is_allowed_video(video):
            return Response({'detail': f'Unsupported video file: {video.name}'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        product.name = data.get('name', product.name)
        product.brand = data.get('brand', product.brand)
        product.category = data.get('category', product.category)
        product.condition = data.get('condition', product.condition)
        product.color = data.get('color', product.color)
        product.description = data.get('description', product.description)
        product.price = data.get('price', product.price)
        product.countInStock = data.get('countInStock', product.countInStock)
        product.save()

        for image in images:
            image.seek(0)
            ProductImage.objects.create(product=product, image=image)
            if not product.image:
                image.seek(0)
                product.image = image
                product.save()

        for video in videos:
            ProductVideo.objects.create(product=product, video=video)

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProductImage(request, pk, image_id):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Listing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if product.user != request.user:
        return Response({'detail': 'Not authorized to edit this listing'}, status=status.HTTP_403_FORBIDDEN)

    try:
        image = product.images.get(_id=image_id)
    except ProductImage.DoesNotExist:
        return Response({'detail': 'Image does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if product.images.count() <= 1:
        return Response({'detail': 'A listing must have at least one photo'}, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        was_cover = product.image and product.image.name == image.image.name
        image.delete()

        if was_cover:
            remaining = product.images.first()
            product.image = remaining.image if remaining else None
            product.save()

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createProductReview(request, pk):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Listing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if not OrderItem.objects.filter(order__user=request.user, product=product).exists():
        return Response({'detail': 'You can only review products you have bought'}, status=status.HTTP_403_FORBIDDEN)

    rating = request.data.get('rating')
    try:
        rating = int(rating)
    except (TypeError, ValueError):
        rating = None
    if rating is None or rating < 1 or rating > 5:
        return Response({'detail': 'Rating must be an integer from 1 to 5'}, status=status.HTTP_400_BAD_REQUEST)

    comment = request.data.get('comment', '')
    name = request.user.first_name or request.user.email

    with transaction.atomic():
        review = Review.objects.filter(product=product, user=request.user).first()
        if review:
            review.rating = rating
            review.comment = comment
            review.name = name
            review.save()
        else:
            Review.objects.create(product=product, user=request.user, name=name, rating=rating, comment=comment)

        reviews = Review.objects.filter(product=product)
        product.numReviews = reviews.count()
        product.rating = sum(r.rating for r in reviews) / reviews.count()
        product.save()

    serializer = ProductSerializer(product, many=False)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteProduct(request, pk):
    try:
        product = Product.objects.get(_id=pk)
    except Product.DoesNotExist:
        return Response({'detail': 'Listing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if product.user != request.user:
        return Response({'detail': 'Not authorized to delete this listing'}, status=status.HTTP_403_FORBIDDEN)

    product.delete()
    return Response({'detail': 'Listing deleted'})

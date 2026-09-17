from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.db.models import Avg
from .models import Product, ProductImage, ProductVideo, Review, Order, OrderItem, ShippingAddress, Conversation, Message, SellerRating


def get_avatar_url(user):
    profile = getattr(user, 'profile', None)
    if profile and profile.avatar:
        return profile.avatar.url
    return None


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField(read_only=True)
    _id = serializers.SerializerMethodField(read_only=True)
    isAdmin = serializers.SerializerMethodField(read_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'avatar']

    def get_isAdmin(self, obj):
        return obj.is_staff

    def get__id(self, obj):
        return obj.id

    def get_name(self, obj):
        name = obj.first_name
        if name == '':
            name = obj.email
        return name

    def get_avatar(self, obj):
        return get_avatar_url(obj)


class UserSerializerWithToken(UserSerializer):
    token = serializers.SerializerMethodField(read_only=True)
    class Meta:
        model = User
        fields = ['id', '_id', 'username', 'email', 'name', 'isAdmin', 'avatar', 'token']

    def get_token(self, obj):
        token = RefreshToken.for_user(obj)
        return str(token.access_token)

class ProductSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField(read_only=True)
    videos = serializers.SerializerMethodField(read_only=True)
    sellerName = serializers.SerializerMethodField(read_only=True)
    sellerRating = serializers.SerializerMethodField(read_only=True)
    sellerRatingCount = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Product
        fields = "__all__"

    def get_images(self, obj):
        return [{'id': image._id, 'url': image.image.url} for image in obj.images.all()]

    def get_videos(self, obj):
        return [video.video.url for video in obj.videos.all()]

    def get_sellerName(self, obj):
        if not obj.user:
            return None
        name = obj.user.first_name
        return name if name else obj.user.email

    def get_sellerRating(self, obj):
        if not obj.user:
            return None
        rating_map = self.context.get('rating_map')
        if rating_map is not None:
            stat = rating_map.get(obj.user_id)
            return round(stat[0], 1) if stat else None
        result = SellerRating.objects.filter(seller=obj.user).aggregate(avg=Avg('rating'))
        return round(result['avg'], 1) if result['avg'] is not None else None

    def get_sellerRatingCount(self, obj):
        if not obj.user:
            return 0
        rating_map = self.context.get('rating_map')
        if rating_map is not None:
            stat = rating_map.get(obj.user_id)
            return stat[1] if stat else 0
        return SellerRating.objects.filter(seller=obj.user).count()


class ShippingAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingAddress
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"


class OrderSerializer(serializers.ModelSerializer):
    orderItems = serializers.SerializerMethodField(read_only=True)
    shippingAddress = serializers.SerializerMethodField(read_only=True)
    user = serializers.SerializerMethodField(read_only=True)
    seller = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = "__all__"

    def get_orderItems(self, obj):
        items = obj.orderitem_set.all()
        serializer = OrderItemSerializer(items, many=True)
        return serializer.data

    def get_shippingAddress(self, obj):
        try:
            address = ShippingAddressSerializer(obj.shippingaddress, many=False).data
        except:
            address = False
        return address

    def get_user(self, obj):
        user = obj.user
        serializer = UserSerializer(user, many=False)
        return serializer.data

    def get_seller(self, obj):
        first_item = obj.orderitem_set.select_related('product__user').first()
        if not first_item or not first_item.product or not first_item.product.user:
            return None
        return UserSerializer(first_item.product.user, many=False).data


class ConversationSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    buyer = UserSerializer(read_only=True)
    seller = UserSerializer(read_only=True)
    lastMessage = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'product', 'buyer', 'seller', 'createdAt', 'lastMessage']

    def get_lastMessage(self, obj):
        last = obj.messages.order_by('-createdAt').first()
        return MessageSerializer(last).data if last else None


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'sender', 'text', 'createdAt']
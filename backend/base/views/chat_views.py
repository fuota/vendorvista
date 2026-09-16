from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from base.models import Product, Conversation
from base.serializers import ConversationSerializer, MessageSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def startOrGetConversation(request, product_id):
    try:
        product = Product.objects.get(_id=product_id)
    except Product.DoesNotExist:
        return Response({'detail': 'Listing does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if product.user == request.user:
        return Response({'detail': "You can't message yourself about your own listing"}, status=status.HTTP_400_BAD_REQUEST)

    conversation, _ = Conversation.objects.get_or_create(
        product=product,
        buyer=request.user,
        seller=product.user,
    )

    serializer = ConversationSerializer(conversation, many=False)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMyConversations(request):
    conversations = Conversation.objects.filter(
        Q(buyer=request.user) | Q(seller=request.user)
    ).order_by('-createdAt')
    serializer = ConversationSerializer(conversations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getConversationMessages(request, pk):
    try:
        conversation = Conversation.objects.get(id=pk)
    except Conversation.DoesNotExist:
        return Response({'detail': 'Conversation does not exist'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in (conversation.buyer, conversation.seller):
        return Response({'detail': 'Not authorized to view this conversation'}, status=status.HTTP_403_FORBIDDEN)

    messages = conversation.messages.order_by('createdAt')
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

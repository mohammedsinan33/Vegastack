from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Post, Like, Comment, Follow
from .serializers import PostSerializer, PostCreateSerializer, CommentSerializer, LikeSerializer, FollowSerializer
from users.models import User
import logging

logger = logging.getLogger(__name__)

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    queryset = Post.objects.filter(is_active=True).prefetch_related('comments', 'likes')

    def get_serializer_class(self):
        if self.action == 'create':
            return PostCreateSerializer
        return PostSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        post = self.get_object()
        if post.author != self.request.user:
            raise PermissionError("You can only edit your own posts")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionError("You can only delete your own posts")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def feed(self, request):
        """Get personalized feed of posts from followed users"""
        user = request.user
        followed_users = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
        
        posts = Post.objects.filter(
            Q(author__in=followed_users) | Q(author=user),
            is_active=True
        ).order_by('-created_at').prefetch_related('comments', 'likes')
        
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a post"""
        post = self.get_object()
        user = request.user
        
        if request.method == 'POST':
            is_liked = request.data.get('is_liked', True)
            like, created = Like.objects.get_or_create(post=post, user=user)
            
            if not created and like.is_liked == is_liked:
                return Response({'error': 'You have already interacted with this post'}, status=400)
            
            if not created:
                # Change from like to dislike or vice versa
                like.is_liked = is_liked
                like.save()
            else:
                like.is_liked = is_liked
                like.save()
            
            return Response(LikeSerializer(like).data)
        
        elif request.method == 'DELETE':
            like = Like.objects.filter(post=post, user=user).first()
            if like:
                like.delete()
                return Response({'message': 'Like removed'})
            return Response({'error': 'No like found'}, status=404)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        post_id = self.kwargs.get('post_pk')
        return Comment.objects.filter(post_id=post_id).order_by('created_at')

    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_pk')
        post = get_object_or_404(Post, id=post_id)
        serializer.save(user=self.request.user, post=post)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise PermissionError("You can only delete your own comments")
        instance.delete()

class FollowViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post', 'delete'], url_path='users/(?P<user_id>[^/.]+)/follow')
    def follow_user(self, request, user_id=None):
        """Follow or unfollow a user"""
        follower = request.user
        following = get_object_or_404(User, id=user_id)
        
        if follower == following:
            return Response({'error': 'You cannot follow yourself'}, status=400)
        
        if request.method == 'POST':
            follow, created = Follow.objects.get_or_create(follower=follower, following=following)
            if created:
                return Response(FollowSerializer(follow).data, status=status.HTTP_201_CREATED)
            return Response({'error': 'Already following'}, status=400)
        
        elif request.method == 'DELETE':
            follow = Follow.objects.filter(follower=follower, following=following).first()
            if follow:
                follow.delete()
                return Response({'message': 'Unfollowed'})
            return Response({'error': 'Not following'}, status=404)

    @action(detail=False, methods=['get'], url_path='users/(?P<user_id>[^/.]+)/followers')
    def get_followers(self, request, user_id=None):
        """Get list of followers for a user"""
        user = get_object_or_404(User, id=user_id)
        followers = Follow.objects.filter(following=user).select_related('follower')
        serializer = FollowSerializer(followers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='users/(?P<user_id>[^/.]+)/following')
    def get_following(self, request, user_id=None):
        """Get list of users that a user is following"""
        user = get_object_or_404(User, id=user_id)
        following = Follow.objects.filter(follower=user).select_related('following')
        serializer = FollowSerializer(following, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_post_image_view(request):
    try:
        file = request.FILES.get('image')
        if not file:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        from posts.storage import upload_post_image
        image_url = upload_post_image(file, str(request.user.id))
        if not image_url:
            return Response({"error": "Upload failed - check server logs"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"image_url": image_url})
    except Exception as e:
        logger.error(f"Upload view error: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def test_comments(request, post_id=None):
    """Test endpoint for debugging"""
    if request.method == 'POST':
        print(f"POST request data: {request.data}")
        print(f"User: {request.user}")
        print(f"Post ID: {post_id}")
    return Response({"status": "ok"})

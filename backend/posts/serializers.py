from rest_framework import serializers
from .models import Post, Like, Comment, Follow
from users.models import User

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar_url')

class CommentSerializer(serializers.ModelSerializer):
    user = UserSimpleSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)  # Add this line

    class Meta:
        model = Comment
        fields = ('id', 'post', 'user', 'content', 'created_at', 'updated_at')
        read_only_fields = ('user', 'post', 'created_at', 'updated_at')  # Add 'post' here

class PostSerializer(serializers.ModelSerializer):
    author = UserSimpleSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    user_like_status = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ('id', 'author', 'content', 'image_url', 'like_count', 'dislike_count', 
                  'comment_count', 'is_active', 'created_at', 'updated_at', 'comments', 'user_like_status')
        read_only_fields = ('author', 'like_count', 'dislike_count', 'comment_count', 'created_at', 'updated_at')

    def get_user_like_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                like = Like.objects.get(post=obj, user=request.user)
                return 'like' if like.is_liked else 'dislike'
            except Like.DoesNotExist:
                return None
        return None

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('content', 'image_url')

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ('id', 'post', 'user', 'is_liked', 'created_at')
        read_only_fields = ('user', 'created_at')

class FollowSerializer(serializers.ModelSerializer):
    follower = UserSimpleSerializer(read_only=True)
    following = UserSimpleSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ('id', 'follower', 'following', 'created_at')
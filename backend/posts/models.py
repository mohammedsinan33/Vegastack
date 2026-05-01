from django.db import models
import uuid
from users.models import User

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField(max_length=280)
    image_url = models.URLField(blank=True, null=True)
    like_count = models.IntegerField(default=0)
    dislike_count = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "posts"
        managed = False
        ordering = ['-created_at']

    def __str__(self):
        return f"Post by {self.author.email} - {self.created_at}"


class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    is_liked = models.BooleanField(default=True)  # TRUE = like, FALSE = dislike
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "likes"
        managed = False
        unique_together = ('post', 'user')

    def __str__(self):
        return f"{'Like' if self.is_liked else 'Dislike'} by {self.user.email} on {self.post.id}"


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "comments"
        managed = False
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.email} on post {self.post.id}"


class Follow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "follows"
        managed = False
        unique_together = ('follower', 'following')

    def __str__(self):
        return f"{self.follower.email} follows {self.following.email}"
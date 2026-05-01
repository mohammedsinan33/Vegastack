from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, FollowViewSet, upload_post_image_view

router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'posts/(?P<post_pk>[^/.]+)/comments', CommentViewSet, basename='comment')
router.register(r'follows', FollowViewSet, basename='follow')

urlpatterns = [
    path('posts/upload-image/', upload_post_image_view),  # Must come BEFORE router
    path('', include(router.urls)),
]
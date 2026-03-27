from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView,
    ChildProfileViewSet,
    forgot_password,
    reset_password,
    verify_email,
    resend_code,
)

router = DefaultRouter()
router.register(r'children', ChildProfileViewSet, basename='child')

urlpatterns = [
    # Register
    path('register/', RegisterView.as_view(), name='register'),

    # Forgot & Reset Password
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', reset_password, name='reset-password'),

    # Child Profiles (router)
    path('', include(router.urls)),

    path('verify-email/', verify_email),
    path('resend-code/', resend_code),
]
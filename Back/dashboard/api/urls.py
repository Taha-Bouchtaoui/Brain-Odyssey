from django.urls import path
from .views import (
    RegisterView,
    user_settings, delete_account, reset_progress, get_my_progress, verify_pin, change_pin,
    get_children, update_child, delete_child, add_children, get_child_progress,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('settings/', user_settings, name='user-settings'),
    path('settings/delete/', delete_account, name='delete-account'),
    path('settings/reset/', reset_progress, name='reset-progress'),
    path('settings/pin/verify/', verify_pin, name='verify-pin'),
    path('settings/pin/change/', change_pin, name='change-pin'),
    path('progress/', get_my_progress, name='my-progress'),
    path('children/', get_children, name='get-children'),
    path('children/add/', add_children, name='add-children'),
    path('children/<int:child_id>/', update_child, name='update-child'),
    path('children/<int:child_id>/delete/', delete_child, name='delete-child'),
    path('children/<int:child_id>/progress/', get_child_progress, name='child-progress'),
]
import uuid
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_settings(request):
    user = request.user
    profile = user.profile

    if request.method == "GET":
        return Response({
            "username": user.username,
            "email": user.email,
            "role": profile.role,
            "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else None,
        })

    if request.method == "PUT":
        user.username = request.data.get("username", user.username)
        user.email = request.data.get("email", user.email)
        password = request.data.get("password")
        if password:
            user.set_password(password)
        user.save()

        if 'avatar' in request.FILES:
            avatar_file = request.FILES['avatar']
            if avatar_file.content_type not in ['image/jpeg', 'image/png']:
                return Response({"error": "Only JPG and PNG files are allowed."}, status=400)
            filename = f"{uuid.uuid4().hex}.jpg"
            profile.avatar.save(filename, ContentFile(avatar_file.read()), save=True)

        return Response({
            "message": "Profile updated successfully",
            "avatar": request.build_absolute_uri(profile.avatar.url) if profile.avatar else None,
        })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_account(request):
    request.user.delete()
    return Response({"message": "Account deleted"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reset_progress(request):
    return Response({"message": "Progress reset"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_my_progress(request):
    profile = request.user.profile
    progress = profile.world_progress.all().order_by('world_index')
    data = [{
        "world_index": p.world_index,
        "exercises_solved": p.exercises_solved,
        "mistakes": p.mistakes,
    } for p in progress]
    return Response({"progress": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_pin(request):
    pin = request.data.get("pin")
    if not pin:
        return Response({"error": "PIN is required."}, status=400)
    if request.user.profile.pin != pin:
        return Response({"error": "Incorrect PIN."}, status=400)
    return Response({"message": "PIN verified."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_pin(request):
    old_pin = request.data.get("old_pin")
    new_pin = request.data.get("new_pin")
    if not old_pin or not new_pin:
        return Response({"error": "Both old and new PIN are required."}, status=400)
    if request.user.profile.pin != old_pin:
        return Response({"error": "Incorrect current PIN."}, status=400)
    if len(new_pin) < 4:
        return Response({"error": "PIN must be at least 4 digits."}, status=400)
    request.user.profile.pin = new_pin
    request.user.profile.save()
    return Response({"message": "PIN changed successfully."})
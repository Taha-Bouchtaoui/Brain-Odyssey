import uuid
from django.core.files.base import ContentFile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from api.models import Profile

User = get_user_model()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_children(request):
    if request.user.profile.role != 'parent':
        return Response({"error": "Only parents can access this."}, status=403)
    children = Profile.objects.filter(parent=request.user.profile, role='child')
    data = [{
        "id": child.user.id,
        "username": child.display_name or child.user.username,
        "age": child.age,
        "avatar": request.build_absolute_uri(child.avatar.url) if child.avatar else None,
    } for child in children]
    return Response(data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_child(request, child_id):
    if request.user.profile.role != 'parent':
        return Response({"error": "Only parents can access this."}, status=403)
    try:
        child_profile = Profile.objects.get(
            user__id=child_id,
            parent=request.user.profile,
            role='child'
        )
    except Profile.DoesNotExist:
        return Response({"error": "Child not found."}, status=404)

    new_display_name = request.data.get("username", child_profile.display_name)

    if new_display_name != child_profile.display_name:
        already_exists = Profile.objects.filter(
            parent=request.user.profile,
            display_name=new_display_name
        ).exclude(user__id=child_id).exists()
        if already_exists:
            return Response({"error": f"You already have a child named '{new_display_name}'."}, status=400)
        child_profile.display_name = new_display_name

    age = request.data.get("age")
    if age is not None:
        child_profile.age = int(age)

    if 'avatar' in request.FILES:
        avatar_file = request.FILES['avatar']
        if avatar_file.content_type not in ['image/jpeg', 'image/png']:
            return Response({"error": "Only JPG and PNG files are allowed."}, status=400)
        filename = f"{uuid.uuid4().hex}.jpg"
        child_profile.avatar.save(filename, ContentFile(avatar_file.read()), save=True)
    else:
        child_profile.save()

    return Response({
        "message": "Child profile updated!",
        "username": child_profile.display_name,
        "age": child_profile.age,
        "avatar": request.build_absolute_uri(child_profile.avatar.url) if child_profile.avatar else None,
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_child(request, child_id):
    if request.user.profile.role != 'parent':
        return Response({"error": "Only parents can do this."}, status=403)
    try:
        child_profile = Profile.objects.get(
            user__id=child_id,
            parent=request.user.profile,
            role='child'
        )
        child_profile.user.delete()
        return Response({"message": "Child deleted."})
    except Profile.DoesNotExist:
        return Response({"error": "Child not found."}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_children(request):
    if request.user.profile.role != 'parent':
        return Response({"error": "Only parents can add children."}, status=403)

    children_data = request.data.get("children", [])
    if not children_data:
        return Response({"error": "No children provided."}, status=400)

    parent_profile = request.user.profile
    created = []

    for child_data in children_data:
        if not child_data.get('username'):
            return Response({"error": "Username is required."}, status=400)
        if not child_data.get('age'):
            return Response({"error": "Age is required."}, status=400)

        already_exists = Profile.objects.filter(
            parent=parent_profile,
            display_name=child_data['username']
        ).exists()
        if already_exists:
            return Response({"error": f"You already have a child named '{child_data['username']}'."}, status=400)

        internal_username = f"{parent_profile.user.id}__{child_data['username']}__{uuid.uuid4().hex[:6]}"
        auto_password = uuid.uuid4().hex

        child_user = User.objects.create_user(
            username=internal_username,
            password=auto_password,
        )
        Profile.objects.create(
            user=child_user,
            role='child',
            parent=parent_profile,
            age=int(child_data['age']),
            display_name=child_data['username'],
        )
        created.append(child_data['username'])

    return Response({"message": f"{len(created)} child(ren) added!", "created": created})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_child_progress(request, child_id):
    if request.user.profile.role != 'parent':
        return Response({"error": "Only parents can access this."}, status=403)
    try:
        child_profile = Profile.objects.get(
            user__id=child_id,
            parent=request.user.profile,
            role='child'
        )
    except Profile.DoesNotExist:
        return Response({"error": "Child not found."}, status=404)

    progress = child_profile.world_progress.all().order_by('world_index')
    data = [{
        "world_index": p.world_index,
        "exercises_solved": p.exercises_solved,
        "mistakes": p.mistakes,
    } for p in progress]
    return Response({"username": child_profile.display_name, "progress": data})
"""
GamerProfile API routes: Create, Read, and Update profiles for authenticated users.
Clean architecture implementation returning unified ApiResponse envelopes.
"""

from datetime import datetime, timezone
import os
import uuid
from fastapi import APIRouter, Body, File, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.dependencies import CurrentUser, ProfileServiceDep
from app.schemas.common import ApiResponse
from app.schemas.profile import (
    GamerProfileCreate,
    GamerProfileRead,
    GamerProfileUpdate,
)

router = APIRouter()


@router.post(
    "",
    response_model=ApiResponse[GamerProfileRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create Gamer Profile",
    description=(
        "Initializes and saves a new gamer profile for the authenticated user. "
        "Allows setting display name, bio, server region, communication language, "
        "preferred games, preferred roles, availability schedule, and avatar URL. "
        "Raises 409 Conflict if a profile has already been initialized."
    ),
    responses={
        201: {"description": "Gamer profile successfully initialized"},
        401: {"description": "Authentication required"},
        409: {"description": "Profile already exists for this account"},
        422: {"description": "Validation error on input attributes"},
    },
)
async def create_my_profile(
    current_user: CurrentUser,
    profile_service: ProfileServiceDep,
    payload: GamerProfileCreate = Body(
        ...,
        openapi_examples={
            "standard_profile": {
                "summary": "Standard Gamer Profile",
                "value": {
                    "display_name": "ShadowStrike",
                    "bio": "Competitive FPS shotcaller and duelist main. Looking for high-immortal scrim teams.",
                    "region": "NA-East",
                    "language": "English",
                    "preferred_games": ["Valorant", "CS2", "Apex Legends"],
                    "preferred_roles": ["Duelist", "Initiator"],
                    "availability": "Weekdays 8PM - 12AM EST, Weekends anytime",
                    "avatar": "https://cdn.squadsync.gg/avatars/shadow.png",
                },
            }
        },
    ),
) -> ApiResponse[GamerProfileRead]:
    """Create a new gamer profile for the currently authenticated user."""
    profile = await profile_service.create_profile(
        user_id=current_user.id,
        profile_in=payload,
    )
    return ApiResponse.ok(
        data=GamerProfileRead.model_validate(profile),
        message="Gamer profile created successfully.",
    )


@router.get(
    "/me",
    response_model=ApiResponse[GamerProfileRead],
    status_code=status.HTTP_200_OK,
    summary="Get My Gamer Profile",
    description=(
        "Retrieves the complete gamer profile for the currently authenticated user. "
        "Returns 404 Not Found if the user has not yet initialized their profile."
    ),
    responses={
        200: {"description": "Gamer profile retrieved successfully"},
        401: {"description": "Authentication required"},
        404: {"description": "Gamer profile not yet created for this user"},
    },
)
async def get_my_profile(
    current_user: CurrentUser,
    profile_service: ProfileServiceDep,
) -> ApiResponse[GamerProfileRead]:
    """Retrieve profile for the currently authenticated user."""
    profile = await profile_service.get_by_user_id_or_404(current_user.id)
    return ApiResponse.ok(
        data=GamerProfileRead.model_validate(profile),
        message="Gamer profile retrieved successfully.",
    )


@router.put(
    "/me",
    response_model=ApiResponse[GamerProfileRead],
    status_code=status.HTTP_200_OK,
    summary="Update My Gamer Profile",
    description=(
        "Updates one or more attributes of the authenticated user's gamer profile. "
        "Supports partial updates—omitted fields remain unchanged."
    ),
    responses={
        200: {"description": "Gamer profile updated successfully"},
        401: {"description": "Authentication required"},
        404: {"description": "Gamer profile not found"},
        422: {"description": "Input validation error"},
    },
)
async def update_my_profile(
    current_user: CurrentUser,
    profile_service: ProfileServiceDep,
    payload: GamerProfileUpdate = Body(
        ...,
        openapi_examples={
            "partial_update": {
                "summary": "Partial Profile Update",
                "value": {
                    "display_name": "ShadowStrike_X",
                    "bio": "Now focusing full-time on Premier Division season playoffs.",
                    "preferred_roles": ["Initiator", "Flex"],
                    "availability": "Daily 7PM - 11PM EST",
                },
            }
        },
    ),
) -> ApiResponse[GamerProfileRead]:
    """Update profile details for the currently authenticated user."""
    profile = await profile_service.update_profile(
        user_id=current_user.id,
        update_in=payload,
    )
    return ApiResponse.ok(
        data=GamerProfileRead.model_validate(profile),
        message="Gamer profile updated successfully.",
    )


@router.post(
    "/avatar",
    response_model=ApiResponse[GamerProfileRead],
    status_code=status.HTTP_200_OK,
    summary="Upload Profile Picture / Avatar",
    description="Uploads an avatar picture (JPG, PNG, WEBP, GIF, max 5MB) and updates the gamer profile.",
)
async def upload_avatar(
    current_user: CurrentUser,
    profile_service: ProfileServiceDep,
    file: UploadFile = File(...),
) -> ApiResponse[GamerProfileRead]:
    """Uploads an avatar image and sets avatar URL on user profile."""
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file selected for upload.",
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 5MB.",
        )

    # Save to static uploads directory
    avatars_dir = os.path.join(settings.STATIC_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    filename = f"avatar_{current_user.id}_{int(datetime.now(timezone.utc).timestamp())}{ext}"
    file_path = os.path.join(avatars_dir, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    avatar_url = f"/static/avatars/{filename}"

    existing_profile = await profile_service.get_by_user_id(current_user.id)
    if not existing_profile:
        profile = await profile_service.create_profile(
            user_id=current_user.id,
            profile_in=GamerProfileCreate(
                display_name=current_user.username,
                avatar=avatar_url,
            ),
        )
    else:
        profile = await profile_service.update_profile(
            user_id=current_user.id,
            update_in=GamerProfileUpdate(
                avatar=avatar_url,
            ),
        )

    return ApiResponse.ok(
        data=GamerProfileRead.model_validate(profile),
        message="Profile avatar uploaded successfully.",
    )

from supabase import create_client
import os
import logging

logger = logging.getLogger(__name__)

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

def upload_avatar(file, user_id):
    """Upload avatar to Supabase Storage"""
    try:
        file_name = f"avatars/{user_id}_{file.name}"
        
        # Upload file
        response = supabase.storage.from_("avatars").upload(
            file_name,
            file.read(),
            {"content-type": file.content_type}
        )
        
        # Build public URL directly (more reliable)
        supabase_url = os.environ.get("SUPABASE_URL")
        public_url = f"{supabase_url}/storage/v1/object/public/avatars/{file_name}"
        
        logger.info(f"Avatar uploaded successfully: {public_url}")
        return public_url
        
    except Exception as e:
        logger.error(f"Avatar upload failed: {str(e)}")
        print(f"Avatar upload error: {e}")
        return None
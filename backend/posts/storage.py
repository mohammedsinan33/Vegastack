from supabase import create_client
import os
import uuid
import logging

logger = logging.getLogger(__name__)

supabase = create_client(
    os.environ.get("SUPABASE_URL"),
    os.environ.get("SUPABASE_SERVICE_KEY")
)

def upload_post_image(file, user_id):
    """Upload post image to Supabase Storage posts bucket"""
    try:
        file_extension = file.name.split('.')[-1]
        file_name = f"posts/{user_id}/{uuid.uuid4()}.{file_extension}"
        
        # Upload file
        response = supabase.storage.from_("posts").upload(
            file_name,
            file.read(),
            {"content-type": file.content_type}
        )
        
        # Build public URL directly (more reliable)
        supabase_url = os.environ.get("SUPABASE_URL")
        public_url = f"{supabase_url}/storage/v1/object/public/posts/{file_name}"
        
        logger.info(f"Post image uploaded successfully: {public_url}")
        return public_url
        
    except Exception as e:
        logger.error(f"Post image upload failed: {str(e)}")
        print(f"Post image upload error: {e}")
        return None
import io
import logging
from typing import BinaryIO

from minio import Minio
from minio.error import S3Error

from app.config import settings

logger = logging.getLogger(__name__)


class MinIOStorage:
    """MinIO storage service for file uploads."""

    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_USE_SSL,
        )
        self.bucket_name = settings.MINIO_BUCKET
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                # Set public read policy for the bucket
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": ["*"]},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"],
                        }
                    ],
                }
                import json

                self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
                logger.info(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise

    def upload_file(
        self,
        file_data: bytes | BinaryIO,
        filename: str,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Upload file to MinIO.

        Args:
            file_data: File content as bytes or file-like object
            filename: Name of the file in storage
            content_type: MIME type of the file

        Returns:
            Public URL of the uploaded file
        """
        try:
            # Convert bytes to BytesIO if needed
            if isinstance(file_data, bytes):
                file_data = io.BytesIO(file_data)
                length = len(file_data.getvalue())
            else:
                # Get length for file-like objects
                file_data.seek(0, 2)  # Seek to end
                length = file_data.tell()
                file_data.seek(0)  # Seek back to start

            # Upload file
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=filename,
                data=file_data,
                length=length,
                content_type=content_type,
            )

            # Return public URL
            url = f"{settings.MINIO_PUBLIC_URL}/{self.bucket_name}/{filename}"
            logger.info(f"Uploaded file: {filename} -> {url}")
            return url

        except S3Error as e:
            logger.error(f"Error uploading file {filename}: {e}")
            raise

    def delete_file(self, filename: str):
        """Delete file from MinIO."""
        try:
            self.client.remove_object(self.bucket_name, filename)
            logger.info(f"Deleted file: {filename}")
        except S3Error as e:
            logger.error(f"Error deleting file {filename}: {e}")
            raise

    def get_file_url(self, filename: str) -> str:
        """Get public URL for a file."""
        return f"{settings.MINIO_PUBLIC_URL}/{self.bucket_name}/{filename}"


# Global storage instance
storage = MinIOStorage()
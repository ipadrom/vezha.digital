"""Простой in-memory кеш с TTL для хранения данных"""

import time
from typing import Any


class CacheService:
    """Простой сервис кеширования с поддержкой TTL (Time To Live)"""

    def __init__(self):
        self._cache: dict[str, tuple[Any, float]] = {}

    def get(self, key: str) -> Any | None:
        """Получить значение из кеша. Возвращает None если ключ не найден или истек TTL"""
        if key not in self._cache:
            return None

        value, expires_at = self._cache[key]

        # Проверяем, не истек ли TTL
        if time.time() > expires_at:
            del self._cache[key]
            return None

        return value

    def set(self, key: str, value: Any, ttl: int = 60) -> None:
        """
        Сохранить значение в кеш

        Args:
            key: Ключ для сохранения
            value: Значение для сохранения
            ttl: Время жизни в секундах (по умолчанию 60 секунд)
        """
        expires_at = time.time() + ttl
        self._cache[key] = (value, expires_at)

    def delete(self, key: str) -> None:
        """Удалить значение из кеша"""
        if key in self._cache:
            del self._cache[key]

    def clear(self) -> None:
        """Очистить весь кеш"""
        self._cache.clear()

    def cleanup(self) -> None:
        """Удалить все истекшие записи из кеша"""
        current_time = time.time()
        expired_keys = [
            key for key, (_, expires_at) in self._cache.items() if current_time > expires_at
        ]
        for key in expired_keys:
            del self._cache[key]


# Глобальный экземпляр кеша
cache_service = CacheService()
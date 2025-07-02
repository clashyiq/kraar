# -*- coding: utf-8 -*-
"""
Teacher AI Enhanced - Configuration
تطبيق المدرس AI المحسن - ملف الإعدادات

Author: Teacher AI Enhanced Team
Version: 2.0.0
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Base configuration class"""
    
    # Basic Flask Configuration
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'teacher-ai-enhanced-secret-key-2024'
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///teacher_ai_enhanced.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 10,
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'echo': False
    }
    
    # File Upload Configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    STATIC_UPLOAD_FOLDER = 'static/uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'doc', 'docx', 'rtf', 'odt'}
    
    # Security Configuration
    WTF_CSRF_ENABLED = True
    WTF_CSRF_TIME_LIMIT = None
    SESSION_COOKIE_SECURE = os.environ.get('FLASK_ENV') == 'production'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    
    # AI Engine Configuration
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY')
    OPENAI_MODEL = os.environ.get('OPENAI_MODEL', 'gpt-3.5-turbo')
    ANTHROPIC_MODEL = os.environ.get('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229')
    
    # Arabic Language Support
    DEFAULT_LANGUAGE = 'ar'
    SUPPORTED_LANGUAGES = ['ar', 'en']
    ARABIC_FONT = 'Cairo, Tajawal, Arial Unicode MS'
    
    # Application Settings
    APP_NAME = 'المدرس AI المحسن'
    APP_VERSION = '2.0.0'
    APP_DESCRIPTION = 'مساعد ذكي للدراسة والتعلم مع النطق العربي المتقدم'
    
    # Logging Configuration
    LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
    LOG_FILE = 'logs/teacher_ai.log'
    LOG_MAX_BYTES = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT = 5
    
    # Cache Configuration
    CACHE_TYPE = os.environ.get('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = 300
    REDIS_URL = os.environ.get('REDIS_URL')
    
    # Rate Limiting
    RATELIMIT_STORAGE_URL = os.environ.get('REDIS_URL', 'memory://')
    RATELIMIT_DEFAULT = "100 per hour"
    
    # Enhanced Arabic Features
    ENABLE_ARABIC_NLP = True
    ENABLE_ARABIC_SPEECH = True
    ARABIC_SPEECH_RATE = 0.7
    ARABIC_SPEECH_PITCH = 1.0
    SUPPORTED_ARABIC_DIALECTS = [
        'ar-SA',  # Saudi Arabia (MSA)
        'ar-EG',  # Egypt
        'ar-AE',  # UAE
        'ar-JO',  # Jordan
        'ar-LB',  # Lebanon
        'ar-MA',  # Morocco
        'ar-DZ',  # Algeria
        'ar-TN',  # Tunisia
        'ar-IQ',  # Iraq
        'ar-SY',  # Syria
        'ar-KW',  # Kuwait
        'ar-QA',  # Qatar
        'ar-BH',  # Bahrain
        'ar-OM',  # Oman
        'ar-YE',  # Yemen
        'ar-PS',  # Palestine
    ]
    
    # Document Processing
    MAX_DOCUMENT_SIZE = 16 * 1024 * 1024  # 16MB
    SUPPORTED_DOCUMENT_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/rtf',
        'application/rtf'
    ]
    
    # AI Response Configuration
    MAX_RESPONSE_LENGTH = 4000
    MAX_CONTEXT_LENGTH = 8000
    ENABLE_CONTEXTUAL_RESPONSES = True
    ENABLE_COMPLETE_ANSWERS = True
    RESPONSE_TEMPERATURE = 0.7
    
    # Search Configuration
    SEARCH_RESULTS_LIMIT = 20
    SEARCH_MIN_QUERY_LENGTH = 2
    ENABLE_FUZZY_SEARCH = True
    
    # Performance Settings
    LAZY_LOADING = True
    PAGINATION_SIZE = 20
    CACHE_TIMEOUT = 300
    
    # Development Settings
    DEBUG_TOOLBAR = False
    SEND_FILE_MAX_AGE_DEFAULT = timedelta(hours=1)

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    LOG_LEVEL = 'DEBUG'
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_size': 5,
        'pool_recycle': 300,
        'pool_pre_ping': True,
        'echo': True  # Enable SQL query logging in development
    }
    SESSION_COOKIE_SECURE = False
    WTF_CSRF_ENABLED = False  # Disable CSRF for development
    DEBUG_TOOLBAR = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    WTF_CSRF_ENABLED = False
    LOGIN_DISABLED = True
    CACHE_TYPE = 'null'
    PRESERVE_CONTEXT_ON_EXCEPTION = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    # Enhanced security for production
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'
    
    # Use PostgreSQL in production
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user:password@localhost/teacher_ai_enhanced'
    
    # Enhanced logging for production
    LOG_LEVEL = 'WARNING'
    
    # Redis cache for production
    CACHE_TYPE = 'redis' if os.environ.get('REDIS_URL') else 'simple'
    
    # Stronger rate limiting in production
    RATELIMIT_DEFAULT = "50 per hour"

class HerokuConfig(ProductionConfig):
    """Heroku-specific configuration"""
    
    @classmethod
    def init_app(cls, app):
        ProductionConfig.init_app(app)
        
        # Handle proxy server headers
        from werkzeug.contrib.fixers import ProxyFix
        app.wsgi_app = ProxyFix(app.wsgi_app)
        
        # Log to stderr
        import logging
        from logging import StreamHandler
        file_handler = StreamHandler()
        file_handler.setLevel(logging.WARNING)
        app.logger.addHandler(file_handler)

class DockerConfig(ProductionConfig):
    """Docker-specific configuration"""
    
    @classmethod
    def init_app(cls, app):
        ProductionConfig.init_app(app)
        
        # Log to stdout for Docker
        import logging
        import sys
        from logging import StreamHandler
        
        handler = StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        app.logger.addHandler(handler)

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'heroku': HerokuConfig,
    'docker': DockerConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    """Get configuration class based on environment"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    
    return config.get(config_name, DevelopmentConfig)

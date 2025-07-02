# -*- coding: utf-8 -*-
"""
Teacher AI Enhanced - Database Models
تطبيق المدرس AI المحسن - نماذج قاعدة البيانات

Author: Teacher AI Enhanced Team
Version: 2.0.0
"""

from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean, JSON
import uuid
import json

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize database with Flask app"""
    db.init_app(app)
    return db

class Document(db.Model):
    """Document model for uploaded files"""
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=True)
    
    # Content and processing
    content = Column(Text, nullable=True)
    content_hash = Column(String(64), nullable=True, index=True)
    word_count = Column(Integer, default=0)
    language = Column(String(10), default='ar')
    
    # Metadata
    upload_date = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    last_accessed = Column(DateTime, default=datetime.utcnow)
    access_count = Column(Integer, default=0)
    
    # Processing status
    processing_status = Column(String(20), default='pending')  # pending, processing, completed, failed
    processing_error = Column(Text, nullable=True)
    
    # Document classification
    document_type = Column(String(50), nullable=True)  # book, notes, assignment, etc.
    subject = Column(String(100), nullable=True)
    tags = Column(JSON, nullable=True)
    
    def __init__(self, filename, original_filename, file_path, file_size, **kwargs):
        self.filename = filename
        self.original_filename = original_filename
        self.file_path = file_path
        self.file_size = file_size
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convert document to dictionary"""
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'word_count': self.word_count,
            'language': self.language,
            'upload_date': self.upload_date.isoformat() if self.upload_date else None,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'access_count': self.access_count,
            'processing_status': self.processing_status,
            'document_type': self.document_type,
            'subject': self.subject,
            'tags': self.tags
        }
    
    def update_access(self):
        """Update last accessed time and increment access count"""
        self.last_accessed = datetime.utcnow()
        self.access_count += 1
        db.session.commit()
    
    def __repr__(self):
        return f'<Document {self.filename}>'

class ChatSession(db.Model):
    """Chat session model"""
    __tablename__ = 'chat_sessions'
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False, default='محادثة جديدة')
    
    # Session metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    last_activity = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    message_count = Column(Integer, default=0)
    
    # Session settings
    language = Column(String(10), default='ar')
    voice_settings = Column(JSON, nullable=True)
    
    # Session status
    is_active = Column(Boolean, default=True)
    is_archived = Column(Boolean, default=False)
    
    # Relationships
    messages = db.relationship('ChatMessage', backref='session', lazy='dynamic', cascade='all, delete-orphan')
    
    def __init__(self, title=None, **kwargs):
        self.title = title or 'محادثة جديدة'
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self, include_messages=False):
        """Convert session to dictionary"""
        data = {
            'id': self.id,
            'title': self.title,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_activity': self.last_activity.isoformat() if self.last_activity else None,
            'message_count': self.message_count,
            'language': self.language,
            'voice_settings': self.voice_settings,
            'is_active': self.is_active,
            'is_archived': self.is_archived
        }
        
        if include_messages:
            data['messages'] = [msg.to_dict() for msg in self.messages.order_by(ChatMessage.timestamp)]
        
        return data
    
    def update_activity(self):
        """Update last activity timestamp"""
        self.last_activity = datetime.utcnow()
        db.session.commit()
    
    def add_message(self, content, message_type, **kwargs):
        """Add a message to this session"""
        message = ChatMessage(
            session_id=self.id,
            content=content,
            message_type=message_type,
            **kwargs
        )
        db.session.add(message)
        self.message_count += 1
        self.update_activity()
        return message
    
    def __repr__(self):
        return f'<ChatSession {self.title[:30]}...>'

class ChatMessage(db.Model):
    """Chat message model"""
    __tablename__ = 'chat_messages'
    
    id = Column(Integer, primary_key=True)
    session_id = Column(String(36), db.ForeignKey('chat_sessions.id'), nullable=False, index=True)
    
    # Message content
    content = Column(Text, nullable=False)
    message_type = Column(String(20), nullable=False, index=True)  # user, assistant, system
    
    # Message metadata
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    language = Column(String(10), default='ar')
    
    # AI response metadata
    confidence = Column(Float, nullable=True)
    response_time = Column(Float, nullable=True)  # in seconds
    model_used = Column(String(50), nullable=True)
    
    # Sources and context
    sources = Column(JSON, nullable=True)  # List of source documents
    context_used = Column(Text, nullable=True)
    
    # Speech metadata
    was_spoken = Column(Boolean, default=False)
    speech_settings = Column(JSON, nullable=True)
    
    # Message actions
    was_copied = Column(Boolean, default=False)
    was_bookmarked = Column(Boolean, default=False)
    was_printed = Column(Boolean, default=False)
    
    def __init__(self, session_id, content, message_type, **kwargs):
        self.session_id = session_id
        self.content = content
        self.message_type = message_type
        
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convert message to dictionary"""
        return {
            'id': self.id,
            'session_id': self.session_id,
            'content': self.content,
            'message_type': self.message_type,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'language': self.language,
            'confidence': self.confidence,
            'response_time': self.response_time,
            'model_used': self.model_used,
            'sources': self.sources,
            'was_spoken': self.was_spoken,
            'speech_settings': self.speech_settings,
            'was_copied': self.was_copied,
            'was_bookmarked': self.was_bookmarked,
            'was_printed': self.was_printed
        }
    
    def mark_as_spoken(self, speech_settings=None):
        """Mark message as spoken"""
        self.was_spoken = True
        if speech_settings:
            self.speech_settings = speech_settings
        db.session.commit()
    
    def mark_as_copied(self):
        """Mark message as copied"""
        self.was_copied = True
        db.session.commit()
    
    def mark_as_bookmarked(self):
        """Mark message as bookmarked"""
        self.was_bookmarked = True
        db.session.commit()
    
    def mark_as_printed(self):
        """Mark message as printed"""
        self.was_printed = True
        db.session.commit()
    
    def __repr__(self):
        return f'<ChatMessage {self.message_type}: {self.content[:50]}...>'

class UserSettings(db.Model):
    """User settings model"""
    __tablename__ = 'user_settings'
    
    id = Column(Integer, primary_key=True)
    user_id = Column(String(36), unique=True, nullable=False, index=True)
    
    # General settings
    language = Column(String(10), default='ar')
    theme = Column(String(20), default='auto')  # light, dark, auto
    
    # Speech settings
    auto_speak = Column(Boolean, default=True)
    voice_speed = Column(Float, default=0.7)
    preferred_dialect = Column(String(10), default='ar-SA')
    enable_speech_enhancements = Column(Boolean, default=True)
    
    # Display settings
    high_contrast_mode = Column(Boolean, default=False)
    font_size = Column(String(20), default='medium')
    
    # Response settings
    response_length = Column(String(20), default='detailed')
    enable_contextual_answers = Column(Boolean, default=True)
    include_sources = Column(Boolean, default=True)
    
    # Privacy settings
    save_history = Column(Boolean, default=True)
    enable_analytics = Column(Boolean, default=False)
    
    # Print settings
    print_format = Column(String(20), default='detailed')
    
    # Advanced settings
    settings_json = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __init__(self, user_id, **kwargs):
        self.user_id = user_id
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convert settings to dictionary"""
        return {
            'user_id': self.user_id,
            'language': self.language,
            'theme': self.theme,
            'auto_speak': self.auto_speak,
            'voice_speed': self.voice_speed,
            'preferred_dialect': self.preferred_dialect,
            'enable_speech_enhancements': self.enable_speech_enhancements,
            'high_contrast_mode': self.high_contrast_mode,
            'font_size': self.font_size,
            'response_length': self.response_length,
            'enable_contextual_answers': self.enable_contextual_answers,
            'include_sources': self.include_sources,
            'save_history': self.save_history,
            'enable_analytics': self.enable_analytics,
            'print_format': self.print_format,
            'settings_json': self.settings_json,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def update_setting(self, key, value):
        """Update a specific setting"""
        if hasattr(self, key):
            setattr(self, key, value)
            self.updated_at = datetime.utcnow()
            db.session.commit()
            return True
        return False
    
    def __repr__(self):
        return f'<UserSettings {self.user_id}>'

class Analytics(db.Model):
    """Analytics and usage tracking model"""
    __tablename__ = 'analytics'
    
    id = Column(Integer, primary_key=True)
    
    # Event information
    event_type = Column(String(50), nullable=False, index=True)
    event_data = Column(JSON, nullable=True)
    
    # Session information
    session_id = Column(String(36), nullable=True, index=True)
    user_id = Column(String(36), nullable=True, index=True)
    
    # Request information
    user_agent = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Timing
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __init__(self, event_type, **kwargs):
        self.event_type = event_type
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
    
    def to_dict(self):
        """Convert analytics record to dictionary"""
        return {
            'id': self.id,
            'event_type': self.event_type,
            'event_data': self.event_data,
            'session_id': self.session_id,
            'user_id': self.user_id,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
    
    @classmethod
    def log_event(cls, event_type, **kwargs):
        """Log an analytics event"""
        event = cls(event_type=event_type, **kwargs)
        db.session.add(event)
        db.session.commit()
        return event
    
    def __repr__(self):
        return f'<Analytics {self.event_type} at {self.timestamp}>'

# Database utility functions
def create_tables():
    """Create all database tables"""
    db.create_all()

def drop_tables():
    """Drop all database tables"""
    db.drop_all()

def reset_database():
    """Reset database by dropping and recreating all tables"""
    drop_tables()
    create_tables()

def get_database_stats():
    """Get database statistics"""
    return {
        'documents': Document.query.count(),
        'chat_sessions': ChatSession.query.count(),
        'chat_messages': ChatMessage.query.count(),
        'user_settings': UserSettings.query.count(),
        'analytics_events': Analytics.query.count(),
        'total_words': db.session.query(db.func.sum(Document.word_count)).scalar() or 0
    }

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Teacher AI Enhanced - Main Application
تطبيق المدرس AI المحسن - التطبيق الرئيسي

Author: Teacher AI Enhanced Team
Version: 2.0.0
License: MIT
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.absolute()
sys.path.insert(0, str(project_root))

from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import json
import uuid
import mimetypes

# Import custom modules
try:
    from ai_engine import TeacherAIEngine
    from document_processor import DocumentProcessor
    from database import init_db, db, Document, ChatSession, ChatMessage
    from config import Config
except ImportError as e:
    print(f"❌ خطأ في استيراد الوحدات: {e}")
    print("تأكد من وجود جميع الملفات المطلوبة في المجلد")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log', encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# Load configuration
try:
    app.config.from_object(Config)
    logger.info("✅ تم تحميل الإعدادات بنجاح")
except Exception as e:
    logger.error(f"❌ خطأ في تحميل الإعدادات: {e}")
    app.config.update({
        'SECRET_KEY': os.environ.get('SECRET_KEY', 'teacher-ai-enhanced-key'),
        'SQLALCHEMY_DATABASE_URI': os.environ.get('DATABASE_URL', 'sqlite:///teacher_ai.db'),
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,  # 16MB max file size
        'UPLOAD_FOLDER': 'uploads',
        'ALLOWED_EXTENSIONS': {'txt', 'pdf', 'doc', 'docx', 'rtf'},
        'OPENAI_API_KEY': os.environ.get('OPENAI_API_KEY'),
        'ANTHROPIC_API_KEY': os.environ.get('ANTHROPIC_API_KEY')
    })

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Initialize database
try:
    init_db(app)
    logger.info("✅ تم تهيئة قاعدة البيانات بنجاح")
except Exception as e:
    logger.error(f"❌ خطأ في تهيئة قاعدة البيانات: {e}")

# Initialize AI Engine and Document Processor
try:
    ai_engine = TeacherAIEngine()
    document_processor = DocumentProcessor()
    logger.info("✅ تم تهيئة محرك الذكاء الاصطناعي ومعالج المستندات")
except Exception as e:
    logger.error(f"❌ خطأ في تهيئة المحركات: {e}")
    ai_engine = None
    document_processor = None

# Create directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs('logs', exist_ok=True)
os.makedirs('static/uploads', exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def get_file_icon(filename):
    """Get appropriate icon for file type"""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    icons = {
        'pdf': 'fas fa-file-pdf',
        'doc': 'fas fa-file-word',
        'docx': 'fas fa-file-word',
        'txt': 'fas fa-file-alt',
        'rtf': 'fas fa-file-alt'
    }
    return icons.get(ext, 'fas fa-file')

@app.route('/')
def index():
    """Main page route"""
    try:
        return render_template('index.html')
    except Exception as e:
        logger.error(f"❌ خطأ في تحميل الصفحة الرئيسية: {e}")
        return f"خطأ في تحميل التطبيق: {str(e)}", 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '2.0.0',
        'ai_engine': ai_engine is not None,
        'document_processor': document_processor is not None
    })

@app.route('/api/upload', methods=['POST'])
def upload_files():
    """Upload and process documents"""
    try:
        if 'files' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'لا توجد ملفات للرفع'
            }), 400

        files = request.files.getlist('files')
        if not files or all(f.filename == '' for f in files):
            return jsonify({
                'status': 'error',
                'message': 'لم يتم اختيار أي ملفات'
            }), 400

        uploaded_files = []
        errors = []

        for file in files:
            if file and file.filename:
                if not allowed_file(file.filename):
                    errors.append(f"نوع الملف غير مدعوم: {file.filename}")
                    continue

                try:
                    # Secure filename
                    filename = secure_filename(file.filename)
                    if not filename:
                        filename = f"file_{uuid.uuid4().hex[:8]}.txt"

                    # Save file
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)

                    # Process document if processor is available
                    content = ""
                    word_count = 0
                    
                    if document_processor:
                        try:
                            content = document_processor.process_file(file_path)
                            word_count = len(content.split()) if content else 0
                        except Exception as e:
                            logger.warning(f"⚠️ فشل في معالجة الملف {filename}: {e}")
                            # Try to read as text file
                            try:
                                with open(file_path, 'r', encoding='utf-8') as f:
                                    content = f.read()
                                word_count = len(content.split())
                            except:
                                content = f"تم رفع الملف {filename} ولكن فشل في معالجته"
                                word_count = 0

                    # Save to database
                    document = Document(
                        filename=filename,
                        original_filename=file.filename,
                        file_path=file_path,
                        file_size=os.path.getsize(file_path),
                        mime_type=mimetypes.guess_type(filename)[0] or 'application/octet-stream',
                        content=content,
                        word_count=word_count,
                        upload_date=datetime.now()
                    )
                    
                    db.session.add(document)
                    db.session.commit()

                    uploaded_files.append({
                        'id': document.id,
                        'filename': filename,
                        'original_filename': file.filename,
                        'size': document.file_size,
                        'word_count': word_count,
                        'icon': get_file_icon(filename)
                    })

                    logger.info(f"✅ تم رفع الملف بنجاح: {filename}")

                except Exception as e:
                    error_msg = f"خطأ في رفع الملف {file.filename}: {str(e)}"
                    errors.append(error_msg)
                    logger.error(f"❌ {error_msg}")

        # Prepare response
        response = {
            'status': 'success' if uploaded_files else 'error',
            'uploaded_files': uploaded_files,
            'message': f"تم رفع {len(uploaded_files)} ملف بنجاح"
        }

        if errors:
            response['errors'] = errors
            response['message'] += f" مع {len(errors)} خطأ"

        return jsonify(response)

    except RequestEntityTooLarge:
        return jsonify({
            'status': 'error',
            'message': 'الملف كبير جداً. الحد الأقصى 16 ميجابايت'
        }), 413
    except Exception as e:
        logger.error(f"❌ خطأ في رفع الملفات: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في رفع الملفات: {str(e)}"
        }), 500

@app.route('/api/documents', methods=['GET'])
def get_documents():
    """Get all uploaded documents"""
    try:
        documents = Document.query.order_by(Document.upload_date.desc()).all()
        
        docs_list = []
        for doc in documents:
            docs_list.append({
                'id': doc.id,
                'filename': doc.filename,
                'original_filename': doc.original_filename,
                'file_size': doc.file_size,
                'word_count': doc.word_count,
                'upload_date': doc.upload_date.isoformat(),
                'mime_type': doc.mime_type,
                'icon': get_file_icon(doc.filename)
            })

        return jsonify({
            'status': 'success',
            'documents': docs_list,
            'total': len(docs_list)
        })

    except Exception as e:
        logger.error(f"❌ خطأ في جلب المستندات: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في جلب المستندات: {str(e)}"
        }), 500

@app.route('/api/documents/<int:doc_id>', methods=['DELETE'])
def delete_document(doc_id):
    """Delete a document"""
    try:
        document = Document.query.get_or_404(doc_id)
        
        # Delete file from filesystem
        try:
            if os.path.exists(document.file_path):
                os.remove(document.file_path)
        except Exception as e:
            logger.warning(f"⚠️ فشل في حذف الملف من النظام: {e}")

        # Delete from database
        db.session.delete(document)
        db.session.commit()

        logger.info(f"✅ تم حذف المستند: {document.filename}")

        return jsonify({
            'status': 'success',
            'message': f'تم حذف الملف {document.filename} بنجاح'
        })

    except Exception as e:
        logger.error(f"❌ خطأ في حذف المستند: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في حذف الملف: {str(e)}"
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages with enhanced Arabic support"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({
                'status': 'error',
                'message': 'لا توجد رسالة للمعالجة'
            }), 400

        user_message = data['message'].strip()
        if not user_message:
            return jsonify({
                'status': 'error',
                'message': 'الرسالة فارغة'
            }), 400

        # Get conversation context
        conversation_id = data.get('conversation_id')
        conversation_history = data.get('conversation_history', [])
        request_complete_answer = data.get('request_complete_answer', True)
        prefer_arabic = data.get('prefer_arabic', True)
        enhanced_arabic_mode = data.get('enhanced_arabic_mode', True)

        # Get relevant documents
        documents = Document.query.all()
        document_context = ""
        
        if documents:
            # Simple keyword matching for context
            keywords = user_message.lower().split()
            relevant_docs = []
            
            for doc in documents:
                if doc.content:
                    content_lower = doc.content.lower()
                    relevance_score = sum(1 for keyword in keywords if keyword in content_lower)
                    if relevance_score > 0:
                        relevant_docs.append((doc, relevance_score))
            
            # Sort by relevance and take top 3
            relevant_docs.sort(key=lambda x: x[1], reverse=True)
            top_docs = relevant_docs[:3]
            
            if top_docs:
                document_context = "\n\n".join([
                    f"من الملف {doc.filename}:\n{doc.content[:1000]}..."
                    for doc, _ in top_docs
                ])

        # Generate response using AI engine
        if ai_engine:
            try:
                response_text = ai_engine.generate_response(
                    user_message,
                    context=document_context,
                    conversation_history=conversation_history,
                    prefer_arabic=prefer_arabic,
                    enhanced_arabic_mode=enhanced_arabic_mode,
                    request_complete_answer=request_complete_answer
                )
                
                confidence = 0.85  # Default confidence
                sources = [{'filename': doc.filename} for doc, _ in top_docs] if 'top_docs' in locals() else []
                
            except Exception as e:
                logger.error(f"❌ خطأ في محرك الذكاء الاصطناعي: {e}")
                response_text = self.generate_fallback_response(user_message, document_context)
                confidence = 0.6
                sources = []
        else:
            response_text = self.generate_fallback_response(user_message, document_context)
            confidence = 0.6
            sources = []

        # Save chat message to database if conversation_id provided
        if conversation_id:
            try:
                # Save user message
                user_msg = ChatMessage(
                    session_id=conversation_id,
                    message_type='user',
                    content=user_message,
                    timestamp=datetime.now()
                )
                db.session.add(user_msg)
                
                # Save assistant response
                assistant_msg = ChatMessage(
                    session_id=conversation_id,
                    message_type='assistant',
                    content=response_text,
                    confidence=confidence,
                    sources=json.dumps(sources, ensure_ascii=False),
                    timestamp=datetime.now()
                )
                db.session.add(assistant_msg)
                db.session.commit()
                
            except Exception as e:
                logger.warning(f"⚠️ فشل في حفظ الرسائل: {e}")

        return jsonify({
            'status': 'success',
            'response': response_text,
            'confidence': confidence,
            'sources': sources,
            'is_complete_answer': request_complete_answer,
            'arabic_enhanced': enhanced_arabic_mode,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"❌ خطأ في معالجة المحادثة: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في معالجة الرسالة: {str(e)}"
        }), 500

def generate_fallback_response(self, user_message, context=""):
    """Generate a fallback response when AI engine is not available"""
    responses = {
        'greeting': [
            'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',
            'مرحباً بك في المدرس AI المحسن! أنا هنا لمساعدتك.',
            'السلام عليكم! أنا مساعدك الذكي للدراسة.'
        ],
        'question': [
            'هذا سؤال مهم! دعني أبحث في الملفات المتاحة لأعطيك إجابة دقيقة.',
            'بناءً على المحتوى المتاح، يمكنني مساعدتك في هذا الموضوع.',
            'سأحاول الإجابة على سؤالك بناءً على المعلومات المتوفرة.'
        ],
        'default': [
            'أعتذر، أواجه صعوبة في معالجة طلبك حالياً. يرجى المحاولة مرة أخرى.',
            'يبدو أن هناك مشكلة تقنية. يرجى إعادة صياغة سؤالك.',
            'أحتاج لمزيد من التوضيح لأتمكن من مساعدتك بشكل أفضل.'
        ]
    }
    
    # Simple intent detection
    greetings = ['مرحبا', 'أهلا', 'السلام', 'صباح', 'مساء']
    question_words = ['ما', 'من', 'كيف', 'متى', 'أين', 'لماذا', 'هل']
    
    user_lower = user_message.lower()
    
    if any(greeting in user_lower for greeting in greetings):
        import random
        return random.choice(responses['greeting'])
    elif any(word in user_lower for word in question_words):
        import random
        base_response = random.choice(responses['question'])
        if context:
            return f"{base_response}\n\nبناءً على الملفات المتاحة:\n{context[:500]}..."
        return base_response
    else:
        import random
        return random.choice(responses['default'])

@app.route('/api/search', methods=['POST'])
def search_documents():
    """Search in uploaded documents"""
    try:
        data = request.get_json()
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({
                'status': 'error',
                'message': 'استعلام البحث فارغ'
            }), 400

        # Search in documents
        documents = Document.query.all()
        results = []
        
        for doc in documents:
            if doc.content and query.lower() in doc.content.lower():
                # Find the context around the match
                content_lower = doc.content.lower()
                query_lower = query.lower()
                
                match_index = content_lower.find(query_lower)
                if match_index >= 0:
                    start = max(0, match_index - 100)
                    end = min(len(doc.content), match_index + len(query) + 100)
                    content_preview = doc.content[start:end]
                    
                    if start > 0:
                        content_preview = "..." + content_preview
                    if end < len(doc.content):
                        content_preview = content_preview + "..."
                    
                    results.append({
                        'id': doc.id,
                        'filename': doc.filename,
                        'content_preview': content_preview,
                        'word_count': doc.word_count,
                        'created_at': doc.upload_date.isoformat()
                    })

        return jsonify({
            'status': 'success',
            'results': results,
            'query': query,
            'total_results': len(results)
        })

    except Exception as e:
        logger.error(f"❌ خطأ في البحث: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في البحث: {str(e)}"
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_statistics():
    """Get application statistics"""
    try:
        stats = {
            'total_documents': Document.query.count(),
            'total_sessions': ChatSession.query.count(),
            'total_messages': ChatMessage.query.count(),
            'total_words': db.session.query(db.func.sum(Document.word_count)).scalar() or 0,
            'last_upload': None,
            'last_chat': None
        }
        
        # Get last upload date
        last_doc = Document.query.order_by(Document.upload_date.desc()).first()
        if last_doc:
            stats['last_upload'] = last_doc.upload_date.isoformat()
        
        # Get last chat date
        last_message = ChatMessage.query.order_by(ChatMessage.timestamp.desc()).first()
        if last_message:
            stats['last_chat'] = last_message.timestamp.isoformat()

        return jsonify({
            'status': 'success',
            'stats': stats
        })

    except Exception as e:
        logger.error(f"❌ خطأ في جلب الإحصائيات: {e}")
        return jsonify({
            'status': 'error',
            'message': f"خطأ في جلب الإحصائيات: {str(e)}"
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'status': 'error',
        'message': 'الصفحة المطلوبة غير موجودة'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"❌ خطأ داخلي في الخادم: {error}")
    return jsonify({
        'status': 'error',
        'message': 'خطأ داخلي في الخادم'
    }), 500

@app.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(error):
    """Handle file too large errors"""
    return jsonify({
        'status': 'error',
        'message': 'الملف كبير جداً. الحد الأقصى 16 ميجابايت'
    }), 413

if __name__ == '__main__':
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("✅ تم إنشاء جداول قاعدة البيانات")
        except Exception as e:
            logger.error(f"❌ خطأ في إنشاء الجداول: {e}")

    # Run the application
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"🚀 بدء تشغيل المدرس AI المحسن على المنفذ {port}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug,
        threaded=True
    )

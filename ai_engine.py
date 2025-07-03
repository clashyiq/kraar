# -*- coding: utf-8 -*-
"""
Teacher AI Enhanced - AI Engine
تطبيق المدرس AI المحسن - محرك الذكاء الاصطناعي

Author: Teacher AI Enhanced Team
Version: 2.0.0
"""

import os
import logging
import json
from typing import List, Dict, Optional, Union
from datetime import datetime

# AI Libraries
try:
    import openai
    from anthropic import Anthropic
except ImportError as e:
    logging.warning(f"AI libraries not fully available: {e}")
    openai = None
    Anthropic = None

# Configure logging
logger = logging.getLogger(__name__)

class TeacherAIEngine:
    """Enhanced AI Engine for Teacher AI with Arabic language support"""
    
    def __init__(self):
        """Initialize the AI engine with enhanced Arabic capabilities"""
        self.openai_client = None
        self.anthropic_client = None
        
        # Initialize OpenAI
        if openai and os.getenv('OPENAI_API_KEY'):
            openai.api_key = os.getenv('OPENAI_API_KEY')
            self.openai_client = openai
            logger.info("✅ تم تهيئة OpenAI بنجاح")
        else:
            logger.warning("⚠️ مفتاح OpenAI غير متوفر")
        
        # Initialize Anthropic
        if Anthropic and os.getenv('ANTHROPIC_API_KEY'):
            self.anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            logger.info("✅ تم تهيئة Anthropic بنجاح")
        else:
            logger.warning("⚠️ مفتاح Anthropic غير متوفر")
        
        # Configuration
        self.config = {
            'openai_model': os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo'),
            'anthropic_model': os.getenv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229'),
            'max_tokens': 4000,
            'temperature': 0.7,
            'arabic_enhanced': True,
            'prefer_arabic': True
        }
        
        # Enhanced Arabic system prompt
        self.arabic_system_prompt = """
أنت المدرس AI المحسن، مساعد ذكي متخصص في التعليم والدراسة باللغة العربية.

**مهامك الأساسية:**
1. الإجابة على الأسئلة التعليمية بشكل شامل ومفصل
2. شرح المفاهيم المعقدة بطريقة مبسطة ومفهومة
3. تقديم أمثلة عملية وتطبيقية
4. مساعدة الطلاب في فهم المواد الدراسية
5. تحليل وتلخيص المحتوى المرفوع

**إرشادات الإجابة:**
- استخدم اللغة العربية الفصحى بشكل أساسي
- قدم إجابات مفصلة وشاملة
- استخدم الأمثلة والتشبيهات لتوضيح المفاهيم
- نظم إجاباتك بشكل منطقي ومتسلسل
- أضف المصادر والمراجع عند الحاجة
- استخدم التنسيق والعناوين لتحسين القراءة

**التعامل مع المحتوى:**
- اقرأ وحلل المحتوى المرفوع بعناية
- استخرج النقاط الرئيسية والمفاهيم المهمة
- اربط الأسئلة بالمحتوى المتاح
- قدم إجابات مستندة إلى المصادر المرفوعة

**نبرة التفاعل:**
- كن ودودًا ومشجعًا
- تحلى بالصبر والتفهم
- قدم المساعدة بطريقة إيجابية
- شجع على التعلم والاستكشاف

تذكر: هدفك هو تسهيل التعلم وجعله تجربة ممتعة ومثمرة للطلاب.
"""
    
    def generate_response(
        self,
        user_message: str,
        context: str = "",
        conversation_history: List[Dict] = None,
        prefer_arabic: bool = True,
        enhanced_arabic_mode: bool = True,
        request_complete_answer: bool = True
    ) -> str:
        """
        Generate AI response with enhanced Arabic support
        
        Args:
            user_message: User's question or message
            context: Relevant document context
            conversation_history: Previous conversation messages
            prefer_arabic: Whether to prefer Arabic language in response
            enhanced_arabic_mode: Enable enhanced Arabic language processing
            request_complete_answer: Request comprehensive answer
            
        Returns:
            Generated response text
        """
        try:
            # Prepare enhanced prompt
            enhanced_prompt = self._prepare_enhanced_prompt(
                user_message=user_message,
                context=context,
                conversation_history=conversation_history or [],
                prefer_arabic=prefer_arabic,
                enhanced_arabic_mode=enhanced_arabic_mode,
                request_complete_answer=request_complete_answer
            )
            
            # Try Anthropic first (better for Arabic)
            if self.anthropic_client:
                try:
                    response = self._generate_anthropic_response(enhanced_prompt)
                    if response:
                        logger.info("✅ تم توليد الإجابة باستخدام Anthropic")
                        return self._enhance_arabic_response(response)
                except Exception as e:
                    logger.warning(f"⚠️ فشل Anthropic، محاولة OpenAI: {e}")
            
            # Fallback to OpenAI
            if self.openai_client:
                try:
                    response = self._generate_openai_response(enhanced_prompt)
                    if response:
                        logger.info("✅ تم توليد الإجابة باستخدام OpenAI")
                        return self._enhance_arabic_response(response)
                except Exception as e:
                    logger.warning(f"⚠️ فشل OpenAI: {e}")
            
            # Fallback response
            return self._generate_fallback_response(user_message, context)
            
        except Exception as e:
            logger.error(f"❌ خطأ في توليد الإجابة: {e}")
            return self._generate_fallback_response(user_message, context)
    
    def _prepare_enhanced_prompt(
        self,
        user_message: str,
        context: str,
        conversation_history: List[Dict],
        prefer_arabic: bool,
        enhanced_arabic_mode: bool,
        request_complete_answer: bool
    ) -> str:
        """Prepare enhanced prompt with Arabic optimization"""
        
        # Build conversation context
        conversation_context = ""
        if conversation_history:
            conversation_context = "\n**السياق من المحادثة السابقة:**\n"
            for msg in conversation_history[-3:]:  # Last 3 messages for context
                role = "المستخدم" if msg.get('type') == 'user' else "المساعد"
                conversation_context += f"{role}: {msg.get('text', '')}\n"
        
        # Build document context
        document_context = ""
        if context:
            document_context = f"\n**المحتوى المرجعي:**\n{context}\n"
        
        # Build enhanced prompt
        enhanced_prompt = f"""{self.arabic_system_prompt}

{conversation_context}
{document_context}

**السؤال الحالي:** {user_message}

**تعليمات خاصة:**
- {"قدم إجابة شاملة ومفصلة" if request_complete_answer else "قدم إجابة مختصرة ومفيدة"}
- {"استخدم اللغة العربية بشكل أساسي" if prefer_arabic else "يمكنك استخدام العربية والإنجليزية"}
- {"طبق التحسينات العربية المتقدمة للنطق والفهم" if enhanced_arabic_mode else ""}
- استند إلى المحتوى المرفوع عند الإجابة
- نظم إجابتك بشكل واضح ومفهوم

**الإجابة:**"""
        
        return enhanced_prompt
    
    def _generate_anthropic_response(self, prompt: str) -> Optional[str]:
        """Generate response using Anthropic Claude"""
        try:
            message = self.anthropic_client.messages.create(
                model=self.config['anthropic_model'],
                max_tokens=self.config['max_tokens'],
                temperature=self.config['temperature'],
                messages=[{
                    "role": "user",
                    "content": prompt
                }]
            )
            
            if message.content and len(message.content) > 0:
                return message.content[0].text
            
            return None
            
        except Exception as e:
            logger.error(f"❌ خطأ في Anthropic: {e}")
            return None
    
    def _generate_openai_response(self, prompt: str) -> Optional[str]:
        """Generate response using OpenAI GPT"""
        try:
            response = self.openai_client.ChatCompletion.create(
                model=self.config['openai_model'],
                messages=[
                    {"role": "system", "content": self.arabic_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.config['max_tokens'],
                temperature=self.config['temperature'],
                top_p=1,
                frequency_penalty=0,
                presence_penalty=0
            )
            
            if response.choices and len(response.choices) > 0:
                return response.choices[0].message.content
            
            return None
            
        except Exception as e:
            logger.error(f"❌ خطأ في OpenAI: {e}")
            return None
    
    def _enhance_arabic_response(self, response: str) -> str:
        """Enhance Arabic text for better speech synthesis and readability"""
        if not response:
            return response
        
        # Arabic text enhancements
        enhancements = {
            # Religious phrases
            'الله': 'اللّٰه',
            'الرحمن': 'الرَّحْمٰن',
            'الرحيم': 'الرَّحِيم',
            
            # Common academic terms
            'التعليم': 'التَّعْلِيم',
            'الدراسة': 'الدِّرَاسَة',
            'المعرفة': 'المَعْرِفَة',
            'الفهم': 'الفَهْم',
            
            # Numbers in Arabic
            '1': 'واحد',
            '2': 'اثنان',
            '3': 'ثلاثة',
            '4': 'أربعة',
            '5': 'خمسة',
            
            # Punctuation for better speech
            '.': '.\n',
            '!': '!\n',
            '?': '؟\n',
        }
        
        enhanced_response = response
        for original, enhanced in enhancements.items():
            enhanced_response = enhanced_response.replace(original, enhanced)
        
        return enhanced_response
    
    def _generate_fallback_response(self, user_message: str, context: str = "") -> str:
        """Generate fallback response when AI services are unavailable"""
        
        fallback_responses = {
            'greeting': [
                'أهلاً وسهلاً بك في المدرس AI المحسن! 🌟\n\nأنا هنا لمساعدتك في دراستك وتعلمك. يمكنني:\n• الإجابة على أسئلتك التعليمية\n• شرح المفاهيم المعقدة\n• تحليل المحتوى المرفوع\n• مساعدتك في فهم دروسك\n\nكيف يمكنني مساعدتك اليوم؟',
                'مرحباً بك! 👋\n\nأنا المدرس AI المحسن، مساعدك الذكي للتعلم. أتطلع لمساعدتك في رحلتك التعليمية.',
                'السلام عليكم ومرحباً بك! 📚\n\nأنا هنا لأكون رفيقك في التعلم والدراسة. اسأل عن أي موضوع تريد فهمه أكثر.'
            ],
            'question': [
                f'سؤال ممتاز! 🤔\n\nبناءً على خبرتي، يمكنني القول أن موضوع "{user_message[:50]}..." مهم جداً في التعلم.\n\n{context[:300] if context else "للحصول على إجابة أكثر تفصيلاً، يرجى رفع المواد الدراسية ذات الصلة."}',
                f'هذا سؤال مفيد! 💡\n\nدعني أساعدك في فهم "{user_message[:50]}...".\n\n{context[:300] if context else "أنصحك برفع الملفات الدراسية المتعلقة بهذا الموضوع للحصول على إجابة أدق."}',
                f'أقدر سؤالك حول "{user_message[:50]}..." 📖\n\n{context[:300] if context else "للإجابة بشكل أفضل، أحتاج إلى مراجعة المحتوى الدراسي المتعلق بهذا الموضوع."}'
            ],
            'analysis': [
                f'تحليل رائع للموضوع! 📊\n\nبناءً على المحتوى المتاح:\n{context[:500] if context else "المحتوى غير متوفر حالياً"}\n\nهل تريد المزيد من التفاصيل حول نقطة معينة؟',
                f'موضوع شيق للدراسة! 🔍\n\n{context[:500] if context else "لتحليل أفضل، يرجى رفع المواد الدراسية ذات الصلة."}\n\nما الجانب الذي تريد التركيز عليه أكثر؟'
            ],
            'default': [
                'أعتذر، أواجه صعوبة في الاتصال بخدمات الذكاء الاصطناعي حالياً. 😔\n\nولكن يمكنني مساعدتك بطرق أخرى:\n• ارفع ملفاتك الدراسية وسأحللها\n• استخدم البحث للعثور على معلومات محددة\n• اطرح أسئلة أكثر تحديداً\n\nأو حاول إعادة صياغة سؤالك بشكل مختلف.',
                'يبدو أن هناك مشكلة تقنية مؤقتة. 🔧\n\nفي هذه الأثناء:\n• تأكد من رفع المواد الدراسية\n• جرب البحث في الملفات المرفوعة\n• اطرح سؤالاً أكثر تفصيلاً\n\nسأعود للعمل قريباً بإذن الله!'
            ]
        }
        
        # Simple intent detection
        user_lower = user_message.lower()
        
        # Greeting detection
        greetings = ['مرحبا', 'أهلا', 'السلام', 'صباح', 'مساء', 'hello', 'hi']
        if any(greeting in user_lower for greeting in greetings):
            import random
            return random.choice(fallback_responses['greeting'])
        
        # Question detection
        question_words = ['ما', 'من', 'كيف', 'متى', 'أين', 'لماذا', 'هل', 'what', 'how', 'why', 'when', 'where']
        if any(word in user_lower for word in question_words):
            import random
            return random.choice(fallback_responses['question'])
        
        # Analysis detection
        analysis_words = ['حلل', 'اشرح', 'وضح', 'لخص', 'explain', 'analyze', 'summarize']
        if any(word in user_lower for word in analysis_words):
            import random
            return random.choice(fallback_responses['analysis'])
        
        # Default response
        import random
        return random.choice(fallback_responses['default'])
    
    def is_available(self) -> bool:
        """Check if AI services are available"""
        return self.openai_client is not None or self.anthropic_client is not None
    
    def get_available_models(self) -> List[str]:
        """Get list of available AI models"""
        models = []
        if self.openai_client:
            models.extend(['gpt-3.5-turbo', 'gpt-4'])
        if self.anthropic_client:
            models.extend(['claude-3-sonnet-20240229', 'claude-3-haiku-20240307'])
        return models
    
    def get_usage_stats(self) -> Dict:
        """Get usage statistics"""
        return {
            'openai_available': self.openai_client is not None,
            'anthropic_available': self.anthropic_client is not None,
            'arabic_enhanced': self.config['arabic_enhanced'],
            'models_available': self.get_available_models(),
            'timestamp': datetime.now().isoformat()
        }

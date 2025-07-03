# 🎓 المدرس AI المحسن | Teacher AI Enhanced

<div align="center">

![Teacher AI Enhanced](https://via.placeholder.com/800x400/667eea/ffffff?text=المدرس+AI+المحسن)

**مساعد ذكي للدراسة والتعلم مع النطق العربي المتقدم**

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Arabic](https://img.shields.io/badge/Language-العربية-red.svg)](README.ar.md)

[العربية](README.ar.md) | [English](README.md) | [Demo](https://your-demo-link.com) | [Documentation](docs/)

</div>

## 🌟 **المميزات الرئيسية**

### 🎙️ **النطق العربي المحسن**
- **نطق تلقائي** للإجابات بصوت عربي طبيعي
- دعم **16 لهجة عربية** مختلفة (سعودي، مصري، إماراتي، أردني، لبناني، مغربي، جزائري، تونسي، عراقي، سوري، كويتي، قطري، بحريني، عماني، يمني، فلسطيني)
- **تحسينات خاصة** لنطق المصطلحات العلمية والدينية
- إمكانية **ضبط سرعة النطق** حسب التفضيل
- **تسجيل صوتي محسن** للأسئلة بالعربية

### 📚 **معالجة المستندات الذكية**
- دعم متعدد الصيغ: **PDF, DOC, DOCX, TXT, RTF**
- **استخراج ذكي** للنصوص العربية
- **فهرسة تلقائية** للمحتوى
- **بحث متقدم** في جميع الملفات المرفوعة

### 💬 **محادثات ذكية ومحفوظة**
- **حفظ تلقائي** لجلسات المحادثة
- **تصنيف ذكي** للمحادثات حسب التاريخ والموضوع
- **إجابات سياقية** تأخذ في الاعتبار المحادثة السابقة
- **مصادر موثقة** مع كل إجابة

### 🎨 **واجهة محسنة ومتجاوبة**
- دعم كامل للوضع الداكن مع **تبديل تلقائي**
- **تخطيط متجاوب** لجميع أحجام الشاشات
- **رموز وإشعارات عربية** محسنة
- **أزرار وأيقونات** واضحة ومفهومة

## 🚀 **التثبيت والتشغيل**

### 📋 **المتطلبات**
- Python 3.8 أو أحدث
- pip (مدير حزم Python)
- Git

### 1️⃣ **استنساخ المستودع**
```bash
git clone https://github.com/clashyiq/kraar.git
cd kraar
```

### 2️⃣ **إنشاء بيئة افتراضية**
```bash
# على Windows
python -m venv venv
venv\Scripts\activate

# على macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ **تثبيت المتطلبات**
```bash
pip install -r requirements.txt
```

### 4️⃣ **إعداد متغيرات البيئة**
```bash
# انسخ ملف البيئة المثال
cp .env.example .env

# قم بتحرير الملف وإضافة مفاتيح API الخاصة بك
nano .env
```

**متغيرات البيئة المطلوبة:**
```bash
SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
DATABASE_URL=sqlite:///teacher_ai_enhanced.db
```

### 5️⃣ **تهيئة قاعدة البيانات**
```bash
python -c "from app import app, db; app.app_context().push(); db.create_all()"
```

### 6️⃣ **تشغيل التطبيق**
```bash
python app.py
```

🎉 **التطبيق الآن يعمل على:** `http://localhost:5000`

## 🐳 **التشغيل باستخدام Docker**

### **بناء وتشغيل الحاوية**
```bash
# بناء الصورة
docker build -t teacher-ai-enhanced .

# تشغيل الحاوية
docker run -p 5000:5000 teacher-ai-enhanced
```

### **استخدام Docker Compose**
```bash
docker-compose up -d
```

## ☁️ **النشر على الاستضافة**

### **Heroku**
```bash
# تسجيل الدخول إلى Heroku
heroku login

# إنشاء تطبيق جديد
heroku create your-app-name

# إضافة متغيرات البيئة
heroku config:set SECRET_KEY=your-secret-key
heroku config:set OPENAI_API_KEY=your-openai-key
heroku config:set ANTHROPIC_API_KEY=your-anthropic-key

# نشر التطبيق
git push heroku main
```

### **Railway**
1. ادخل إلى [Railway.app](https://railway.app)
2. اربط حساب GitHub
3. اختر المستودع
4. أضف متغيرات البيئة
5. انشر التطبيق

### **Render**
1. ادخل إلى [Render.com](https://render.com)
2. اربط حساب GitHub
3. اختر "Web Service"
4. حدد المستودع
5. أضف متغيرات البيئة
6. انشر التطبيق

## 📖 **كيفية الاستخدام**

### **البدء السريع:**
1. **ارفع ملفاتك** من الزر على اليمين (📁)
2. **فعّل النطق التلقائي** من الإعدادات
3. **اختر اللهجة المفضلة** من إعدادات النطق
4. **اكتب سؤالك** أو استخدم **التسجيل الصوتي** (🎤)
5. **استمع للإجابة** بالنطق العربي المحسن

### **الاختصارات المفيدة:**
- `Ctrl + H` - تاريخ المحادثات
- `Ctrl + Enter` - إرسال الرسالة  
- `Ctrl + M` - تسجيل صوتي
- `Ctrl + K` - البحث المتقدم
- `Escape` - إيقاف النطق أو إغلاق النوافذ

## 🔧 **التكوين المتقدم**

### **إعدادات الذكاء الاصطناعي**
```python
# في ملف config.py
OPENAI_MODEL = "gpt-4"  # أو gpt-3.5-turbo
ANTHROPIC_MODEL = "claude-3-sonnet-20240229"
RESPONSE_TEMPERATURE = 0.7
MAX_RESPONSE_LENGTH = 4000
```

### **إعدادات النطق العربي**
```python
ARABIC_SPEECH_RATE = 0.7  # سرعة النطق (0.1 - 2.0)
ARABIC_SPEECH_PITCH = 1.0  # نبرة الصوت
SUPPORTED_ARABIC_DIALECTS = [
    'ar-SA',  # السعودية (الفصحى)
    'ar-EG',  # المصرية
    'ar-AE',  # الإماراتية
    # ... المزيد
]
```

## 📁 **هيكل المشروع**

```
teacher-ai-enhanced/
├── 📄 app.py                 # التطبيق الرئيسي
├── 📄 config.py             # ملف الإعدادات
├── 📄 database.py           # نماذج قاعدة البيانات
├── 📄 ai_engine.py          # محرك الذكاء الاصطناعي
├── 📄 document_processor.py # معالج المستندات
├── 📄 requirements.txt      # متطلبات Python
├── 📄 .env.example         # مثال متغيرات البيئة
├── 📄 Dockerfile           # ملف Docker
├── 📄 docker-compose.yml   # ملف Docker Compose
├── 📄 Procfile             # ملف Heroku
├── 📁 templates/            # قوالب HTML
│   └── 📄 index.html       # الصفحة الرئيسية
├── 📁 static/              # الملفات الثابتة
│   ├── 📁 css/            # ملفات CSS
│   ├── 📁 js/             # ملفات JavaScript
│   └── 📁 images/         # الصور
├── 📁 uploads/             # ملفات المستخدمين المرفوعة
├── 📁 logs/               # ملفات السجل
└── 📁 tests/              # الاختبارات
```

## 🤝 **المساهمة**

نرحب بالمساهمات! يرجى اتباع هذه الخطوات:

1. **Fork** المستودع
2. إنشاء فرع جديد: `git checkout -b feature/amazing-feature`
3. Commit التغييرات: `git commit -m 'Add amazing feature'`
4. Push إلى الفرع: `git push origin feature/amazing-feature`
5. فتح **Pull Request**

### **إرشادات المساهمة:**
- اكتب كود نظيف ومفهوم
- أضف اختبارات للميزات الجديدة
- حدث الوثائق حسب الحاجة
- اتبع معايير Python (PEP 8)

## 🐛 **الإبلاغ عن الأخطاء**

إذا وجدت خطأ، يرجى [فتح issue](https://github.com/clashyiq/kraar/issues) مع:
- وصف مفصل للمشكلة
- خطوات إعادة الإنتاج
- لقطات شاشة (إن أمكن)
- معلومات البيئة (نظام التشغيل، إصدار Python، إلخ)

## 📄 **الترخيص**

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 🙏 **الشكر والتقدير**

- [OpenAI](https://openai.com) - للذكاء الاصطناعي
- [Anthropic](https://anthropic.com) - لنماذج Claude
- [Flask](https://flask.palletsprojects.com) - لإطار العمل
- [Font Awesome](https://fontawesome.com) - للأيقونات
- [Google Fonts](https://fonts.google.com) - للخطوط العربية

## 📞 **التواصل**

- **الموقع:** [your-website.com](https://your-website.com)
- **البريد الإلكتروني:** support@your-domain.com
- **تويتر:** [@YourHandle](https://twitter.com/YourHandle)
- **GitHub:** [clashyiq](https://github.com/clashyiq)

---

<div align="center">

**صنع بـ ❤️ للمجتمع العربي**

[⭐ أعط النجمة للمشروع](https://github.com/clashyiq/kraar) | [🐛 أبلغ عن خطأ](https://github.com/clashyiq/kraar/issues) | [💡 اقترح ميزة](https://github.com/clashyiq/kraar/issues)

</div>

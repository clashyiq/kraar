# 🤝 المساهمة في المدرس AI المحسن | Contributing to Teacher AI Enhanced

نرحب بمساهماتكم! يسرنا أن نتلقى مساعدتكم لتحسين وتطوير المدرس AI المحسن.

We welcome contributions! We're excited to receive your help in improving Teacher AI Enhanced.

## 📋 **قبل البدء | Before You Start**

### **للمساهمين العرب | For Arabic Contributors**
- تأكد من فهم أهداف المشروع ورؤيته
- اقرأ الكود والوثائق الموجودة
- تحقق من القضايا المفتوحة (Issues) قبل البدء

### **For International Contributors**
- Please ensure you understand the project's goals and vision
- Read through existing code and documentation
- Check open issues before starting work

## 🚀 **كيفية المساهمة | How to Contribute**

### 1️⃣ **إعداد البيئة | Setting Up**

```bash
# Fork المستودع | Fork the repository
git clone https://github.com/your-username/kraar.git
cd kraar

# إنشاء بيئة افتراضية | Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# أو | or
venv\Scripts\activate  # Windows

# تثبيت المتطلبات | Install dependencies
pip install -r requirements.txt

# إعداد ملف البيئة | Setup environment file
cp .env.example .env
# قم بتحرير .env وإضافة مفاتيحك | Edit .env and add your keys
```

### 2️⃣ **إنشاء فرع جديد | Create New Branch**

```bash
# إنشاء فرع للميزة الجديدة | Create feature branch
git checkout -b feature/amazing-feature

# أو للإصلاح | or for bug fix
git checkout -b fix/issue-description

# أو للتحديث | or for update
git checkout -b update/documentation
```

### 3️⃣ **تطوير المساهمة | Develop Your Contribution**

#### **أنواع المساهمات المرحب بها | Welcome Contribution Types:**

- 🐛 **إصلاح الأخطاء | Bug Fixes**
- ✨ **ميزات جديدة | New Features**
- 📚 **تحسين الوثائق | Documentation Improvements**
- 🎨 **تحسين الواجهة | UI/UX Improvements**
- 🌐 **ترجمات | Translations**
- 🚀 **تحسين الأداء | Performance Improvements**
- 🧪 **إضافة اختبارات | Adding Tests**

#### **إرشادات الكود | Code Guidelines:**

**للـ Python:**
```python
# استخدم أسماء متغيرات واضحة | Use clear variable names
user_message = request.get_json()['message']  # ✅ جيد | Good
msg = request.get_json()['message']           # ❌ غير واضح | Unclear

# أضف تعليقات بالعربية والإنجليزية | Add bilingual comments
def process_arabic_text(text):
    """
    معالجة النص العربي وتحسينه للنطق
    Process Arabic text and enhance it for speech synthesis
    """
    # تنظيف النص من الرموز غير المرغوبة
    # Clean text from unwanted symbols
    cleaned_text = remove_unwanted_chars(text)
    return cleaned_text
```

**للـ JavaScript:**
```javascript
// استخدم const/let بدلاً من var | Use const/let instead of var
const arabicText = 'النص العربي';  // ✅
var text = 'text';                  // ❌

// أضف تعليقات توضيحية | Add explanatory comments
function enhanceArabicSpeech(text) {
    // تحسين النطق العربي | Enhance Arabic pronunciation
    return cleanTextForSpeech(text);
}
```

**للـ CSS:**
```css
/* استخدم أسماء واضحة للكلاسات | Use clear class names */
.arabic-text-container {  /* ✅ واضح | Clear */
    direction: rtl;
    font-family: 'Cairo', sans-serif;
}

.container1 {              /* ❌ غير واضح | Unclear */
    direction: rtl;
}
```

### 4️⃣ **اختبار التغييرات | Testing Changes**

```bash
# تشغيل الاختبارات | Run tests
python -m pytest tests/

# اختبار يدوي | Manual testing
python app.py

# التحقق من جودة الكود | Check code quality
flake8 .
black .
```

### 5️⃣ **إرسال المساهمة | Submit Contribution**

```bash
# إضافة التغييرات | Add changes
git add .

# كتابة رسالة واضحة | Write clear commit message
git commit -m "✨ إضافة ميزة النطق المحسن للعربية

- إضافة دعم للهجات عربية متعددة
- تحسين جودة النطق للمصطلحات العلمية
- إصلاح مشكلة البطء في التحميل

Add enhanced Arabic speech feature
- Add support for multiple Arabic dialects  
- Improve pronunciation quality for scientific terms
- Fix slow loading issue"

# رفع التغييرات | Push changes
git push origin feature/amazing-feature
```

### 6️⃣ **فتح Pull Request**

1. اذهب إلى GitHub وافتح Pull Request
2. اكتب وصفاً واضحاً للتغييرات بالعربية والإنجليزية
3. أضف screenshots إذا كانت التغييرات تؤثر على الواجهة
4. اربط PR بالـ Issue المتعلق (إن وجد)

## 📝 **معايير المراجعة | Review Criteria**

### **سيتم قبول المساهمة إذا | Contribution will be accepted if:**
- ✅ تتبع إرشادات الكود
- ✅ تتضمن اختبارات (إن أمكن)
- ✅ لا تكسر الوظائف الموجودة
- ✅ تحسن من تجربة المستخدم
- ✅ موثقة بشكل جيد
- ✅ تدعم اللغة العربية

### **سيتم رفض المساهمة إذا | Contribution will be rejected if:**
- ❌ تحتوي على أخطاء أمنية
- ❌ تكسر الوظائف الموجودة
- ❌ غير موثقة
- ❌ لا تتبع معايير الكود
- ❌ تتضارب مع أهداف المشروع

## 🐛 **الإبلاغ عن الأخطاء | Reporting Bugs**

### **قبل الإبلاغ | Before Reporting:**
1. تأكد من أن الخطأ لم يُبلغ عنه مسبقاً
2. جرب إعادة إنتاج الخطأ
3. اجمع معلومات مفصلة

### **تنسيق التقرير | Report Format:**
```markdown
## 🐛 وصف الخطأ | Bug Description
وصف واضح ومختصر للمشكلة
Clear and concise description of the problem

## 🔄 خطوات إعادة الإنتاج | Steps to Reproduce
1. اذهب إلى...
2. انقر على...
3. قم بـ...
4. شاهد الخطأ

## ✅ السلوك المتوقع | Expected Behavior
ما كان يجب أن يحدث
What should have happened

## 📱 البيئة | Environment
- نظام التشغيل | OS: [e.g. Windows 11, macOS 12, Ubuntu 20.04]
- المتصفح | Browser: [e.g. Chrome 91, Firefox 89]
- إصدار Python | Python Version: [e.g. 3.9.7]

## 📷 لقطات الشاشة | Screenshots
إن أمكن، أضف لقطات شاشة توضح المشكلة
If possible, add screenshots showing the problem
```

## 💡 **اقتراح الميزات | Feature Requests**

### **تنسيق الاقتراح | Request Format:**
```markdown
## ✨ وصف الميزة | Feature Description
وصف واضح للميزة المقترحة
Clear description of the proposed feature

## 🎯 المشكلة | Problem
ما المشكلة التي تحلها هذه الميزة؟
What problem does this feature solve?

## 💭 الحل المقترح | Proposed Solution
كيف تتصور تنفيذ هذه الميزة؟
How do you envision implementing this feature?

## 🔄 البدائل | Alternatives
هل فكرت في حلول بديلة؟
Have you considered alternative solutions?

## ➕ سياق إضافي | Additional Context
أي معلومات أخرى مفيدة
Any other useful information
```

## 👥 **مجتمع المطورين | Developer Community**

### **التواصل | Communication:**
- **GitHub Issues:** للأخطاء والاقتراحات
- **GitHub Discussions:** للنقاشات العامة
- **Pull Requests:** لمراجعة الكود

### **آداب التعامل | Code of Conduct:**
- 🤝 احترام جميع المساهمين
- 💬 استخدام لغة مهذبة ومحترمة
- 🎯 التركيز على المشكلة وليس الشخص
- 📚 مشاركة المعرفة والخبرات
- 🌍 الترحيب بالمساهمين من جميع البلدان والخلفيات

## 🏆 **الاعتراف بالمساهمين | Contributor Recognition**

- سيتم إضافة جميع المساهمين إلى قائمة الشكر
- المساهمات الكبيرة ستحصل على ذكر خاص
- نشجع على إضافة اسمك إلى AUTHORS.md

## ❓ **أسئلة؟ | Questions?**

إذا كانت لديك أسئلة، لا تتردد في:
- فتح Discussion على GitHub
- إرسال Issue مع label "question"
- التواصل مع المشرفين

---

## 🙏 **شكراً لمساهمتك! | Thank You for Contributing!**

كل مساهمة، مهما كانت صغيرة، تساعد في تحسين المدرس AI المحسن وتفيد المجتمع العربي.

Every contribution, no matter how small, helps improve Teacher AI Enhanced and benefits the Arabic community.

**معاً نبني مستقبل التعليم الذكي! 🚀**
**Together we build the future of intelligent education! 🚀**

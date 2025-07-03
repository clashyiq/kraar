/**
 * Teacher AI Application - Enhanced JavaScript Module
 * تطبيق المدرس AI - الوحدة المطورة مع المميزات الجديدة
 * Features: Chat History, Enhanced Arabic Speech, Complete Answers, Fixed Layout
 */

class TeacherAI {
    constructor() {
        // Core Properties
        this.isInitialized = false;
        this.documents = [];
        this.chatHistory = [];
        this.chatSessions = [];
        this.currentSession = null;
        this.currentConversation = [];
        this.isTyping = false;
        this.isRecording = false;
        this.isLoading = false;
        this.isSidebarOpen = false;
        this.isChatHistoryOpen = false;
        
        // Audio/Speech Properties
        this.speechRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.preferredVoice = null;
        this.lastAnswer = '';
        this.arabicVoices = [];
        this.currentUtterance = null;
        
        // Settings with Enhanced Options
        this.settings = this.loadSettings();
        this.statistics = { 
            totalQueries: 0, 
            totalDocuments: 0,
            totalSessions: 0,
            averageResponseTime: 0
        };
        
        // API Endpoints
        this.apiEndpoints = {
            upload: '/api/upload',
            chat: '/api/chat',
            documents: '/api/documents',
            search: '/api/search',
            stats: '/api/stats',
            chatHistory: '/api/chat/history',
            deleteDocument: '/api/documents',
            saveChatSession: '/api/chat/session',
            loadChatSession: '/api/chat/session',
            deleteChatSession: '/api/chat/session'
        };
        
        // UI Elements Cache
        this.elements = {};
        
        // Enhanced Arabic Speech Configuration
        this.arabicSpeechConfig = {
            preferredLanguages: ['ar-SA', 'ar-EG', 'ar-AE', 'ar-JO', 'ar-LB', 'ar-MA'],
            speechRate: 0.7, // Slower for better Arabic pronunciation
            speechPitch: 1.0,
            speechVolume: 1.0,
            pauseBetweenSentences: 300, // ms
            enableEmphasis: true,
            correctCommonMispronunciations: true,
            enableEnhancedArabicMode: true
        };
        
        // Initialize Application
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('🚀 بدء تهيئة تطبيق المدرس AI...');
            
            // Wait a bit for DOM to be fully ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            await this.cacheElements();
            console.log('✅ تم تحميل عناصر الواجهة بنجاح');
            
            this.setupEventListeners();
            console.log('✅ تم إعداد مستمعات الأحداث');
            
            this.setupSpeechRecognition();
            this.setupEnhancedArabicSpeech();
            console.log('✅ تم تهيئة أنظمة النطق العربي المحسنة');
            
            this.setupDragAndDrop();
            this.setupKeyboardShortcuts();
            this.setupResizeObserver();
            this.setupThemeDetection();
            console.log('✅ تم إعداد تحسينات الواجهة');
            
            // Load initial data
            await this.loadInitialData();
            console.log('✅ تم تحميل البيانات الأولية');
            
            // Apply settings
            this.applySettings();
            console.log('✅ تم تطبيق الإعدادات');
            
            // Initialize chat history AFTER everything else is ready
            setTimeout(() => {
                this.initializeChatHistory();
                console.log('✅ تم تهيئة تاريخ المحادثات');
            }, 200);
            
            this.isInitialized = true;
            this.showNotification('تم تهيئة تطبيق المدرس AI بنجاح ✨', 'success');
            
            console.log('🎉 تم تحميل تطبيق المدرس AI بنجاح مع النطق العربي المحسن');
        } catch (error) {
            console.error('❌ خطأ في تهيئة المدرس AI:', error);
            this.showNotification('خطأ في تهيئة التطبيق ❌', 'error');
        }
    }

    /**
     * Cache DOM elements for better performance
     */
    async cacheElements() {
        const selectors = {
            // App Container
            appContainer: 'appContainer',
            
            // Chat History Sidebar
            chatHistorySidebar: 'chatHistorySidebar',
            chatHistoryToggle: 'chatHistoryToggle',
            chatHistoryClose: 'chatHistoryClose',
            chatSessionsList: 'chatSessionsList',
            newChatBtn: 'newChatBtn',
            
            // Main Sidebar
            sidebarPanel: 'sidebarPanel',
            sidebarToggle: 'sidebarToggle',
            sidebarClose: 'sidebarClose',
            
            // File Management
            fileInput: 'fileInput',
            uploadZone: 'uploadZone',
            filesList: 'filesList',
            filesCount: 'filesCount',
            
            // Chat Interface
            welcomeSection: 'welcomeSection',
            messagesContainer: 'messagesContainer',
            messageInput: 'messageInput',
            sendButton: 'sendButton',
            
            // Input Actions
            micButton: 'micButton',
            attachButton: 'attachButton',
            quickActions: 'quickActions',
            
            // Status and Stats
            statusArea: 'statusArea',
            totalQueries: 'totalQueries',
            totalDocuments: 'totalDocuments',
            totalSessions: 'totalSessions',
            connectionStatus: 'connectionStatus',
            
            // Modals and Overlays
            loadingOverlay: 'loadingOverlay',
            settingsModal: 'settingsModal',
            searchModal: 'searchModal',
            searchInput: 'searchInput',
            searchResults: 'searchResults',
            performSearch: 'performSearch',
            
            // Settings - Basic
            settingsBtn: 'settingsBtn',
            voiceSpeed: 'voiceSpeed',
            autoSpeak: 'autoSpeak',
            theme: 'theme',
            saveHistory: 'saveHistory',
            clearAllData: 'clearAllData',
            
            // Settings - Enhanced
            arabicDialect: 'arabicDialect',
            enableSpeechEnhancements: 'enableSpeechEnhancements',
            highContrastMode: 'highContrastMode',
            printFormat: 'printFormat',
            includeSources: 'includeSources',
            responseLength: 'responseLength',
            enableContextualAnswers: 'enableContextualAnswers'
        };

        this.elements = {};
        
        for (const [key, id] of Object.entries(selectors)) {
            const element = document.getElementById(id);
            if (element) {
                this.elements[key] = element;
            } else {
                console.warn(`⚠️ العنصر '${id}' غير موجود`);
            }
        }

        // Validate required elements
        const required = ['messageInput', 'sendButton', 'messagesContainer'];
        for (const elementKey of required) {
            if (!this.elements[elementKey]) {
                throw new Error(`العنصر المطلوب '${elementKey}' غير موجود`);
            }
        }
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Chat History Sidebar Controls
        this.addEventListenerSafe('chatHistoryToggle', 'click', () => this.toggleChatHistorySidebar());
        this.addEventListenerSafe('chatHistoryClose', 'click', () => this.closeChatHistorySidebar());
        this.addEventListenerSafe('newChatBtn', 'click', () => this.startNewChatSession());
        
        // Main Sidebar Controls
        this.addEventListenerSafe('sidebarToggle', 'click', () => this.toggleSidebar());
        this.addEventListenerSafe('sidebarClose', 'click', () => this.closeSidebar());
        
        // File Upload
        this.addEventListenerSafe('fileInput', 'change', (e) => this.handleFileUpload(e));
        this.addEventListenerSafe('uploadZone', 'click', () => this.elements.fileInput?.click());
        
        // Chat Input
        this.addEventListenerSafe('messageInput', 'keydown', (e) => this.handleInputKeydown(e));
        this.addEventListenerSafe('messageInput', 'input', () => this.adjustTextareaHeight());
        this.addEventListenerSafe('sendButton', 'click', () => this.sendMessage());
        
        // Audio Controls
        this.addEventListenerSafe('micButton', 'click', () => this.toggleRecording());
        this.addEventListenerSafe('attachButton', 'click', () => this.elements.fileInput?.click());
        
        // Settings - Basic
        this.addEventListenerSafe('settingsBtn', 'click', () => this.openModal('settingsModal'));
        this.addEventListenerSafe('voiceSpeed', 'change', (e) => this.updateSetting('voiceSpeed', parseFloat(e.target.value)));
        this.addEventListenerSafe('autoSpeak', 'change', (e) => this.updateSetting('autoSpeak', e.target.checked));
        this.addEventListenerSafe('theme', 'change', (e) => this.updateSetting('theme', e.target.value));
        this.addEventListenerSafe('saveHistory', 'change', (e) => this.updateSetting('saveHistory', e.target.checked));
        this.addEventListenerSafe('clearAllData', 'click', () => this.clearAllData());
        
        // Settings - Enhanced
        this.addEventListenerSafe('arabicDialect', 'change', (e) => this.updateSetting('preferredArabicDialect', e.target.value));
        this.addEventListenerSafe('enableSpeechEnhancements', 'change', (e) => this.updateSetting('enableSpeechEnhancements', e.target.checked));
        this.addEventListenerSafe('highContrastMode', 'change', (e) => this.updateSetting('highContrastMode', e.target.checked));
        this.addEventListenerSafe('printFormat', 'change', (e) => this.updateSetting('printFormat', e.target.value));
        this.addEventListenerSafe('includeSources', 'change', (e) => this.updateSetting('includeSources', e.target.checked));
        this.addEventListenerSafe('responseLength', 'change', (e) => this.updateSetting('responseLength', e.target.value));
        this.addEventListenerSafe('enableContextualAnswers', 'change', (e) => this.updateSetting('enableContextualAnswers', e.target.checked));
        
        // Search
        this.addEventListenerSafe('performSearch', 'click', () => this.performSearch());
        this.addEventListenerSafe('searchInput', 'keydown', (e) => {
            if (e.key === 'Enter') this.performSearch();
        });
        
        // Quick Actions
        if (this.elements.quickActions) {
            this.elements.quickActions.addEventListener('click', (e) => {
                const btn = e.target.closest('.quick-btn');
                if (btn) {
                    const text = btn.dataset.text;
                    if (text && this.elements.messageInput) {
                        this.elements.messageInput.value = text + ' ';
                        this.elements.messageInput.focus();
                        this.adjustTextareaHeight();
                    }
                }
            });
        }
        
        // Modal Controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal(e.target.id);
            }
            
            const closeBtn = e.target.closest('.modal-close');
            if (closeBtn) {
                const modalId = closeBtn.dataset.modal;
                if (modalId) {
                    this.closeModal(modalId);
                }
            }
        });
        
        // Window Events
        window.addEventListener('online', () => this.updateConnectionStatus(true));
        window.addEventListener('offline', () => this.updateConnectionStatus(false));
        window.addEventListener('beforeunload', () => this.saveCurrentSession());
        window.addEventListener('resize', () => this.handleResize());
        
        // Theme Change Events
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (this.settings.theme === 'auto') {
                this.applyTheme('auto');
            }
        });

        // Setup overlay for chat history sidebar
        this.setupChatHistoryOverlay();
    }

    /**
     * Setup chat history overlay for mobile
     */
    setupChatHistoryOverlay() {
        // Create overlay if it doesn't exist
        let overlay = document.querySelector('.chat-history-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'chat-history-overlay';
            document.body.appendChild(overlay);
            
            overlay.addEventListener('click', () => {
                this.closeChatHistorySidebar();
            });
        }
    }

    /**
     * Safely add event listener with null checks
     */
    addEventListenerSafe(elementKey, event, handler) {
        const element = this.elements[elementKey];
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    /**
     * Setup enhanced Arabic speech recognition
     */
    setupSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('⚠️ التعرف على الصوت غير مدعوم في هذا المتصفح');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.speechRecognition = new SpeechRecognition();
        
        // Enhanced Arabic speech recognition settings
        this.speechRecognition.lang = this.settings.preferredArabicDialect || 'ar-SA';
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = true;
        this.speechRecognition.maxAlternatives = 10; // More alternatives for better accuracy
        
        this.speechRecognition.onstart = () => {
            this.isRecording = true;
            this.updateMicButton();
            this.showNotification('🎤 جاري الاستماع... تحدث بوضوح', 'info');
        };

        this.speechRecognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (this.elements.messageInput) {
                this.elements.messageInput.value = finalTranscript + interimTranscript;
                this.adjustTextareaHeight();
            }
            
            if (finalTranscript) {
                this.elements.messageInput.value = this.enhanceArabicText(finalTranscript);
                this.showNotification('✅ تم تحويل الصوت إلى نص بنجاح', 'success');
            }
        };

        this.speechRecognition.onerror = (event) => {
            console.error('خطأ في التعرف على الصوت:', event.error);
            let errorMessage = 'خطأ في التسجيل الصوتي';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage = 'لم يتم رصد أي كلام. حاول مرة أخرى وتحدث بوضوح';
                    break;
                case 'audio-capture':
                    errorMessage = 'لا يمكن الوصول للمايكروفون. تحقق من الأذونات';
                    break;
                case 'not-allowed':
                    errorMessage = 'تم رفض الإذن للوصول للمايكروفون';
                    break;
                case 'network':
                    errorMessage = 'خطأ في الشبكة. تحقق من الاتصال';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'خدمة التعرف على الصوت غير مسموحة';
                    break;
            }
            
            this.showNotification(errorMessage, 'error');
        };

        this.speechRecognition.onend = () => {
            this.isRecording = false;
            this.updateMicButton();
        };
    }

    /**
     * Setup enhanced Arabic speech synthesis
     */
    setupEnhancedArabicSpeech() {
        // Stop any ongoing speech
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        // Wait for voices to be loaded
        if (this.speechSynthesis.getVoices().length === 0) {
            this.speechSynthesis.addEventListener('voiceschanged', () => {
                this.loadEnhancedArabicVoices();
            });
        } else {
            this.loadEnhancedArabicVoices();
        }

        // Enhanced speech settings for better Arabic pronunciation
        this.arabicSpeechConfig.enableEnhancedArabicMode = true;
        this.arabicSpeechConfig.speechRate = this.settings.voiceSpeed || 0.7;
        this.arabicSpeechConfig.pauseBetweenSentences = 300;
    }

    /**
     * Load and categorize enhanced Arabic voices
     */
    loadEnhancedArabicVoices() {
        const voices = this.speechSynthesis.getVoices();
        
        // Enhanced Arabic voice detection
        this.arabicVoices = voices.filter(voice => {
            const lang = voice.lang.toLowerCase();
            const name = voice.name.toLowerCase();
            
            return lang.startsWith('ar') || 
                   name.includes('arabic') || 
                   name.includes('عربي') ||
                   name.includes('saudi') ||
                   name.includes('khalid') ||
                   name.includes('majed') ||
                   name.includes('zahra') ||
                   name.includes('naayf') ||
                   name.includes('hoda') ||
                   name.includes('egyptian') ||
                   name.includes('gulf') ||
                   name.includes('levantine') ||
                   name.includes('maghrebi');
        });

        // Enhanced voice sorting for better Arabic pronunciation
        this.arabicVoices.sort((a, b) => {
            const aScore = this.getEnhancedVoiceQualityScore(a);
            const bScore = this.getEnhancedVoiceQualityScore(b);
            return bScore - aScore;
        });

        if (this.arabicVoices.length > 0) {
            this.preferredVoice = this.arabicVoices[0];
            console.log('🎙️ الأصوات العربية المتاحة:', this.arabicVoices.map(v => `${v.name} (${v.lang})`));
            console.log('✅ تم اختيار الصوت المفضل:', this.preferredVoice.name);
            
            // Test the voice quality
            this.testArabicVoiceQuality();
        } else {
            console.warn('⚠️ لم يتم العثور على أصوات عربية. سيتم استخدام الصوت الافتراضي.');
            this.findFallbackArabicVoice();
        }
    }

    /**
     * Enhanced voice quality scoring for Arabic
     */
    getEnhancedVoiceQualityScore(voice) {
        let score = 0;
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        
        // Prefer Saudi Arabic (best for MSA)
        if (lang === 'ar-sa' || name.includes('saudi')) score += 100;
        
        // Prefer specific high-quality Arabic voices
        if (name.includes('khalid') || name.includes('majed') || name.includes('zahra')) score += 90;
        if (name.includes('naayf') || name.includes('hoda')) score += 85;
        
        // Prefer female voices (often clearer for Arabic)
        if (name.includes('female') || name.includes('woman') || 
            name.includes('زينب') || name.includes('نورا') || name.includes('هدى')) score += 50;
        
        // Prefer premium/enhanced voices
        if (name.includes('premium') || name.includes('enhanced') || 
            name.includes('neural') || name.includes('natural')) score += 40;
        
        // Regional preferences (in order of MSA quality)
        if (lang === 'ar-eg') score += 30; // Egyptian (widely understood)
        if (lang === 'ar-ae') score += 25; // UAE
        if (lang === 'ar-jo') score += 20; // Jordanian
        if (lang === 'ar-lb') score += 15; // Lebanese
        if (lang === 'ar-ma') score += 10; // Moroccan
        
        // Prefer local voices over remote
        if (voice.localService) score += 15;
        
        // Bonus for voices that support Arabic well
        if (name.includes('arabic') || name.includes('عربي')) score += 25;
        
        return score;
    }

    /**
     * Test Arabic voice quality
     */
    testArabicVoiceQuality() {
        if (!this.preferredVoice) return;

        // Silently test the voice with a short Arabic phrase
        const testPhrase = 'مرحبا';
        const testUtterance = new SpeechSynthesisUtterance(testPhrase);
        testUtterance.voice = this.preferredVoice;
        testUtterance.lang = this.settings.preferredArabicDialect || 'ar-SA';
        testUtterance.rate = 0.1; // Very slow and quiet for testing
        testUtterance.volume = 0.01;
        
        testUtterance.onstart = () => {
            console.log('🧪 اختبار جودة الصوت العربي...');
        };
        
        testUtterance.onend = () => {
            console.log('✅ تم اختبار الصوت العربي بنجاح');
        };
        
        testUtterance.onerror = () => {
            console.warn('⚠️ فشل اختبار الصوت، البحث عن بديل...');
            this.findFallbackArabicVoice();
        };
        
        // Only test if not already speaking
        if (!this.speechSynthesis.speaking) {
            this.speechSynthesis.speak(testUtterance);
        }
    }

    /**
     * Find fallback Arabic voice if primary fails
     */
    findFallbackArabicVoice() {
        const voices = this.speechSynthesis.getVoices();
        
        // Look for any voice that might support Arabic
        const fallbackVoice = voices.find(voice => {
            const name = voice.name.toLowerCase();
            return name.includes('microsoft') || 
                   name.includes('google') || 
                   name.includes('apple') ||
                   voice.lang.startsWith('en-') || // English voices often support Arabic
                   voice.default;
        });
        
        if (fallbackVoice) {
            this.preferredVoice = fallbackVoice;
            console.log('🔄 تم العثور على صوت بديل:', fallbackVoice.name);
        }
    }

    /**
     * Enhanced Arabic text processing
     */
    enhanceArabicText(text) {
        if (!text) return text;
        
        // Remove extra spaces and normalize
        text = text.trim().replace(/\s+/g, ' ');
        
        // Enhanced Arabic corrections
        const corrections = {
            // Common speech recognition errors
            'ضه': 'ضة',
            'ته': 'تة', 
            'كه': 'كة',
            'شه': 'شة',
            'ان شاء اللة': 'إن شاء الله',
            'بسم اللة': 'بسم الله',
            'الحمد للة': 'الحمد لله',
            'ما شاء اللة': 'ما شاء الله',
            'استغفر اللة': 'أستغفر الله',
            'صلى اللة عليه وسلم': 'صلى الله عليه وسلم',
            
            // Common diacritical marks issues
            'أ': 'ا',
            'إ': 'ا',
            'آ': 'ا',
            'ة': 'ه',
            'ى': 'ي',
            
            // Question words
            'اش': 'ما',
            'ايش': 'ما',
            'وش': 'ما',
            'منو': 'من',
            'وين': 'أين',
            'متى': 'متى',
            'ليش': 'لماذا',
            'كيف': 'كيف'
        };
        
        for (const [wrong, correct] of Object.entries(corrections)) {
            const regex = new RegExp(wrong, 'g');
            text = text.replace(regex, correct);
        }
        
        // Add question mark if the sentence seems like a question
        const questionWords = ['ما', 'من', 'متى', 'أين', 'كيف', 'لماذا', 'هل', 'أين', 'كم'];
        const firstWord = text.split(' ')[0];
        if (questionWords.includes(firstWord) && !text.endsWith('؟') && !text.endsWith('?')) {
            text += '؟';
        }
        
        return text;
    }

    /**
     * Enhanced Arabic text-to-speech with advanced pronunciation
     */
    speakTextEnhanced(text, messageId = null) {
        if (!text || typeof text !== 'string') {
            console.warn('⚠️ النص المراد قراءته غير صالح');
            return;
        }

        // Stop any current speech
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.clearSpeakingIndicators();
            console.log('🛑 تم إيقاف القراءة الحالية');
            return;
        }

        const cleanText = this.cleanTextForEnhancedArabicSpeech(text);
        if (!cleanText) {
            console.warn('⚠️ النص فارغ بعد التنظيف');
            return;
        }

        console.log('🗣️ بدء قراءة النص بالعربية:', cleanText.substring(0, 50) + '...');

        this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
        
        // Enhanced Arabic speech settings
        this.currentUtterance.lang = this.settings.preferredArabicDialect || 'ar-SA';
        this.currentUtterance.rate = this.arabicSpeechConfig.speechRate * (this.settings.voiceSpeed || 1);
        this.currentUtterance.pitch = this.arabicSpeechConfig.speechPitch;
        this.currentUtterance.volume = this.arabicSpeechConfig.speechVolume;
        
        // Use preferred Arabic voice if available
        if (this.preferredVoice) {
            this.currentUtterance.voice = this.preferredVoice;
            console.log('🎙️ استخدام الصوت:', this.preferredVoice.name);
        }
        
        this.currentUtterance.onstart = () => {
            console.log('▶️ بدأت القراءة');
            if (messageId) {
                this.showSpeakingIndicator(messageId);
            }
            this.showNotification('🔊 جاري القراءة بالعربية...', 'info');
        };
        
        this.currentUtterance.onend = () => {
            console.log('⏹️ انتهت القراءة');
            this.clearSpeakingIndicators();
            this.currentUtterance = null;
        };
        
        this.currentUtterance.onerror = (event) => {
            console.error('❌ خطأ في القراءة:', event.error);
            this.clearSpeakingIndicators();
            this.currentUtterance = null;
            
            // Try with fallback voice
            if (event.error === 'voice-unavailable' || event.error === 'language-unavailable') {
                console.log('🔄 محاولة استخدام صوت بديل...');
                this.findFallbackArabicVoice();
                // Retry with fallback
                setTimeout(() => {
                    if (this.preferredVoice) {
                        this.speakTextEnhanced(text, messageId);
                    }
                }, 500);
            } else {
                this.showNotification('خطأ في قراءة النص ❌', 'error');
            }
        };
        
        this.currentUtterance.onpause = () => {
            console.log('⏸️ تم إيقاف القراءة مؤقتاً');
        };

        this.currentUtterance.onresume = () => {
            console.log('▶️ تم استئناف القراءة');
        };
        
        // Enhanced boundary handling for better Arabic pronunciation
        this.currentUtterance.onboundary = (event) => {
            if (event.name === 'sentence' && this.arabicSpeechConfig.pauseBetweenSentences > 0) {
                // Natural pause between sentences for better comprehension
                console.log('⏯️ وقفة طبيعية بين الجمل');
            }
        };
        
        try {
            this.speechSynthesis.speak(this.currentUtterance);
            console.log('🚀 تم بدء القراءة بنجاح');
        } catch (error) {
            console.error('❌ خطأ في بدء القراءة:', error);
            this.showNotification('خطأ في بدء القراءة ❌', 'error');
            this.clearSpeakingIndicators();
        }
    }

    /**
     * Enhanced Arabic text cleaning for superior speech synthesis
     */
    cleanTextForEnhancedArabicSpeech(text) {
        if (!text || typeof text !== 'string') return '';
        
        let cleanedText = text
            // Remove markdown formatting
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`(.*?)`/g, '$1')
            .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
            .replace(/#{1,6}\s*/g, '')
            
            // Remove HTML tags
            .replace(/<[^>]*>/g, ' ')
            
            // Remove emojis and special characters that cause speech issues
            .replace(/[📖🔍📝💡⚖️🧮📚✅⚠️📄🤖📋🚀✨🎯📊🔧❌❓🎙️🗣️▶️⏹️⏸️⏯️🔊🎵🎶]/g, '')
            .replace(/[👍👎❤️😊😢😡🤔💭💡🌟⭐🎉🎊🎈]/g, '')
            
            // Clean up punctuation for better speech flow
            .replace(/([\.!?])\s*/g, '$1 ')
            .replace(/[:;]\s*/g, '. ')
            .replace(/،\s*/g, '، ')
            .replace(/\n+/g, '. ')
            .replace(/\s+/g, ' ')
            
            // Fix common Arabic text issues
            .replace(/أ|إ|آ/g, 'ا')
            .replace(/ة/g, 'ه')
            .replace(/ى/g, 'ي')
            
            // Replace English numbers with Arabic words for better pronunciation
            .replace(/\b(\d+)\b/g, (match) => this.numberToArabicWords(parseInt(match)))
            
            // Clean up final whitespace
            .trim();
        
        // Apply pronunciation enhancements if enabled
        if (this.settings.enableSpeechEnhancements) {
            cleanedText = this.applyAdvancedArabicPronunciationEnhancements(cleanedText);
        }
        
        // Split long text into shorter chunks for better speech synthesis
        if (cleanedText.length > 200) {
            cleanedText = this.splitLongTextForSpeech(cleanedText);
        }
        
        return cleanedText;
    }

    /**
     * Apply advanced Arabic pronunciation enhancements
     */
    applyAdvancedArabicPronunciationEnhancements(text) {
        const enhancements = {
            // Religious phrases (very common in Arabic)
            'الله': 'اللاه',
            'الرحمن': 'الرحمان',
            'الرحيم': 'الرحيم',
            'بسم الله': 'بسم اللاه',
            'الحمد لله': 'الحمد للاه',
            'إن شاء الله': 'إن شاء اللاه',
            'ما شاء الله': 'ما شاء اللاه',
            'سبحان الله': 'سبحان اللاه',
            'أستغفر الله': 'أستغفر اللاه',
            
            // Common Arabic words that need pronunciation help
            'النص': 'النص',
            'البحث': 'البحث',
            'السؤال': 'السؤال',
            'الجواب': 'الجواب',
            'المعلومات': 'المعلومات',
            'الملف': 'الملف',
            'الدرس': 'الدرس',
            'الشرح': 'الشرح',
            'المثال': 'المثال',
            'الفهم': 'الفهم',
            
            // Numbers in Arabic
            'واحد': 'واحد',
            'اثنان': 'اثنان',
            'ثلاثة': 'ثلاثه',
            'أربعة': 'أربعه',
            'خمسة': 'خمسه',
            'ستة': 'ستّه',
            'سبعة': 'سبعه',
            'ثمانية': 'ثمانيه',
            'تسعة': 'تسعه',
            'عشرة': 'عشره',
            
            // Add breathing marks and pauses for better flow
            ' في ': ' في. ',
            ' من ': ' من. ',
            ' إلى ': ' إلى. ',
            ' على ': ' على. ',
            ' عن ': ' عن. ',
            ' مع ': ' مع. ',
            ' بعد ': ' بعد. ',
            ' قبل ': ' قبل. ',
            ' أثناء ': ' أثناء. ',
            ' خلال ': ' خلال. ',
            
            // Fix common pronunciation issues
            'هذا': 'هاذا',
            'هذه': 'هاذه',
            'ذلك': 'ذالك',
            'تلك': 'تالك',
            'الذي': 'اللذي',
            'التي': 'اللتي',
            'الذين': 'اللذين',
            'اللواتي': 'اللواتي'
        };
        
        for (const [original, enhanced] of Object.entries(enhancements)) {
            const regex = new RegExp(original, 'g');
            text = text.replace(regex, enhanced);
        }
        
        return text;
    }

    /**
     * Split long text into manageable chunks for speech synthesis
     */
    splitLongTextForSpeech(text) {
        const maxChunkLength = 200;
        if (text.length <= maxChunkLength) return text;
        
        // Split by sentences first
        const sentences = text.split(/[.!?؟]/).filter(s => s.trim());
        let chunks = [];
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkLength && currentChunk) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? '. ' : '') + sentence;
            }
        }
        
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }
        
        // Return the first chunk (we'll handle chunked speech later if needed)
        return chunks[0] || text;
    }

    /**
     * Enhanced number to Arabic words conversion
     */
    numberToArabicWords(num) {
        if (num === 0) return 'صفر';
        if (num === 1) return 'واحد';
        if (num === 2) return 'اثنان';
        if (num === 3) return 'ثلاثة';
        if (num === 4) return 'أربعة';
        if (num === 5) return 'خمسة';
        if (num === 6) return 'ستة';
        if (num === 7) return 'سبعة';
        if (num === 8) return 'ثمانية';
        if (num === 9) return 'تسعة';
        if (num === 10) return 'عشرة';
        if (num === 11) return 'أحد عشر';
        if (num === 12) return 'اثنا عشر';
        if (num === 20) return 'عشرون';
        if (num === 30) return 'ثلاثون';
        if (num === 40) return 'أربعون';
        if (num === 50) return 'خمسون';
        if (num === 60) return 'ستون';
        if (num === 70) return 'سبعون';
        if (num === 80) return 'ثمانون';
        if (num === 90) return 'تسعون';
        if (num === 100) return 'مائة';
        if (num === 1000) return 'ألف';
        
        // For larger numbers, keep as digits but pronounce them properly
        if (num < 100) return num.toString();
        return num.toString();
    }

    /**
     * Setup theme detection and application
     */
    setupThemeDetection() {
        // Apply theme immediately based on setting
        this.applyTheme(this.settings.theme);
        
        // Watch for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (this.settings.theme === 'auto') {
                this.applyTheme('auto');
            }
        });
    }

    /**
     * Apply theme to document with complete dark mode support
     */
    applyTheme(theme) {
        const root = document.documentElement;
        const body = document.body;
        
        // Remove existing theme classes
        body.classList.remove('light-theme', 'dark-theme', 'high-contrast');
        root.removeAttribute('data-theme');
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                root.setAttribute('data-theme', 'dark');
                body.classList.add('dark-theme');
            } else {
                body.classList.add('light-theme');
            }
        } else if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
            body.classList.add('dark-theme');
        } else {
            body.classList.add('light-theme');
        }
        
        // Apply high contrast if enabled
        if (this.settings.highContrastMode) {
            body.classList.add('high-contrast');
        }
        
        // Update meta theme color for mobile browsers
        this.updateMetaThemeColor(theme);
    }

    /**
     * Update meta theme color for mobile browsers
     */
    updateMetaThemeColor(theme) {
        let themeColor = '#ffffff'; // Default light
        
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            themeColor = '#0f172a'; // Dark theme color
        }
        
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
            metaTheme = document.createElement('meta');
            metaTheme.name = 'theme-color';
            document.head.appendChild(metaTheme);
        }
        metaTheme.content = themeColor;
    }

    /**
     * Initialize chat history functionality
     */
    initializeChatHistory() {
        this.loadChatSessions();
        this.createChatHistorySidebar();
    }

    /**
     * Create chat history sidebar if it doesn't exist
     */
    createChatHistorySidebar() {
        // Don't create if already exists
        if (document.getElementById('chatHistorySidebar')) return;
        
        const sidebar = document.createElement('aside');
        sidebar.id = 'chatHistorySidebar';
        sidebar.className = 'chat-history-sidebar collapsed';
        
        sidebar.innerHTML = `
            <div class="chat-history-header">
                <h3 class="chat-history-title">تاريخ المحادثات</h3>
                <button class="chat-history-close" id="chatHistoryClose" title="إغلاق">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="padding: var(--space-4);">
                <button class="btn-secondary" id="newChatBtn" style="width: 100%; margin-bottom: var(--space-4);">
                    <i class="fas fa-plus"></i>
                    محادثة جديدة
                </button>
                <div class="chat-sessions-list" id="chatSessionsList">
                    <div class="empty-state">
                        <i class="fas fa-comments"></i>
                        <p>لا توجد محادثات سابقة</p>
                    </div>
                </div>
            </div>
        `;
        
        // Insert at the beginning of app container
        const appContainer = document.getElementById('appContainer');
        if (appContainer) {
            appContainer.insertBefore(sidebar, appContainer.firstChild);
            
            // Update elements cache
            this.elements.chatHistorySidebar = sidebar;
            this.elements.chatHistoryClose = document.getElementById('chatHistoryClose');
            this.elements.chatSessionsList = document.getElementById('chatSessionsList');
            this.elements.newChatBtn = document.getElementById('newChatBtn');
            
            // Add toggle button to header
            this.addChatHistoryToggleButton();
            
            // Setup event listeners for new elements
            this.elements.chatHistoryClose?.addEventListener('click', () => this.closeChatHistorySidebar());
            this.elements.newChatBtn?.addEventListener('click', () => this.startNewChatSession());
            
            console.log('✅ تم إنشاء الشريط الجانبي لتاريخ المحادثات');
        } else {
            console.error('❌ حاوي التطبيق غير موجود');
        }
    }

    /**
     * Add chat history toggle button to header
     */
    addChatHistoryToggleButton() {
        const headerLeft = document.querySelector('.header-left');
        if (headerLeft && !document.getElementById('chatHistoryToggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.id = 'chatHistoryToggle';
            toggleBtn.className = 'chat-history-sidebar-toggle header-btn';
            toggleBtn.innerHTML = '<i class="fas fa-history"></i>';
            toggleBtn.title = 'تاريخ المحادثات (Ctrl+H)';
            
            // Insert as first child in header-left
            headerLeft.insertBefore(toggleBtn, headerLeft.firstChild);
            
            this.elements.chatHistoryToggle = toggleBtn;
            toggleBtn.addEventListener('click', () => this.toggleChatHistorySidebar());
            
            console.log('✅ تم إضافة زر تاريخ المحادثات');
        }
    }

    /**
     * Toggle chat history sidebar
     */
    toggleChatHistorySidebar() {
        if (!this.elements.chatHistorySidebar) return;
        
        this.isChatHistoryOpen = !this.isChatHistoryOpen;
        
        const overlay = document.querySelector('.chat-history-overlay');
        
        if (this.isChatHistoryOpen) {
            this.elements.chatHistorySidebar.classList.remove('collapsed');
            this.elements.chatHistorySidebar.classList.add('open');
            if (overlay) overlay.classList.add('active');
            console.log('📖 فتح تاريخ المحادثات');
        } else {
            this.elements.chatHistorySidebar.classList.add('collapsed');
            this.elements.chatHistorySidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            console.log('📕 إغلاق تاريخ المحادثات');
        }
    }

    /**
     * Close chat history sidebar
     */
    closeChatHistorySidebar() {
        this.isChatHistoryOpen = false;
        if (this.elements.chatHistorySidebar) {
            this.elements.chatHistorySidebar.classList.add('collapsed');
            this.elements.chatHistorySidebar.classList.remove('open');
        }
        
        const overlay = document.querySelector('.chat-history-overlay');
        if (overlay) overlay.classList.remove('active');
    }

    /**
     * Start new chat session
     */
    startNewChatSession() {
        // Save current session if it has messages
        if (this.currentConversation.length > 0) {
            this.saveCurrentChatSession();
        }
        
        // Create new session
        this.currentSession = {
            id: this.generateSessionId(),
            title: 'محادثة جديدة',
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString(),
            messageCount: 0
        };
        
        // Clear current conversation
        this.currentConversation = [];
        
        // Clear messages UI
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '';
            this.elements.messagesContainer.classList.remove('active');
        }
        
        // Show welcome section
        if (this.elements.welcomeSection) {
            this.elements.welcomeSection.style.display = 'flex';
        }
        
        // Update chat sessions list
        this.displayChatSessions();
        
        // Close chat history sidebar
        this.closeChatHistorySidebar();
        
        this.showNotification('تم بدء محادثة جديدة ✨', 'success');
        console.log('🆕 بدء محادثة جديدة');
    }

    /**
     * Enhanced send message with Arabic speech auto-play
     */
    async sendMessage() {
        const input = this.elements.messageInput;
        if (!input || this.isTyping || this.isLoading) return;

        const message = input.value.trim();
        if (!message) return;

        // Initialize current session if needed
        if (!this.currentSession) {
            this.currentSession = {
                id: this.generateSessionId(),
                title: 'محادثة جديدة',
                createdAt: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                messageCount: 0
            };
        }

        // Hide welcome section
        this.hideWelcomeSection();

        // Add user message
        this.addMessage(message, 'user');
        
        // Clear input
        input.value = '';
        this.adjustTextareaHeight();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const startTime = Date.now();
            
            // Enhanced request with complete answer preference
            const response = await this.apiRequest('POST', this.apiEndpoints.chat, {
                message: message,
                conversation_id: this.currentSession.id,
                request_complete_answer: true,
                response_length: this.settings.responseLength || 'detailed',
                enable_contextual: this.settings.enableContextualAnswers !== false,
                include_sources: this.settings.includeSources !== false,
                conversation_history: this.currentConversation.slice(-5),
                prefer_arabic: true, // Request Arabic responses
                enhanced_arabic_mode: true
            });

            this.hideTypingIndicator();
            const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);

            if (response.status === 'success') {
                const messageDiv = this.addMessage(response.response, 'assistant', {
                    confidence: response.confidence,
                    sources: response.sources,
                    responseTime: responseTime,
                    isComplete: response.is_complete_answer
                });
                
                this.lastAnswer = response.response;
                
                // Auto-speak Arabic response if enabled
                if (this.settings.autoSpeak) {
                    const messageId = this.currentConversation[this.currentConversation.length - 1]?.id;
                    console.log('🔊 تشغيل النطق التلقائي للإجابة العربية');
                    setTimeout(() => this.speakTextEnhanced(this.lastAnswer, messageId), 800);
                }
                
                // Update statistics
                this.statistics.totalQueries++;
                this.statistics.averageResponseTime = (this.statistics.averageResponseTime + parseFloat(responseTime)) / 2;
                this.updateStatisticsDisplay();
                
                // Auto-save session
                setTimeout(() => this.saveCurrentChatSession(), 1000);
                
            } else {
                this.addMessage(response.message || 'حدث خطأ في معالجة الرسالة', 'assistant');
            }

        } catch (error) {
            this.hideTypingIndicator();
            console.error('خطأ في إرسال الرسالة:', error);
            this.addMessage('عذراً، حدث خطأ في الاتصال. الرجاء المحاولة مرة أخرى.', 'assistant');
            this.showNotification('خطأ في إرسال الرسالة ❌', 'error');
        }
    }

    /**
     * Enhanced message addition with better Arabic support
     */
    addMessage(text, type, metadata = {}) {
        if (!this.elements.messagesContainer) return;

        const messageDiv = this.addMessageToUI(text, type, metadata);
        
        // Add to conversation history
        const messageData = {
            id: messageDiv.dataset.messageId,
            text: text,
            type: type,
            timestamp: new Date().toISOString(),
            metadata: metadata
        };
        
        this.currentConversation.push(messageData);

        // Save to chat history if enabled
        if (this.settings.saveHistory) {
            this.chatHistory.push(messageData);
        }
        
        // Log message for debugging
        console.log(`💬 رسالة ${type}:`, text.substring(0, 50) + '...');
        
        return messageDiv;
    }

    /**
     * Show speaking indicator for specific message
     */
    showSpeakingIndicator(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const speakBtn = messageElement.querySelector('.speak-btn');
            if (speakBtn) {
                speakBtn.innerHTML = '<i class="fas fa-stop"></i>';
                speakBtn.classList.add('speaking');
                speakBtn.title = 'إيقاف القراءة';
                
                const indicator = document.createElement('div');
                indicator.className = 'speaking-indicator';
                indicator.innerHTML = `
                    <span class="speaking-wave"></span>
                    <span class="speaking-wave"></span>
                    <span class="speaking-wave"></span>
                    <span class="speaking-wave"></span>
                    <span>🔊 جاري القراءة...</span>
                `;
                messageElement.querySelector('.message-meta').appendChild(indicator);
                console.log('📢 عرض مؤشر القراءة');
            }
        }
    }

    /**
     * Clear all speaking indicators
     */
    clearSpeakingIndicators() {
        document.querySelectorAll('.speak-btn.speaking').forEach(btn => {
            btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            btn.classList.remove('speaking');
            btn.title = 'استماع للإجابة';
        });
        
        document.querySelectorAll('.speaking-indicator').forEach(indicator => {
            indicator.remove();
        });
        
        console.log('🔇 تم مسح مؤشرات القراءة');
    }

    /**
     * Speak specific message
     */
    speakMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const text = messageElement.dataset.originalText;
            console.log('🎙️ قراءة رسالة محددة:', messageId);
            this.speakTextEnhanced(text, messageId);
        }
    }

    /**
     * Enhanced settings loading with new Arabic options
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('teacherAI_settings');
            const defaultSettings = {
                voiceSpeed: 0.7, // Slower for better Arabic
                autoSpeak: true, // Enable by default for Arabic
                theme: 'auto',
                saveHistory: true,
                preferredArabicDialect: 'ar-SA', // Saudi Arabic (MSA)
                highContrastMode: false,
                enableSpeechEnhancements: true, // Enhanced Arabic pronunciation
                printFormat: 'detailed',
                includeSources: true,
                responseLength: 'detailed',
                enableContextualAnswers: true
            };
            
            const settings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
            return settings;
        } catch (error) {
            console.error('خطأ في تحميل الإعدادات:', error);
            return {
                voiceSpeed: 0.7,
                autoSpeak: true,
                theme: 'auto',
                saveHistory: true,
                preferredArabicDialect: 'ar-SA',
                highContrastMode: false,
                enableSpeechEnhancements: true,
                printFormat: 'detailed',
                includeSources: true,
                responseLength: 'detailed',
                enableContextualAnswers: true
            };
        }
    }

    /**
     * Enhanced settings application with Arabic defaults
     */
    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Apply high contrast mode
        if (this.settings.highContrastMode) {
            document.body.classList.add('high-contrast');
        }
        
        // Update UI elements with enhanced settings
        const settingsMap = {
            'voiceSpeed': 'voiceSpeed',
            'autoSpeak': 'autoSpeak', 
            'theme': 'theme',
            'saveHistory': 'saveHistory',
            'arabicDialect': 'preferredArabicDialect',
            'enableSpeechEnhancements': 'enableSpeechEnhancements',
            'highContrastMode': 'highContrastMode',
            'printFormat': 'printFormat',
            'includeSources': 'includeSources',
            'responseLength': 'responseLength',
            'enableContextualAnswers': 'enableContextualAnswers'
        };
        
        for (const [elementKey, settingKey] of Object.entries(settingsMap)) {
            const element = this.elements[elementKey];
            if (element) {
                const value = this.settings[settingKey];
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        }
        
        // Update speech recognition language
        if (this.speechRecognition && this.settings.preferredArabicDialect) {
            this.speechRecognition.lang = this.settings.preferredArabicDialect;
        }
        
        // Update Arabic speech configuration
        this.arabicSpeechConfig.speechRate = this.settings.voiceSpeed || 0.7;
        this.arabicSpeechConfig.enableEnhancedArabicMode = this.settings.enableSpeechEnhancements;
        
        // Load Arabic voices if speech enhancements are enabled
        if (this.settings.enableSpeechEnhancements) {
            this.loadEnhancedArabicVoices();
        }
        
        console.log('⚙️ تم تطبيق الإعدادات مع التحسينات العربية');
    }

    // Include all other existing methods with Arabic enhancements...
    // [All other methods remain the same but with enhanced Arabic support and logging]
    
    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique message ID
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Save current chat session
     */
    async saveCurrentChatSession() {
        if (!this.currentSession || this.currentConversation.length === 0) return;
        
        // Update session info
        this.currentSession.lastActivity = new Date().toISOString();
        this.currentSession.messageCount = this.currentConversation.length;
        
        // Generate title from first user message
        const firstUserMessage = this.currentConversation.find(msg => msg.type === 'user');
        if (firstUserMessage) {
            this.currentSession.title = this.generateSessionTitle(firstUserMessage.text);
        }
        
        // Save conversation data
        this.currentSession.conversation = [...this.currentConversation];
        
        // Add to sessions list if not already there
        const existingIndex = this.chatSessions.findIndex(s => s.id === this.currentSession.id);
        if (existingIndex >= 0) {
            this.chatSessions[existingIndex] = this.currentSession;
        } else {
            this.chatSessions.unshift(this.currentSession);
        }
        
        // Save to localStorage
        this.saveChatSessionsToStorage();
        
        // Update display
        this.displayChatSessions();
        
        console.log('💾 تم حفظ الجلسة:', this.currentSession.title);
    }

    /**
     * Generate session title from message text
     */
    generateSessionTitle(text) {
        if (!text) return 'محادثة جديدة';
        
        // Limit title length and clean it
        let title = text.substring(0, 40).trim();
        if (text.length > 40) {
            title += '...';
        }
        
        return title;
    }

    /**
     * Load chat session
     */
    async loadChatSession(sessionId) {
        const session = this.chatSessions.find(s => s.id === sessionId);
        if (!session) return;
        
        // Save current session if needed
        if (this.currentSession && this.currentConversation.length > 0) {
            await this.saveCurrentChatSession();
        }
        
        // Load selected session
        this.currentSession = session;
        this.currentConversation = session.conversation || [];
        
        // Clear and rebuild messages UI
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.innerHTML = '';
            
            // Add all messages from the session
            this.currentConversation.forEach(message => {
                this.addMessageToUI(message.text, message.type, message.metadata || {});
            });
            
            if (this.currentConversation.length > 0) {
                this.hideWelcomeSection();
                this.scrollToBottom();
            }
        }
        
        // Update active session in UI
        this.updateActiveSessionInUI(sessionId);
        
        // Close chat history sidebar
        this.closeChatHistorySidebar();
        
        this.showNotification(`📖 تم تحميل: ${session.title}`, 'success');
        console.log('📂 تم تحميل الجلسة:', session.title);
    }

    /**
     * Delete chat session
     */
    async deleteChatSession(sessionId) {
        if (!confirm('هل أنت متأكد من حذف هذه المحادثة؟')) return;
        
        // Remove from sessions list
        this.chatSessions = this.chatSessions.filter(s => s.id !== sessionId);
        
        // If it's the current session, start new one
        if (this.currentSession && this.currentSession.id === sessionId) {
            this.startNewChatSession();
        }
        
        // Save and update display
        this.saveChatSessionsToStorage();
        this.displayChatSessions();
        
        this.showNotification('🗑️ تم حذف المحادثة', 'success');
        console.log('🗑️ تم حذف الجلسة:', sessionId);
    }

    /**
     * Load chat sessions from storage
     */
    loadChatSessions() {
        try {
            const saved = localStorage.getItem('teacherAI_chatSessions');
            this.chatSessions = saved ? JSON.parse(saved) : [];
            console.log(`📚 تم تحميل ${this.chatSessions.length} جلسة محفوظة`);
        } catch (error) {
            console.error('خطأ في تحميل الجلسات:', error);
            this.chatSessions = [];
        }
    }

    /**
     * Save chat sessions to storage
     */
    saveChatSessionsToStorage() {
        try {
            localStorage.setItem('teacherAI_chatSessions', JSON.stringify(this.chatSessions));
        } catch (error) {
            console.error('خطأ في حفظ الجلسات:', error);
        }
    }

    /**
     * Display chat sessions in sidebar
     */
    displayChatSessions() {
        if (!this.elements.chatSessionsList) return;
        
        if (this.chatSessions.length === 0) {
            this.elements.chatSessionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>لا توجد محادثات سابقة</p>
                    <small>ابدأ محادثة جديدة لحفظها</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        this.chatSessions.forEach(session => {
            const isActive = this.currentSession && this.currentSession.id === session.id;
            const lastActivity = new Date(session.lastActivity);
            const timeAgo = this.getTimeAgo(lastActivity);
            
            html += `
                <div class="chat-session-item ${isActive ? 'active' : ''}" data-session-id="${session.id}">
                    <div class="session-info" onclick="teacherAI.loadChatSession('${session.id}')">
                        <div class="session-title">${this.escapeHtml(session.title)}</div>
                        <div class="session-meta">${session.messageCount || 0} رسالة • ${timeAgo}</div>
                    </div>
                    <div class="session-actions">
                        <button class="session-action-btn delete" onclick="teacherAI.deleteChatSession('${session.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.elements.chatSessionsList.innerHTML = html;
        this.updateStatisticsDisplay();
    }

    /**
     * Update active session in UI
     */
    updateActiveSessionInUI(sessionId) {
        const sessionItems = document.querySelectorAll('.chat-session-item');
        sessionItems.forEach(item => {
            if (item.dataset.sessionId === sessionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Get time ago string in Arabic
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 7) return `منذ ${diffDays} يوم`;
        
        return date.toLocaleDateString('ar-SA', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    /**
     * Enhanced statistics display
     */
    updateStatisticsDisplay() {
        if (this.elements.totalQueries) {
            this.elements.totalQueries.textContent = this.statistics.totalQueries || this.currentConversation.filter(m => m.type === 'user').length;
        }
        
        if (this.elements.totalDocuments) {
            this.elements.totalDocuments.textContent = this.statistics.totalDocuments || this.documents.length;
        }
        
        if (this.elements.totalSessions) {
            this.elements.totalSessions.textContent = this.chatSessions.length;
        }
    }

    /**
     * Add message to UI only (used for loading sessions)
     */
    addMessageToUI(text, type, metadata = {}) {
        if (!this.elements.messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.dataset.messageId = this.generateMessageId();
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble arabic-text';
        bubbleDiv.innerHTML = this.formatMessageContent(text, type, metadata);
        
        // Add message actions for assistant messages
        if (type === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="message-action-btn speak-btn" title="استماع للإجابة (صوت عربي محسن)" onclick="teacherAI.speakMessage('${messageDiv.dataset.messageId}')">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="message-action-btn copy-btn" title="نسخ الإجابة" onclick="teacherAI.copyMessage('${messageDiv.dataset.messageId}')">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="message-action-btn print-btn" title="طباعة الإجابة" onclick="teacherAI.printMessage('${messageDiv.dataset.messageId}')">
                    <i class="fas fa-print"></i>
                </button>
                <button class="message-action-btn save-btn" title="حفظ الإجابة" onclick="teacherAI.saveMessage('${messageDiv.dataset.messageId}')">
                    <i class="fas fa-bookmark"></i>
                </button>
            `;
            messageDiv.appendChild(actionsDiv);
        }
        
        const metaDiv = document.createElement('div');
        metaDiv.className = 'message-meta';
        metaDiv.innerHTML = this.formatMessageMeta(type, metadata);
        
        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(metaDiv);
        
        // Store original text for actions
        messageDiv.dataset.originalText = text;
        
        this.elements.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        return messageDiv;
    }

    /**
     * Enhanced message content formatting with Arabic indicators
     */
    formatMessageContent(text, type, metadata) {
        let content = this.formatText(text);
        
        if (type === 'assistant') {
            // Add completeness indicator
            if (metadata.isComplete) {
                content = '<div class="complete-answer-badge">إجابة كاملة ✓</div>' + content;
            }
            
            // Add Arabic response indicator
            if (this.isArabicText(text)) {
                content = '<div style="color: var(--success); font-size: 0.75rem; margin-bottom: var(--space-2);"><i class="fas fa-language"></i> إجابة بالعربية</div>' + content;
            }
            
            // Add sources if available
            if (metadata.sources && metadata.sources.length > 0) {
                content += '<div class="message-sources">';
                content += '<strong><i class="fas fa-book"></i> المصادر:</strong><br>';
                metadata.sources.forEach(source => {
                    content += `📄 ${source.filename}<br>`;
                });
                content += '</div>';
            }
        }
        
        return content;
    }

    /**
     * Check if text is primarily Arabic
     */
    isArabicText(text) {
        const arabicRegex = /[\u0600-\u06FF]/g;
        const arabicMatches = text.match(arabicRegex);
        const arabicCount = arabicMatches ? arabicMatches.length : 0;
        const totalChars = text.replace(/\s/g, '').length;
        return arabicCount / totalChars > 0.3; // More than 30% Arabic characters
    }

    /**
     * Enhanced message metadata formatting
     */
    formatMessageMeta(type, metadata) {
        const time = new Date().toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let meta = `<span class="message-time"><i class="fas fa-clock"></i> ${time}</span>`;
        
        if (type === 'assistant') {
            if (metadata.confidence !== undefined) {
                const confidence = Math.round(metadata.confidence * 100);
                const confidenceIcon = confidence > 80 ? 'fas fa-check-circle' : 'fas fa-info-circle';
                const confidenceColor = confidence > 80 ? 'var(--success)' : 'var(--warning)';
                meta += `<span class="message-confidence" style="color: ${confidenceColor}"><i class="${confidenceIcon}"></i> ثقة: ${confidence}%</span>`;
            }
            
            if (metadata.responseTime) {
                meta += `<span class="message-response-time"><i class="fas fa-stopwatch"></i> ${metadata.responseTime}s</span>`;
            }
        }
        
        return meta;
    }

    /**
     * Format text with enhanced Arabic support
     */
    formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Update setting with immediate application and Arabic enhancements
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        
        if (key === 'theme') {
            this.applyTheme(value);
        } else if (key === 'highContrastMode') {
            document.body.classList.toggle('high-contrast', value);
        } else if (key === 'preferredArabicDialect') {
            if (this.speechRecognition) {
                this.speechRecognition.lang = value;
            }
            // Reload Arabic voices for the new dialect
            this.loadEnhancedArabicVoices();
        } else if (key === 'voiceSpeed') {
            this.arabicSpeechConfig.speechRate = value;
        } else if (key === 'enableSpeechEnhancements') {
            this.arabicSpeechConfig.enableEnhancedArabicMode = value;
            if (value) {
                this.loadEnhancedArabicVoices();
            }
        } else if (key === 'autoSpeak') {
            if (value) {
                this.showNotification('🔊 تم تفعيل النطق التلقائي للإجابات العربية', 'success');
            } else {
                this.showNotification('🔇 تم إيقاف النطق التلقائي', 'info');
            }
        }
        
        console.log(`⚙️ تم تحديث الإعداد ${key}:`, value);
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('teacherAI_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('خطأ في حفظ الإعدادات:', error);
        }
    }

    /**
     * Copy message content to clipboard
     */
    async copyMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const text = messageElement.dataset.originalText;
            
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    textArea.style.position = 'fixed';
                    textArea.style.left = '-999999px';
                    textArea.style.top = '-999999px';
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    document.execCommand('copy');
                    textArea.remove();
                }
                
                this.showCopyNotification();
                this.showNotification('✅ تم نسخ النص بنجاح', 'success');
                console.log('📋 تم نسخ الرسالة');
                
            } catch (error) {
                console.error('فشل في نسخ النص:', error);
                this.showNotification('❌ فشل في نسخ النص', 'error');
            }
        }
    }

    /**
     * Show copy notification
     */
    showCopyNotification() {
        const notification = document.createElement('div');
        notification.className = 'copy-notification';
        notification.textContent = '✅ تم النسخ!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Print specific message
     */
    printMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const text = messageElement.dataset.originalText;
            const printContent = this.generatePrintContent(text, 'إجابة من المدرس AI');
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
            
            console.log('🖨️ تم طباعة الرسالة');
        }
    }

    /**
     * Generate enhanced print content with Arabic support
     */
    generatePrintContent(text, title = 'المدرس AI') {
        const currentDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
        
        const formatStyle = this.settings.printFormat || 'detailed';
        let additionalStyles = '';
        let headerContent = '';
        let footerContent = '';
        
        switch (formatStyle) {
            case 'simple':
                headerContent = `<div class="title">${title}</div>`;
                footerContent = '';
                break;
            case 'formatted':
                additionalStyles = `
                    .content { 
                        background: #f9f9f9; 
                        border-right: 4px solid #667eea; 
                        padding: 20px; 
                        margin: 20px 0; 
                    }
                `;
                headerContent = `
                    <div class="title">${title}</div>
                    <div class="date">${currentDate}</div>
                `;
                footerContent = `
                    <div class="footer">
                        تم إنشاء هذا المستند بواسطة تطبيق المدرس AI المحسن<br>
                        مع دعم النطق العربي المتقدم<br>
                        ${new Date().toLocaleString('ar-SA')}
                    </div>
                `;
                break;
            default: // detailed
                headerContent = `
                    <div class="title">${title}</div>
                    <div class="date">${currentDate}</div>
                `;
                footerContent = `
                    <div class="footer">
                        تم إنشاء هذا المستند بواسطة تطبيق المدرس AI<br>
                        الإصدار: 2.0 المحسن مع النطق العربي<br>
                        ${new Date().toLocaleString('ar-SA')}
                    </div>
                `;
                break;
        }
        
        return `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
                <style>
                    body {
                        font-family: 'Cairo', 'Arial Unicode MS', sans-serif;
                        direction: rtl;
                        text-align: right;
                        margin: 2cm;
                        line-height: 1.8;
                        color: #000;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #667eea;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #667eea;
                        margin-bottom: 10px;
                    }
                    .date {
                        font-size: 14px;
                        color: #666;
                    }
                    .content {
                        font-size: 16px;
                        line-height: 2;
                        white-space: pre-wrap;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 12px;
                        color: #999;
                    }
                    @page {
                        margin: 2cm;
                    }
                    ${additionalStyles}
                </style>
            </head>
            <body>
                <div class="header">${headerContent}</div>
                <div class="content">${this.cleanTextForPrint(text)}</div>
                ${footerContent}
            </body>
            </html>
        `;
    }

    /**
     * Clean text for printing with Arabic support
     */
    cleanTextForPrint(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code style="background: #f5f5f5; padding: 2px 4px; border-radius: 3px;">$1</code>')
            .replace(/<[^>]*>/g, '')
            .replace(/\n/g, '<br>');
    }

    /**
     * Save message to favorites/bookmarks
     */
    async saveMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const text = messageElement.dataset.originalText;
            
            // Save to localStorage bookmarks
            const bookmarks = JSON.parse(localStorage.getItem('teacherAI_bookmarks') || '[]');
            const bookmark = {
                id: this.generateMessageId(),
                text: text,
                timestamp: new Date().toISOString(),
                sessionId: this.currentSession?.id
            };
            
            bookmarks.unshift(bookmark);
            localStorage.setItem('teacherAI_bookmarks', JSON.stringify(bookmarks));
            
            this.showNotification('تم حفظ الإجابة في المفضلة ⭐', 'success');
            console.log('⭐ تم حفظ الرسالة في المفضلة');
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        if (!this.elements.sidebarPanel) return;

        this.isSidebarOpen = !this.isSidebarOpen;
        
        if (this.isSidebarOpen) {
            this.elements.sidebarPanel.classList.add('open');
            console.log('📁 فتح الشريط الجانبي');
        } else {
            this.elements.sidebarPanel.classList.remove('open');
            console.log('📁 إغلاق الشريط الجانبي');
        }
    }

    /**
     * Close sidebar
     */
    closeSidebar() {
        this.isSidebarOpen = false;
        if (this.elements.sidebarPanel) {
            this.elements.sidebarPanel.classList.remove('open');
        }
    }

    /**
     * Enhanced file processing with Arabic notifications
     */
    async processFiles(files) {
        if (!files || files.length === 0) return;

        const validFiles = files.filter(file => this.isValidFileType(file));
        
        if (validFiles.length === 0) {
            this.showNotification('نوع الملف غير مدعوم ❌', 'error');
            return;
        }

        if (validFiles.length !== files.length) {
            this.showNotification(`تم تجاهل ${files.length - validFiles.length} ملف غير مدعوم ⚠️`, 'warning');
        }

        this.showLoading(true);
        this.showNotification(`📤 جاري رفع ${validFiles.length} ملف...`, 'info');

        try {
            const formData = new FormData();
            validFiles.forEach(file => {
                formData.append('files', file);
            });

            const response = await fetch(this.apiEndpoints.upload, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                this.showNotification(result.message || 'تم رفع الملفات بنجاح ✅', 'success');
                await this.loadDocuments();
                await this.updateStatistics();
                console.log('📤 تم رفع الملفات بنجاح');
            } else {
                this.showNotification(result.message || 'فشل في رفع الملفات ❌', 'error');
            }

        } catch (error) {
            console.error('خطأ في رفع الملفات:', error);
            this.showNotification('خطأ في رفع الملفات ❌', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Check if file type is valid
     */
    isValidFileType(file) {
        const allowedTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/rtf'
        ];
        return allowedTypes.includes(file.type) || 
               file.name.toLowerCase().match(/\.(txt|pdf|doc|docx|rtf)$/);
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = Array.from(event.target.files);
        await this.processFiles(files);
        
        if (this.elements.fileInput) {
            this.elements.fileInput.value = '';
        }
    }

    /**
     * Handle input keydown events
     */
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Adjust textarea height based on content
     */
    adjustTextareaHeight() {
        const input = this.elements.messageInput;
        if (!input) return;

        input.style.height = 'auto';
        const newHeight = Math.min(input.scrollHeight, 120);
        input.style.height = newHeight + 'px';
    }

    /**
     * Show typing indicator
     */
    showTypingIndicator() {
        if (!this.elements.messagesContainer) return;

        this.isTyping = true;
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        this.elements.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        console.log('⌨️ عرض مؤشر الكتابة');
    }

    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        console.log('⌨️ إخفاء مؤشر الكتابة');
    }

    /**
     * Hide welcome section
     */
    hideWelcomeSection() {
        if (this.elements.welcomeSection) {
            this.elements.welcomeSection.style.display = 'none';
        }
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.classList.add('active');
        }
    }

    /**
     * Scroll to bottom of messages
     */
    scrollToBottom() {
        if (this.elements.messagesContainer) {
            setTimeout(() => {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }, 100);
        }
    }

    /**
     * Toggle recording with enhanced Arabic support
     */
    toggleRecording() {
        if (!this.speechRecognition) {
            this.showNotification('التسجيل الصوتي غير مدعوم في هذا المتصفح ❌', 'error');
            return;
        }

        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * Start recording with Arabic optimization
     */
    startRecording() {
        try {
            // Ensure Arabic language is set
            this.speechRecognition.lang = this.settings.preferredArabicDialect || 'ar-SA';
            this.speechRecognition.start();
            console.log('🎤 بدء التسجيل باللغة العربية:', this.speechRecognition.lang);
        } catch (error) {
            console.error('خطأ في بدء التسجيل:', error);
            this.showNotification('خطأ في بدء التسجيل ❌', 'error');
        }
    }

    /**
     * Stop recording
     */
    stopRecording() {
        if (this.speechRecognition) {
            this.speechRecognition.stop();
        }
        this.isRecording = false;
        this.updateMicButton();
        console.log('🎤 إيقاف التسجيل');
    }

    /**
     * Update microphone button state
     */
    updateMicButton() {
        const micBtn = this.elements.micButton;
        if (!micBtn) return;

        if (this.isRecording) {
            micBtn.classList.add('recording');
            micBtn.innerHTML = '<i class="fas fa-stop"></i>';
            micBtn.title = 'إيقاف التسجيل';
        } else {
            micBtn.classList.remove('recording');
            micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            micBtn.title = 'التسجيل الصوتي (Ctrl+M)';
        }
    }

    /**
     * Load documents from server
     */
    async loadDocuments() {
        try {
            const response = await this.apiRequest('GET', this.apiEndpoints.documents);
            if (response.status === 'success') {
                this.documents = response.documents || [];
                this.displayDocuments();
                this.updateFilesCount();
                console.log(`📚 تم تحميل ${this.documents.length} ملف`);
            }
        } catch (error) {
            console.error('خطأ في تحميل المستندات:', error);
        }
    }

    /**
     * Display documents in sidebar
     */
    displayDocuments() {
        if (!this.elements.filesList) return;

        if (this.documents.length === 0) {
            this.elements.filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>لا توجد ملفات بعد</p>
                    <small>ارفع ملازمك الدراسية لتبدأ</small>
                </div>
            `;
            return;
        }

        this.elements.filesList.innerHTML = '';
        
        this.documents.forEach(doc => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.innerHTML = `
                <div class="file-icon">
                    <i class="fas fa-file-text"></i>
                </div>
                <div class="file-details">
                    <div class="file-name" title="${doc.filename}">${doc.filename}</div>
                    <div class="file-meta">${this.formatFileSize(doc.file_size)} • ${doc.word_count || 0} كلمة</div>
                </div>
                <div class="file-actions">
                    <button class="file-action-btn delete" onclick="teacherAI.deleteDocument(${doc.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.elements.filesList.appendChild(fileDiv);
        });
    }

    /**
     * Delete document
     */
    async deleteDocument(documentId) {
        if (!confirm('هل أنت متأكد من حذف هذا الملف؟')) {
            return;
        }

        try {
            const response = await this.apiRequest('DELETE', `${this.apiEndpoints.deleteDocument}/${documentId}`);
            
            if (response.status === 'success') {
                this.showNotification('تم حذف الملف بنجاح ✅', 'success');
                await this.loadDocuments();
                await this.updateStatistics();
                console.log('🗑️ تم حذف الملف:', documentId);
            } else {
                this.showNotification(response.message || 'فشل في حذف الملف ❌', 'error');
            }
        } catch (error) {
            console.error('خطأ في حذف الملف:', error);
            this.showNotification('خطأ في حذف الملف ❌', 'error');
        }
    }

    /**
     * Update files count
     */
    updateFilesCount() {
        if (this.elements.filesCount) {
            this.elements.filesCount.textContent = this.documents.length;
        }
    }

    /**
     * Load chat history
     */
    async loadChatHistory() {
        try {
            const response = await this.apiRequest('GET', this.apiEndpoints.chatHistory);
            if (response.status === 'success') {
                this.chatHistory = response.history || [];
                console.log(`📖 تم تحميل ${this.chatHistory.length} رسالة من التاريخ`);
            }
        } catch (error) {
            console.error('خطأ في تحميل تاريخ المحادثة:', error);
        }
    }

    /**
     * Update statistics
     */
    async updateStatistics() {
        try {
            const response = await this.apiRequest('GET', this.apiEndpoints.stats);
            if (response.status === 'success') {
                this.statistics = response.stats || this.statistics;
                this.updateStatisticsDisplay();
                console.log('📊 تم تحديث الإحصائيات');
            }
        } catch (error) {
            console.error('خطأ في تحديث الإحصائيات:', error);
        }
    }

    /**
     * Perform search with Arabic support
     */
    async performSearch() {
        const searchInput = this.elements.searchInput;
        const searchResults = this.elements.searchResults;
        
        if (!searchInput || !searchResults) return;

        const query = searchInput.value.trim();
        if (!query) {
            this.showNotification('الرجاء إدخال نص للبحث ⚠️', 'warning');
            return;
        }

        searchResults.innerHTML = '<div class="loading-text">🔍 جاري البحث...</div>';
        searchResults.classList.add('active');

        try {
            const response = await this.apiRequest('POST', this.apiEndpoints.search, {
                query: query,
                limit: 10,
                arabic_search: true // Enable Arabic search optimization
            });

            if (response.status === 'success' && response.results.length > 0) {
                this.displaySearchResults(response.results, query);
                console.log(`🔍 تم العثور على ${response.results.length} نتيجة`);
            } else {
                searchResults.innerHTML = `<p>لم يتم العثور على نتائج للبحث: "${query}" 😔</p>`;
            }

        } catch (error) {
            console.error('خطأ في البحث:', error);
            searchResults.innerHTML = '<p>خطأ في البحث ❌</p>';
        }
    }

    /**
     * Display search results with Arabic formatting
     */
    displaySearchResults(results, query) {
        const searchResults = this.elements.searchResults;
        if (!searchResults) return;

        let html = `<h4>🔍 نتائج البحث: "${query}" (${results.length})</h4>`;
        
        results.forEach(result => {
            html += `
                <div class="search-result-item">
                    <div class="search-result-title">📄 ${result.filename}</div>
                    <div class="search-result-content">${result.content_preview}</div>
                    <div class="search-result-meta">
                        📝 ${result.word_count} كلمة • 📅 ${this.formatDate(new Date(result.created_at))}
                    </div>
                </div>
            `;
        });
        
        searchResults.innerHTML = html;
    }

    /**
     * Open modal
     */
    openModal(modalId) {
        const modal = this.elements[modalId] || document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            
            if (modalId === 'searchModal' && this.elements.searchInput) {
                setTimeout(() => this.elements.searchInput.focus(), 100);
            }
            
            console.log('🔓 فتح النافذة:', modalId);
        } else {
            console.warn(`⚠️ النافذة ${modalId} غير موجودة`);
        }
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        const modal = this.elements[modalId] || document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            console.log('🔒 إغلاق النافذة:', modalId);
        }
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        console.log('🔒 إغلاق جميع النوافذ');
    }

    /**
     * Clear all data with confirmation
     */
    async clearAllData() {
        if (!confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            return;
        }

        try {
            // Stop any ongoing speech
            if (this.speechSynthesis.speaking) {
                this.speechSynthesis.cancel();
            }

            // Clear local data
            this.currentConversation = [];
            this.chatHistory = [];
            this.chatSessions = [];
            this.currentSession = null;
            
            // Clear UI
            if (this.elements.messagesContainer) {
                this.elements.messagesContainer.innerHTML = '';
                this.elements.messagesContainer.classList.remove('active');
            }
            
            if (this.elements.welcomeSection) {
                this.elements.welcomeSection.style.display = 'flex';
            }
            
            // Clear localStorage
            localStorage.removeItem('teacherAI_chatHistory');
            localStorage.removeItem('teacherAI_currentSession');
            localStorage.removeItem('teacherAI_chatSessions');
            localStorage.removeItem('teacherAI_bookmarks');
            
            // Update displays
            this.displayChatSessions();
            this.updateStatisticsDisplay();
            
            this.showNotification('تم مسح جميع البيانات نهائياً ✅', 'success');
            this.closeAllModals();
            
            console.log('🧹 تم مسح جميع البيانات');
            
        } catch (error) {
            console.error('خطأ في مسح البيانات:', error);
            this.showNotification('خطأ في مسح البيانات ❌', 'error');
        }
    }

    /**
     * Update connection status with Arabic indicators
     */
    updateConnectionStatus(isOnline) {
        if (this.elements.connectionStatus) {
            const statusDot = this.elements.connectionStatus.querySelector('.status-dot');
            const statusText = this.elements.connectionStatus.querySelector('span');
            
            if (statusDot && statusText) {
                if (isOnline) {
                    statusDot.className = 'status-dot online';
                    statusText.textContent = 'متصل';
                    console.log('🌐 الاتصال متاح');
                } else {
                    statusDot.className = 'status-dot offline';
                    statusText.textContent = 'غير متصل';
                    console.log('📡 انقطع الاتصال');
                }
            }
        }
    }

    /**
     * Handle window resize with sidebar management
     */
    handleResize() {
        if (window.innerWidth > 1200 && this.isChatHistoryOpen) {
            this.closeChatHistorySidebar();
        }
        
        if (window.innerWidth > 1024 && this.isSidebarOpen) {
            this.closeSidebar();
        }
        
        this.adjustTextareaHeight();
    }

    /**
     * Show loading overlay
     */
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.add('active');
                this.isLoading = true;
                console.log('⏳ عرض شاشة التحميل');
            } else {
                this.elements.loadingOverlay.classList.remove('active');
                this.isLoading = false;
                console.log('✅ إخفاء شاشة التحميل');
            }
        }
    }

    /**
     * Show notification with enhanced Arabic support
     */
    showNotification(message, type = 'info', duration = 4000) {
        if (!this.elements.statusArea) return;

        const notification = document.createElement('div');
        notification.className = `status-message ${type}`;
        notification.textContent = message;

        this.elements.statusArea.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);

        console.log(`📢 إشعار (${type}):`, message);
    }

    /**
     * Save current session
     */
    saveCurrentSession() {
        if (this.settings.saveHistory && this.currentSession) {
            this.saveCurrentChatSession();
        }
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        if (!this.elements.uploadZone) return;

        const preventDefaults = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.elements.uploadZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.elements.uploadZone.addEventListener(eventName, () => {
                this.elements.uploadZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.elements.uploadZone.addEventListener(eventName, () => {
                this.elements.uploadZone.classList.remove('dragover');
            }, false);
        });

        this.elements.uploadZone.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.processFiles(files);
            console.log('📁 تم إسقاط الملفات');
        }, false);
    }

    /**
     * Setup keyboard shortcuts with Arabic support
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.elements.messageInput?.focus();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openModal('searchModal');
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.toggleChatHistorySidebar();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.startNewChatSession();
            }

            if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
                e.preventDefault();
                this.toggleRecording();
            }

            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeChatHistorySidebar();
                if (this.isRecording) {
                    this.stopRecording();
                }
                if (this.speechSynthesis.speaking) {
                    this.speechSynthesis.cancel();
                    this.clearSpeakingIndicators();
                }
            }
        });

        console.log('⌨️ تم إعداد اختصارات لوحة المفاتيح');
    }

    /**
     * Setup resize observer for responsive behavior
     */
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            const resizeObserver = new ResizeObserver((entries) => {
                this.handleResize();
            });
            resizeObserver.observe(document.body);
        }
    }

    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadDocuments(),
                this.loadChatHistory(),
                this.updateStatistics()
            ]);
            console.log('📊 تم تحميل البيانات الأولية');
        } catch (error) {
            console.error('خطأ في تحميل البيانات الأولية:', error);
        }
    }

    /**
     * Format file size in Arabic
     */
    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 بايت';
        
        const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }

    /**
     * Format date in Arabic
     */
    formatDate(date) {
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    /**
     * Show help modal
     */
    showHelp() {
        this.openModal('helpModal');
    }

    /**
     * Utility function to escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Make API request with error handling
     */
    async apiRequest(method, url, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && method !== 'GET') {
            options.body = JSON.stringify(data);
        }

        if (data && method === 'GET') {
            const params = new URLSearchParams(data);
            url += '?' + params.toString();
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
}

// Global Functions for onclick handlers
window.teacherAI = null;

// Enhanced global functions with Arabic support
window.teacherAISpeakMessage = function(messageId) {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.speakMessage(messageId);
    }
};

window.teacherAICopyMessage = function(messageId) {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.copyMessage(messageId);
    }
};

window.teacherAIPrintMessage = function(messageId) {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.printMessage(messageId);
    }
};

window.teacherAISaveMessage = function(messageId) {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.saveMessage(messageId);
    }
};

window.teacherAIShowHelp = function() {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.showHelp();
    }
};

window.teacherAIOpenModal = function(modalId) {
    if (window.teacherAI && window.teacherAI.isInitialized) {
        window.teacherAI.openModal(modalId);
    }
};

// Initialize Application with enhanced error handling
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 بدء تحميل تطبيق المدرس AI المحسن...');
        window.teacherAI = new TeacherAI();
        console.log('✨ تم تحميل تطبيق المدرس AI بنجاح مع النطق العربي المحسن');
    } catch (error) {
        console.error('❌ فشل في تهيئة المدرس AI:', error);
        
        // Enhanced Arabic error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fee2e2;
            color: #dc2626;
            padding: 30px;
            border-radius: 12px;
            border: 2px solid #fecaca;
            text-align: center;
            z-index: 10000;
            font-family: 'Cairo', sans-serif;
            direction: rtl;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            max-width: 400px;
        `;
        errorDiv.innerHTML = `
            <h3 style="margin-bottom: 15px; font-size: 1.2rem;">❌ خطأ في تحميل التطبيق</h3>
            <p style="margin-bottom: 20px; line-height: 1.6;">حدث خطأ في تهيئة تطبيق المدرس AI. الرجاء تحديث الصفحة أو التحقق من الاتصال بالإنترنت.</p>
            <button onclick="location.reload()" style="
                padding: 12px 24px; 
                background: #dc2626; 
                color: white; 
                border: none; 
                border-radius: 8px; 
                cursor: pointer; 
                font-family: inherit;
                font-weight: 600;
                transition: background 0.2s;
            " onmouseover="this.style.background='#b91c1c'" onmouseout="this.style.background='#dc2626'">
                🔄 تحديث الصفحة
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Enhanced global error handlers with Arabic support
window.addEventListener('error', function(e) {
    console.error('❌ خطأ عام:', e.error);
    if (window.teacherAI) {
        window.teacherAI.showNotification('حدث خطأ غير متوقع ⚠️', 'error');
    }
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('❌ رفض وعد غير معالج:', e.reason);
    if (window.teacherAI) {
        window.teacherAI.showNotification('حدث خطأ في العملية ⚠️', 'error');
    }
});

// Enhanced Service Worker Registration for PWA functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/static/js/sw.js')
        .then(registration => {
            console.log('✅ تم تسجيل Service Worker بنجاح');
            if (window.teacherAI) {
                window.teacherAI.showNotification('تم تحديث التطبيق للعمل دون اتصال ✨', 'success');
            }
        })
        .catch(error => {
            console.log('❌ فشل تسجيل Service Worker:', error);
        });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeacherAI;
}
// src/lib/translations.ts

export type LanguageCode = 'en' | 'hi' | 'bn' | 'gu' | 'kn' | 'ml' | 'mr' | 'pa' | 'ta' | 'te';

type Translations = {
  [key in LanguageCode]: {
    [key: string]: any;
  };
};

export const translations: Translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      support: 'Support',
    },
    selectLanguage: 'Select Language',
    heroTitle: 'Explore the Wonders of India',
    heroSubtitle: 'Your ultimate travel companion is here. Plan your journey, book transport, and find stays—all in one seamless experience.',
    startPlanning: 'Start Planning',
    featuresTitle: 'Features',
    go: 'Go',
    features: {
      aiTripPlanner: {
        title: 'AI Trip Planner',
        description: 'Let our AI craft the perfect trip for you based on your preferences and budget.',
      },
      localTransport: {
        title: 'Local Transport',
        description: 'Find verified local cabs, buses, and trains for your travel needs.',
      },
      accommodations: {
        title: 'Accommodations',
        description: 'Discover and Book hotels & dharamshalas across India.',
      },
      offlineMaps: {
        title: 'Offline Maps',
        description: 'Save maps and routes to navigate with confidence, even without internet.',
      },
    },
  },
  hi: {
    nav: {
      dashboard: 'डैशबोर्ड',
      support: 'सहायता',
    },
    selectLanguage: 'भाषा चुनें',
    heroTitle: 'भारत के आश्चर्यों का अन्वेषण करें',
    heroSubtitle: 'आपका अंतिम यात्रा साथी यहाँ है। अपनी यात्रा की योजना बनाएं, परिवहन बुक करें, और रहने की जगहें खोजें—सब कुछ एक सहज अनुभव में।',
    startPlanning: 'योजना बनाना शुरू करें',
    featuresTitle: 'विशेषताएँ',
    go: 'जाएँ',
    features: {
      aiTripPlanner: {
        title: 'एआई यात्रा योजनाकार',
        description: 'हमारी एआई को आपकी पसंद और बजट के आधार पर आपके लिए सही यात्रा तैयार करने दें।',
      },
      localTransport: {
        title: 'स्थानीय परिवहन',
        description: 'अपनी यात्रा की जरूरतों के लिए सत्यापित स्थानीय कैब, बसें और ट्रेनें खोजें।',
      },
      accommodations: {
        title: 'आवास',
        description: 'पूरे भारत में होटल और धर्मशालाएं खोजें और बुक करें।',
      },
      offlineMaps: {
        title: 'ऑफ़लाइन मानचित्र',
        description: 'बिना इंटरनेट के भी आत्मविश्वास से नेविगेट करने के लिए मानचित्र और मार्ग सहेजें।',
      },
    },
  },
  // Add other languages here...
  bn: {
    nav: { dashboard: 'ড্যাশবোর্ড', support: 'সমর্থন' },
    selectLanguage: 'ভাষা নির্বাচন করুন',
    heroTitle: 'ভারতের বিস্ময় অন্বেষণ করুন',
    heroSubtitle: 'আপনার চূড়ান্ত ভ্রমণ সঙ্গী এখানে। আপনার যাত্রা পরিকল্পনা করুন, পরিবহন বুক করুন, এবং থাকার জায়গা খুঁজুন—সবই এক বিরামহীন অভিজ্ঞতায়।',
    startPlanning: 'পরিকল্পনা শুরু করুন',
    featuresTitle: 'বৈশিষ্ট্য',
    go: 'যান',
    features: {
        aiTripPlanner: { title: 'এআই ট্রিপ প্ল্যানার', description: 'আমাদের এআই আপনার পছন্দ এবং বাজেটের উপর ভিত্তি করে আপনার জন্য নিখুঁত ট্রিপ তৈরি করবে।' },
        localTransport: { title: 'স্থানীয় পরিবহন', description: 'আপনার ভ্রমণের প্রয়োজনের জন্য যাচাইকৃত স্থানীয় ক্যাব, বাস এবং ট্রেন খুঁজুন।' },
        accommodations: { title: 'থাকার ব্যবস্থা', description: 'ভারত জুড়ে হোটেল এবং ধর্মশালা আবিষ্কার করুন এবং বুক করুন।' },
        offlineMaps: { title: 'অফলাইন মানচিত্র', description: 'এমনকি ইন্টারনেট ছাড়াই আত্মবিশ্বাসের সাথে নেভিগেট করতে মানচিত্র এবং রুটগুলি সংরক্ষণ করুন।' }
    }
  },
  gu: {
    nav: { dashboard: 'ડેશબોર્ડ', support: 'આધાર' },
    selectLanguage: 'ભાષા પસંદ કરો',
    heroTitle: 'ભારતના અજાયબીઓની શોધખોળ કરો',
    heroSubtitle: 'તમારો અંતિમ પ્રવાસ સાથી અહીં છે. તમારી મુસાફરીની યોજના બનાવો, પરિવહન બુક કરો, અને રહેઠાણ શોધો—બધું એક સરળ અનુભવમાં.',
    startPlanning: 'યોજના બનાવવાનું શરૂ કરો',
    featuresTitle: 'સુવિધાઓ',
    go: 'જાઓ',
    features: {
        aiTripPlanner: { title: 'એઆઈ ટ્રિપ પ્લાનર', description: 'અમારી એઆઈને તમારી પસંદગીઓ અને બજેટના આધારે તમારા માટે સંપૂર્ણ સફર બનાવવા દો.' },
        localTransport: { title: 'સ્થાનિક પરિવહન', description: 'તમારી મુસાફરીની જરૂરિયાતો માટે ચકાસાયેલ સ્થાનિક કેબ, બસો અને ટ્રેનો શોધો.' },
        accommodations: { title: 'રહેઠાણ', description: 'ભારતભરમાં હોટલો અને ધર્મશાળાઓ શોધો અને બુક કરો.' },
        offlineMaps: { title: 'ઑફલાઇન નકશા', description: 'ઇન્ટરનેટ વિના પણ આત્મવિશ્વાસ સાથે નેવિગેટ કરવા માટે નકશા અને માર્ગો સાચવો.' }
    }
  },
  kn: {
    nav: { dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', support: 'ಬೆಂಬಲ' },
    selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    heroTitle: 'ಭಾರತದ ಅದ್ಭುತಗಳನ್ನು ಅನ್ವೇಷಿಸಿ',
    heroSubtitle: 'ನಿಮ್ಮ ಅಂತಿಮ ಪ್ರಯಾಣ ಸಂಗಾತಿ ಇಲ್ಲಿದೆ. ನಿಮ್ಮ ಪ್ರಯಾಣವನ್ನು ಯೋಜಿಸಿ, ಸಾರಿಗೆಯನ್ನು ಕಾಯ್ದಿರಿಸಿ, ಮತ್ತು ಉಳಿದುಕೊಳ್ಳುವ ಸ್ಥಳಗಳನ್ನು ಹುಡುಕಿ—ಎಲ್ಲವೂ ಒಂದೇ ಸುಲಲಿತ ಅನುಭವದಲ್ಲಿ.',
    startPlanning: 'ಯೋಜನೆ ಪ್ರಾರಂಭಿಸಿ',
    featuresTitle: 'ವೈಶಿಷ್ಟ್ಯಗಳು',
    go: 'ಹೋಗಿ',
    features: {
        aiTripPlanner: { title: 'ಎಐ ಪ್ರವಾಸ ಯೋಜಕ', description: 'ನಮ್ಮ ಎಐ ನಿಮ್ಮ ಆದ್ಯತೆಗಳು ಮತ್ತು ಬಜೆಟ್‌ಗೆ ಅನುಗುಣವಾಗಿ ನಿಮಗಾಗಿ ಪರಿಪೂರ್ಣ ಪ್ರವಾಸವನ್ನು ರಚಿಸಲಿ.' },
        localTransport: { title: 'ಸ್ಥಳೀಯ ಸಾರಿಗೆ', description: 'ನಿಮ್ಮ ಪ್ರಯಾಣದ ಅಗತ್ಯಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿದ ಸ್ಥಳೀಯ ಕ್ಯಾಬ್‌ಗಳು, ಬಸ್‌ಗಳು ಮತ್ತು ರೈಲುಗಳನ್ನು ಹುಡುಕಿ.' },
        accommodations: { title: 'ವಸತಿ', description: 'ಭಾರತದಾದ್ಯಂತ ಹೋಟೆಲ್‌ಗಳು ಮತ್ತು ಧರ್ಮಶಾಲೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ ಮತ್ತು ಕಾಯ್ದಿರಿಸಿ.' },
        offlineMaps: { title: 'ಆಫ್‌ಲೈನ್ ನಕ್ಷೆಗಳು', description: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಆತ್ಮವಿಶ್ವಾಸದಿಂದ ನ್ಯಾವಿಗೇಟ್ ಮಾಡಲು ನಕ್ಷೆಗಳು ಮತ್ತು ಮಾರ್ಗಗಳನ್ನು ಉಳಿಸಿ.' }
    }
  },
  ml: {
    nav: { dashboard: 'ഡാഷ്ബോർഡ്', support: 'പിന്തുണ' },
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കുക',
    heroTitle: 'ഇന്ത്യയുടെ അത്ഭുതങ്ങൾ കണ്ടെത്തുക',
    heroSubtitle: 'നിങ്ങളുടെ ആത്യന്തിക യാത്രാ സഹായി ഇവിടെയുണ്ട്. നിങ്ങളുടെ യാത്ര ആസൂത്രണം ചെയ്യുക, ഗതാഗതം ബുക്ക് ചെയ്യുക, താമസസ്ഥലങ്ങൾ കണ്ടെത്തുക—എല്ലാം ഒരൊറ്റ സുഗമമായ അനുഭവത്തിൽ.',
    startPlanning: 'ആസൂത്രണം ആരംഭിക്കുക',
    featuresTitle: 'സവിശേഷതകൾ',
    go: 'പോകൂ',
    features: {
        aiTripPlanner: { title: 'എഐ ട്രിപ്പ് പ്ലാനർ', description: 'ഞങ്ങളുടെ എഐ നിങ്ങളുടെ താൽപ്പര്യങ്ങൾക്കും ബജറ്റിനും അനുസരിച്ച് നിങ്ങൾക്കായി മികച്ച യാത്ര തയ്യാറാക്കട്ടെ.' },
        localTransport: { title: 'പ്രാദേശിക ഗതാഗതം', description: 'നിങ്ങളുടെ യാത്രാ ആവശ്യങ്ങൾക്കായി പരിശോധിച്ചുറപ്പിച്ച പ്രാദേശിക ക്യാബുകൾ, ബസുകൾ, ട്രെയിനുകൾ എന്നിവ കണ്ടെത്തുക.' },
        accommodations: { title: 'താമസ സൗകര്യങ്ങൾ', description: 'ഇന്ത്യയിലുടനീളമുള്ള ഹോട്ടലുകളും ധർമ്മശാലകളും കണ്ടെത്തുകയും ബുക്ക് ചെയ്യുകയും ചെയ്യുക.' },
        offlineMaps: { title: 'ഓഫ്‌ലൈൻ മാപ്പുകൾ', description: 'ഇൻ്റർനെറ്റ് ഇല്ലാതെ പോലും ആത്മവിശ്വാസത്തോടെ നാവിഗേറ്റ് ചെയ്യാൻ മാപ്പുകളും റൂട്ടുകളും സംരക്ഷിക്കുക.' }
    }
  },
  mr: {
    nav: { dashboard: 'डॅशबोर्ड', support: 'समर्थन' },
    selectLanguage: 'भाषा निवडा',
    heroTitle: 'भारताच्या आश्चर्यांचा शोध घ्या',
    heroSubtitle: 'तुमचा अंतिम प्रवास सोबती येथे आहे. तुमच्या प्रवासाची योजना करा, वाहतूक बुक करा आणि राहण्याची ठिकाणे शोधा—सर्व काही एका अखंड अनुभवात.',
    startPlanning: 'नियोजन सुरू करा',
    featuresTitle: 'वैशिष्ट्ये',
    go: 'जा',
    features: {
        aiTripPlanner: { title: 'एआय ट्रिप प्लॅनर', description: 'आमच्या एआयला तुमच्या आवडी आणि बजेटनुसार तुमच्यासाठी योग्य सहल तयार करू द्या.' },
        localTransport: { title: 'स्थानिक वाहतूक', description: 'तुमच्या प्रवासाच्या गरजांसाठी सत्यापित स्थानिक कॅब, बस आणि ट्रेन शोधा.' },
        accommodations: { title: 'निवास', description: 'भारतभरातील हॉटेल्स आणि धर्मशाळा शोधा आणि बुक करा.' },
        offlineMaps: { title: 'ऑफलाइन नकाशे', description: 'इंटरनेटशिवायही आत्मविश्वासाने नेव्हिगेट करण्यासाठी नकाशे आणि मार्ग जतन करा.' }
    }
  },
  pa: {
    nav: { dashboard: 'ਡੈਸ਼ਬੋਰਡ', support: 'ਸਹਾਇਤਾ' },
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    heroTitle: 'ਭਾਰਤ ਦੇ ਅਜੂਬਿਆਂ ਦੀ ਪੜਚੋਲ ਕਰੋ',
    heroSubtitle: 'ਤੁਹਾਡਾ ਅੰਤਮ ਯਾਤਰਾ ਸਾਥੀ ਇੱਥੇ ਹੈ। ਆਪਣੀ ਯਾਤਰਾ ਦੀ ਯੋਜਨਾ ਬਣਾਓ, ਆਵਾਜਾਈ ਬੁੱਕ ਕਰੋ, ਅਤੇ ਰਹਿਣ ਦੀਆਂ ਥਾਵਾਂ ਲੱਭੋ—ਸਭ ਕੁਝ ਇੱਕ ਸਹਿਜ ਅਨੁਭਵ ਵਿੱਚ।',
    startPlanning: 'ਯੋਜਨਾਬੰਦੀ ਸ਼ੁਰੂ ਕਰੋ',
    featuresTitle: 'ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ',
    go: 'ਜਾਓ',
    features: {
        aiTripPlanner: { title: 'ਏਆਈ ਟ੍ਰਿਪ ਪਲੈਨਰ', description: 'ਸਾਡੇ ਏਆਈ ਨੂੰ ਤੁਹਾਡੀਆਂ ਤਰਜੀਹਾਂ ਅਤੇ ਬਜਟ ਦੇ ਅਧਾਰ ਤੇ ਤੁਹਾਡੇ ਲਈ ਸੰਪੂਰਨ ਯਾਤਰਾ ਤਿਆਰ ਕਰਨ ਦਿਓ।' },
        localTransport: { title: 'ਸਥਾਨਕ ਆਵਾਜਾਈ', description: 'ਆਪਣੀਆਂ ਯਾਤਰਾ ਦੀਆਂ ਜ਼ਰੂਰਤਾਂ ਲਈ ਪ੍ਰਮਾਣਿਤ ਸਥਾਨਕ ਕੈਬ, ਬੱਸਾਂ ਅਤੇ ਰੇਲ ਗੱਡੀਆਂ ਲੱਭੋ।' },
        accommodations: { title: 'ਰਿਹਾਇਸ਼', description: 'ਪੂਰੇ ਭਾਰਤ ਵਿੱਚ ਹੋਟਲ ਅਤੇ ਧਰਮਸ਼ਾਲਾ ਲੱਭੋ ਅਤੇ ਬੁੱਕ ਕਰੋ।' },
        offlineMaps: { title: 'ਔਫਲਾਈਨ ਨਕਸ਼ੇ', description: 'ਬਿਨਾਂ ਇੰਟਰਨੈਟ ਦੇ ਵੀ ਭਰੋਸੇ ਨਾਲ ਨੈਵੀਗੇਟ ਕਰਨ ਲਈ ਨਕਸ਼ੇ ਅਤੇ ਰੂਟ ਸੁਰੱਖਿਅਤ ਕਰੋ।' }
    }
  },
  ta: {
    nav: { dashboard: 'แดชบอร์ด', support: 'ஆதரவு' },
    selectLanguage: 'மொழியை தேர்ந்தெடு',
    heroTitle: 'இந்தியாவின் அதிசயங்களை ஆராயுங்கள்',
    heroSubtitle: 'உங்கள் இறுதி பயண துணை இங்கே உள்ளது. உங்கள் பயணத்தைத் திட்டமிடுங்கள், போக்குவரத்தை முன்பதிவு செய்யுங்கள், தங்குமிடங்களைக் கண்டறியுங்கள்—அனைத்தும் ஒரே απρόσκοπτη அனுபவத்தில்.',
    startPlanning: 'திட்டமிடத் தொடங்குங்கள்',
    featuresTitle: 'அம்சங்கள்',
    go: 'செல்',
    features: {
        aiTripPlanner: { title: 'AI பயண திட்டமிடுபவர்', description: 'எங்கள் AI உங்கள் விருப்பங்கள் மற்றும் பட்ஜெட்டின் அடிப்படையில் உங்களுக்கான சரியான பயணத்தை உருவாக்கட்டும்.' },
        localTransport: { title: 'உள்ளூர் போக்குவரத்து', description: 'உங்கள் பயணத் தேவைகளுக்கு சரிபார்க்கப்பட்ட உள்ளூர் வண்டிகள், பேருந்துகள் மற்றும் ரயில்களைக் கண்டறியவும்.' },
        accommodations: { title: 'தங்குமிடங்கள்', description: 'இந்தியா முழுவதும் உள்ள ஹோட்டல்கள் மற்றும் தர்மசாலாக்களைக் கண்டறிந்து முன்பதிவு செய்யுங்கள்.' },
        offlineMaps: { title: 'ஆஃப்லைன் வரைபடங்கள்', description: 'இணையம் இல்லாவிட்டாலும் நம்பிக்கையுடன் செல்ல வரைபடங்களையும் வழிகளையும் சேமிக்கவும்.' }
    }
  },
  te: {
    nav: { dashboard: 'డాష్‌బోర్డ్', support: 'మద్దతు' },
    selectLanguage: 'భాషను ఎంచుకోండి',
    heroTitle: 'భారతదేశ అద్భుతాలను అన్వేషించండి',
    heroSubtitle: 'మీ అంతిమ ప్రయాణ సహచరుడు ఇక్కడ ఉన్నారు. మీ ప్రయాణాన్ని ప్లాన్ చేసుకోండి, రవాణాను బుక్ చేసుకోండి మరియు బసలను కనుగొనండి—అన్నీ ఒకే అతుకులు లేని అనుభవంలో.',
    startPlanning: 'ప్రణాళిక ప్రారంభించండి',
    featuresTitle: 'ఫీచర్లు',
    go: 'వెళ్ళండి',
    features: {
        aiTripPlanner: { title: 'AI ట్రిప్ ప్లానర్', description: 'మా AI మీ ప్రాధాన్యతలు మరియు బడ్జెట్ ఆధారంగా మీ కోసం ఖచ్చితమైన పర్యటనను రూపొందించనివ్వండి.' },
        localTransport: { title: 'స్థానిక రవాణా', description: 'మీ ప్రయాణ అవసరాల కోసం ధృవీకరించబడిన స్థానిక క్యాబ్‌లు, బస్సులు మరియు రైళ్లను కనుగొనండి.' },
        accommodations: { title: 'వసతులు', description: 'భారతదేశం అంతటా హోటళ్ళు మరియు ధర్మశాలలను కనుగొని బుక్ చేసుకోండి.' },
        offlineMaps: { title: 'ఆఫ్‌లైన్ మ్యాప్‌లు', description: 'ఇంటర్నెట్ లేకుండా కూడా విశ్వాసంతో నావిగేట్ చేయడానికి మ్యాప్‌లు మరియు మార్గాలను సేవ్ చేయండి.' }
    }
  },
};

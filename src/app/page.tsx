
// src/app/page.tsx
"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/language-provider";
import {
  ArrowRight,
  Car,
  Hotel,
  Languages,
  Plane,
  Search,
  Map,
  NotebookPen,
  BadgeIndianRupee,
  Route as RouteIcon,
} from "lucide-react";

export default function DashboardPage() {
  const { language, t } = useLanguage();
  const heroButtonClass =
    "mt-8 rounded-2xl border border-emerald-600 bg-emerald-600 px-8 py-6 text-lg text-white shadow-[0_18px_45px_rgba(22,163,74,0.22)] transition-all duration-300 hover:bg-emerald-700 hover:border-emerald-700 dark:border-orange-400 dark:bg-orange-400 dark:text-slate-950 dark:shadow-[0_20px_50px_rgba(251,146,60,0.24)] dark:hover:bg-orange-300 dark:hover:border-orange-300";
  const featureIconClass =
    "rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-orange-400/30 dark:bg-slate-950";
  const featureIconColorClass =
    "h-8 w-8 shrink-0 text-emerald-700 dark:text-orange-200";
  const featureButtonClass =
    "w-full rounded-2xl border border-sky-300 bg-sky-50 text-sky-800 shadow-sm transition-all duration-300 hover:bg-sky-100 hover:text-sky-900 dark:border-sky-400/40 dark:bg-slate-950 dark:text-sky-200 dark:shadow-[0_10px_30px_rgba(56,189,248,0.12)] dark:hover:bg-slate-900 dark:hover:text-sky-100";

  const homepageCopy = {
    en: {
      badge: "Built for practical India travel planning",
      heroTitle: "Travel planning that feels closer to how people actually travel",
      heroSubtitle:
        "I shaped this app around real use: where to stay after reaching, what a meal may cost nearby, how to plan local movement, and what to do each day without making the trip feel over-packed.",
      quickReasons: [
        {
          title: "Built around real trip flow",
          description:
            "Not just place names. The planner now thinks in sequence: arrival, hotel check-in, meals, nearby visits, and next-day coverage.",
        },
        {
          title: "Keeps budget visible",
          description:
            "Hotel, food, local transport, and activity estimates stay visible so the plan feels practical, not random.",
        },
        {
          title: "Useful on the ground",
          description:
            "Routes, local transport, place search, and support tools are all placed so you can use them during the trip too.",
        },
        {
          title: "Supports Indian languages",
          description:
            "The app supports major Indian languages so users can switch the experience into the language they are more comfortable reading.",
        },
      ],
      toolsEyebrow: "Main tools inside the app",
      toolsHeading: "Start from the part of the trip you want to solve first",
      toolsDescription:
        "Some people begin with budget, some with route, and some with hotel planning. I kept the tools separate so you can use only what you need.",
      openTool: "Open this tool",
    },
    hi: {
      badge: "व्यावहारिक भारत यात्रा योजना के लिए बनाया गया",
      heroTitle: "यात्रा योजना अब वैसी लगती है जैसी लोग सच में करते हैं",
      heroSubtitle:
        "मैंने इस ऐप को वास्तविक उपयोग के हिसाब से बनाया है: पहुँचने के बाद कहाँ रुकना है, पास में खाना कितना पड़ेगा, लोकल मूवमेंट कैसे प्लान करना है, और हर दिन क्या करना है ताकि यात्रा ज़्यादा भरी हुई न लगे।",
      quickReasons: [
        {
          title: "असली यात्रा क्रम पर आधारित",
          description:
            "यह केवल जगहों की सूची नहीं देता। यह आगमन, होटल चेक-इन, भोजन, पास की जगहें और अगले दिन की योजना एक क्रम में सोचता है।",
        },
        {
          title: "बजट हमेशा सामने रखता है",
          description:
            "होटल, खाना, लोकल ट्रांसपोर्ट और एक्टिविटी का खर्च दिखाई देता रहता है, इसलिए योजना व्यावहारिक लगती है।",
        },
        {
          title: "जमीन पर भी उपयोगी",
          description:
            "रूट, लोकल ट्रांसपोर्ट, जगह खोज और सहायता टूल्स ऐसे रखे गए हैं कि आप यात्रा के दौरान भी इन्हें काम में ले सकें।",
        },
        {
          title: "भारतीय भाषाओं का समर्थन",
          description:
            "ऐप प्रमुख भारतीय भाषाओं का समर्थन करता है ताकि उपयोगकर्ता अपनी सुविधा की भाषा में इसे पढ़ सकें।",
        },
      ],
      toolsEyebrow: "ऐप के मुख्य टूल",
      toolsHeading: "जहाँ से समस्या हल करनी हो, वहीं से शुरुआत करें",
      toolsDescription:
        "कुछ लोग बजट से शुरू करते हैं, कुछ रूट से, और कुछ होटल से। मैंने टूल्स अलग रखे हैं ताकि आप वही उपयोग करें जिसकी आपको ज़रूरत है।",
      openTool: "यह टूल खोलें",
    },
    bn: {
      badge: "ব্যবহারিক ভারত ভ্রমণ পরিকল্পনার জন্য তৈরি",
      heroTitle: "ভ্রমণ পরিকল্পনা এখন অনেক বেশি বাস্তব মনে হয়",
      heroSubtitle:
        "আমি এই অ্যাপটি বাস্তব ব্যবহারের কথা ভেবে বানিয়েছি: পৌঁছে কোথায় থাকা যাবে, কাছাকাছি খাবারের খরচ কত, লোকাল চলাচল কীভাবে হবে, আর প্রতিদিন কী করলে ভ্রমণ অযথা চাপের না লাগে।",
      quickReasons: [
        {
          title: "বাস্তব ট্রিপ ফ্লো অনুযায়ী তৈরি",
          description:
            "শুধু জায়গার নাম নয়। প্ল্যানারটি আগমন, হোটেল চেক-ইন, খাবার, কাছের ঘোরা এবং পরের দিনের পরিকল্পনা একসাথে ধরে।",
        },
        {
          title: "বাজেট চোখের সামনে রাখে",
          description:
            "হোটেল, খাবার, লোকাল ট্রান্সপোর্ট ও অ্যাক্টিভিটির খরচ সামনে থাকায় পরিকল্পনাটা বাস্তবসম্মত লাগে।",
        },
        {
          title: "ভ্রমণের সময়ও কাজে লাগে",
          description:
            "রুট, লোকাল ট্রান্সপোর্ট, প্লেস সার্চ এবং সাপোর্ট টুল এমনভাবে রাখা আছে যাতে যাত্রার মধ্যেই ব্যবহার করা যায়।",
        },
        {
          title: "ভারতের ভাষার সমর্থন",
          description:
            "অ্যাপটি প্রধান ভারতীয় ভাষাগুলিকে সমর্থন করে যাতে ব্যবহারকারী নিজের স্বাচ্ছন্দ্যের ভাষায় পড়তে পারেন।",
        },
      ],
      toolsEyebrow: "অ্যাপের প্রধান টুল",
      toolsHeading: "যে জায়গা থেকে সমাধান শুরু করতে চান, সেখান থেকেই শুরু করুন",
      toolsDescription:
        "কেউ বাজেট দিয়ে শুরু করেন, কেউ রুট, কেউ আবার হোটেল পরিকল্পনা দিয়ে। তাই টুলগুলো আলাদা রাখা হয়েছে।",
      openTool: "এই টুল খুলুন",
    },
    gu: {
      badge: "વ્યવહારુ ભારત પ્રવાસ આયોજન માટે બનાવેલું",
      heroTitle: "પ્રવાસ આયોજન હવે લોકો ખરેખર જે રીતે કરે છે તેવું લાગે છે",
      heroSubtitle:
        "આ એપને મેં હકીકતના ઉપયોગ મુજબ ગોઠવી છે: પહોંચી ગયા પછી ક્યાં રહેવું, નજીકમાં ભોજનમાં કેટલો ખર્ચ થાય, સ્થાનિક મુસાફરી કેવી રીતે ગોઠવવી અને દિવસ પ્રમાણે શું કરવું.",
      quickReasons: [
        {
          title: "વાસ્તવિક પ્રવાસ પ્રવાહ પર આધારિત",
          description:
            "ફક્ત સ્થળોના નામ નથી. પ્લાનર આગમન, હોટેલ ચેક-ઇન, ભોજન, નજીકના સ્થળો અને બીજા દિવસની યોજના ક્રમે વિચારે છે.",
        },
        {
          title: "બજેટ નજર સામે રાખે છે",
          description:
            "હોટેલ, ભોજન, સ્થાનિક ટ્રાન્સપોર્ટ અને પ્રવૃત્તિઓનો ખર્ચ દેખાતો રહે છે જેથી યોજના વ્યવહારુ લાગે.",
        },
        {
          title: "જમીન પર પણ ઉપયોગી",
          description:
            "રૂટ, સ્થાનિક ટ્રાન્સપોર્ટ, સ્થળ શોધ અને સપોર્ટ ટૂલ્સ એવા રીતે રાખ્યા છે કે પ્રવાસ દરમિયાન પણ ઉપયોગી થાય.",
        },
        {
          title: "ભારતીય ભાષાઓને સપોર્ટ કરે છે",
          description:
            "એપ મુખ્ય ભારતીય ભાષાઓને સપોર્ટ કરે છે જેથી વપરાશકર્તા પોતાની અનુકૂળ ભાષામાં અનુભવ મેળવી શકે.",
        },
      ],
      toolsEyebrow: "એપના મુખ્ય ટૂલ્સ",
      toolsHeading: "પ્રશ્ન જ્યાંથી ઉકેલવો હોય ત્યાંથી શરૂઆત કરો",
      toolsDescription:
        "કેટલાક લોકો બજેટથી શરૂ કરે છે, કેટલાક રૂટથી, અને કેટલાક હોટેલથી. તેથી ટૂલ્સ અલગ રાખ્યા છે.",
      openTool: "આ ટૂલ ખોલો",
    },
    kn: {
      badge: "ಪ್ರಾಯೋಗಿಕ ಭಾರತ ಪ್ರವಾಸ ಯೋಜನೆಗಾಗಿ ರೂಪಿಸಲಾಗಿದೆ",
      heroTitle: "ಜನರು ನಿಜವಾಗಿಯೂ ಪ್ರಯಾಣ ಮಾಡುವ ರೀತಿಗೆ ಹತ್ತಿರವಾಗಿರುವ ಯೋಜನೆ",
      heroSubtitle:
        "ಈ ಆಪ್ ಅನ್ನು ನಿಜವಾದ ಬಳಕೆಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟು ರೂಪಿಸಿದ್ದೇನೆ: ತಲುಪಿದ ಬಳಿಕ ಎಲ್ಲಿಗೆ ತಂಗಬೇಕು, ಹತ್ತಿರದ ಊಟದ ವೆಚ್ಚ ಎಷ್ಟು, ಸ್ಥಳೀಯ ಪ್ರಯಾಣವನ್ನು ಹೇಗೆ ಯೋಜಿಸಬೇಕು ಮತ್ತು ಪ್ರತಿದಿನ ಏನು ಮಾಡಬೇಕು.",
      quickReasons: [
        {
          title: "ನಿಜವಾದ ಟ್ರಿಪ್ ಕ್ರಮದ ಮೇಲೆ ನಿರ್ಮಿಸಲಾಗಿದೆ",
          description:
            "ಕೆವಲ ಸ್ಥಳಗಳ ಪಟ್ಟಿಯಲ್ಲ. ಆಗಮನ, ಹೋಟೆಲ್ ಚೆಕ್-ಇನ್, ಊಟ, ಹತ್ತಿರದ ಭೇಟಿ ಮತ್ತು ಮುಂದಿನ ದಿನದ ಯೋಜನೆಯನ್ನು ಕ್ರಮವಾಗಿ ಯೋಚಿಸುತ್ತದೆ.",
        },
        {
          title: "ಬಜೆಟ್ ಕಣ್ಣಿಗೆ ಕಾಣುವಂತೆ ಇಡುತ್ತದೆ",
          description:
            "ಹೋಟೆಲ್, ಊಟ, ಸ್ಥಳೀಯ ಸಾರಿಗೆ ಮತ್ತು ಚಟುವಟಿಕೆ ವೆಚ್ಚಗಳು ಗೋಚರಿಸುತ್ತವೆ, ಆದ್ದರಿಂದ ಯೋಜನೆ ಪ್ರಾಯೋಗಿಕವಾಗಿರುತ್ತದೆ.",
        },
        {
          title: "ಪ್ರಯಾಣದ ಮಧ್ಯೆಯೂ ಉಪಯುಕ್ತ",
          description:
            "ಮಾರ್ಗ, ಸ್ಥಳೀಯ ಸಾರಿಗೆ, ಸ್ಥಳ ಹುಡುಕಾಟ ಮತ್ತು ಬೆಂಬಲ ಸಾಧನಗಳನ್ನು ಪ್ರಯಾಣದ ಸಮಯದಲ್ಲಿಯೂ ಬಳಸುವಂತೆ ಇರಿಸಲಾಗಿದೆ.",
        },
        {
          title: "ಭಾರತೀಯ ಭಾಷೆಗಳಿಗೆ ಬೆಂಬಲ",
          description:
            "ಬಳಕೆದಾರರು ತಮ್ಮ ಅನುಕೂಲ ಭಾಷೆಯಲ್ಲಿ ಓದಲು ಆಪ್ ಪ್ರಮುಖ ಭಾರತೀಯ ಭಾಷೆಗಳಿಗೆ ಬೆಂಬಲ ನೀಡುತ್ತದೆ.",
        },
      ],
      toolsEyebrow: "ಆಪ್‌ನ ಮುಖ್ಯ ಸಾಧನಗಳು",
      toolsHeading: "ನೀವು ಯಾವ ಭಾಗದಿಂದ ಶುರುಮಾಡಬೇಕು ಎಂದುಕೊಳ್ಳುತ್ತೀರೋ ಅಲ್ಲಿಂದ ಆರಂಭಿಸಿ",
      toolsDescription:
        "ಕೆಲವರು ಬಜೆಟ್‌ನಿಂದ, ಕೆಲವರು ಮಾರ್ಗದಿಂದ, ಇನ್ನೂ ಕೆಲವರು ಹೋಟೆಲ್ ಯೋಜನೆಯಿಂದ ಆರಂಭಿಸುತ್ತಾರೆ. ಆದ್ದರಿಂದ ಸಾಧನಗಳನ್ನು ಬೇರ್ಪಡಿಸಿದ್ದೇನೆ.",
      openTool: "ಈ ಸಾಧನ ತೆರೆಯಿರಿ",
    },
    ml: {
      badge: "പ്രായോഗിക ഇന്ത്യാ യാത്രാ പദ്ധതിക്കായി തയ്യാറാക്കിയത്",
      heroTitle: "ആൾകൾ യഥാർത്ഥത്തിൽ നടത്തുന്ന യാത്രയ്ക്ക് അടുത്തതായൊരു പദ്ധതി",
      heroSubtitle:
        "ഈ ആപ്പ് ഞാൻ യഥാർത്ഥ യാത്രാ ഉപയോഗം കണക്കിലെടുത്താണ് രൂപപ്പെടുത്തിയത്: എത്തിയ ശേഷം എവിടെ താമസിക്കണം, അടുത്തുള്ള ഭക്ഷണച്ചെലവ് എത്ര, ലോക്കൽ യാത്ര എങ്ങനെ പ്ലാൻ ചെയ്യണം, ദിവസേന എന്ത് ചെയ്യണം എന്നിങ്ങനെ.",
      quickReasons: [
        {
          title: "യഥാർത്ഥ യാത്രാ പ്രവാഹത്തെ അടിസ്ഥാനമാക്കി",
          description:
            "സ്ഥലങ്ങളുടെ പേരുകൾ മാത്രം അല്ല. എത്തൽ, ഹോട്ടൽ ചെക്ക്-ഇൻ, ഭക്ഷണം, അടുത്തുള്ള സന്ദർശനങ്ങൾ, അടുത്ത ദിവസത്തെ പദ്ധതി എന്നിവ ക്രമത്തിൽ ചിന്തിക്കുന്നു.",
        },
        {
          title: "ബജറ്റ് എപ്പോഴും കാണാവുന്നതാക്കുന്നു",
          description:
            "ഹോട്ടൽ, ഭക്ഷണം, ലോക്കൽ ട്രാൻസ്പോർട്ട്, പ്രവർത്തനങ്ങൾ എന്നിവയുടെ ചിലവ് കാണുന്നതിനാൽ പദ്ധതി കൂടുതൽ പ്രായോഗികമാകുന്നു.",
        },
        {
          title: "യാത്രയ്ക്കിടയിലും ഉപയോഗപ്രദം",
          description:
            "റൂട്ടുകൾ, ലോക്കൽ ട്രാൻസ്പോർട്ട്, സ്ഥല തിരച്ചിൽ, സഹായ ഉപകരണങ്ങൾ എന്നിവ യാത്രയ്ക്കിടയിലും ഉപയോഗിക്കാവുന്ന വിധത്തിലാണ്.",
        },
        {
          title: "ഇന്ത്യൻ ഭാഷകൾക്ക് പിന്തുണ",
          description:
            "ഉപയോക്താക്കൾക്ക് തങ്ങൾക്ക് സൗകര്യമുള്ള ഭാഷയിൽ വായിക്കാൻ ആപ്പ് പ്രധാന ഇന്ത്യൻ ഭാഷകൾക്ക് പിന്തുണ നൽകുന്നു.",
        },
      ],
      toolsEyebrow: "ആപ്പിലെ പ്രധാന ഉപകരണങ്ങൾ",
      toolsHeading: "നിങ്ങൾക്ക് ആദ്യം പരിഹരിക്കേണ്ട ഭാഗത്ത് നിന്നു തുടങ്ങുക",
      toolsDescription:
        "ചിലർ ബജറ്റിൽ നിന്ന് തുടങ്ങും, ചിലർ റൂട്ടിൽ നിന്ന്, ചിലർ ഹോട്ടലിൽ നിന്ന്. അതിനാലാണ് ഉപകരണങ്ങൾ വേർതിരിച്ചിരിക്കുന്നത്.",
      openTool: "ഈ ഉപകരണം തുറക്കുക",
    },
    mr: {
      badge: "व्यवहार्य भारत प्रवास नियोजनासाठी तयार केलेले",
      heroTitle: "लोक प्रत्यक्षात जसा प्रवास करतात तसा जाणवणारा प्लॅन",
      heroSubtitle:
        "हे अॅप मी खऱ्या वापरासाठी तयार केले आहे: पोहोचल्यानंतर कुठे थांबायचे, जवळच्या जेवणाचा खर्च किती, स्थानिक हालचाल कशी करायची आणि दररोज काय पाहायचे.",
      quickReasons: [
        {
          title: "खऱ्या प्रवासाच्या क्रमावर आधारित",
          description:
            "फक्त ठिकाणांची नावे नाहीत. आगमन, हॉटेल चेक-इन, जेवण, जवळची ठिकाणे आणि पुढच्या दिवसाची योजना अशा क्रमाने विचार करते.",
        },
        {
          title: "बजेट स्पष्ट दिसत राहते",
          description:
            "हॉटेल, अन्न, स्थानिक प्रवास आणि अ‍ॅक्टिव्हिटीचा खर्च दिसत राहतो म्हणून योजना अधिक व्यवहार्य वाटते.",
        },
        {
          title: "प्रवासादरम्यानही उपयोगी",
          description:
            "रूट, स्थानिक प्रवास, ठिकाण शोध आणि सहाय्य साधने अशी ठेवली आहेत की ती प्रवासातही उपयोगी पडतील.",
        },
        {
          title: "भारतीय भाषांना समर्थन",
          description:
            "वापरकर्त्यांना आपल्या सोयीच्या भाषेत अनुभव मिळावा म्हणून अॅप प्रमुख भारतीय भाषांना समर्थन देते.",
        },
      ],
      toolsEyebrow: "अॅपमधील मुख्य साधने",
      toolsHeading: "जिथून प्रश्न सोडवायचा आहे तिथून सुरुवात करा",
      toolsDescription:
        "काही लोक बजेटपासून सुरुवात करतात, काही रूटपासून, तर काही हॉटेलपासून. म्हणून साधने वेगळी ठेवली आहेत.",
      openTool: "हे साधन उघडा",
    },
    pa: {
      badge: "ਵਿਵਹਾਰਿਕ ਭਾਰਤ ਯਾਤਰਾ ਯੋਜਨਾ ਲਈ ਬਣਾਇਆ ਗਿਆ",
      heroTitle: "ਯਾਤਰਾ ਯੋਜਨਾ ਹੁਣ ਉਹੋ ਜਿਹੀ ਲੱਗਦੀ ਹੈ ਜਿਵੇਂ ਲੋਕ ਸੱਚਮੁੱਚ ਕਰਦੇ ਹਨ",
      heroSubtitle:
        "ਮੈਂ ਇਹ ਐਪ ਅਸਲ ਵਰਤੋਂ ਨੂੰ ਧਿਆਨ ਵਿੱਚ ਰੱਖ ਕੇ ਬਣਾਇਆ ਹੈ: ਪਹੁੰਚਣ ਤੋਂ ਬਾਅਦ ਕਿੱਥੇ ਰਹਿਣਾ, ਨੇੜੇ ਖਾਣੇ ਦਾ ਖਰਚ ਕਿੰਨਾ, ਲੋਕਲ ਆਵਾਜਾਈ ਕਿਵੇਂ ਪਲਾਨ ਕਰਨੀ ਹੈ ਅਤੇ ਹਰ ਦਿਨ ਕੀ ਕਰਨਾ ਹੈ।",
      quickReasons: [
        {
          title: "ਅਸਲੀ ਯਾਤਰਾ ਦੇ ਪ੍ਰਵਾਹ ਦੇ ਆਧਾਰ ਤੇ",
          description:
            "ਇਹ ਕੇਵਲ ਥਾਵਾਂ ਦੇ ਨਾਮ ਨਹੀਂ ਦਿੰਦਾ। ਇਹ ਆਉਣਾ, ਹੋਟਲ ਚੈਕ-ਇਨ, ਖਾਣਾ, ਨੇੜਲੇ ਦੌਰੇ ਅਤੇ ਅਗਲੇ ਦਿਨ ਦੀ ਯੋਜਨਾ ਇਕ ਕ੍ਰਮ ਵਿੱਚ ਰੱਖਦਾ ਹੈ।",
        },
        {
          title: "ਬਜਟ ਹਮੇਸ਼ਾ ਦਿੱਖ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ",
          description:
            "ਹੋਟਲ, ਖਾਣਾ, ਲੋਕਲ ਟ੍ਰਾਂਸਪੋਰਟ ਅਤੇ ਐਕਟਿਵਿਟੀ ਦੇ ਖਰਚ ਦਿਖਾਈ ਦਿੰਦੇ ਹਨ, ਇਸ ਲਈ ਪਲਾਨ ਹੋਰ ਵਰਤੋਂਯੋਗ ਲੱਗਦਾ ਹੈ।",
        },
        {
          title: "ਜ਼ਮੀਨ ਤੇ ਵੀ ਕੰਮ ਆਉਂਦਾ ਹੈ",
          description:
            "ਰੂਟ, ਲੋਕਲ ਟ੍ਰਾਂਸਪੋਰਟ, ਥਾਂ ਖੋਜ ਅਤੇ ਸਹਾਇਤਾ ਟੂਲ ਇੰਝ ਰੱਖੇ ਗਏ ਹਨ ਕਿ ਯਾਤਰਾ ਦੌਰਾਨ ਵੀ ਵਰਤੇ ਜਾ ਸਕਣ।",
        },
        {
          title: "ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਦਾ ਸਮਰਥਨ",
          description:
            "ਐਪ ਮੁੱਖ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਦਾ ਸਮਰਥਨ ਕਰਦਾ ਹੈ ਤਾਂ ਜੋ ਵਰਤੋਂਕਾਰ ਆਪਣੀ ਆਰਾਮਦਾਇਕ ਭਾਸ਼ਾ ਵਿੱਚ ਇਸਨੂੰ ਪੜ੍ਹ ਸਕਣ।",
        },
      ],
      toolsEyebrow: "ਐਪ ਦੇ ਮੁੱਖ ਟੂਲ",
      toolsHeading: "ਜਿਥੋਂ ਹੱਲ ਚਾਹੀਦਾ ਹੈ ਓਥੋਂ ਸ਼ੁਰੂ ਕਰੋ",
      toolsDescription:
        "ਕੁਝ ਲੋਕ ਬਜਟ ਤੋਂ ਸ਼ੁਰੂ ਕਰਦੇ ਹਨ, ਕੁਝ ਰੂਟ ਤੋਂ, ਤੇ ਕੁਝ ਹੋਟਲ ਯੋਜਨਾ ਤੋਂ. ਇਸ ਲਈ ਟੂਲ ਵੱਖਰੇ ਰੱਖੇ ਹਨ।",
      openTool: "ਇਹ ਟੂਲ ਖੋਲ੍ਹੋ",
    },
    ta: {
      badge: "நடைமுறை இந்திய பயணத் திட்டத்திற்காக உருவாக்கப்பட்டது",
      heroTitle: "மக்கள் உண்மையில் பயணம் செய்வதற்கு நெருக்கமான திட்டமிடல்",
      heroSubtitle:
        "இந்த செயலியை நான் உண்மையான பயன்பாட்டை நினைத்து வடிவமைத்தேன்: சென்றதும் எங்கு தங்குவது, அருகிலுள்ள உணவுக்கான செலவு எவ்வளவு, உள்ளூர் பயணத்தை எப்படி திட்டமிடுவது, தினமும் என்ன செய்ய வேண்டும் என்பதெல்லாம் இதில் இருக்கிறது.",
      quickReasons: [
        {
          title: "உண்மையான பயண ஓட்டத்தை மையமாகக் கொண்டது",
          description:
            "இது வெறும் இடப்பெயர்கள் அல்ல. வருகை, ஹோட்டல் செக்-இன், உணவு, அருகிலுள்ள இடங்கள், அடுத்த நாள் திட்டம் ஆகியவற்றை ஒழுங்காக சிந்திக்கிறது.",
        },
        {
          title: "பட்ஜெட்டை எப்போதும் கண்முன் வைக்கிறது",
          description:
            "ஹோட்டல், உணவு, உள்ளூர் போக்குவரத்து மற்றும் செயல்பாடுகளின் செலவுகள் தெரியும்; அதனால் திட்டம் நடைமுறையாக இருக்கும்.",
        },
        {
          title: "பயணத்திலேயே பயன்படும்",
          description:
            "வழிகள், உள்ளூர் போக்குவரத்து, இடத் தேடல், உதவி கருவிகள் ஆகியவை பயணத்தின் போதும் பயன்படுத்தும்படி அமைக்கப்பட்டுள்ளன.",
        },
        {
          title: "இந்திய மொழிகளுக்கு ஆதரவு",
          description:
            "பயனர்கள் தங்களுக்கு வசதியான மொழியில் படிக்க இந்த செயலி முக்கிய இந்திய மொழிகளை ஆதரிக்கிறது.",
        },
      ],
      toolsEyebrow: "செயலியின் முக்கிய கருவிகள்",
      toolsHeading: "நீங்கள் முதலில் தீர்க்க வேண்டிய இடத்திலிருந்து தொடங்குங்கள்",
      toolsDescription:
        "சிலர் பட்ஜெட்டில் இருந்து தொடங்குகிறார்கள், சிலர் பாதையில் இருந்து, சிலர் ஹோட்டலில் இருந்து. அதனால் கருவிகளை தனித்தனியாக வைத்துள்ளேன்.",
      openTool: "இந்த கருவியை திறக்கவும்",
    },
    te: {
      badge: "ప్రయోజనకరమైన భారత ప్రయాణ ప్రణాళిక కోసం రూపొందించబడింది",
      heroTitle: "ప్రజలు నిజంగా చేసే ప్రయాణానికి దగ్గరగా ఉండే ప్రణాళిక",
      heroSubtitle:
        "ఈ యాప్‌ను నేను నిజమైన ప్రయాణ అవసరాలను దృష్టిలో పెట్టుకుని రూపొందించాను: చేరుకున్నాక ఎక్కడ ఉండాలి, దగ్గర్లో భోజన ఖర్చు ఎంత, లోకల్ ప్రయాణాన్ని ఎలా ప్లాన్ చేయాలి, ప్రతి రోజు ఏమి చేయాలి అన్నది.",
      quickReasons: [
        {
          title: "నిజమైన ట్రిప్ ఫ్లో ఆధారంగా",
          description:
            "ఇది కేవలం ప్రదేశాల జాబితా కాదు. చేరిక, హోటల్ చెక్-ఇన్, భోజనం, దగ్గర్లో సందర్శనలు, తదుపరి రోజు ప్రణాళిక అన్నీ క్రమంగా ఆలోచిస్తుంది.",
        },
        {
          title: "బడ్జెట్ స్పష్టంగా కనిపిస్తుంది",
          description:
            "హోటల్, భోజనం, లోకల్ రవాణా, కార్యకలాపాల ఖర్చులు కనిపిస్తాయి కాబట్టి ప్రణాళిక మరింత ప్రయోజనకరంగా అనిపిస్తుంది.",
        },
        {
          title: "ప్రయాణంలో కూడా ఉపయోగకరం",
          description:
            "రూట్లు, లోకల్ ట్రాన్స్పోర్ట్, ప్లేస్ సెర్చ్, సపోర్ట్ టూల్స్ ప్రయాణం సమయంలో కూడా ఉపయోగపడేలా ఉంచాం.",
        },
        {
          title: "భారతీయ భాషలకు మద్దతు",
          description:
            "వాడుకదారులు తమకు అనుకూలమైన భాషలో చదవడానికి యాప్ ప్రధాన భారతీయ భాషలకు మద్దతు ఇస్తుంది.",
        },
      ],
      toolsEyebrow: "యాప్‌లోని ప్రధాన సాధనాలు",
      toolsHeading: "మీరు మొదట పరిష్కరించాలనుకునే భాగం నుంచే ప్రారంభించండి",
      toolsDescription:
        "కొంతమంది బడ్జెట్‌తో మొదలుపెడతారు, కొంతమంది రూట్‌తో, మరికొందరు హోటల్ ప్లానింగ్‌తో. అందుకే సాధనాలను వేరు వేరు ఉంచాం.",
      openTool: "ఈ సాధనాన్ని తెరవండి",
    },
  } as const;

  const copy = homepageCopy[language] ?? homepageCopy.en;

  const features = [
    {
      key: "aiTripPlanner",
      href: "/trip-planner",
      icon: Plane,
      title: t("features.aiTripPlanner.title"),
      description: t("features.aiTripPlanner.description"),
    },
    {
      key: "explore",
      href: "/explore",
      icon: Search,
      title: t("features.explore.title"),
      description: t("features.explore.description"),
    },
    {
      key: "localTransport",
      href: "/local-transport",
      icon: Car,
      title: t("features.localTransport.title"),
      description: t("features.localTransport.description"),
    },
    {
      key: "accommodations",
      href: "/accommodations",
      icon: Hotel,
      title: t("features.accommodations.title"),
      description: t("features.accommodations.description"),
    },
    {
      key: "routePlanner",
      href: "/route-planner",
      icon: Map,
      title: t("features.routePlanner.title"),
      description: t("features.routePlanner.description"),
    },
  ];

  const quickReasons = [
    {
      icon: NotebookPen,
      title: copy.quickReasons[0].title,
      description: copy.quickReasons[0].description,
    },
    {
      icon: BadgeIndianRupee,
      title: copy.quickReasons[1].title,
      description: copy.quickReasons[1].description,
    },
    {
      icon: RouteIcon,
      title: copy.quickReasons[2].title,
      description: copy.quickReasons[2].description,
    },
    {
      icon: Languages,
      title: copy.quickReasons[3].title,
      description: copy.quickReasons[3].description,
    },
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in-50">
      <Card className="overflow-hidden border border-sky-200 bg-white shadow-xl dark:border-orange-400/20 dark:bg-[#120d08]">
        <div className="relative h-[500px] w-full">
          <img
            src="https://picsum.photos/seed/42/1200/800"
            alt="A vibrant depiction of a travel destination in India"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(7,10,18,0.72)_12%,rgba(7,10,18,0.28)_45%,rgba(7,10,18,0.55)_100%)]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-6">
            <div className="mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.22em] text-white/85 backdrop-blur-sm">
              {copy.badge}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-headline mb-4 drop-shadow-lg max-w-5xl">
              {copy.heroTitle}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl drop-shadow-md text-white/92 leading-relaxed">
              {copy.heroSubtitle}
            </p>
            <Button asChild size="lg" className={heroButtonClass}>
              <Link to="/trip-planner">
                {t("startPlanning")} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {quickReasons.map((item) => (
          <Card
            key={item.title}
            className="border border-emerald-200 bg-[#fffaf1] shadow-sm dark:border-orange-400/20 dark:bg-[#18120c]"
          >
            <CardHeader>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 dark:border-orange-400/30 dark:bg-[#23180f]">
                <item.icon className="h-6 w-6 text-emerald-700 dark:text-orange-200" />
              </div>
              <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div>
        <div className="mx-auto mb-8 max-w-3xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.28em] text-emerald-700 dark:text-orange-200">
            {copy.toolsEyebrow}
          </p>
          <h2 className="text-3xl font-bold font-headline">
            {copy.toolsHeading}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {copy.toolsDescription}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.key}
              className="flex flex-col overflow-hidden border border-sky-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-orange-400/15 dark:bg-[#120d08]"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={featureIconClass}>
                     <feature.icon className={featureIconColorClass} />
                  </div>
                  <CardTitle className="font-headline text-xl">
                    {feature.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm leading-7 text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className={featureButtonClass}>
                  <Link to={feature.href}>
                    {copy.openTool} <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

from datetime import datetime

TRANSLATIONS = {
 "en": {"safe":"Are you safe? Please confirm.", "alert":"Safety alert", "armed":"Guardian armed"},
 "hi": {"safe":"क्या आप सुरक्षित हैं? कृपया पुष्टि करें।", "alert":"सुरक्षा चेतावनी", "armed":"गार्जियन सक्रिय है"},
 "ta": {"safe":"நீங்கள் பாதுகாப்பாக இருக்கிறீர்களா? உறுதிப்படுத்தவும்.", "alert":"பாதுகாப்பு எச்சரிக்கை", "armed":"கார்டியன் செயல்படுத்தப்பட்டது"},
 "te": {"safe":"మీరు సురక్షితంగా ఉన్నారా? దయచేసి నిర్ధారించండి.", "alert":"భద్రతా హెచ్చరిక", "armed":"గార్డియన్ సక్రియం"},
 "bn": {"safe":"আপনি কি নিরাপদে আছেন? নিশ্চিত করুন।", "alert":"নিরাপত্তা সতর্কতা", "armed":"গার্ডিয়ান চালু"},
 "mr": {"safe":"तुम्ही सुरक्षित आहात का? कृपया खात्री करा.", "alert":"सुरक्षा सूचना", "armed":"गार्डियन सक्रिय"},
 "kn": {"safe":"ನೀವು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಾ? ದೃಢೀಕರಿಸಿ.", "alert":"ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆ", "armed":"ಗಾರ್ಡಿಯನ್ ಸಕ್ರಿಯ"},
 "gu": {"safe":"તમે સુરક્ષિત છો? કૃપા કરીને પુષ્ટિ કરો.", "alert":"સલામતી ચેતવણી", "armed":"ગાર્ડિયન સક્રિય"},
 "ml": {"safe":"നിങ്ങൾ സുരക്ഷിതരാണോ? സ്ഥിരീകരിക്കുക.", "alert":"സുരക്ഷാ മുന്നറിയിപ്പ്", "armed":"ഗാർഡിയൻ സജീവം"},
 "pa": {"safe":"ਕੀ ਤੁਸੀਂ ਸੁਰੱਖਿਅਤ ਹੋ? ਕਿਰਪਾ ਕਰਕੇ ਪੁਸ਼ਟੀ ਕਰੋ।", "alert":"ਸੁਰੱਖਿਆ ਚੇਤਾਵਨੀ", "armed":"ਗਾਰਡੀਅਨ ਸਰਗਰਮ"},
}

def safe_route(origin, destination):
    return {"origin": origin, "destination": destination, "safety_index": 86,
      "distance": "4.8 km", "duration": "17 min", "reasons":["Well-lit main roads", "3 verified safe havens", "High commercial activity"],
      "steps":["Head north on MG Road — well-lit corridor", "Turn right at Metro Station — safe haven nearby", "Continue past 24/7 pharmacy", "Arrive at your destination"]}

def dispatch_message(name, tier):
    urgency = "HIGH PRIORITY" if tier == 2 else "Safety"
    return f"{urgency} AI Safety Net alert for Ananya. Her route has stopped unexpectedly near MG Road. Last known location: https://maps.google.com/?q=12.9716,77.5946"

def event(kind, detail=""):
    return {"kind":kind,"detail":detail,"at":datetime.now().isoformat(timespec="seconds")}

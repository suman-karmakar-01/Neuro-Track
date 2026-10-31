/**
 * Neuro Track - Internationalization (i18n) Engine
 * Bilingual support: English (en) and Hindi (hi)
 * Brand Name "Neuro Track" remains untranslated in both languages.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'neurotrack_lang';

  // 20 Standard PTSD / Emotional Well-Being Screening Questions in English and Hindi
  const QUESTIONS_I18N = [
    {
      id: 1,
      text_en: "During the past two weeks, how often have you felt nervous, anxious, or on edge?",
      text_hi: "पिछले दो सप्ताह के दौरान, आप कितनी बार घबराहट, चिंता या तनाव महसूस कर चुके हैं?",
      subtitle_en: "Select the option that best reflects your feelings.",
      subtitle_hi: "उस विकल्प का चयन करें जो आपकी भावनाओं को सबसे अच्छी तरह दर्शाता है।",
      options: [
        { text_en: "Not at all", text_hi: "बिल्कुल नहीं", score: 0 },
        { text_en: "Several days", text_hi: "कई दिन", score: 1 },
        { text_en: "More than half the days", text_hi: "आधे से अधिक दिन", score: 2 },
        { text_en: "Nearly every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 2,
      text_en: "How often have you experienced unwanted or distressing memories of a difficult or traumatic event?",
      text_hi: "किसी कठिन या दर्दनाक घटना की अवांछित या परेशान करने वाली यादें आपको कितनी बार आई हैं?",
      subtitle_en: "Unwanted recurring thoughts or vivid memories.",
      subtitle_hi: "अवांछित आवर्ती विचार या जीवंत यादें।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 3,
      text_en: "How often have you had upsetting dreams or nightmares related to a difficult experience?",
      text_hi: "किसी दर्दनाक अनुभव से जुड़े परेशान करने वाले सपने या बुरे सपने आपको कितनी बार आए हैं?",
      subtitle_en: "Distressing dreams disturbing your sleep.",
      subtitle_hi: "आपकी नींद को बाधित करने वाले परेशान करने वाले सपने।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 4,
      text_en: "How often have you tried to avoid thoughts, feelings, people, places, or situations that remind you of a difficult experience?",
      text_hi: "आपने किसी दर्दनाक अनुभव की याद दिलाने वाले विचारों, भावनाओं, लोगों, स्थानों या स्थितियों से बचने की कितनी बार कोशिश की है?",
      subtitle_en: "Active avoidance of reminders.",
      subtitle_hi: "याद दिलाने वाली चीजों से सक्रिय बचाव।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost always", text_hi: "लगभग हमेशा", score: 3 }
      ]
    },
    {
      id: 5,
      text_en: "How often have you felt unusually alert, watchful, or 'on guard'?",
      text_hi: "आप कितनी बार अत्यधिक सतर्क, चौकन्ने या 'खतरे की आशंका' में रहे हैं?",
      subtitle_en: "Feeling on edge even in everyday surroundings.",
      subtitle_hi: "सामान्य वातावरण में भी लगातार तनाव या खतरे की आशंका महसूस होना।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost constantly", text_hi: "लगभग लगातार", score: 3 }
      ]
    },
    {
      id: 6,
      text_en: "How easily are you startled by sudden sounds or unexpected events?",
      text_hi: "अचानक होने वाली आवाजों या अप्रत्याशित घटनाओं से आप कितनी आसानी से चौंक जाते हैं?",
      subtitle_en: "Heightened startle response or jumping at noises.",
      subtitle_hi: "अचानक आवाजों पर चौंकने की बढ़ी हुई संवेदनशीलता।",
      options: [
        { text_en: "Not at all", text_hi: "बिल्कुल नहीं", score: 0 },
        { text_en: "Slightly", text_hi: "थोड़ा सा", score: 1 },
        { text_en: "Quite easily", text_hi: "काफी आसानी से", score: 2 },
        { text_en: "Extremely easily", text_hi: "अत्यधिक आसानी से", score: 3 }
      ]
    },
    {
      id: 7,
      text_en: "How often have you had difficulty falling asleep or staying asleep?",
      text_hi: "आपको सोने में या रात में लगातार सोते रहने में कितनी बार परेशानी हुई है?",
      subtitle_en: "Restlessness, waking up in the middle of the night, or insomnia.",
      subtitle_hi: "बेचैनी, आधी रात को नींद खुलना या अनिद्रा।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every night", text_hi: "लगभग हर रात", score: 3 }
      ]
    },
    {
      id: 8,
      text_en: "How would you describe your average sleep duration during the past week?",
      text_hi: "पिछले सप्ताह के दौरान आपकी औसत नींद की अवधि कैसी रही?",
      subtitle_en: "Estimated hours of restful sleep per night.",
      subtitle_hi: "प्रति रात आरामदायक नींद के अनुमानित घंटे।",
      isSleepDuration: true,
      options: [
        { text_en: "8 hours or more", text_hi: "8 घंटे या अधिक", score: 0, minHr: 8, maxHr: 24 },
        { text_en: "6–7 hours", text_hi: "6–7 घंटे", score: 1, minHr: 6, maxHr: 7 },
        { text_en: "4–5 hours", text_hi: "4–5 घंटे", score: 2, minHr: 4, maxHr: 5 },
        { text_en: "Less than 4 hours", text_hi: "4 घंटे से कम", score: 3, minHr: 0, maxHr: 3 }
      ]
    },
    {
      id: 9,
      text_en: "How often have you experienced difficulty concentrating on studies, work, or daily activities?",
      text_hi: "पढ़ाई, काम या दैनिक गतिविधियों पर ध्यान केंद्रित करने में आपको कितनी बार कठिनाई हुई है?",
      subtitle_en: "Trouble focusing or remembering routine tasks.",
      subtitle_hi: "ध्यान केंद्रित करने या नियमित कार्यों को याद रखने में परेशानी।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 10,
      text_en: "How often have you felt emotionally numb, detached, or disconnected from people around you?",
      text_hi: "आप अपने आस-पास के लोगों से भावनात्मक रूप से अलग या कटा हुआ कितनी बार महसूस करते हैं?",
      subtitle_en: "Feeling distant from family, friends, or loved ones.",
      subtitle_hi: "परिवार, दोस्तों या प्रियजनों से भावनात्मक दूरी महसूस होना।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost always", text_hi: "लगभग हमेशा", score: 3 }
      ]
    },
    {
      id: 11,
      text_en: "How often have you experienced sudden feelings of fear, panic, or intense discomfort?",
      text_hi: "आपको अचानक भय, घबराहट या तीव्र बेचैनी का अनुभव कितनी बार हुआ है?",
      subtitle_en: "Spontaneous rushes of anxiety or dread.",
      subtitle_hi: "चिंता या आशंका की अचानक तीव्र लहरें।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 12,
      text_en: "How often have you felt that you are unable to relax even when you are in a safe environment?",
      text_hi: "सुरक्षित माहौल में होने पर भी आप तनावमुक्त या शांत महसूस नहीं कर पाते, ऐसा कितनी बार हुआ?",
      subtitle_en: "Persistent tension even while resting at home.",
      subtitle_hi: "घर पर आराम करते समय भी लगातार आंतरिक तनाव महसूस होना।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost always", text_hi: "लगभग हमेशा", score: 3 }
      ]
    },
    {
      id: 13,
      text_en: "How often have you experienced sudden physical reactions when something reminded you of a stressful or difficult experience?",
      text_hi: "किसी तनावपूर्ण घटना की याद आने पर आपको अचानक शारीरिक प्रतिक्रियाएं (जैसे दिल की धड़कन तेज होना, पसीना आना, कांपना) कितनी बार हुई हैं?",
      subtitle_en: "Examples include racing heart rate, sweating, shaking, or feeling tight in the chest.",
      subtitle_hi: "उदाहरण: दिल की धड़कन तेज होना, पसीना आना, कांपना या सीने में भारीपन।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every time", text_hi: "लगभग हर बार", score: 3 }
      ]
    },
    {
      id: 14,
      text_en: "How often have you experienced changes in your mood, such as irritability, sadness, or frustration?",
      text_hi: "आपके मूड में बदलाव, जैसे चिड़चिड़ापन, उदासी या निराशा का अनुभव कितनी बार हुआ है?",
      subtitle_en: "Rapid mood shifts or unexpected anger.",
      subtitle_hi: "तेजी से मूड बदलना या अकारण गुस्सा आना।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost every day", text_hi: "लगभग हर दिन", score: 3 }
      ]
    },
    {
      id: 15,
      text_en: "How much have these experiences affected your studies, work, relationships, or normal daily activities?",
      text_hi: "इन अनुभवों ने आपकी पढ़ाई, काम, रिश्तों या सामान्य दैनिक जीवन को कितना प्रभावित किया है?",
      subtitle_en: "Degree of interference with regular functioning.",
      subtitle_hi: "नियमित दिनचर्या और काम में रुकावट या प्रभाव का स्तर।",
      options: [
        { text_en: "Not at all", text_hi: "बिल्कुल नहीं", score: 0 },
        { text_en: "A little", text_hi: "थोड़ा सा", score: 1 },
        { text_en: "Quite a lot", text_hi: "काफी हद तक", score: 2 },
        { text_en: "Severely", text_hi: "गंभीर रूप से", score: 3 }
      ]
    },
    {
      id: 16,
      text_en: "How often have you felt that something bad might happen even when there is no immediate danger?",
      text_hi: "कोई तात्कालिक खतरा न होने पर भी कुछ बुरा होने की आशंका आपको कितनी बार महसूस हुई है?",
      subtitle_en: "Apprehension or persistent feelings of impending doom.",
      subtitle_hi: "आशंका या लगातार कुछ अनिष्ट होने का आंतरिक डर।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost always", text_hi: "लगभग हमेशा", score: 3 }
      ]
    },
    {
      id: 17,
      text_en: "How often have you found yourself thinking repeatedly about a stressful or difficult experience when you did not want to?",
      text_hi: "न चाहते हुए भी किसी तनावपूर्ण अनुभव के बारे में बार-बार सोचने पर आप कितनी बार मजबूर हुए हैं?",
      subtitle_en: "Intrusive, looping thoughts that feel hard to stop.",
      subtitle_hi: "परेशान करने वाले बार-बार आने वाले विचार जिन्हें रोकना मुश्किल लगता है।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost constantly", text_hi: "लगभग लगातार", score: 3 }
      ]
    },
    {
      id: 18,
      text_en: "How often have you avoided social interaction because you did not feel comfortable or safe?",
      text_hi: "असहज या असुरक्षित महसूस होने के कारण आपने सामाजिक मेलजोल से कितनी बार दूरी बनाई है?",
      subtitle_en: "Cancelling plans or withdrawing from gatherings.",
      subtitle_hi: "योजनाएं रद्द करना या लोगों से दूरी बनाना।",
      options: [
        { text_en: "Never", text_hi: "कभी नहीं", score: 0 },
        { text_en: "Occasionally", text_hi: "कभी-कभार", score: 1 },
        { text_en: "Frequently", text_hi: "अक्सर", score: 2 },
        { text_en: "Almost always", text_hi: "लगभग हमेशा", score: 3 }
      ]
    },
    {
      id: 19,
      text_en: "How would you rate your overall emotional well-being during the past two weeks?",
      text_hi: "पिछले दो सप्ताह में आप अपने समग्र भावनात्मक स्वास्थ्य को कैसा आंकेंगे?",
      subtitle_en: "Your general personal assessment of your mental state.",
      subtitle_hi: "आपकी मानसिक स्थिति का सामान्य व्यक्तिगत मूल्यांकन।",
      options: [
        { text_en: "Very good", text_hi: "बहुत अच्छा", score: 0 },
        { text_en: "Good", text_hi: "अच्छा", score: 1 },
        { text_en: "Poor", text_hi: "खराब", score: 2 },
        { text_en: "Very poor", text_hi: "बहुत खराब", score: 3 }
      ]
    },
    {
      id: 20,
      text_en: "How difficult have these symptoms or feelings made your everyday life?",
      text_hi: "इन लक्षणों या भावनाओं ने आपके रोजमर्रा के जीवन को कितना कठिन बना दिया है?",
      subtitle_en: "Overall perceived burden on daily life.",
      subtitle_hi: "दैनिक जीवन पर महसूस किया गया समग्र बोझ।",
      options: [
        { text_en: "Not difficult", text_hi: "कठिन नहीं", score: 0 },
        { text_en: "Slightly difficult", text_hi: "थोड़ा कठिन", score: 1 },
        { text_en: "Quite difficult", text_hi: "काफी कठिन", score: 2 },
        { text_en: "Extremely difficult", text_hi: "अत्यंत कठिन", score: 3 }
      ]
    }
  ];

  // Comprehensive Key-Value Dictionary for App UI
  const DICTIONARY = {
    en: {
      // Nav
      nav_home: "Home",
      nav_session: "Session",
      nav_data_live: "Data / Live",
      nav_history: "History",
      nav_statistics: "Statistics",
      nav_profile: "Profile",
      nav_about: "About",
      nav_logout: "Logout",
      nav_login: "Login",
      nav_register: "Register",
      brand_tagline: "SUPPORTING MINDS, BRIGHTER TOMORROWS",
      brand_sub: "Mind Today. Brighter Tomorrows.",

      // Metrics & Live Telemetry
      ppg_pulse_hr: "Heart Rate (PPG)",
      ecg_rhythm_hr: "Heart Rate (PPG)",
      heart_rate: "Heart Rate",
      spo2_metric: "SpO2",
      blood_oxygen: "Blood Oxygen",
      body_temp: "Body Temperature",
      sleep_monitoring: "Sleep Monitoring",
      not_applicable: "Not Applicable",
      not_connected: "Not Connected",
      device_connected: "Device Connected",
      device_disconnected: "Device Disconnected",
      check_status: "Check Status",
      checking: "Checking...",
      normal_sinus: "Normal Sinus",
      bradycardia: "Bradycardia",
      tachycardia: "Tachycardia",
      standby: "Standby",
      wrist_actigraphy: "Wrist Actigraphy",
      thermal_probe: "DS18B20 Digital Thermal Probe",
      imu_sensor: "MPU6050 6-Axis Motion Sensor",
      optical_sensor: "MAX30102 Optical Biometric Sensor",

      // Dashboard
      hello_user: "Hello,",
      take_care_quote: "Take care of your mind today.",
      last_risk_level: "Last Risk Level",
      telemetry_status: "Telemetry Status",
      assessment_activity: "Assessment Activity",
      take_assessment: "Take Assessment",
      take_assessment_desc: "Standard 20-question PTSD & emotional well-being questionnaire.",
      live_health_stream: "Live Health Stream",
      live_health_stream_desc: "Real-time biometric telemetry: PPG heart rate, SpO2, and skin temperature.",
      trend_analytics: "Trend Analytics",
      trend_analytics_desc: "Historical charts for assessment scores, sleep, and physical vitals.",
      manage_profile: "Manage Profile",
      manage_profile_desc: "Update personal records, emergency contacts, and medical history.",
      recent_activity: "Recent Activity",
      no_recent_activity: "No recent assessments found. Start your first session!",

      // Assessment Flow
      assessment_title: "PTSD & Emotional Well-Being Screening",
      assessment_intro_subtitle: "A confidential, clinically designed 20-question self-assessment to help evaluate your emotional well-being and stress levels.",
      duration_badge: "5–7 Minutes",
      questions_badge: "20 Questions",
      privacy_badge: "100% Confidential",
      start_assessment_btn: "Start Assessment",
      previous_btn: "Previous",
      next_btn: "Next",
      review_answers_btn: "Review Answers",
      submit_assessment_btn: "Submit Assessment",
      retake_assessment_btn: "Retake Assessment",
      download_report_btn: "Download Clinical Report",
      back_to_dashboard_btn: "Back to Dashboard",
      question_progress: "Question {current} of {total}",
      select_option_notice: "Please select an answer before continuing.",
      review_heading: "Review Your Assessment",
      review_subheading: "Please review your responses to all 20 screening questions before submitting.",
      all_answered_ready: "All 20 questions answered and ready for evaluation.",
      some_unanswered: "You have answered {answered} of 20 questions. Please complete all questions before submitting.",
      evaluating_answers: "Evaluating Answers...",
      edit_answer: "Edit",

      // Results
      assessment_complete_title: "Assessment Complete",
      assessment_complete_sub: "Your responses have been processed alongside physical biometric data.",
      overall_risk_score: "Overall Risk Score",
      raw_score: "Raw Score:",
      what_this_means: "What this means",
      supportive_recommendations: "Supportive Recommendations",
      risk_low: "Low Risk",
      risk_moderate: "Moderate Risk",
      risk_high: "High Risk",
      risk_low_desc: "Your responses suggest minimal or mild indications of stress and emotional distress at this time. Keep maintaining your healthy habits and continue to monitor your well-being.",
      risk_mod_desc: "Your responses suggest moderate symptoms of emotional stress or anxiety. Taking proactive relaxation steps and speaking to a trusted counselor is recommended.",
      risk_high_desc: "Your responses indicate heightened levels of distress or post-traumatic stress symptoms. We strongly encourage scheduling a session with a campus mental health professional.",
      average_sleep: "Average Sleep (Q8)",
      from_questionnaire: "From Questionnaire",
      hardware_not_connected: "Hardware Not Connected",

      // History & Statistics
      history_title: "Assessment History",
      history_subtitle: "Track your emotional well-being trends and past screening scores.",
      statistics_title: "Telemetry & Health Statistics",
      statistics_subtitle: "Comprehensive physical and psychological analytics aggregated over time.",
      risk_level_trend: "Risk Level Trend",
      sleep_duration_trend: "Sleep Duration Trend",
      average_body_temp: "Average Body Temperature",
      risk_distribution: "Risk Level Distribution",
      heart_rate_trend: "Heart Rate Trend",
      spo2_trend: "SpO2 Trend",

      // Buttons / Common
      btn_save: "Save Changes",
      btn_cancel: "Cancel",
      btn_filter: "Filter",
      btn_export: "Export",
      status_active: "Active",
      status_inactive: "Inactive",
      lang_switch_tooltip: "Switch to Hindi / हिन्दी में बदलें"
    },
    hi: {
      // Nav
      nav_home: "होम",
      nav_session: "सत्र",
      nav_data_live: "लाइव डेटा",
      nav_history: "इतिहास",
      nav_statistics: "सांख्यिकी",
      nav_profile: "प्रोफाइल",
      nav_about: "हमारे बारे में",
      nav_logout: "लॉगआउट",
      nav_login: "लॉगिन",
      nav_register: "रजिस्टर",
      brand_tagline: "मानसिक संबल, उज्ज्वल कल",
      brand_sub: "माइंड टुडे। ब्राइटर टुमॉरोज।",

      // Metrics & Live Telemetry
      ppg_pulse_hr: "हृदय गति (PPG)",
      ecg_rhythm_hr: "हृदय गति (PPG)",
      heart_rate: "हृदय गति",
      spo2_metric: "रक्त ऑक्सीजन (SpO2)",
      blood_oxygen: "रक्त ऑक्सीजन",
      body_temp: "शरीर का तापमान",
      sleep_monitoring: "नींद की निगरानी",
      not_applicable: "लागू नहीं",
      not_connected: "कनेक्टेड नहीं",
      device_connected: "डिवाइस कनेक्टेड",
      device_disconnected: "डिवाइस डिस्कनेक्टेड",
      check_status: "स्थिति जांचें",
      checking: "जांच जारी है...",
      normal_sinus: "सामान्य साइनस",
      bradycardia: "धीमी धड़कन (Bradycardia)",
      tachycardia: "तेज़ धड़कन (Tachycardia)",
      standby: "स्टैंडबाय",
      wrist_actigraphy: "कलाई गतिशीलता (एक्टीग्राफी)",
      thermal_probe: "DS18B20 डिजिटल थर्मल सेंसर",
      imu_sensor: "MPU6050 6-अक्षीय गति संवेदक",
      optical_sensor: "MAX30102 ऑप्टिकल बायोमेट्रिक सेंसर",

      // Dashboard
      hello_user: "नमस्ते,",
      take_care_quote: "आज अपने मानसिक स्वास्थ्य का ध्यान रखें।",
      last_risk_level: "पिछला जोखिम स्तर",
      telemetry_status: "टेलीमेट्री स्थिति",
      assessment_activity: "मूल्यांकन गतिविधि",
      take_assessment: "मूल्यांकन शुरू करें",
      take_assessment_desc: "20-प्रश्नों वाली मानक PTSD एवं भावनात्मक स्वास्थ्य प्रश्नावली।",
      live_health_stream: "लाइव स्वास्थ्य स्ट्रीम",
      live_health_stream_desc: "रीयल-टाइम बायोमेट्रिक डेटा: PPG हृदय गति, SpO2, और त्वचा का तापमान।",
      trend_analytics: "ट्रेंड विश्लेषण",
      trend_analytics_desc: "मूल्यांकन स्कोर, नींद और शारीरिक स्वास्थ्य का ऐतिहासिक रिकॉर्ड।",
      manage_profile: "प्रोफाइल प्रबंधन",
      manage_profile_desc: "व्यक्तिगत रिकॉर्ड, आपातकालीन संपर्क और स्वास्थ्य इतिहास अपडेट करें।",
      recent_activity: "हाल की गतिविधि",
      no_recent_activity: "कोई हालिया मूल्यांकन नहीं मिला। अपना पहला सत्र शुरू करें!",

      // Assessment Flow
      assessment_title: "PTSD एवं भावनात्मक स्वास्थ्य मूल्यांकन",
      assessment_intro_subtitle: "एक गोपनीय, चिकित्सकीय रूप से प्रमाणित 20-प्रश्नों वाला स्व-मूल्यांकन जो आपके तनाव एवं भावनात्मक स्वास्थ्य को समझने में मदद करता है।",
      duration_badge: "5–7 मिनट",
      questions_badge: "20 प्रश्न",
      privacy_badge: "100% गोपनीय",
      start_assessment_btn: "मूल्यांकन शुरू करें",
      previous_btn: "पिछला",
      next_btn: "अगला",
      review_answers_btn: "उत्तरों की समीक्षा करें",
      submit_assessment_btn: "मूल्यांकन जमा करें",
      retake_assessment_btn: "पुनः मूल्यांकन करें",
      download_report_btn: "क्लिनिकल रिपोर्ट डाउनलोड करें",
      back_to_dashboard_btn: "डैशबोर्ड पर वापस जाएं",
      question_progress: "प्रश्न {current} / {total}",
      select_option_notice: "कृपया आगे बढ़ने से पहले एक विकल्प चुनें।",
      review_heading: "अपने उत्तरों की समीक्षा करें",
      review_subheading: "अंतिम रूप से जमा करने से पहले कृपया अपने सभी 20 प्रश्नों के उत्तरों की पुष्टि करें।",
      all_answered_ready: "✓ सभी 20 प्रश्नों के उत्तर पूरे हो गए हैं। मूल्यांकन के लिए तैयार।",
      some_unanswered: "⚠️ आपने 20 में से केवल {answered} प्रश्नों के उत्तर दिए हैं। कृपया सभी प्रश्न पूरे करें।",
      evaluating_answers: "उत्तरों का विश्लेषण किया जा रहा है...",
      edit_answer: "बदलें",

      // Results
      assessment_complete_title: "मूल्यांकन पूर्ण",
      assessment_complete_sub: "आपके उत्तरों का विश्लेषण शारीरिक बायोमेट्रिक डेटा के साथ कर लिया गया है।",
      overall_risk_score: "समग्र जोखिम स्कोर",
      raw_score: "कच्चा स्कोर:",
      what_this_means: "इसका क्या अर्थ है",
      supportive_recommendations: "सहायक सिफारिशें",
      risk_low: "निम्न जोखिम",
      risk_moderate: "मध्यम जोखिम",
      risk_high: "उच्च जोखिम",
      risk_low_desc: "आपके उत्तर इस समय तनाव और भावनात्मक परेशानी के न्यूनतम या हल्के स्तर का संकेत देते हैं। अपनी स्वस्थ आदतों को बनाए रखें और अपने स्वास्थ्य की निगरानी जारी रखें।",
      risk_mod_desc: "आपके उत्तर भावनात्मक तनाव या चिंता के मध्यम स्तर का संकेत देते हैं। तनावमुक्ति के उपाय अपनाना और किसी विश्वसनीय परामर्शदाता से बात करना अनुशंसित है।",
      risk_high_desc: "आपके उत्तर तनाव या PTSD लक्षणों के उच्च स्तर की ओर इशारा करते हैं। हम दृढ़तापूर्वक अनुशंसा करते हैं कि आप किसी प्रमाणित मानसिक स्वास्थ्य विशेषज्ञ या काउंसलर से संपर्क करें।",
      average_sleep: "औसत नींद (प्रश्न 8)",
      from_questionnaire: "प्रश्नावली के अनुसार",
      hardware_not_connected: "हार्डवेयर कनेक्टेड नहीं",

      // History & Statistics
      history_title: "मूल्यांकन इतिहास",
      history_subtitle: "अपने भावनात्मक स्वास्थ्य के बदलावों और पिछले स्कोर की जांच करें।",
      statistics_title: "टेलीमेट्री एवं स्वास्थ्य सांख्यिकी",
      statistics_subtitle: "शारीरिक और मानसिक स्वास्थ्य का समय के साथ संकलित विस्तृत विश्लेषण।",
      risk_level_trend: "जोखिम स्तर ट्रेंड",
      sleep_duration_trend: "नींद की अवधि ट्रेंड",
      average_body_temp: "औसत शरीर का तापमान",
      risk_distribution: "जोखिम स्तर वितरण",
      heart_rate_trend: "हृदय गति ट्रेंड",
      spo2_trend: "SpO2 ट्रेंड",

      // Buttons / Common
      btn_save: "परिवर्तन सहेजें",
      btn_cancel: "रद्द करें",
      btn_filter: "फ़िल्टर",
      btn_export: "एक्सपोर्ट",
      status_active: "सक्रिय",
      status_inactive: "निष्क्रिय",
      lang_switch_tooltip: "Switch to English / अंग्रेज़ी में बदलें"
    }
  };

  // Common UI phrase translation mapping for direct text node matching
  const PHRASE_PAIRS = [
    ["SUPPORTING MINDS, BRIGHTER TOMORROWS", "मानसिक संबल, उज्ज्वल कल"],
    ["SUPPORTING MINDS", "मानसिक संबल"],
    ["BRIGHTER TOMORROWS", "उज्ज्वल कल"],
    ["Mental Health Matters", "मानसिक स्वास्थ्य महत्वपूर्ण है"],
    ["Early Awareness. Stronger Tomorrows.", "प्रारंभिक जागरूकता। मजबूत कल।"],
    ["Take Assessment", "मूल्यांकन शुरू करें"],
    ["Live Health Stream", "लाइव स्वास्थ्य स्ट्रीम"],
    ["Trend Analytics", "ट्रेंड विश्लेषण"],
    ["Manage Profile", "प्रोफाइल प्रबंधन"],
    ["Last Risk Level", "पिछला जोखिम स्तर"],
    ["Telemetry Status", "टेलीमेट्री स्थिति"],
    ["Assessment Activity", "मूल्यांकन गतिविधि"],
    ["Heart Rate", "हृदय गति"],
    ["Body Temperature", "शरीर का तापमान"],
    ["Sleep Monitoring", "नींद की निगरानी"],
    ["Not Applicable", "लागू नहीं"],
    ["Not Connected", "कनेक्टेड नहीं"],
    ["Device Connected", "डिवाइस कनेक्टेड"],
    ["Device Disconnected", "डिवाइस डिस्कनेक्टेड"],
    ["Check Status", "स्थिति जांचें"],
    ["Checking...", "जांच जारी है..."],
    ["Home", "होम"],
    ["Session", "सत्र"],
    ["Data / Live", "लाइव डेटा"],
    ["History", "इतिहास"],
    ["Statistics", "सांख्यिकी"],
    ["Profile", "प्रोफाइल"],
    ["About", "हमारे बारे में"],
    ["Logout", "लॉगआउट"],
    ["Login", "लॉगिन"],
    ["Register", "रजिस्टर"],
    ["Authority", "प्राधिकारी"],
    ["Authority Portal", "प्राधिकारी पोर्टल"],
    ["What this means", "इसका क्या अर्थ है"],
    ["Supportive Recommendations", "सहायक सिफारिशें"],
    ["Overall Risk Score", "समग्र जोखिम स्कोर"],
    ["Assessment Complete", "मूल्यांकन पूर्ण"],
    ["Review Answers", "उत्तरों की समीक्षा करें"],
    ["Submit Assessment", "मूल्यांकन जमा करें"],
    ["Retake Assessment", "पुनः मूल्यांकन करें"],
    ["Download Clinical Report", "क्लिनिकल रिपोर्ट डाउनलोड करें"],
    ["Back to Dashboard", "डैशबोर्ड पर वापस जाएं"],
    ["Start Assessment", "मूल्यांकन शुरू करें"],
    ["Previous", "पिछला"],
    ["Next", "अगला"],
    ["Edit", "बदलें"],
    ["Low Risk", "निम्न जोखिम"],
    ["Moderate Risk", "मध्यम जोखिम"],
    ["High Risk", "उच्च जोखिम"],
    ["Recent Activity", "हाल की गतिविधि"],
    ["Normal Sinus", "सामान्य साइनस"],
    ["Standby", "स्टैंडबाय"],
    ["Hardware Telemetry", "हार्डवेयर टेलीमेट्री"]
  ];

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  }

  function setLang(lang) {
    if (lang !== 'en' && lang !== 'hi') lang = 'en';
    localStorage.setItem(STORAGE_KEY, lang);
    applyLanguage(lang);
    window.dispatchEvent(new CustomEvent('neurotrack_language_changed', { detail: { lang } }));
  }

  function t(key, fallback = '') {
    const lang = getLang();
    if (DICTIONARY[lang] && DICTIONARY[lang][key]) {
      return DICTIONARY[lang][key];
    }
    if (DICTIONARY['en'] && DICTIONARY['en'][key]) {
      return DICTIONARY['en'][key];
    }
    return fallback || key;
  }

  function getQuestions(lang) {
    const l = lang || getLang();
    return QUESTIONS_I18N.map(q => ({
      id: q.id,
      text: l === 'hi' ? q.text_hi : q.text_en,
      subtitle: l === 'hi' ? q.subtitle_hi : q.subtitle_en,
      isSleepDuration: Boolean(q.isSleepDuration),
      options: q.options.map(o => ({
        text: l === 'hi' ? o.text_hi : o.text_en,
        score: o.score,
        minHr: o.minHr,
        maxHr: o.maxHr
      }))
    }));
  }

  // Update Language Switcher UI button state
  function updateSwitcherUI(lang) {
    const btn = document.getElementById('langSwitchBtn');
    if (!btn) return;
    const enLabel = btn.querySelector('.lang-code-en');
    const hiLabel = btn.querySelector('.lang-code-hi');

    if (lang === 'hi') {
      if (enLabel) { enLabel.className = 'lang-code lang-code-en inactive'; }
      if (hiLabel) { hiLabel.className = 'lang-code lang-code-hi active'; }
      btn.setAttribute('title', 'Switch to English / अंग्रेज़ी में बदलें');
      btn.setAttribute('aria-label', 'Switch to English');
    } else {
      if (enLabel) { enLabel.className = 'lang-code lang-code-en active'; }
      if (hiLabel) { hiLabel.className = 'lang-code lang-code-hi inactive'; }
      btn.setAttribute('title', 'Switch to Hindi / हिन्दी में बदलें');
      btn.setAttribute('aria-label', 'Switch to Hindi');
    }
  }

  // Inject language toggle button into header
  function injectLanguageSwitcher() {
    if (document.getElementById('langSwitchBtn')) return;

    // Look for top navigation container
    const navContainer = document.querySelector('.site-header .nav-container') || document.querySelector('.site-header');
    if (!navContainer) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'lang-switcher-wrapper';
    wrapper.id = 'langSwitcherWrapper';

    const currentLang = getLang();
    const isHi = currentLang === 'hi';

    wrapper.innerHTML = `
      <button type="button" class="lang-switch-btn" id="langSwitchBtn" 
              title="${isHi ? 'Switch to English / अंग्रेज़ी में बदलें' : 'Switch to Hindi / हिन्दी में बदलें'}" 
              aria-label="Language Toggle">
        <span class="lang-icon" aria-hidden="true">🌐</span>
        <span class="lang-code lang-code-en ${isHi ? 'inactive' : 'active'}">EN</span>
        <span class="lang-divider">|</span>
        <span class="lang-code lang-code-hi ${isHi ? 'active' : 'inactive'}">हिन्दी</span>
      </button>
    `;

    // Position nicely: before user profile badge or appended at the right
    const userBadge = navContainer.querySelector('.user-profile-badge') || navContainer.querySelector('.authority-header-right');
    if (userBadge) {
      navContainer.insertBefore(wrapper, userBadge);
    } else {
      navContainer.appendChild(wrapper);
    }

    // Bind click
    const btn = wrapper.querySelector('#langSwitchBtn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const nextLang = getLang() === 'en' ? 'hi' : 'en';
        setLang(nextLang);
      });
    }
  }

  // Recursive text node replacement engine that protects "Neuro Track"
  function translateTextNodes(node, lang) {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      let text = node.nodeValue;
      if (!text || text.trim().length === 0) return;

      // Do NOT replace the brand name
      if (text.trim() === 'Neuro Track') return;

      PHRASE_PAIRS.forEach(([enPhrase, hiPhrase]) => {
        if (lang === 'hi') {
          // Replace English with Hindi if whole phrase or prominent segment matches
          if (text.includes(enPhrase) && !text.includes('Neuro Track ' + enPhrase)) {
            text = text.split(enPhrase).join(hiPhrase);
          }
        } else {
          // Replace Hindi with English
          if (text.includes(hiPhrase)) {
            text = text.split(hiPhrase).join(enPhrase);
          }
        }
      });
      node.nodeValue = text;
      return;
    }

    // Skip scripts, styles, inputs, textareas, and pre tags
    const tag = node.tagName ? node.tagName.toLowerCase() : '';
    if (['script', 'style', 'input', 'textarea', 'pre', 'code', 'svg'].includes(tag)) {
      return;
    }

    // If element has a specific i18n attribute, handle it
    if (node.getAttribute) {
      const i18nKey = node.getAttribute('data-i18n');
      if (i18nKey && DICTIONARY[lang] && DICTIONARY[lang][i18nKey]) {
        node.textContent = DICTIONARY[lang][i18nKey];
        return;
      }
      const i18nPlaceholder = node.getAttribute('data-i18n-placeholder');
      if (i18nPlaceholder && DICTIONARY[lang] && DICTIONARY[lang][i18nPlaceholder]) {
        node.setAttribute('placeholder', DICTIONARY[lang][i18nPlaceholder]);
      }
      const i18nTitle = node.getAttribute('data-i18n-title');
      if (i18nTitle && DICTIONARY[lang] && DICTIONARY[lang][i18nTitle]) {
        node.setAttribute('title', DICTIONARY[lang][i18nTitle]);
      }
    }

    // Traverse children
    Array.from(node.childNodes).forEach(child => translateTextNodes(child, lang));
  }

  // Apply language across the DOM
  function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);

    // 1. Update elements with explicit data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (DICTIONARY[lang] && DICTIONARY[lang][key]) {
        el.textContent = DICTIONARY[lang][key];
      }
    });

    // 2. Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (DICTIONARY[lang] && DICTIONARY[lang][key]) {
        el.setAttribute('placeholder', DICTIONARY[lang][key]);
      }
    });

    // 3. Update titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (DICTIONARY[lang] && DICTIONARY[lang][key]) {
        el.setAttribute('title', DICTIONARY[lang][key]);
      }
    });

    // 4. Translate common body nodes
    const mainContent = document.body;
    if (mainContent) {
      translateTextNodes(mainContent, lang);
    }

    // 5. Update switcher UI
    updateSwitcherUI(lang);
  }

  // Initialize on load
  function init() {
    injectLanguageSwitcher();
    const currentLang = getLang();
    applyLanguage(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export to window
  window.NeuroTrackI18n = {
    getLang,
    setLang,
    t,
    getQuestions,
    applyLanguage,
    DICTIONARY,
    QUESTIONS_I18N
  };

})();

/**
 * Salary Calculator tool module, Hindi — see `../en/salary-calculator.ts`
 * for what this covers. Written the way salaried people actually talk
 * about pay: "CTC", "PF", "TDS" and "Basic + DA" stay as they appear on
 * every offer letter and payslip, with a few Hindi words beside them
 * where a bare abbreviation would not be clear enough.
 */
export const salaryCalculator = {
  app: {
    title: "सैलरी कैलकुलेटर",
    tagline: "देखें कि आपके CTC में से हर महीने कितनी सैलरी आपके बैंक खाते में आएगी।",
    calculatorLabel: "सैलरी कैलकुलेटर",
    purpose: "CTC से इन-हैंड सैलरी",
  },

  calculator: {
    ctc: "सालाना CTC",
    ctcHint: "आपके ऑफ़र लेटर में लिखा सालाना CTC (कंपनी का कुल खर्च)।",
    ctcPlaceholder: "जैसे, 12,00,000",
    ctcInLakhs: "= {lakhs} लाख सालाना",
    clear: "हटाएँ",

    advanced: "और विकल्प",
    advancedHint: "ज़रूरी नहीं। इन्हें तभी बदलें जब आपके ऑफ़र लेटर में कुछ और लिखा हो।",
    optional: "ज़रूरी नहीं",

    variablePay: "वेरिएबल पे",
    variablePayPercent: "वेरिएबल पे (CTC का %)",
    variablePayHint: "CTC में शामिल बोनस या परफ़ॉर्मेंस पे।",
    variablePayPlaceholder: "जैसे, 10",

    pfWagesPercent: "Basic + DA (फ़िक्स्ड CTC का %)",
    pfWagesHint:
      "आपका PF, Basic + DA पर बनता है। अगर ऑफ़र लेटर में यह नहीं लिखा है, तो {percent}% मानकर चलना ठीक रहेगा।",

    pf: "प्रॉविडेंट फ़ंड (PF)",
    pfMode: "आपका PF कैसे कटता है?",
    pfFull: "पूरा PF",
    pfFullHint: "आपके Basic + DA का {rate}%",
    pfCapped: "सीमित PF",
    pfCappedHint: "Basic + DA का {rate}%, लेकिन हर महीने ज़्यादा से ज़्यादा {ceiling} पर",
    pfNone: "PF नहीं",
    pfNoneHint: "कोई PF नहीं कटता",

    gratuity: "ग्रेच्युटी",
    gratuityToggle: "मेरे CTC में ग्रेच्युटी शामिल है",
    gratuityHint: "ग्रेच्युटी नौकरी छोड़ने के समय के लिए अलग रखी जाती है, इसलिए यह हर महीने नहीं मिलती।",

    professionalTax: "प्रोफ़ेशनल टैक्स (सालाना)",
    professionalTaxHint:
      "कुछ राज्य यह लेते हैं, साल में ज़्यादा से ज़्यादा {max}। अगर आपका राज्य नहीं लेता, तो इसे 0 ही रहने दें।",
    professionalTaxPlaceholder: "जैसे, 2,400",

    taxRegime: "इनकम टैक्स",
    taxRegimeValue: "नई टैक्स व्यवस्था, टैक्स वर्ष {year}",
  },

  actions: {
    reset: "फिर से शुरू करें",
    showBreakdown: "पूरा हिसाब देखें",
    hideBreakdown: "हिसाब छिपाएँ",
    moreDetails: "और जानकारी",
    fewerDetails: "कम जानकारी",
  },

  result: {
    empty: "इन-हैंड सैलरी देखने के लिए अपना सालाना CTC भरें।",
    monthlyTakeHome: "हर महीने हाथ में आने वाली सैलरी",
    annualTakeHome: "साल भर में हाथ में आने वाली सैलरी",
    monthlyGross: "महीने की ग्रॉस सैलरी",
    annualGross: "सालाना ग्रॉस सैलरी",
    ctc: "CTC (कुल पैकेज)",
    takeHome: "इन-हैंड सैलरी",
    regularMonth: "सामान्य महीना",
    annualTotal: "पूरे साल का जोड़",
    perMonth: "हर महीने",
    perYear: "हर साल",
    afterDeductions: "PF, प्रोफ़ेशनल टैक्स और इनकम टैक्स कटने के बाद।",
    plusVariable: "साथ में साल भर में {amount} वेरिएबल पे, अगर पूरा मिले।",
    estimate: "अनुमान",
  },

  breakdown: {
    heading: "आपका CTC कहाँ जाता है",
    monthly: "महीने का",
    annual: "साल का",
    ctc: "CTC (कुल पैकेज)",
    notPaidMonthly: "CTC का हिस्सा, जो हर महीने नहीं मिलता",
    variablePay: "वेरिएबल पे",
    employerPf: "कंपनी का PF",
    gratuity: "ग्रेच्युटी",
    grossSalary: "ग्रॉस सैलरी",
    deductions: "कटौतियाँ",
    employeePf: "आपका PF",
    professionalTax: "प्रोफ़ेशनल टैक्स",
    incomeTax: "इनकम टैक्स (TDS)",
    takeHome: "इन-हैंड सैलरी (नेट सैलरी)",
  },

  tax: {
    heading: "आपका इनकम टैक्स कैसे बनता है",
    regime: "नई टैक्स व्यवस्था, टैक्स वर्ष {year}",
    grossSalary: "ग्रॉस सैलरी",
    standardDeduction: "स्टैंडर्ड डिडक्शन",
    taxableIncome: "टैक्स वाली आय",
    slab: "{from} से {to}",
    slabTop: "{from} से ज़्यादा",
    taxBeforeRebate: "छूट से पहले टैक्स",
    rebate: "टैक्स छूट (रिबेट)",
    marginalRelief: "मार्जिनल रिलीफ़",
    surcharge: "सरचार्ज",
    cess: "हेल्थ और एजुकेशन सेस",
    totalTax: "कुल इनकम टैक्स",
    noTax: "इस सैलरी पर कोई इनकम टैक्स नहीं लगेगा, क्योंकि छूट पूरा टैक्स माफ़ कर देती है।",
  },

  explain: {
    ctcNotTakeHome:
      "CTC वह रकम है जो कंपनी साल भर में आप पर खर्च करती है। यह वह नहीं है जो आपके बैंक खाते में आता है।",
    notMonthlyCash:
      "CTC के कुछ हिस्से कभी महीने की सैलरी में नहीं मिलते: कंपनी का PF, ग्रेच्युटी और वेरिएबल पे।",
    basicEstimated:
      "सिर्फ़ CTC से Basic + DA पता नहीं चलता, इसलिए इसे फ़िक्स्ड CTC का {percent}% माना गया है। आपकी सैलरी स्लिप में यह अलग हो सकता है।",
    employerPfInCtc:
      "ज़्यादातर ऑफ़र लेटर की तरह, कंपनी का PF आपके CTC में गिना गया है। यह आपके PF खाते में जाता है, सैलरी में नहीं।",
    variableNotMonthly:
      "वेरिएबल पे हर महीने मिले, यह ज़रूरी नहीं। इसलिए इसे महीने की सैलरी में नहीं, साल के जोड़ में गिना गया है।",
    professionalTaxState:
      "प्रोफ़ेशनल टैक्स आपके राज्य पर निर्भर है। कुछ राज्य यह लेते हैं, कुछ नहीं।",
    professionalTaxNotDeductible:
      "नई टैक्स व्यवस्था में प्रोफ़ेशनल टैक्स से आपकी टैक्स वाली आय कम नहीं होती।",
    tdsSpread: "इनकम टैक्स को 12 महीनों में बराबर बाँटकर दिखाया गया है, जैसे आम तौर पर TDS कटता है।",
    newRegimeOnly: "इनकम टैक्स नई टैक्स व्यवस्था से निकाला गया है, जो नौकरीपेशा लोगों के लिए डिफ़ॉल्ट है।",
    estimate: "यह आपकी भरी गई जानकारी पर आधारित एक अनुमान है। आख़िरी आँकड़ा आपकी सैलरी स्लिप में होगा।",
    pfCapped: "आपके PF में Basic + DA हर महीने ज़्यादा से ज़्यादा {ceiling} तक ही गिना गया है।",
    wagesBelowFloor:
      "लेबर कोड के मुताबिक़ आम तौर पर कुल वेतन का कम से कम {percent}% PF के लिए वेतन माना जाता है, इसलिए आपका PF दिखाए गए से ज़्यादा हो सकता है।",
    rebateMarginalRelief:
      "आपकी टैक्स वाली आय {limit} से थोड़ी ही ज़्यादा है, इसलिए मार्जिनल रिलीफ़ की वजह से आपका टैक्स उस सीमा से ऊपर की आय से ज़्यादा नहीं होगा।",
    surchargeMarginalRelief:
      "मार्जिनल रिलीफ़ से आपका सरचार्ज कम हुआ है, ताकि सरचार्ज की सीमा पार करने पर बढ़ा टैक्स आपकी बढ़ी आय से ज़्यादा न हो।",
  },

  errors: {
    EMPTY: "रकम भरें।",
    NOT_A_NUMBER: "सही संख्या भरें।",
    NOT_POSITIVE: "आपका CTC शून्य से ज़्यादा होना चाहिए।",
    NEGATIVE: "यह माइनस में नहीं हो सकता।",
    TOO_LARGE: "CTC साल में ज़्यादा से ज़्यादा {max} हो सकता है।",
    PERCENT_OUT_OF_RANGE: "तय सीमा के अंदर प्रतिशत भरें।",
    PROFESSIONAL_TAX_TOO_HIGH: "प्रोफ़ेशनल टैक्स साल में ज़्यादा से ज़्यादा {max} हो सकता है।",
    INVALID_PF_MODE: "चुनें कि आपका PF कैसे कटता है।",
    IMPOSSIBLE_STRUCTURE: "इन आँकड़ों से फ़िक्स्ड सैलरी कुछ नहीं बचती। अपना वेरिएबल पे जाँचें।",
    NON_POSITIVE_TAKE_HOME: "इन आँकड़ों से कटौतियाँ महीने की सैलरी से ज़्यादा हो जाती हैं।",
  },

  /** `PERCENT_OUT_OF_RANGE` के लिए फ़ील्ड के हिसाब से संदेश — see the English module. */
  fieldErrors: {
    variablePayPercent: "वेरिएबल पे माइनस में नहीं हो सकता, और पूरे CTC से कम होना चाहिए।",
    pfWagesPercent: "Basic + DA शून्य से ज़्यादा होना चाहिए, और फ़िक्स्ड CTC से ज़्यादा नहीं हो सकता।",
  },

  content: {
    heading: "CTC और इन-हैंड सैलरी के बारे में",
    ctcTitle: "CTC आपकी महीने की सैलरी नहीं है",
    notMonthlyTitle: "CTC ÷ 12 आपकी इन-हैंड सैलरी क्यों नहीं है",
    pfTitle: "PF से आपकी सैलरी पर क्या असर पड़ता है",
    variableTitle: "वेरिएबल पे: सालाना, महीने का नहीं",
    estimateTitle: "यह अनुमान क्यों है",

    assumptionsHeading: "यह नतीजा किन बातों पर आधारित है",

    privacyNote:
      "पूरा हिसाब आपके ब्राउज़र में ही होता है — आप जो भरते हैं, वह न किसी सर्वर पर भेजा जाता है, न सेव होता है।",
    privacyLinkText: "निजता नीति पढ़ें →",

    faqHeading: "आम सवाल",
    faq: [
      {
        q: "मेरी इन-हैंड सैलरी, CTC को 12 से भाग देने पर आई रकम से कम क्यों है?",
        a: "CTC में ऐसी रकम भी शामिल होती है जो आपको महीने की सैलरी के रूप में नहीं मिलती, जैसे कंपनी का PF, ग्रेच्युटी और वेरिएबल पे। बची हुई रकम में से आपका अपना PF, प्रोफ़ेशनल टैक्स और इनकम टैक्स कटता है।",
      },
      {
        q: "क्या इस नतीजे में इनकम टैक्स शामिल है?",
        a: "हाँ। इनकम टैक्स नई टैक्स व्यवस्था से निकाला गया है, जो नौकरीपेशा लोगों के लिए डिफ़ॉल्ट है, और इसे TDS की तरह साल भर में बराबर बाँटा गया है।",
      },
      {
        q: "PF कैसे निकाला जाता है?",
        a: "PF आपके Basic + DA का एक हिस्सा होता है। कंपनी भी उतनी ही रकम डालती है, और वह हिस्सा आपके CTC में गिना जाता है। अगर ऑफ़र लेटर में Basic + DA नहीं लिखा है, तो कैलकुलेटर उसका अनुमान लगाता है।",
      },
    ],
  },
};

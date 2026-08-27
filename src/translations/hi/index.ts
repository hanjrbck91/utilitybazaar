import type { Dictionary } from "../../lib/i18n/types.ts";

/**
 * Hindi dictionary.
 *
 * Written as an Indian shopkeeper or customer would actually say it, not
 * as a literal rendering of the English. "GST", "CGST", "SGST" and "IGST"
 * stay in Latin script because that is how they appear on every invoice
 * and how people say them out loud.
 *
 * Typed as `Dictionary`, so a missing or misspelled key fails the build.
 */
export const hi: Dictionary = {
  localeName: "हिन्दी",

  app: {
    title: "GST कैलकुलेटर",
    tagline: "सेकंडों में GST निकालें।",
    calculatorLabel: "GST कैलकुलेटर",
    languageLabel: "भाषा",
  },

  calculator: {
    amount: "राशि",
    clearAmount: "राशि हटाएँ",
    mode: "क्या करना है",
    add: "GST जोड़ें",
    remove: "GST हटाएँ",
    rate: "GST दर",
    custom: "अन्य दर",
    customRateLabel: "अपनी GST दर, प्रतिशत में",
    rateHint:
      "दी गई दरें सिर्फ़ सुझाव हैं। अपने सामान या सेवा पर लगने वाली दर ज़रूर जाँच लें।",
    taxType: "बिक्री कहाँ",
    intraState: "इसी राज्य में",
    interState: "दूसरे राज्य में",
  },

  result: {
    label: "नतीजा",
    total: "कुल राशि",
    base: "GST से पहले की राशि",
    empty: "GST देखने के लिए ऊपर राशि भरें।",
    summaryAdd: "इसमें {rate}% की दर से {gst} GST शामिल है",
    summaryRemove: "{total} में से {gst} GST है, दर {rate}%",
    viewBreakdown: "पूरा विवरण देखें",
    cgst: "CGST",
    sgst: "SGST",
    igst: "IGST",
    totalGst: "कुल GST",
  },

  errors: {
    EMPTY: "राशि भरें।",
    NOT_A_NUMBER: "सही संख्या भरें।",
    NEGATIVE: "राशि ऋणात्मक नहीं हो सकती।",
    ZERO: "राशि शून्य से ज़्यादा होनी चाहिए।",
    TOO_SMALL: "राशि बहुत कम है।",
    TOO_LARGE: "राशि बहुत बड़ी है।",
    RATE_NOT_A_NUMBER: "सही GST दर भरें।",
    RATE_NEGATIVE: "GST दर ऋणात्मक नहीं हो सकती।",
    RATE_TOO_LARGE: "GST दर बहुत ज़्यादा है।",
  },

  actions: {
    listen: "सुनें",
    stop: "रोकें",
    speaking: "नतीजा पढ़कर सुनाया जा रहा है",
    listenUnavailable: "इस ब्राउज़र में सुनाने की सुविधा नहीं है",
    listenNoVoice: "आपके ब्राउज़र में हिन्दी आवाज़ मौजूद नहीं है",
    share: "भेजें",
    copy: "कॉपी करें",
    copied: "कॉपी हो गया",
    copyFailed: "कॉपी नहीं हो पाया। नतीजा चुनकर खुद कॉपी करें।",
    shareTitle: "GST हिसाब",
    addShopName: "दुकान का नाम जोड़ें",
    hideShopName: "दुकान का नाम हटाएँ",
    shopNameLabel: "दुकान या कारोबार का नाम, ज़रूरी नहीं",
    shopNamePlaceholder: "दुकान का नाम (ज़रूरी नहीं)",
  },

  share: {
    heading: "GST हिसाब",
    modeAdd: "GST जोड़ा गया",
    modeRemove: "GST हटाया गया",
    amount: "राशि",
    base: "GST से पहले की राशि",
    gst: "GST ({rate}%)",
    cgst: "CGST",
    sgst: "SGST",
    igst: "IGST",
    total: "कुल राशि",
  },

  speech: {
    gst: "GST {gst} रुपये है।",
    cgst: "CGST {cgst} रुपये है।",
    sgst: "SGST {sgst} रुपये है।",
    igst: "IGST {igst} रुपये है।",
    total: "कुल राशि {total} रुपये है।",
    base: "GST से पहले की राशि {base} रुपये है।",
  },
};

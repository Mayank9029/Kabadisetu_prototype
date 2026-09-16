import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Camera, Package, IndianRupee, MapPin, CheckCircle2, Clock, WifiOff, Wifi,
  Volume2, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Home as HomeIcon,
  Wallet, MoreHorizontal, Truck, Battery, Recycle, Users, Database, ListChecks,
  ArrowRight, Plus, X, TrendingUp, TrendingDown, Minus, Phone, QrCode, Flame,
  MonitorX, Sparkles, RefreshCw, ClipboardList, ShieldAlert, ChevronDown, Check, Download,
} from "lucide-react";

/* ============================================================================
   KABADISETU — vernacular, offline-first e-waste collection prototype
   ----------------------------------------------------------------------------
   This single artifact contains three linked experiences (switchable with the
   demo control bar at the top): the Collector app, the Recycler app and the
   Admin / data console. All three share one in-memory data store so an action
   taken in one role (e.g. a recycler confirming a handover) is immediately
   reflected in the others (e.g. the collector's earnings ledger and the
   admin's traceability timeline).

   WHAT IS REAL vs SIMULATED IN THIS BROWSER PROTOTYPE
   - Real: photo capture (file input, works with device camera on mobile),
     text-to-speech audio via the Web Speech API, all state transitions,
     price-estimate math, recycler matching/scoring, offline queueing +
     idempotent sync, traceability timeline, receipt generation.
   - Simulated (clearly labelled): recycler authorization records, price
     data, network connectivity (toggled by hand instead of a real radio),
     AI classification (transparent rule-based heuristic, not a trained
     model — see the "Prototype classifier" labels).
   - Not implemented in a browser artifact (documented as future work):
     a native local database/SQLite layer, a real backend + auth, push
     notifications, and a trained ML model. The data contracts here are
     written so those could be swapped in without changing the UI.
============================================================================ */

/* ---------------------------------------------------------------------- */
/* Translations                                                            */
/* ---------------------------------------------------------------------- */
const STR = {
  appName: { hi: "कबाड़ीसेतु", mr: "कबाडीसेतू", en: "KabadiSetu" },
  tagline: {
    hi: "कबाड़ी से Recycler तक — सीधा, साफ़ और सुरक्षित",
    mr: "कबाडीपासून Recycler पर्यंत — थेट, स्वच्छ आणि सुरक्षित",
    en: "From scrap collector to recycler — direct, transparent and safe",
  },
  chooseLanguage: { hi: "अपनी भाषा चुनें", mr: "तुमची भाषा निवडा", en: "Choose your language" },
  chooseArea: { hi: "अपना इलाका चुनें", mr: "तुमचा भाग निवडा", en: "Choose your area" },
  chooseAreaHint: {
    hi: "पूरा पता ज़रूरी नहीं — बस शहर/इलाका काफ़ी है",
    mr: "संपूर्ण पत्ता गरजेचा नाही — फक्त शहर/भाग पुरेसा आहे",
    en: "No full address needed — city or locality is enough",
  },
  yourId: { hi: "आपकी Collector ID", mr: "तुमची Collector ID", en: "Your Collector ID" },
  yourIdHint: {
    hi: "यह अपने आप बन गई है। आधार या बैंक जानकारी की ज़रूरत नहीं।",
    mr: "ही आपोआप तयार झाली आहे. आधार किंवा बँक माहितीची गरज नाही.",
    en: "This was created automatically. No Aadhaar or bank details needed.",
  },
  getStarted: { hi: "शुरू करें", mr: "सुरू करा", en: "Get started" },
  continueBtn: { hi: "आगे बढ़ें", mr: "पुढे जा", en: "Continue" },
  greeting: { hi: "नमस्ते", mr: "नमस्कार", en: "Hello" },
  whatToSell: { hi: "आज क्या बेचना है?", mr: "आज काय विकायचे आहे?", en: "What are you selling today?" },
  addScrap: { hi: "कचरा जोड़ें", mr: "कचरा जोडा", en: "Add scrap" },
  todaysRates: { hi: "आज के भाव", mr: "आजचे भाव", en: "Today's rates" },
  myLots: { hi: "मेरे लॉट", mr: "माझे लॉट", en: "My lots" },
  earnings: { hi: "कमाई", mr: "कमाई", en: "Earnings" },
  safeMethods: { hi: "सुरक्षित तरीके", mr: "सुरक्षित पद्धती", en: "Safe methods" },
  findRecycler: { hi: "Recycler खोजें", mr: "Recycler शोधा", en: "Find recycler" },
  more: { hi: "और", mr: "अधिक", en: "More" },
  updated: { hi: "अपडेट किया गया", mr: "अपडेट केले", en: "Updated" },
  today: { hi: "आज", mr: "आज", en: "Today" },
  lastUpdated: { hi: "आख़िरी अपडेट", mr: "शेवटचे अपडेट", en: "Last updated" },
  synced: { hi: "सिंक हो गया", mr: "सिंक झाले", en: "Synced" },
  waitingSync: { hi: "सिंक होना बाकी है", mr: "सिंक व्हायचे बाकी", en: "waiting to sync" },
  syncNow: { hi: "अभी सिंक करें", mr: "आत्ता सिंक करा", en: "Sync now" },
  offlineNote: {
    hi: "अभी इंटरनेट नहीं है। जानकारी फोन में सुरक्षित है, इंटरनेट आते ही भेज दी जाएगी।",
    mr: "आत्ता इंटरनेट नाही. माहिती फोनमध्ये सेव्ह आहे, इंटरनेट येताच पाठवली जाईल.",
    en: "No internet right now. Your data is saved on the phone and will sync automatically.",
  },
  network: { hi: "नेटवर्क", mr: "नेटवर्क", en: "Network" },
  online: { hi: "ऑनलाइन", mr: "ऑनलाइन", en: "Online" },
  offline: { hi: "ऑफ़लाइन", mr: "ऑफलाइन", en: "Offline" },
  takePhoto: { hi: "कचरे की फ़ोटो लें", mr: "कचऱ्याचा फोटो घ्या", en: "Photograph the material" },
  addPhoto: { hi: "फ़ोटो जोड़ें", mr: "फोटो जोडा", en: "Add photo" },
  retake: { hi: "दोबारा लें", mr: "पुन्हा घ्या", en: "Retake" },
  selectCategory: { hi: "माल चुनें", mr: "माल निवडा", en: "Select the material" },
  notSure: { hi: "पता नहीं", mr: "माहीत नाही", en: "Not sure" },
  subCategory: { hi: "किस्म चुनें", mr: "प्रकार निवडा", en: "Choose the sub-type" },
  skip: { hi: "छोड़ें", mr: "वगळा", en: "Skip" },
  condition: { hi: "हालत कैसी है?", mr: "स्थिती कशी आहे?", en: "What condition is it in?" },
  good: { hi: "अच्छी", mr: "चांगली", en: "Good" },
  used: { hi: "पुरानी", mr: "जुनी", en: "Used" },
  damaged: { hi: "टूटी-फूटी", mr: "खराब", en: "Damaged" },
  mixedCond: { hi: "मिश्रित", mr: "संमिश्र", en: "Mixed" },
  unknownCond: { hi: "पता नहीं", mr: "माहीत नाही", en: "Unknown" },
  howMuchWeight: { hi: "कितना वज़न है?", mr: "किती वजन आहे?", en: "How much does it weigh?" },
  approxWeightNote: { hi: "अंदाज़न वज़न — बिल्कुल सही होना ज़रूरी नहीं", mr: "अंदाजे वजन — अगदी बरोबर असणे गरजेचे नाही", en: "Approximate weight — exact precision not required" },
  sourceType: { hi: "यह माल कहाँ से है?", mr: "हा माल कुठून आहे?", en: "Where is this from?" },
  household: { hi: "घर", mr: "घर", en: "Household" },
  shop: { hi: "दुकान", mr: "दुकान", en: "Shop" },
  office: { hi: "ऑफ़िस", mr: "ऑफिस", en: "Office" },
  collectionPoint: { hi: "कलेक्शन पॉइंट", mr: "कलेक्शन पॉइंट", en: "Collection point" },
  scrapyard: { hi: "कबाड़ी यार्ड", mr: "भंगार यार्ड", en: "Scrap yard" },
  otherSrc: { hi: "अन्य", mr: "इतर", en: "Other" },
  unknownSrc: { hi: "पता नहीं", mr: "माहीत नाही", en: "Unknown" },
  location: { hi: "इलाका", mr: "भाग", en: "Locality" },
  estimatedValue: { hi: "लगभग कीमत", mr: "अंदाजे किंमत", en: "Estimated value" },
  estimateDisclaimer: {
    hi: "यह अंदाज़ है। Recycler के निरीक्षण और आख़िरी तोल के बाद कीमत बदल सकती है।",
    mr: "हा अंदाज आहे. Recycler च्या तपासणी आणि अंतिम वजनानंतर किंमत बदलू शकते.",
    en: "This is an estimate. The final value may change after recycler inspection and final weighing.",
  },
  highConf: { hi: "अच्छा अनुमान", mr: "चांगला अंदाज", en: "Good estimate" },
  highConfSub: { hi: "हाल के कई लेन-देन उपलब्ध हैं", mr: "अलीकडील अनेक व्यवहार उपलब्ध आहेत", en: "Based on many recent transactions" },
  medConf: { hi: "ठीक अनुमान", mr: "ठीक अंदाज", en: "Fair estimate" },
  medConfSub: { hi: "कुछ हाल का डेटा उपलब्ध है", mr: "काही अलीकडील डेटा उपलब्ध आहे", en: "Based on some recent data" },
  lowConf: { hi: "सीमित जानकारी", mr: "मर्यादित माहिती", en: "Limited data" },
  lowConfSub: { hi: "इस माल के लिए कम हालिया डेटा उपलब्ध है", mr: "या मालासाठी कमी अलीकडील डेटा उपलब्ध आहे", en: "Not much recent data for this material" },
  seeEstimate: { hi: "Recycler देखें", mr: "Recycler पहा", en: "See recyclers" },
  priceBoard: { hi: "भाव बोर्ड", mr: "भाव फलक", en: "Price board" },
  marketRange: { hi: "बाज़ार रेंज", mr: "बाजार रेंज", en: "Market range" },
  typicalOffer: { hi: "आज का सामान्य भाव", mr: "आजचा सर्वसाधारण भाव", en: "Today's typical offer" },
  viewTrend: { hi: "पिछला रुझान देखें", mr: "मागील कल पहा", en: "View trend" },
  last30: { hi: "पिछले 30 दिन", mr: "गेले ३० दिवस", en: "Last 30 days" },
  trendUp: { hi: "भाव थोड़ा बढ़ा है", mr: "भाव थोडा वाढला आहे", en: "Price has risen a little" },
  trendDown: { hi: "भाव थोड़ा गिरा है", mr: "भाव थोडा कमी झाला आहे", en: "Price has dropped a little" },
  trendFlat: { hi: "भाव लगभग स्थिर है", mr: "भाव जवळपास स्थिर आहे", en: "Price is roughly stable" },
  noTrend: { hi: "रुझान उपलब्ध नहीं — पर्याप्त पुराना डेटा नहीं", mr: "कल उपलब्ध नाही — पुरेसा जुना डेटा नाही", en: "Trend unavailable — not enough historical data" },
  recyclerOffers: { hi: "Recycler के भाव", mr: "Recycler चे भाव", en: "Recycler offers" },
  matchesFor: { hi: "आपके लॉट के लिए मैच", mr: "तुमच्या लॉटसाठी मॅच", en: "Matches for your lot" },
  authVerified: { hi: "Authorization सत्यापित", mr: "Authorization पडताळले", en: "Authorization verified" },
  authPending: { hi: "सत्यापन बाकी है", mr: "पडताळणी बाकी", en: "Verification pending" },
  authExpired: { hi: "सत्यापन समाप्त", mr: "पडताळणी संपली", en: "Verification expired" },
  materialsAccepted: { hi: "स्वीकार किया गया माल", mr: "स्वीकारला जाणारा माल", en: "Materials accepted" },
  distance: { hi: "दूरी", mr: "अंतर", en: "Distance" },
  pickupAvailable: { hi: "पिकअप उपलब्ध", mr: "पिकअप उपलब्ध", en: "Pickup available" },
  pickupNotAvailable: { hi: "पिकअप उपलब्ध नहीं", mr: "पिकअप उपलब्ध नाही", en: "No pickup" },
  serviceArea: { hi: "सेवा क्षेत्र", mr: "सेवा क्षेत्र", en: "Service area" },
  selectRecycler: { hi: "Recycler चुनें", mr: "Recycler निवडा", en: "Select recycler" },
  requestPickup: { hi: "पिकअप माँगें", mr: "पिकअप मागवा", en: "Request pickup" },
  viewDetails: { hi: "विवरण देखें", mr: "तपशील पहा", en: "View details" },
  call: { hi: "कॉल करें", mr: "कॉल करा", en: "Call" },
  quotedByRecycler: { hi: "Recycler का भाव", mr: "Recycler चा भाव", en: "Recycler quoted" },
  matchedBecause: { hi: "यह क्यों दिख रहा है", mr: "हे का दिसत आहे", en: "Suggested because" },
  reasonMaterial: { hi: "आपके माल को स्वीकार करता है", mr: "तुमचा माल स्वीकारतो", en: "Accepts your material" },
  reasonAuth: { hi: "Authorization सत्यापित", mr: "Authorization पडताळले", en: "Authorization verified" },
  reasonPickup: { hi: "पिकअप उपलब्ध", mr: "पिकअप उपलब्ध", en: "Pickup available" },
  reasonArea: { hi: "आपके इलाके में सेवा देता है", mr: "तुमच्या भागात सेवा देतो", en: "Serves your area" },
  pickupRequested: { hi: "पिकअप माँगा गया", mr: "पिकअप मागवला", en: "Pickup requested" },
  pickupWaiting: { hi: "Recycler के जवाब का इंतज़ार", mr: "Recycler च्या उत्तराची वाट पाहत आहे", en: "Waiting for recycler response" },
  handover: { hi: "हैंडओवर", mr: "हॅंडओव्हर", en: "Handover" },
  confirmHandover: { hi: "हैंडओवर की पुष्टि करें", mr: "हॅंडओव्हरची पुष्टी करा", en: "Confirm handover" },
  finalWeight: { hi: "आख़िरी वज़न", mr: "अंतिम वजन", en: "Final weight" },
  finalValue: { hi: "आख़िरी कीमत", mr: "अंतिम किंमत", en: "Final value" },
  paymentMethod: { hi: "भुगतान का तरीका", mr: "पेमेंट पद्धत", en: "Payment method" },
  cash: { hi: "नक़द", mr: "रोख", en: "Cash" },
  digital: { hi: "डिजिटल (UPI)", mr: "डिजिटल (UPI)", en: "Digital (UPI)" },
  paymentStatus: { hi: "भुगतान स्थिति", mr: "पेमेंट स्थिती", en: "Payment status" },
  paid: { hi: "मिल गया", mr: "मिळाले", en: "Paid" },
  pendingPay: { hi: "बाकी है", mr: "बाकी आहे", en: "Pending" },
  confirmTransaction: { hi: "लेन-देन पक्का करें", mr: "व्यवहार निश्चित करा", en: "Confirm transaction" },
  receiptTitle: { hi: "डिजिटल हैंडओवर रसीद", mr: "डिजिटल हॅंडओव्हर पावती", en: "Digital handover receipt" },
  reference: { hi: "रेफ़रेंस नंबर", mr: "संदर्भ क्रमांक", en: "Reference number" },
  material: { hi: "माल", mr: "माल", en: "Material" },
  quotedValue: { hi: "बताई गई कीमत", mr: "सांगितलेली किंमत", en: "Quoted value" },
  finalSaleValue: { hi: "अंतिम बिक्री मूल्य", mr: "अंतिम विक्री मूल्य", en: "Final sale value" },
  recyclerLbl: { hi: "Recycler", mr: "Recycler", en: "Recycler" },
  handoverDate: { hi: "हैंडओवर तारीख़", mr: "हॅंडओव्हर तारीख", en: "Handover date" },
  timeLbl: { hi: "समय", mr: "वेळ", en: "Time" },
  recyclerConfirmation: { hi: "Recycler पुष्टि", mr: "Recycler पुष्टी", en: "Recycler confirmation" },
  verified: { hi: "सत्यापित", mr: "पडताळले", en: "Verified" },
  pendingConfirmation: { hi: "पुष्टि बाकी", mr: "पुष्टी बाकी", en: "Pending confirmation" },
  totalEarnings: { hi: "कुल कमाई", mr: "एकूण कमाई", en: "Total earnings" },
  pendingDues: { hi: "बकाया राशि", mr: "थकीत रक्कम", en: "Pending dues" },
  thisMonth: { hi: "इस महीने", mr: "या महिन्यात", en: "This month" },
  txHistory: { hi: "लेन-देन", mr: "व्यवहार", en: "Transactions" },
  safetyCenter: { hi: "सुरक्षा केंद्र", mr: "सुरक्षा केंद्र", en: "Safety center" },
  listen: { hi: "सुनें", mr: "ऐका", en: "Listen" },
  doLabel: { hi: "करें", mr: "करा", en: "Do" },
  dontLabel: { hi: "न करें", mr: "करू नका", en: "Don't" },
  noLotsYet: { hi: "अभी कोई लॉट नहीं है।", mr: "आत्ता कोणताही लॉट नाही.", en: "No lots yet." },
  createFirstLot: { hi: "फ़ोटो लेकर पहला लॉट बनाएं।", mr: "फोटो घेऊन पहिला लॉट तयार करा.", en: "Take a photo to create your first lot." },
  noPriceData: { hi: "इस माल के लिए अभी पर्याप्त भाव उपलब्ध नहीं हैं।", mr: "या मालासाठी पुरेसे भाव उपलब्ध नाहीत.", en: "Not enough price data for this material yet." },
  noRecyclerFound: { hi: "आपके इलाके में अभी कोई मिलान करने वाला Recycler नहीं मिला।", mr: "तुमच्या भागात जुळणारा Recycler सापडला नाही.", en: "No matching recycler found in your area yet." },
  noHistoryYet: { hi: "लेन-देन होने के बाद आपकी कमाई यहाँ दिखेगी।", mr: "व्यवहार झाल्यावर तुमची कमाई इथे दिसेल.", en: "Your earnings will appear here after a transaction." },
  back: { hi: "पीछे", mr: "मागे", en: "Back" },
  status: { hi: "स्थिति", mr: "स्थिती", en: "Status" },
  draftStatus: { hi: "ड्राफ़्ट", mr: "ड्राफ्ट", en: "Draft" },
  readyStatus: { hi: "तैयार", mr: "तयार", en: "Ready" },
  matchingStatus: { hi: "Recycler खोज रहे हैं", mr: "Recycler शोधत आहोत", en: "Matching recyclers" },
  offerReceivedStatus: { hi: "भाव मिला", mr: "भाव मिळाला", en: "Offer received" },
  pickupReqStatus: { hi: "पिकअप माँगा गया", mr: "पिकअप मागवला", en: "Pickup requested" },
  handedOverStatus: { hi: "हैंडओवर हो गया", mr: "हॅंडओव्हर झाले", en: "Handed over" },
  completedStatus: { hi: "पूरा हुआ", mr: "पूर्ण झाले", en: "Completed" },
  continueLot: { hi: "पिछला लॉट जारी रखें?", mr: "मागील लॉट सुरू ठेवायचा?", en: "Continue previous lot?" },
  demoControls: { hi: "डेमो नियंत्रण", mr: "डेमो नियंत्रण", en: "Demo controls" },
  role: { hi: "भूमिका", mr: "भूमिका", en: "Role" },
  collectorRole: { hi: "Collector ऐप", mr: "Collector अ‍ॅप", en: "Collector app" },
  recyclerRole: { hi: "Recycler ऐप", mr: "Recycler अ‍ॅप", en: "Recycler app" },
  adminRole: { hi: "Admin कंसोल", mr: "Admin कन्सोल", en: "Admin console" },
  incomingLots: { hi: "आने वाले लॉट", mr: "येणारे लॉट", en: "Incoming lots" },
  giveOffer: { hi: "भाव दें", mr: "भाव द्या", en: "Give offer" },
  acceptLot: { hi: "स्वीकार करें", mr: "स्वीकार करा", en: "Accept" },
  rejectLot: { hi: "अस्वीकार करें", mr: "नकार द्या", en: "Reject" },
  schedulePickup: { hi: "पिकअप तय करें", mr: "पिकअप ठरवा", en: "Schedule pickup" },
  overview: { hi: "सारांश", mr: "सारांश", en: "Overview" },
  activeCollectors: { hi: "सक्रिय Collectors", mr: "सक्रिय Collectors", en: "Active collectors" },
  activeRecyclers: { hi: "सक्रिय Recyclers", mr: "सक्रिय Recyclers", en: "Active recyclers" },
  lotsCreated: { hi: "बनाए गए लॉट", mr: "तयार झालेले लॉट", en: "Lots created" },
  txCompleted: { hi: "पूरे हुए लेन-देन", mr: "पूर्ण झालेले व्यवहार", en: "Transactions completed" },
  totalWeight: { hi: "कुल वज़न", mr: "एकूण वजन", en: "Total weight" },
  totalValue: { hi: "कुल मूल्य", mr: "एकूण मूल्य", en: "Total value" },
  pendingSyncCount: { hi: "सिंक बाकी", mr: "सिंक बाकी", en: "Pending sync" },
  flaggedTx: { hi: "फ़्लैग किए गए", mr: "फ्लॅग केलेले", en: "Flagged" },
  materialsDataset: { hi: "माल डेटासेट", mr: "माल डेटासेट", en: "Materials dataset" },
  priceDataset: { hi: "भाव डेटासेट", mr: "भाव डेटासेट", en: "Price dataset" },
  recyclerDataset: { hi: "Recycler डेटासेट", mr: "Recycler डेटासेट", en: "Recycler dataset" },
  transactionDataset: { hi: "लेन-देन डेटासेट", mr: "व्यवहार डेटासेट", en: "Transaction dataset" },
  traceabilityLookup: { hi: "ट्रेसेबिलिटी खोज", mr: "ट्रेसेबिलिटी शोध", en: "Traceability lookup" },
  enterLotId: { hi: "Lot ID डालें", mr: "Lot ID टाका", en: "Enter a Lot ID" },
  anomalies: { hi: "असामान्य लेन-देन", mr: "असामान्य व्यवहार", en: "Anomaly flags" },
  aiStatus: { hi: "AI/ML स्थिति", mr: "AI/ML स्थिती", en: "AI/ML status" },
  unitEconomics: { hi: "यूनिट अर्थशास्त्र", mr: "युनिट अर्थशास्त्र", en: "Unit economics" },
  demoDataWarning: { hi: "डेमो डेटा — असली लेन-देन के लिए नहीं", mr: "डेमो डेटा — खऱ्या व्यवहारांसाठी नाही", en: "DEMO DATA — not for real-world transactions" },
  fieldValidationRequired: { hi: "फ़ील्ड वैलिडेशन ज़रूरी", mr: "फील्ड व्हॅलिडेशन आवश्यक", en: "Field validation required" },
  requiresReview: { hi: "समीक्षा ज़रूरी", mr: "पुनरावलोकन आवश्यक", en: "Requires review" },
  predictedCategory: { hi: "अनुमानित माल", mr: "अंदाजित माल", en: "Predicted category" },
  ruleBasedNote: {
    hi: "प्रोटोटाइप नियम-आधारित वर्गीकरण — यह प्रशिक्षित AI मॉडल नहीं है",
    mr: "प्रोटोटाइप नियम-आधारित वर्गीकरण — हे प्रशिक्षित AI मॉडेल नाही",
    en: "Prototype rule-based classifier — this is not a trained ML model",
  },
  itemsWaitingSync: { hi: "आइटम सिंक होना बाकी", mr: "आयटम सिंक व्हायचे बाकी", en: "items waiting to sync" },
  approx: { hi: "अंदाज़न", mr: "अंदाजे", en: "Approx." },
  kg: { hi: "किलो", mr: "किलो", en: "kg" },
  perKg: { hi: "/ किलो", mr: "/ किलो", en: "/kg" },
  demoDataTag: { hi: "डेमो डेटा", mr: "डेमो डेटा", en: "Demo data" },
  close: { hi: "बंद करें", mr: "बंद करा", en: "Close" },
  save: { hi: "सेव करें", mr: "सेव्ह करा", en: "Save" },
  next: { hi: "आगे", mr: "पुढे", en: "Next" },
  step: { hi: "चरण", mr: "टप्पा", en: "Step" },
  photoCaptured: { hi: "फ़ोटो ली गई", mr: "फोटो घेतला", en: "Photo captured" },
  changeCategory: { hi: "माल बदलें", mr: "माल बदला", en: "Change category" },
  confirmCategory: { hi: "पुष्टि करें", mr: "पुष्टी करा", en: "Confirm" },
  homeNav: { hi: "होम", mr: "होम", en: "Home" },
  pricesNav: { hi: "भाव", mr: "भाव", en: "Prices" },
  lotsNav: { hi: "लॉट", mr: "लॉट", en: "Lots" },
  earningsNav: { hi: "कमाई", mr: "कमाई", en: "Earnings" },
  moreNav: { hi: "और", mr: "अधिक", en: "More" },
  languageSetting: { hi: "भाषा", mr: "भाषा", en: "Language" },
  aboutProduct: { hi: "प्रोडक्ट के बारे में", mr: "प्रॉडक्टबद्दल", en: "About this product" },
  switchArea: { hi: "इलाका बदलें", mr: "भाग बदला", en: "Change area" },
  of: { hi: "में से", mr: "पैकी", en: "of" },
  timeline: { hi: "ट्रेसेबिलिटी टाइमलाइन", mr: "ट्रेसेबिलिटी टाइमलाइन", en: "Traceability timeline" },
  totalQuotedValue: { hi: "कुल बताई गई कीमत", mr: "एकूण सांगितलेली किंमत", en: "Total quoted value" },
};

function useT(lang) {
  return useCallback((key) => (STR[key] ? (STR[key][lang] || STR[key].en) : key), [lang]);
}

/* ---------------------------------------------------------------------- */
/* Seed / demo data                                                        */
/* ---------------------------------------------------------------------- */
const LOCALITIES = ["Gurgaon", "Faridabad", "Noida", "Delhi", "Ghaziabad"];

const CATEGORIES = [
  { id: "pcb", icon: "🟩", hi: "PCB", mr: "PCB", en: "PCB", base: 148,
    subcats: [
      { id: "motherboard", hi: "मदरबोर्ड", mr: "मदरबोर्ड", en: "Motherboard" },
      { id: "mobile_pcb", hi: "मोबाइल PCB", mr: "मोबाइल PCB", en: "Mobile PCB" },
      { id: "appliance_pcb", hi: "उपकरण PCB", mr: "उपकरण PCB", en: "Appliance PCB" },
      { id: "mixed_pcb", hi: "मिश्रित PCB", mr: "मिश्र PCB", en: "Mixed PCB" },
    ] },
  { id: "cables", icon: "🔌", hi: "केबल", mr: "केबल", en: "Cables", base: 260,
    subcats: [
      { id: "copper", hi: "तांबे की केबल", mr: "तांब्याची केबल", en: "Copper cable" },
      { id: "mixed_cable", hi: "मिश्रित केबल", mr: "मिश्र केबल", en: "Mixed cable" },
      { id: "insulated", hi: "इंसुलेटेड तार", mr: "इन्सुलेटेड वायर", en: "Insulated wire" },
    ] },
  { id: "batteries", icon: "🔋", hi: "बैटरी", mr: "बॅटरी", en: "Batteries", base: 150,
    subcats: [
      { id: "liion", hi: "लिथियम-आयन", mr: "लिथियम-आयन", en: "Lithium-ion" },
      { id: "leadacid", hi: "लेड-एसिड", mr: "लेड-अ‍ॅसिड", en: "Lead-acid" },
      { id: "mixed_battery", hi: "मिश्रित बैटरी", mr: "मिश्र बॅटरी", en: "Mixed battery" },
    ] },
  { id: "crt", icon: "🖥️", hi: "CRT मॉनिटर", mr: "CRT मॉनिटर", en: "CRT monitor", base: 8, subcats: [] },
  { id: "lcd", icon: "📺", hi: "LCD/LED पैनल", mr: "LCD/LED पॅनल", en: "LCD/LED panel", base: 35, subcats: [] },
  { id: "motors", icon: "⚙️", hi: "मोटर", mr: "मोटर", en: "Motors", base: 55, subcats: [] },
  { id: "magnets", icon: "🧲", hi: "चुंबक असेंबली", mr: "चुंबक असेंब्ली", en: "Magnet assembly", base: 300, subcats: [] },
  { id: "plastics", icon: "🧴", hi: "मिश्रित प्लास्टिक", mr: "मिश्र प्लास्टिक", en: "Mixed plastics", base: 18, subcats: [] },
  { id: "other", icon: "📦", hi: "अन्य इलेक्ट्रॉनिक्स", mr: "इतर इलेक्ट्रॉनिक्स", en: "Other electronics", base: 40, subcats: [] },
  { id: "mixed", icon: "🗑️", hi: "मिश्रित ई-कचरा", mr: "संमिश्र ई-कचरा", en: "Mixed e-waste", base: 25, subcats: [] },
];
const CAT_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
// Categories with enough demo transaction history for a "high confidence" read.
const HIGH_DATA_CATEGORIES = new Set(["pcb", "cables", "batteries"]);

const CONDITION_MULTIPLIER = { good: 1, used: 0.95, damaged: 0.7, mixed: 0.85, unknown: 0.75 };

// price_id, material_category, location, timestamp, prevailing_buying_price, unit, source_type, data_quality
const PRICE_HISTORY = [
  ...["pcb"].flatMap((cat) => [
    { date: "2026-09-01", price: 140 }, { date: "2026-09-05", price: 144 },
    { date: "2026-09-10", price: 148 }, { date: "2026-09-15", price: 152 },
  ].map((p, i) => ({ id: `PR-${cat}-${i}`, category: cat, location: "Gurgaon", ...p, unit: "kg", source: "aggregated recycler quotes", quality: "Demo data" }))),
  ...["cables"].flatMap((cat) => [
    { date: "2026-09-01", price: 245 }, { date: "2026-09-08", price: 252 },
    { date: "2026-09-15", price: 260 },
  ].map((p, i) => ({ id: `PR-${cat}-${i}`, category: cat, location: "Gurgaon", ...p, unit: "kg", source: "aggregated recycler quotes", quality: "Demo data" }))),
  ...["batteries"].flatMap((cat) => [
    { date: "2026-09-01", price: 158 }, { date: "2026-09-08", price: 152 },
    { date: "2026-09-15", price: 150 },
  ].map((p, i) => ({ id: `PR-${cat}-${i}`, category: cat, location: "Gurgaon", ...p, unit: "kg", source: "aggregated recycler quotes", quality: "Demo data" }))),
];

// recycler_id, name, facility_location, materials_accepted, authorization_status,
// authorization_type, authorization_reference, authorization_last_verified,
// offered_rates, pickup_availability, service_area
const RECYCLERS = [
  { id: "RCY-001", name: "GreenLoop Recycling — Demo", location: "Gurgaon", distanceKm: 6,
    accepts: ["pcb", "cables", "batteries", "motors"], auth: "VERIFIED",
    authType: "State Pollution Control Board authorization (demo)", authRef: "DEMO-SPCB-11029",
    authDate: "2026-06-12", pickup: true, serviceArea: "Delhi NCR", phone: "+91 98XXXXXX01",
    rates: { pcb: 152, cables: 268, batteries: 156, motors: 58 } },
  { id: "RCY-002", name: "UrbanMine Recyclers — Demo", location: "Delhi", distanceKm: 18,
    accepts: ["pcb", "cables", "batteries", "crt", "lcd", "motors", "magnets", "plastics", "other", "mixed"],
    auth: "VERIFIED", authType: "CPCB e-waste authorization (demo)", authRef: "DEMO-CPCB-88213",
    authDate: "2026-04-02", pickup: true, serviceArea: "Delhi NCR", phone: "+91 98XXXXXX02",
    rates: { pcb: 145, cables: 255, batteries: 148, crt: 6, lcd: 32, motors: 52, magnets: 288, plastics: 16, other: 36, mixed: 22 } },
  { id: "RCY-003", name: "ReTech Recovery — Demo", location: "Noida", distanceKm: 24,
    accepts: ["cables", "batteries", "motors"], auth: "VERIFIED",
    authType: "State Pollution Control Board authorization (demo)", authRef: "DEMO-SPCB-33871",
    authDate: "2026-07-20", pickup: true, serviceArea: "Delhi NCR", phone: "+91 98XXXXXX03",
    rates: { cables: 248, batteries: 151, motors: 54 } },
  { id: "RCY-004", name: "EcoCycle Materials — Demo", location: "Faridabad", distanceKm: 14,
    accepts: ["pcb", "crt", "lcd"], auth: "PENDING_VERIFICATION",
    authType: "CPCB e-waste authorization (demo, under review)", authRef: "DEMO-CPCB-PENDING-04",
    authDate: "—", pickup: false, serviceArea: "Faridabad only", phone: "+91 98XXXXXX04",
    rates: { pcb: 140, crt: 7, lcd: 30 } },
  { id: "RCY-005", name: "ScrapCircle Aggregator — Demo", location: "Ghaziabad", distanceKm: 31,
    accepts: ["plastics", "mixed", "other"], auth: "EXPIRED",
    authType: "State Pollution Control Board authorization (demo, expired)", authRef: "DEMO-SPCB-EXPIRED-19",
    authDate: "2024-01-15", pickup: true, serviceArea: "Ghaziabad / East Delhi", phone: "+91 98XXXXXX05",
    rates: { plastics: 17, mixed: 24, other: 34 } },
];
const RCY_BY_ID = Object.fromEntries(RECYCLERS.map((r) => [r.id, r]));

const SAFETY_TOPICS = [
  { id: "cable_burn", icon: <Flame size={28} />, severity: "high",
    title: { hi: "केबल मत जलाएं", mr: "केबल जाळू नका", en: "Don't burn cables" },
    body: { hi: "केबल जलाने से जहरीला धुआँ निकलता है जो साँस के ज़रिए शरीर में जाता है।", mr: "केबल जाळल्याने विषारी धूर निघतो जो श्वासाद्वारे शरीरात जातो.", en: "Burning cables releases toxic smoke that enters the body through breathing." } },
  { id: "battery", icon: <Battery size={28} />, severity: "high",
    title: { hi: "बैटरी सावधानी", mr: "बॅटरी सावधानी", en: "Battery caution" },
    body: { hi: "फूली हुई या टूटी बैटरी को आग और गर्मी से दूर रखें। उसे तोड़ें या दबाएं नहीं।", mr: "फुगलेली किंवा तुटलेली बॅटरी आग व उष्णतेपासून दूर ठेवा. ती फोडू किंवा दाबू नका.", en: "Keep swollen or damaged batteries away from heat and flame. Never crush or puncture them." } },
  { id: "crt", icon: <MonitorX size={28} />, severity: "medium",
    title: { hi: "CRT मॉनिटर सावधानी", mr: "CRT मॉनिटर सावधानी", en: "CRT monitor caution" },
    body: { hi: "CRT स्क्रीन नाज़ुक होती है, उसे तोड़ें नहीं। पूरे मॉनिटर को सही Recycler तक सुरक्षित पहुँचाएं।", mr: "CRT स्क्रीन नाजूक असते, ती फोडू नका. संपूर्ण मॉनिटर योग्य Recycler पर्यंत सुरक्षित पोहोचवा.", en: "CRT screens are fragile — never break them. Transfer the whole monitor safely to an authorized recycler." } },
  { id: "acid", icon: <ShieldAlert size={28} />, severity: "high",
    title: { hi: "एसिड से धातु न निकालें", mr: "अ‍ॅसिडने धातू काढू नका", en: "Never use acid to recover metal" },
    body: { hi: "एसिड से धातु निकालना बहुत ख़तरनाक है और यह त्वचा व फेफड़ों को नुक़सान पहुँचा सकता है।", mr: "अ‍ॅसिडने धातू काढणे खूप धोकादायक आहे आणि त्वचा व फुफ्फुसांना हानी पोहोचवू शकते.", en: "Recovering metal with acid is dangerous and can harm skin and lungs." } },
];

const genLotId = (n) => `LOT-${10000 + n}`;
const genCollectorId = () => `COL-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
const genHandoverRef = () => {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `KS-${ymd}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
};

function speak(text, lang) {
  try {
    if (!("speechSynthesis" in window)) return false;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
    return true;
  } catch (e) {
    return false;
  }
}

function computeEstimate(categoryId, weightKg, condition, recyclerId) {
  const cat = CAT_BY_ID[categoryId];
  if (!cat || !weightKg) return null;
  let rate = cat.base;
  if (recyclerId && RCY_BY_ID[recyclerId]?.rates?.[categoryId]) {
    rate = RCY_BY_ID[recyclerId].rates[categoryId];
  }
  const mult = CONDITION_MULTIPLIER[condition] ?? 0.85;
  const value = Math.round(rate * weightKg * mult);
  const confidence = HIGH_DATA_CATEGORIES.has(categoryId) ? "high" : "low";
  return { rate, value, confidence };
}

function scoreRecyclers(categoryId) {
  return RECYCLERS
    .filter((r) => r.accepts.includes(categoryId)) // material_compatibility: mandatory gate
    .filter((r) => r.auth === "VERIFIED") // authorization: mandatory gate for the formal matching flow
    .map((r) => ({
      ...r,
      offeredRate: r.rates[categoryId],
      reasons: ["reasonMaterial", "reasonAuth", ...(r.pickup ? ["reasonPickup"] : []), "reasonArea"],
    }))
    .sort((a, b) => b.offeredRate - a.offeredRate);
}

/* Everything above is used directly by the App component below — this is a
   single-file artifact, so no module exports are needed until the very end. */

/* ---------------------------------------------------------------------- */
/* Design tokens (see design plan in accompanying README)                  */
/* ---------------------------------------------------------------------- */
const COLOR = {
  paper: "#F5F3EA",
  ink: "#16231D",
  inkSoft: "#4A5A50",
  line: "#D9D3BF",
  teal: "#1F4D3D",
  tealDark: "#153A2D",
  tealSoft: "#E4EEE7",
  marigold: "#E7A21D",
  marigoldSoft: "#FCEFD2",
  clay: "#C1502E",
  claySoft: "#F7E1D8",
  white: "#FFFFFF",
};

function Btn({ children, onClick, variant = "primary", full, icon: Icon, disabled, small }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";
  const size = small ? "px-3 py-2 text-sm" : "px-4 py-3.5 text-[15px]";
  const styles = {
    primary: { backgroundColor: COLOR.teal, color: COLOR.white },
    marigold: { backgroundColor: COLOR.marigold, color: COLOR.tealDark },
    outline: { backgroundColor: "transparent", color: COLOR.teal, border: `1.5px solid ${COLOR.teal}` },
    ghost: { backgroundColor: COLOR.tealSoft, color: COLOR.teal },
    danger: { backgroundColor: COLOR.clay, color: COLOR.white },
    subtle: { backgroundColor: "transparent", color: COLOR.inkSoft },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={styles[variant]}
      className={`${base} ${size} ${full ? "w-full" : ""}`}
    >
      {Icon && <Icon size={small ? 15 : 18} />}
      {children}
    </button>
  );
}

function Card({ children, style, onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}`, ...style }}
      className={`rounded-2xl p-4 ${onClick ? "cursor-pointer active:scale-[0.99] transition-transform" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: { backgroundColor: COLOR.tealSoft, color: COLOR.teal },
    good: { backgroundColor: "#DDEFE2", color: "#1F6B3A" },
    warn: { backgroundColor: COLOR.marigoldSoft, color: "#8A6110" },
    bad: { backgroundColor: COLOR.claySoft, color: COLOR.clay },
    demo: { backgroundColor: "#EDEAE0", color: "#6B6552" },
  };
  return (
    <span style={tones[tone]} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
      {children}
    </span>
  );
}

function ListenBtn({ text, lang, label }) {
  const [ok, setOk] = useState(true);
  return (
    <button
      onClick={() => setOk(speak(text, lang))}
      className="inline-flex items-center gap-1.5 text-sm font-semibold"
      style={{ color: COLOR.teal }}
    >
      <Volume2 size={16} /> {label}
      {!ok && <span style={{ color: COLOR.clay }} className="text-xs">(unsupported)</span>}
    </button>
  );
}

function ScreenHeader({ title, onBack, right }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      {onBack && (
        <button onClick={onBack} className="p-1.5 -ml-1.5 rounded-full" style={{ color: COLOR.teal }}>
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="text-lg font-bold flex-1" style={{ color: COLOR.ink }}>{title}</h1>
      {right}
    </div>
  );
}

function StatBlock({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-3.5" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }}>
      <div className="text-[11px] font-medium uppercase tracking-wide" style={{ color: COLOR.inkSoft, letterSpacing: "0.04em" }}>{label}</div>
      <div className="text-xl font-bold mt-0.5" style={{ color: accent || COLOR.ink }}>{value}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: COLOR.inkSoft }}>{sub}</div>}
    </div>
  );
}

function TrendMini({ points }) {
  if (!points || points.length < 2) return null;
  const w = 220, h = 56, pad = 6;
  const vals = points.map((p) => p.price);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  const x = (i) => pad + (i * (w - pad * 2)) / (points.length - 1);
  const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.price)}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={COLOR.marigold} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.price)} r="3.5" fill={COLOR.teal} />
      ))}
    </svg>
  );
}

function PhotoCapture({ photo, onChange, label, retakeLabel }) {
  const inputRef = useRef(null);
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result);
          reader.readAsDataURL(file);
        }}
      />
      {photo ? (
        <div className="relative">
          <img src={photo} alt="captured material" className="w-full h-48 object-cover rounded-2xl" style={{ border: `1px solid ${COLOR.line}` }} />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 rounded-full px-3 py-2 text-sm font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: COLOR.white, color: COLOR.teal, border: `1px solid ${COLOR.line}` }}
          >
            <Camera size={15} /> {retakeLabel}
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-2xl flex flex-col items-center justify-center gap-2"
          style={{ backgroundColor: COLOR.tealSoft, border: `1.5px dashed ${COLOR.teal}` }}
        >
          <Camera size={34} style={{ color: COLOR.teal }} />
          <span className="font-semibold" style={{ color: COLOR.teal }}>{label}</span>
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Root application                                                        */
/* ---------------------------------------------------------------------- */
export default function KabadiSetuApp() {
  // ---- onboarding / identity -------------------------------------------------
  const [lang, setLang] = useState(null);           // null until chosen -> onboarding
  const [area, setArea] = useState(null);
  const [collectorId] = useState(genCollectorId());
  const [onboardStep, setOnboardStep] = useState(0);

  // ---- demo controls ----------------------------------------------------------
  const [role, setRole] = useState("collector");     // collector | recycler | admin
  const [adminUnlocked, setAdminUnlocked] = useState(false); // demo-only client-side gate, see README
  const [online, setOnline] = useState(true);
  const [activeRecyclerId, setActiveRecyclerId] = useState("RCY-001"); // which recycler "app" we're viewing

  // ---- "Add to desktop" install prompt (real browser API; no-op where unsupported) --
  const [installEvent, setInstallEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setInstallEvent(e); };
    const onInstalled = () => { setInstalled(true); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);
  async function requestInstall() {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  }

  // ---- collector navigation ----------------------------------------------------
  const [tab, setTab] = useState("home");            // home | prices | lots | earnings | more
  const [screen, setScreen] = useState(null);         // overlay screens (wizard, detail, etc.)
  const [wizardStep, setWizardStep] = useState(0);
  const [draft, setDraft] = useState(null);
  const [activeLotId, setActiveLotId] = useState(null);
  const [priceDetailCat, setPriceDetailCat] = useState(null);
  const [selectedRecyclerId, setSelectedRecyclerId] = useState(null);
  const [adminLotQuery, setAdminLotQuery] = useState("");

  const t = useT(lang || "en");

  // ---- core data store ----------------------------------------------------------
  const [lots, setLots] = useState(() => seedLots());
  const [transactions, setTransactions] = useState(() => seedTransactions());
  const nextLotNum = useRef(1010);

  function seedLots() {
    return [
      {
        id: "LOT-10021", collectorId: "COL-1001", category: "pcb", subcategory: "motherboard",
        condition: "used", weight: 12, sourceType: "shop", location: "Gurgaon", photo: null,
        estimatedValue: 1740, confidence: "high", status: "COMPLETED", syncStatus: "SYNCED",
        createdAt: "2026-09-16T10:15:00", recyclerId: "RCY-001", quotedPrice: 152,
        events: [
          { at: "2026-09-16T10:15:00", key: "Lot created" },
          { at: "2026-09-16T10:17:00", key: "Material categorized" },
          { at: "2026-09-16T10:18:00", key: "Estimated value generated" },
          { at: "2026-09-16T10:22:00", key: "Recycler matched" },
          { at: "2026-09-16T12:30:00", key: "Pickup requested" },
          { at: "2026-09-16T14:10:00", key: "Material handed over" },
          { at: "2026-09-16T14:12:00", key: "Recycler confirmed" },
          { at: "2026-09-16T14:13:00", key: "Payment recorded" },
        ],
      },
      {
        id: "LOT-10022", collectorId: "COL-1001", category: "cables", subcategory: "mixed_cable",
        condition: "good", weight: 4, sourceType: "household", location: "Gurgaon", photo: null,
        estimatedValue: 920, confidence: "high", status: "PICKUP_REQUESTED", syncStatus: "SYNCED",
        createdAt: "2026-09-14T09:00:00", recyclerId: "RCY-001", quotedPrice: 268,
        events: [
          { at: "2026-09-14T09:00:00", key: "Lot created" },
          { at: "2026-09-14T09:05:00", key: "Recycler matched" },
          { at: "2026-09-14T09:10:00", key: "Pickup requested" },
        ],
      },
      {
        id: "LOT-10023", collectorId: "COL-1001", category: "batteries", subcategory: "leadacid",
        condition: "damaged", weight: 6, sourceType: "scrapyard", location: "Gurgaon", photo: null,
        estimatedValue: 630, confidence: "high", status: "READY", syncStatus: "PENDING_SYNC",
        createdAt: "2026-09-16T08:40:00", recyclerId: null, quotedPrice: null,
        events: [
          { at: "2026-09-16T08:40:00", key: "Lot created (offline)" },
        ],
        offlineCreated: true,
      },
    ];
  }
  function seedTransactions() {
    return [
      {
        id: "TXN-9001", lotId: "LOT-10021", collectorId: "COL-1001", recyclerId: "RCY-001",
        quotedPrice: 1824, finalPrice: 1770, weight: 11.8, paymentMethod: "cash", paymentStatus: "PAID",
        status: "COMPLETED", handoverRef: "KS-20260916-8F42A1", handoverAt: "2026-09-16T14:12:00",
        location: "Gurgaon", flagged: false,
      },
      {
        id: "TXN-9002", lotId: "LOT-9998", collectorId: "COL-1002", recyclerId: "RCY-002",
        quotedPrice: 2200, finalPrice: 1150, weight: 8, paymentMethod: "digital", paymentStatus: "PAID",
        status: "COMPLETED", handoverRef: "KS-20260910-2CDE90", handoverAt: "2026-09-10T11:02:00",
        location: "Delhi", flagged: true, flagReason: "Final price 48% below quoted price",
      },
    ];
  }

  const collectorLots = useMemo(() => lots.filter((l) => l.collectorId === collectorId || l.collectorId === "COL-1001"), [lots, collectorId]);

  // ---- sync simulation ----------------------------------------------------------
  const pendingCount = useMemo(() => lots.filter((l) => l.syncStatus === "PENDING_SYNC").length, [lots]);

  function runSync() {
    setLots((prev) => prev.map((l) => (l.syncStatus === "PENDING_SYNC" ? { ...l, syncStatus: "SYNCED", offlineCreated: false } : l)));
  }
  function toggleOnline() {
    setOnline((prevOnline) => {
      const next = !prevOnline;
      if (next) setTimeout(runSync, 350); // idempotent: only PENDING_SYNC rows are touched
      return next;
    });
  }

  function addTraceEvent(lotId, key) {
    setLots((prev) => prev.map((l) => (l.id === lotId ? { ...l, events: [...l.events, { at: new Date().toISOString(), key }] } : l)));
  }

  // ---- lot wizard actions ---------------------------------------------------------
  function startWizard() {
    setDraft({ category: null, subcategory: null, condition: null, weight: "", sourceType: null, location: area || "Gurgaon", photo: null, aiSuggestion: null });
    setWizardStep(0);
    setScreen("wizard");
  }
  function finishWizard() {
    const id = genLotId(nextLotNum.current++);
    const weightNum = parseFloat(draft.weight) || 0;
    const est = computeEstimate(draft.category, weightNum, draft.condition || "unknown");
    const newLot = {
      id, collectorId, category: draft.category, subcategory: draft.subcategory,
      condition: draft.condition || "unknown", weight: weightNum, sourceType: draft.sourceType || "unknown",
      location: draft.location, photo: draft.photo,
      estimatedValue: est?.value || 0, confidence: est?.confidence || "low",
      status: "READY", syncStatus: online ? "SYNCED" : "PENDING_SYNC", offlineCreated: !online,
      createdAt: new Date().toISOString(), recyclerId: null, quotedPrice: null,
      events: [
        { at: new Date().toISOString(), key: online ? "Lot created" : "Lot created (offline)" },
        { at: new Date().toISOString(), key: "Material categorized" },
        { at: new Date().toISOString(), key: "Estimated value generated" },
      ],
    };
    setLots((prev) => [newLot, ...prev]);
    setDraft(null);
    setActiveLotId(id);
    setScreen("lotDetail");
    setTab("lots");
  }

  function requestPickupFor(lotId, recyclerId, quoted) {
    setLots((prev) => prev.map((l) => (l.id === lotId
      ? { ...l, status: "PICKUP_REQUESTED", recyclerId, quotedPrice: quoted, syncStatus: online ? "SYNCED" : "PENDING_SYNC" }
      : l)));
    addTraceEvent(lotId, "Recycler matched");
    addTraceEvent(lotId, "Pickup requested");
  }

  function confirmHandoverFor(lotId, { finalWeight, finalValue, paymentMethod, paymentStatus }) {
    const lot = lots.find((l) => l.id === lotId);
    const ref = genHandoverRef();
    const txn = {
      id: `TXN-${9000 + transactions.length + 1}`, lotId, collectorId: lot.collectorId, recyclerId: lot.recyclerId,
      quotedPrice: lot.quotedPrice ? Math.round(lot.quotedPrice * lot.weight) : lot.estimatedValue,
      finalPrice: finalValue, weight: finalWeight, paymentMethod, paymentStatus,
      status: "COMPLETED", handoverRef: ref, handoverAt: new Date().toISOString(), location: lot.location,
      flagged: lot.estimatedValue > 0 && Math.abs(finalValue - lot.estimatedValue) / lot.estimatedValue > 0.4,
      flagReason: "Final value differs from estimate by more than 40%",
    };
    setTransactions((prev) => [...prev, txn]);
    setLots((prev) => prev.map((l) => (l.id === lotId
      ? { ...l, status: "COMPLETED", finalWeight, finalValue, paymentMethod, paymentStatus, handoverRef: ref, transactionId: txn.id, syncStatus: online ? "SYNCED" : "PENDING_SYNC" }
      : l)));
    addTraceEvent(lotId, "Material handed over");
    addTraceEvent(lotId, "Recycler confirmed");
    addTraceEvent(lotId, "Payment recorded");
    return ref;
  }

  function recyclerAcceptLot(lotId, recyclerId, rate) {
    setLots((prev) => prev.map((l) => (l.id === lotId ? { ...l, status: "OFFER_RECEIVED", recyclerId, quotedPrice: rate } : l)));
    addTraceEvent(lotId, `Recycler quoted ₹${rate}/kg`);
  }

  // ---- guards -----------------------------------------------------------------
  if (lang === null) {
    return <OnboardingFlow {...{ onboardStep, setOnboardStep, lang, setLang, area, setArea, collectorId }} />;
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center py-4 px-2" style={{ backgroundColor: "#EDEAE0", fontFamily: "'Noto Sans', 'Noto Sans Devanagari', sans-serif" }}>
      <DemoBar {...{ role, setRole, online, toggleOnline, t, pendingCount, activeRecyclerId, setActiveRecyclerId, installEvent, requestInstall, installed }} />
      {role === "admin" ? (
        adminUnlocked ? (
          <AdminConsole {...{ t, lots, transactions, lang, adminLotQuery, setAdminLotQuery, onLock: () => setAdminUnlocked(false) }} />
        ) : (
          <AdminLock onUnlock={() => setAdminUnlocked(true)} />
        )
      ) : (
        <PhoneShell>
          {role === "collector" ? (
            <CollectorApp {...{
              t, lang, setLang, area, setArea, collectorId, tab, setTab, screen, setScreen,
              wizardStep, setWizardStep, draft, setDraft, startWizard, finishWizard,
              collectorLots, activeLotId, setActiveLotId, online, pendingCount, runSync,
              priceDetailCat, setPriceDetailCat, requestPickupFor, transactions,
              selectedRecyclerId, setSelectedRecyclerId,
            }} />
          ) : (
            <RecyclerApp {...{ t, lang, lots, activeRecyclerId, recyclerAcceptLot, confirmHandoverFor, transactions }} />
          )}
        </PhoneShell>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin password gate                                                     */
/* ---------------------------------------------------------------------- */
const ADMIN_PASSWORD = "1234"; // demo-only client-side gate — see README, this is not real security

function AdminLock({ onUnlock }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  function submit(e) {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) { setError(false); onUnlock(); }
    else { setError(true); setValue(""); }
  }
  return (
    <div className="w-full max-w-[420px] mt-6">
      <div className="rounded-3xl p-7 flex flex-col items-center gap-4 text-center" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <div className="font-bold text-lg" style={{ color: COLOR.ink }}>Admin console — password required</div>
          <div className="text-sm mt-1" style={{ color: COLOR.inkSoft }}>This role is gated separately from the Collector and Recycler demo apps.</div>
        </div>
        <form onSubmit={submit} className="w-full flex flex-col gap-3">
          <input
            type="password" inputMode="numeric" autoFocus value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            placeholder="Password"
            className="w-full rounded-xl px-4 py-3 text-center text-lg font-semibold tracking-widest"
            style={{ backgroundColor: COLOR.tealSoft, color: COLOR.tealDark, border: error ? `1.5px solid ${COLOR.clay}` : "1.5px solid transparent" }}
          />
          {error && <div className="text-xs font-semibold" style={{ color: COLOR.clay }}>Incorrect password — try again.</div>}
          <Btn full>Unlock</Btn>
        </form>
      </div>
    </div>
  );
}

function PhoneShell({ children }) {
  return (
    <div
      className="w-full max-w-[400px] rounded-[2.2rem] overflow-hidden flex flex-col"
      style={{ backgroundColor: COLOR.paper, border: `8px solid ${COLOR.tealDark}`, minHeight: 720, maxHeight: 800, boxShadow: "0 20px 40px rgba(21,58,45,0.25)" }}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
    </div>
  );
}

function DemoBar({ role, setRole, online, toggleOnline, t, pendingCount, activeRecyclerId, setActiveRecyclerId, installEvent, requestInstall, installed }) {
  return (
    <div className="w-full max-w-[700px] mb-4 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3" style={{ backgroundColor: COLOR.ink, color: COLOR.paper }}>
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md" style={{ backgroundColor: COLOR.marigold, color: COLOR.tealDark }}>
        {t("demoControls")}
      </span>
      {installEvent && !installed && (
        <button
          onClick={requestInstall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ backgroundColor: COLOR.marigold, color: COLOR.tealDark }}
        >
          <Download size={14} /> Install app
        </button>
      )}
      {installed && (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ backgroundColor: "rgba(31,107,58,0.35)", color: "#B9E6C4" }}>
          <CheckCircle2 size={14} /> Installed
        </span>
      )}
      <div className="flex items-center gap-1.5 rounded-lg p-1" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
        {[
          { id: "collector", label: "Collector app" },
          { id: "recycler", label: "Recycler app" },
          { id: "admin", label: "Admin console" },
        ].map((r) => (
          <button
            key={r.id}
            onClick={() => setRole(r.id)}
            className="px-2.5 py-1.5 rounded-md text-xs font-semibold"
            style={role === r.id ? { backgroundColor: COLOR.marigold, color: COLOR.tealDark } : { color: COLOR.paper, opacity: 0.75 }}
          >
            {r.label}
          </button>
        ))}
      </div>
      {role === "recycler" && (
        <select
          value={activeRecyclerId}
          onChange={(e) => setActiveRecyclerId(e.target.value)}
          className="text-xs font-semibold rounded-lg px-2 py-1.5"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", color: COLOR.paper }}
        >
          {RECYCLERS.map((r) => <option key={r.id} value={r.id} style={{ color: COLOR.ink }}>{r.name}</option>)}
        </select>
      )}
      <button
        onClick={toggleOnline}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
        style={online ? { backgroundColor: "rgba(31,107,58,0.35)", color: "#B9E6C4" } : { backgroundColor: "rgba(193,80,46,0.35)", color: "#F5C3AE" }}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online ? "Simulate offline" : "Go online"}
      </button>
      {pendingCount > 0 && (
        <span className="text-xs font-semibold" style={{ color: COLOR.marigold }}>{pendingCount} {t("itemsWaitingSync")}</span>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Onboarding                                                              */
/* ---------------------------------------------------------------------- */
function OnboardingFlow({ onboardStep, setOnboardStep, setLang, area, setArea, collectorId }) {
  const [pickedLang, setPickedLang] = useState("hi");
  const [pickedArea, setPickedArea] = useState("Gurgaon");
  const t = useT(pickedLang);

  return (
    <div className="w-full min-h-full flex items-center justify-center py-8 px-2" style={{ backgroundColor: "#EDEAE0" }}>
      <PhoneShell>
        <div className="h-full flex flex-col px-6 py-8">
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-1 mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: COLOR.teal }}>
              <Recycle size={32} color={COLOR.marigold} />
            </div>
            <div className="text-2xl font-bold" style={{ color: COLOR.ink }}>
              {STR.appName[pickedLang]}
            </div>
            <div className="text-sm max-w-[240px]" style={{ color: COLOR.inkSoft }}>{STR.tagline[pickedLang]}</div>
          </div>

          {onboardStep === 0 && (
            <div className="flex flex-col gap-4">
              <div className="text-center font-semibold" style={{ color: COLOR.ink }}>{t("chooseLanguage")}</div>
              <div className="flex flex-col gap-3">
                {[{ id: "hi", label: "हिंदी" }, { id: "mr", label: "मराठी" }, { id: "en", label: "English" }].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setPickedLang(l.id)}
                    className="w-full rounded-2xl py-4 text-lg font-semibold flex items-center justify-between px-5"
                    style={pickedLang === l.id
                      ? { backgroundColor: COLOR.teal, color: COLOR.white }
                      : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1.5px solid ${COLOR.line}` }}
                  >
                    {l.label}
                    {pickedLang === l.id && <Check size={20} />}
                  </button>
                ))}
              </div>
              <Btn full onClick={() => setOnboardStep(1)}>{t("continueBtn")} <ArrowRight size={18} /></Btn>
            </div>
          )}

          {onboardStep === 1 && (
            <div className="flex flex-col gap-4">
              <div className="text-center font-semibold" style={{ color: COLOR.ink }}>{t("chooseArea")}</div>
              <div className="text-center text-sm -mt-2" style={{ color: COLOR.inkSoft }}>{t("chooseAreaHint")}</div>
              <div className="grid grid-cols-2 gap-3">
                {LOCALITIES.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setPickedArea(loc)}
                    className="rounded-2xl py-4 font-semibold flex flex-col items-center gap-1.5"
                    style={pickedArea === loc
                      ? { backgroundColor: COLOR.teal, color: COLOR.white }
                      : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1.5px solid ${COLOR.line}` }}
                  >
                    <MapPin size={18} />
                    {loc}
                  </button>
                ))}
              </div>
              <Btn full onClick={() => setOnboardStep(2)}>{t("continueBtn")} <ArrowRight size={18} /></Btn>
            </div>
          )}

          {onboardStep === 2 && (
            <div className="flex flex-col gap-4 items-center text-center">
              <div className="font-semibold" style={{ color: COLOR.ink }}>{t("yourId")}</div>
              <div className="rounded-2xl px-6 py-4 text-2xl font-bold tracking-wide" style={{ backgroundColor: COLOR.marigoldSoft, color: COLOR.tealDark, fontFamily: "monospace" }}>
                {collectorId}
              </div>
              <div className="text-sm max-w-[260px]" style={{ color: COLOR.inkSoft }}>{t("yourIdHint")}</div>
              <div className="w-full mt-4">
                <Btn full onClick={() => { setArea(pickedArea); setLang(pickedLang); }}>{t("getStarted")} <ArrowRight size={18} /></Btn>
              </div>
            </div>
          )}
        </div>
      </PhoneShell>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Collector app shell                                                     */
/* ---------------------------------------------------------------------- */
function CollectorApp(props) {
  const { t, lang, tab, setTab, screen, setScreen } = props;

  let body;
  if (screen === "wizard") body = <LotWizard {...props} />;
  else if (screen === "lotDetail") body = <LotDetailScreen {...props} />;
  else if (screen === "recyclerList") body = <RecyclerListScreen {...props} />;
  else if (screen === "recyclerDetail") body = <RecyclerDetailScreen {...props} />;
  else if (screen === "receipt") body = <ReceiptScreen {...props} />;
  else if (screen === "safety") body = <SafetyScreen {...props} />;
  else if (screen === "priceTrend") body = <PriceTrendScreen {...props} />;
  else if (tab === "home") body = <HomeTab {...props} />;
  else if (tab === "prices") body = <PricesTab {...props} />;
  else if (tab === "lots") body = <LotsTab {...props} />;
  else if (tab === "earnings") body = <EarningsTab {...props} />;
  else body = <MoreTab {...props} />;

  const showNav = !screen;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto pb-2">{body}</div>
      {showNav && (
        <div className="grid grid-cols-5 border-t" style={{ borderColor: COLOR.line, backgroundColor: COLOR.white }}>
          {[
            { id: "home", icon: HomeIcon, label: t("homeNav") },
            { id: "prices", icon: IndianRupee, label: t("pricesNav") },
            { id: "lots", icon: Package, label: t("lotsNav") },
            { id: "earnings", icon: Wallet, label: t("earningsNav") },
            { id: "more", icon: MoreHorizontal, label: t("moreNav") },
          ].map((it) => (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5"
              style={{ color: tab === it.id ? COLOR.teal : COLOR.inkSoft }}
            >
              <it.icon size={20} strokeWidth={tab === it.id ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SyncBadge({ online, pendingCount, runSync, t }) {
  if (online && pendingCount === 0) {
    return <Pill tone="good"><CheckCircle2 size={12} /> {t("synced")}</Pill>;
  }
  if (!online) {
    return <Pill tone="bad"><WifiOff size={12} /> {t("offline")}</Pill>;
  }
  return (
    <button onClick={runSync}>
      <Pill tone="warn"><RefreshCw size={12} /> {pendingCount} {t("waitingSync")}</Pill>
    </button>
  );
}

/* ---- Home ------------------------------------------------------------- */
function HomeTab(props) {
  const { t, lang, online, pendingCount, runSync, startWizard, setTab, collectorLots, setScreen, area } = props;
  const openLots = collectorLots.filter((l) => l.status !== "COMPLETED" && l.status !== "CANCELLED").length;

  return (
    <div className="px-4 pt-4 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("greeting")} 👋</div>
          <div className="text-sm" style={{ color: COLOR.inkSoft }}>{t("whatToSell")}</div>
        </div>
        <SyncBadge online={online} pendingCount={pendingCount} runSync={runSync} t={t} />
      </div>

      {!online && (
        <div className="rounded-xl px-3.5 py-2.5 text-sm flex items-start gap-2" style={{ backgroundColor: COLOR.claySoft, color: "#7A2E17" }}>
          <WifiOff size={16} className="mt-0.5 shrink-0" /> {t("offlineNote")}
        </div>
      )}

      <button
        onClick={startWizard}
        className="w-full rounded-3xl py-6 flex flex-col items-center gap-2 font-bold text-lg"
        style={{ backgroundColor: COLOR.teal, color: COLOR.white }}
      >
        <Camera size={30} />
        {t("addScrap")}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <QuickTile icon={<IndianRupee size={20} />} label={t("todaysRates")} onClick={() => setTab("prices")} />
        <QuickTile icon={<Package size={20} />} label={t("myLots")} onClick={() => setTab("lots")} badge={openLots || null} />
        <QuickTile icon={<Wallet size={20} />} label={t("earnings")} onClick={() => setTab("earnings")} />
        <QuickTile icon={<ShieldCheck size={20} />} label={t("safeMethods")} onClick={() => setScreen("safety")} />
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold text-sm" style={{ color: COLOR.ink }}>{t("todaysRates")}</div>
          <div className="text-xs" style={{ color: COLOR.inkSoft }}>{online ? `${t("updated")}: ${t("today")}` : `${t("lastUpdated")}: 15 Sep`}</div>
        </div>
        <div className="flex flex-col gap-2">
          {CATEGORIES.slice(0, 4).map((c) => (
            <div key={c.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2" style={{ color: COLOR.ink }}><span>{c.icon}</span>{c[lang] || c.en}</span>
              <span className="font-bold" style={{ color: COLOR.teal }}>₹{c.base} {t("perKg")}</span>
            </div>
          ))}
        </div>
      </Card>
      <div className="h-2" />
    </div>
  );
}

function QuickTile({ icon, label, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl p-4 flex flex-col items-start gap-2"
      style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>{icon}</div>
      <span className="font-semibold text-sm text-left" style={{ color: COLOR.ink }}>{label}</span>
      {badge && (
        <span className="absolute top-3 right-3 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: COLOR.marigold, color: COLOR.tealDark }}>{badge}</span>
      )}
    </button>
  );
}

/* ---- Prices ------------------------------------------------------------- */
function PricesTab(props) {
  const { t, lang, online, setPriceDetailCat, setScreen } = props;
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <div className="text-lg font-bold" style={{ color: COLOR.ink }}>{t("priceBoard")}</div>
      <div className="text-xs" style={{ color: COLOR.inkSoft }}>
        {online ? `${t("updated")}: ${t("today")}, 10:30 AM` : `${t("lastUpdated")}: 15 Sep 2026`} · <Pill tone="demo">{t("demoDataTag")}</Pill>
      </div>
      <div className="flex flex-col gap-2.5">
        {CATEGORIES.map((c) => {
          const hasHistory = HIGH_DATA_CATEGORIES.has(c.id);
          const range = hasHistory ? [Math.round(c.base * 0.9), Math.round(c.base * 1.12)] : null;
          const bestOffer = Math.max(...RECYCLERS.filter((r) => r.accepts.includes(c.id) && r.auth === "VERIFIED").map((r) => r.rates[c.id] || 0), 0);
          return (
            <Card key={c.id} onClick={() => hasHistory && (setPriceDetailCat(c.id), setScreen("priceTrend"))}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{c.icon}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: COLOR.ink }}>{c[lang] || c.en}</div>
                    {range ? (
                      <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("marketRange")}: ₹{range[0]}–₹{range[1]}{t("perKg")}</div>
                    ) : (
                      <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("noPriceData")}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: COLOR.teal }}>₹{c.base}{t("perKg")}</div>
                  {bestOffer > 0 && <div className="text-[11px]" style={{ color: COLOR.inkSoft }}>{t("typicalOffer")}: ₹{bestOffer}</div>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

function PriceTrendScreen(props) {
  const { t, lang, priceDetailCat, setScreen } = props;
  const cat = CAT_BY_ID[priceDetailCat];
  const points = PRICE_HISTORY.filter((p) => p.category === priceDetailCat);
  const hasEnough = points.length >= 2;
  const trend = hasEnough ? (points[points.length - 1].price > points[0].price ? "up" : points[points.length - 1].price < points[0].price ? "down" : "flat") : null;
  const trendKey = trend === "up" ? "trendUp" : trend === "down" ? "trendDown" : "trendFlat";
  const offers = RECYCLERS.filter((r) => r.accepts.includes(priceDetailCat)).map((r) => ({ name: r.name, rate: r.rates[priceDetailCat], auth: r.auth })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="pb-4">
      <ScreenHeader title={`${cat.icon} ${cat[lang] || cat.en}`} onBack={() => setScreen(null)} />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: COLOR.inkSoft }}>{t("last30")}</div>
          {hasEnough ? (
            <>
              <TrendMini points={points} />
              <div className="text-sm mt-2 flex items-center gap-1.5" style={{ color: COLOR.ink }}>
                {trend === "up" ? <TrendingUp size={16} color={COLOR.clay} /> : trend === "down" ? <TrendingDown size={16} color={COLOR.teal} /> : <Minus size={16} />}
                {t(trendKey)}
              </div>
              <ListenBtn text={STR[trendKey][lang]} lang={lang} label={t("listen")} />
            </>
          ) : (
            <div className="text-sm" style={{ color: COLOR.inkSoft }}>{t("noTrend")}</div>
          )}
          <div className="mt-2"><Pill tone="demo">{t("demoDataTag")}</Pill></div>
        </Card>

        <div>
          <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("recyclerOffers")}</div>
          <div className="flex flex-col gap-2">
            {offers.map((o) => (
              <div key={o.name} className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }}>
                <span className="text-sm" style={{ color: COLOR.ink }}>{o.name}</span>
                <span className="flex items-center gap-2">
                  {o.auth !== "VERIFIED" && <Pill tone="warn">{t("authPending")}</Pill>}
                  <span className="font-bold" style={{ color: COLOR.teal }}>₹{o.rate}{t("perKg")}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Lots ------------------------------------------------------------- */
const LOT_STATUS_KEY = {
  READY: "readyStatus", MATCHING: "matchingStatus", OFFER_RECEIVED: "offerReceivedStatus",
  PICKUP_REQUESTED: "pickupReqStatus", HANDED_OVER: "handedOverStatus", COMPLETED: "completedStatus",
};
function statusTone(status) {
  if (status === "COMPLETED") return "good";
  if (status === "PICKUP_REQUESTED" || status === "OFFER_RECEIVED") return "warn";
  return "neutral";
}

function LotsTab(props) {
  const { t, lang, collectorLots, setActiveLotId, setScreen } = props;
  if (collectorLots.length === 0) {
    return (
      <div className="px-4 pt-16 flex flex-col items-center text-center gap-2">
        <Package size={40} style={{ color: COLOR.inkSoft }} />
        <div className="font-semibold" style={{ color: COLOR.ink }}>{t("noLotsYet")}</div>
        <div className="text-sm" style={{ color: COLOR.inkSoft }}>{t("createFirstLot")}</div>
      </div>
    );
  }
  return (
    <div className="px-4 pt-4 flex flex-col gap-2.5">
      <div className="text-lg font-bold" style={{ color: COLOR.ink }}>{t("myLots")}</div>
      {collectorLots.map((lot) => {
        const cat = CAT_BY_ID[lot.category];
        return (
          <Card key={lot.id} onClick={() => { setActiveLotId(lot.id); setScreen("lotDetail"); }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: COLOR.ink }}>{cat[lang] || cat.en} · {lot.weight}{t("kg")}</div>
                  <div className="text-xs" style={{ color: COLOR.inkSoft }}>{lot.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold" style={{ color: COLOR.teal }}>₹{lot.finalValue ?? lot.estimatedValue}</div>
                <Pill tone={statusTone(lot.status)}>{t(LOT_STATUS_KEY[lot.status] || "draftStatus")}</Pill>
              </div>
            </div>
            {lot.syncStatus === "PENDING_SYNC" && (
              <div className="mt-2 text-[11px] font-semibold flex items-center gap-1" style={{ color: COLOR.clay }}><WifiOff size={11} /> {t("waitingSync")}</div>
            )}
          </Card>
        );
      })}
      <div className="h-2" />
    </div>
  );
}

function LotDetailScreen(props) {
  const { t, lang, collectorLots, activeLotId, setScreen } = props;
  const lot = collectorLots.find((l) => l.id === activeLotId);
  if (!lot) return null;
  const cat = CAT_BY_ID[lot.category];
  const recycler = lot.recyclerId ? RCY_BY_ID[lot.recyclerId] : null;

  return (
    <div className="pb-6">
      <ScreenHeader title={lot.id} onBack={() => setScreen(null)} right={<Pill tone={statusTone(lot.status)}>{t(LOT_STATUS_KEY[lot.status] || "draftStatus")}</Pill>} />
      <div className="px-4 flex flex-col gap-4">
        {lot.photo && <img src={lot.photo} className="w-full h-40 object-cover rounded-2xl" style={{ border: `1px solid ${COLOR.line}` }} alt="lot" />}
        <Card>
          <div className="flex items-center gap-2.5 mb-3">
            <span className="text-2xl">{cat.icon}</span>
            <div>
              <div className="font-bold" style={{ color: COLOR.ink }}>{cat[lang] || cat.en}</div>
              <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("approx")} {lot.weight}{t("kg")} · {t(lot.condition + "Cond") || lot.condition}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <StatBlock label={t("estimatedValue")} value={`₹${lot.estimatedValue}`} />
            <StatBlock label={t("location")} value={lot.location} />
          </div>
        </Card>

        {lot.syncStatus === "PENDING_SYNC" && (
          <div className="rounded-xl px-3.5 py-2.5 text-sm flex items-center gap-2" style={{ backgroundColor: COLOR.claySoft, color: "#7A2E17" }}>
            <WifiOff size={16} /> {t("waitingSync")}
          </div>
        )}

        {lot.status === "READY" && (
          <Btn full onClick={() => setScreen("recyclerList")} icon={ArrowRight}>{t("seeEstimate")}</Btn>
        )}

        {(lot.status === "PICKUP_REQUESTED") && recycler && (
          <Card style={{ backgroundColor: COLOR.tealSoft, border: "none" }}>
            <div className="font-semibold text-sm mb-1" style={{ color: COLOR.teal }}>{t("pickupRequested")}</div>
            <div className="text-sm" style={{ color: COLOR.ink }}>{recycler.name}</div>
            <div className="text-xs mt-1" style={{ color: COLOR.inkSoft }}>{t("quotedByRecycler")}: ₹{lot.quotedPrice}{t("perKg")}</div>
            <div className="text-xs mt-2" style={{ color: COLOR.inkSoft }}>{t("pickupWaiting")}</div>
          </Card>
        )}

        {lot.status === "COMPLETED" && (
          <Btn full variant="ghost" onClick={() => setScreen("receipt")} icon={ClipboardList}>{t("receiptTitle")}</Btn>
        )}

        <div>
          <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("timeline")}</div>
          <Timeline events={lot.events} />
        </div>
      </div>
    </div>
  );
}

function Timeline({ events }) {
  return (
    <div className="flex flex-col">
      {events.map((e, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full mt-1.5" style={{ backgroundColor: COLOR.teal }} />
            {i < events.length - 1 && <div className="w-px flex-1" style={{ backgroundColor: COLOR.line }} />}
          </div>
          <div className="pb-3">
            <div className="text-sm font-medium" style={{ color: COLOR.ink }}>{e.key}</div>
            <div className="text-[11px]" style={{ color: COLOR.inkSoft }}>{new Date(e.at).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---- Lot creation wizard ------------------------------------------------ */
function LotWizard(props) {
  const { t, lang, draft, setDraft, wizardStep, setWizardStep, finishWizard, setScreen } = props;
  const cat = draft.category ? CAT_BY_ID[draft.category] : null;
  const hasSubcats = cat && cat.subcats.length > 0;

  // dynamic step list depending on whether the chosen category has sub-types
  const steps = ["photo", "category", ...(hasSubcats ? ["subcategory"] : []), "condition", "weight", "source", "review"];
  const stepId = steps[wizardStep];

  function next() { setWizardStep((s) => Math.min(s + 1, steps.length - 1)); }
  function prev() { if (wizardStep === 0) setScreen(null); else setWizardStep((s) => s - 1); }
  function set(patch) { setDraft((d) => ({ ...d, ...patch })); }

  const canNext = {
    photo: true,
    category: !!draft.category,
    subcategory: true,
    condition: !!draft.condition,
    weight: parseFloat(draft.weight) > 0,
    source: !!draft.sourceType,
    review: true,
  }[stepId];

  return (
    <div className="pb-6">
      <ScreenHeader
        title={`${t("step")} ${wizardStep + 1} ${t("of") || "/"} ${steps.length}`}
        onBack={prev}
      />
      <div className="px-4 flex flex-col gap-4">
        {stepId === "photo" && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("takePhoto")}</div>
            <PhotoCapture photo={draft.photo} onChange={(p) => set({ photo: p })} label={t("addPhoto")} retakeLabel={t("retake")} />
          </>
        )}

        {stepId === "category" && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("selectCategory")}</div>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { set({ category: c.id, subcategory: null, aiSuggestion: null }); }}
                  className="rounded-2xl p-3.5 flex flex-col items-center gap-1.5"
                  style={draft.category === c.id
                    ? { backgroundColor: COLOR.teal, color: COLOR.white }
                    : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1px solid ${COLOR.line}` }}
                >
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-xs font-semibold text-center">{c[lang] || c.en}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stepId === "subcategory" && cat && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("subCategory")}</div>
            <div className="flex flex-col gap-2.5">
              {cat.subcats.map((s) => (
                <button
                  key={s.id}
                  onClick={() => set({ subcategory: s.id, aiSuggestion: null })}
                  className="rounded-xl px-4 py-3.5 text-left font-semibold"
                  style={draft.subcategory === s.id
                    ? { backgroundColor: COLOR.teal, color: COLOR.white }
                    : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1px solid ${COLOR.line}` }}
                >
                  {s[lang] || s.en}
                </button>
              ))}
              <button
                onClick={() => {
                  // Prototype rule-based "AI" suggestion — not a trained model.
                  const guess = cat.subcats[0];
                  set({ subcategory: "unsure", aiSuggestion: guess });
                }}
                className="rounded-xl px-4 py-3.5 text-left font-semibold"
                style={draft.subcategory === "unsure"
                  ? { backgroundColor: COLOR.marigold, color: COLOR.tealDark }
                  : { backgroundColor: COLOR.white, color: COLOR.inkSoft, border: `1px dashed ${COLOR.line}` }}
              >
                {t("notSure")}
              </button>
              {draft.subcategory === "unsure" && draft.aiSuggestion && (
                <Card style={{ backgroundColor: COLOR.marigoldSoft, border: "none" }}>
                  <div className="flex items-center gap-2 mb-1"><Sparkles size={15} color="#8A6110" /><span className="text-xs font-bold" style={{ color: "#8A6110" }}>{t("predictedCategory")}: {draft.aiSuggestion[lang] || draft.aiSuggestion.en} (62%)</span></div>
                  <div className="text-[11px]" style={{ color: "#8A6110" }}>{t("ruleBasedNote")}</div>
                </Card>
              )}
            </div>
          </>
        )}

        {stepId === "condition" && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("condition")}</div>
            <div className="grid grid-cols-2 gap-3">
              {[["good", "✅"], ["used", "🔁"], ["damaged", "💥"], ["mixed", "🔀"], ["unknown", "❔"]].map(([id, icon]) => (
                <button
                  key={id}
                  onClick={() => set({ condition: id })}
                  className="rounded-2xl p-4 flex flex-col items-center gap-1.5"
                  style={draft.condition === id
                    ? { backgroundColor: COLOR.teal, color: COLOR.white }
                    : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1px solid ${COLOR.line}` }}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-semibold">{t(id + "Cond") || id}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {stepId === "weight" && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("howMuchWeight")}</div>
            <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("approxWeightNote")}</div>
            <div className="rounded-2xl p-5 flex items-center justify-center gap-2" style={{ backgroundColor: COLOR.white, border: `1.5px solid ${COLOR.line}` }}>
              <input
                type="number" inputMode="decimal" min="0" step="0.1"
                value={draft.weight}
                onChange={(e) => set({ weight: e.target.value })}
                placeholder="0"
                className="text-4xl font-bold text-center w-32 bg-transparent outline-none"
                style={{ color: COLOR.ink }}
              />
              <span className="text-2xl font-bold" style={{ color: COLOR.inkSoft }}>{t("kg")}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {[1, 5, 10, 25].map((v) => (
                <button key={v} onClick={() => set({ weight: String((parseFloat(draft.weight) || 0) + v) })}
                  className="px-3.5 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>
                  +{v}
                </button>
              ))}
            </div>
          </>
        )}

        {stepId === "source" && (
          <>
            <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("sourceType")}</div>
            <div className="grid grid-cols-2 gap-3">
              {[["household", "🏠"], ["shop", "🏪"], ["office", "🏢"], ["collectionPoint", "📍"], ["scrapyard", "🏗️"], ["otherSrc", "❔"]].map(([id, icon]) => (
                <button
                  key={id}
                  onClick={() => set({ sourceType: id })}
                  className="rounded-2xl p-4 flex flex-col items-center gap-1.5"
                  style={draft.sourceType === id
                    ? { backgroundColor: COLOR.teal, color: COLOR.white }
                    : { backgroundColor: COLOR.white, color: COLOR.ink, border: `1px solid ${COLOR.line}` }}
                >
                  <span className="text-2xl">{icon}</span>
                  <span className="text-xs font-semibold">{t(id)}</span>
                </button>
              ))}
            </div>
            <div>
              <div className="text-sm font-semibold mb-2" style={{ color: COLOR.ink }}>{t("location")}</div>
              <div className="flex flex-wrap gap-2">
                {LOCALITIES.map((loc) => (
                  <button key={loc} onClick={() => set({ location: loc })}
                    className="px-3.5 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5"
                    style={draft.location === loc ? { backgroundColor: COLOR.teal, color: COLOR.white } : { backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>
                    <MapPin size={13} /> {loc}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {stepId === "review" && (() => {
          const est = computeEstimate(draft.category, parseFloat(draft.weight) || 0, draft.condition);
          return (
            <>
              <div className="font-bold text-lg" style={{ color: COLOR.ink }}>{t("estimatedValue")}</div>
              <Card style={{ backgroundColor: COLOR.tealSoft, border: "none" }}>
                <div className="text-sm" style={{ color: COLOR.teal }}>{draft.weight}{t("kg")} {cat[lang] || cat.en}</div>
                <div className="text-xs" style={{ color: COLOR.inkSoft }}>₹{est?.rate}{t("perKg")}</div>
                <div className="text-3xl font-bold mt-1" style={{ color: COLOR.tealDark }}>{t("approx")} ₹{est?.value}</div>
              </Card>
              <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("estimateDisclaimer")}</div>
              <Card>
                {est?.confidence === "high" ? (
                  <div className="flex items-start gap-2"><CheckCircle2 size={16} color="#1F6B3A" className="mt-0.5" /><div><div className="text-sm font-semibold" style={{ color: COLOR.ink }}>{t("highConf")}</div><div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("highConfSub")}</div></div></div>
                ) : (
                  <div className="flex items-start gap-2"><AlertTriangle size={16} color="#8A6110" className="mt-0.5" /><div><div className="text-sm font-semibold" style={{ color: COLOR.ink }}>{t("lowConf")}</div><div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("lowConfSub")}</div></div></div>
                )}
              </Card>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <StatBlock label={t("condition")} value={t(draft.condition + "Cond")} />
                <StatBlock label={t("location")} value={draft.location} />
              </div>
            </>
          );
        })()}

        <div className="mt-2">
          {stepId === "review" ? (
            <Btn full onClick={finishWizard} icon={CheckCircle2}>{t("save")}</Btn>
          ) : (
            <Btn full onClick={next} disabled={!canNext} icon={ArrowRight}>{t("next")}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Recycler matching (collector side) --------------------------------- */
function RecyclerListScreen(props) {
  const { t, lang, collectorLots, activeLotId, setScreen, setSelectedRecyclerId } = props;
  const lot = collectorLots.find((l) => l.id === activeLotId);
  if (!lot) return null;
  const matches = scoreRecyclers(lot.category);

  return (
    <div className="pb-6">
      <ScreenHeader title={t("matchesFor")} onBack={() => setScreen("lotDetail")} />
      <div className="px-4 flex flex-col gap-3">
        {matches.length === 0 && (
          <div className="text-sm text-center py-10" style={{ color: COLOR.inkSoft }}>{t("noRecyclerFound")}</div>
        )}
        {matches.map((r) => (
          <Card key={r.id} onClick={() => { setSelectedRecyclerId(r.id); setScreen("recyclerDetail"); }}>
            <RecyclerCardBody r={r} t={t} category={lot.category} />
          </Card>
        ))}
      </div>
    </div>
  );
}

function RecyclerCardBody({ r, t, category }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-bold text-sm" style={{ color: COLOR.ink }}>{r.name}</div>
          <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: COLOR.inkSoft }}><MapPin size={11} />{r.location} · {r.distanceKm} km</div>
        </div>
        <Pill tone="good"><ShieldCheck size={11} /> {t("authVerified")}</Pill>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {r.pickup && <Pill>{t("pickupAvailable")}</Pill>}
        </div>
        <div className="font-bold" style={{ color: COLOR.teal }}>₹{r.offeredRate ?? r.rates[category]}{t("perKg")}</div>
      </div>
    </div>
  );
}

function RecyclerDetailScreen(props) {
  const { t, lang, collectorLots, activeLotId, setScreen, requestPickupFor, selectedRecyclerId } = props;
  const lot = collectorLots.find((l) => l.id === activeLotId);
  const matches = lot ? scoreRecyclers(lot.category) : [];
  const r = matches.find((m) => m.id === selectedRecyclerId) || matches[0];
  if (!lot || !r) return <ScreenHeader title="—" onBack={() => setScreen("lotDetail")} />;
  const rate = r.rates[lot.category];

  return (
    <div className="pb-6">
      <ScreenHeader title={r.name} onBack={() => setScreen("recyclerList")} />
      <div className="px-4 flex flex-col gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <Pill tone="good"><ShieldCheck size={12} /> {t("authVerified")}</Pill>
            <span className="text-xs" style={{ color: COLOR.inkSoft }}>{r.authRef}</span>
          </div>
          <div className="text-xs" style={{ color: COLOR.inkSoft }}>{r.authType}</div>
          <div className="text-xs" style={{ color: COLOR.inkSoft }}>Last verified: {r.authDate}</div>
        </Card>

        <div className="grid grid-cols-2 gap-2.5">
          <StatBlock label={t("distance")} value={`${r.distanceKm} km`} />
          <StatBlock label={t("quotedByRecycler")} value={`₹${rate}${t("perKg")}`} accent={COLOR.teal} />
          <StatBlock label={t("pickupAvailable")} value={r.pickup ? "✓" : "✕"} />
          <StatBlock label={t("serviceArea")} value={r.serviceArea} />
        </div>

        <div>
          <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("matchedBecause")}</div>
          <div className="flex flex-col gap-1.5">
            {r.reasons.map((rk) => (
              <div key={rk} className="flex items-center gap-2 text-sm" style={{ color: COLOR.ink }}>
                <CheckCircle2 size={14} color="#1F6B3A" /> {t(rk)}
              </div>
            ))}
          </div>
        </div>

        <Card style={{ backgroundColor: COLOR.marigoldSoft, border: "none" }}>
          <div className="text-xs font-semibold" style={{ color: "#8A6110" }}>{t("estimatedValue")}: ₹{lot.estimatedValue}</div>
          <div className="text-xs" style={{ color: "#8A6110" }}>{t("quotedByRecycler")} × {lot.weight}{t("kg")} ≈ ₹{Math.round(rate * lot.weight)}</div>
        </Card>

        <div className="flex gap-2">
          <Btn variant="outline" full icon={Phone}>{t("call")}</Btn>
          {r.pickup ? (
            <Btn full icon={Truck} onClick={() => { requestPickupFor(lot.id, r.id, rate); setScreen("lotDetail"); }}>{t("requestPickup")}</Btn>
          ) : (
            <Btn full icon={CheckCircle2} onClick={() => { requestPickupFor(lot.id, r.id, rate); setScreen("lotDetail"); }}>{t("selectRecycler")}</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- Earnings ------------------------------------------------------------- */
function EarningsTab(props) {
  const { t, collectorLots, setActiveLotId, setScreen } = props;
  const completed = collectorLots.filter((l) => l.status === "COMPLETED");
  const total = completed.reduce((s, l) => s + (l.finalValue ?? l.estimatedValue), 0);
  const pending = collectorLots.filter((l) => l.status === "PICKUP_REQUESTED" || l.status === "OFFER_RECEIVED")
    .reduce((s, l) => s + l.estimatedValue, 0);
  const thisMonth = total; // demo dataset is all within the current month

  if (collectorLots.length === 0) {
    return <div className="px-4 pt-16 text-center text-sm" style={{ color: COLOR.inkSoft }}>{t("noHistoryYet")}</div>;
  }

  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <div className="text-lg font-bold" style={{ color: COLOR.ink }}>{t("earnings")}</div>
      <Card style={{ backgroundColor: COLOR.teal, border: "none" }}>
        <div className="text-xs font-medium" style={{ color: "#CFE3D6" }}>{t("totalEarnings")}</div>
        <div className="text-3xl font-bold" style={{ color: COLOR.white }}>₹{total.toLocaleString("en-IN")}</div>
      </Card>
      <div className="grid grid-cols-2 gap-2.5">
        <StatBlock label={t("pendingDues")} value={`₹${pending.toLocaleString("en-IN")}`} accent={COLOR.marigold === "" ? undefined : "#8A6110"} />
        <StatBlock label={t("thisMonth")} value={`₹${thisMonth.toLocaleString("en-IN")}`} />
      </div>
      <div className="text-sm font-bold mt-1" style={{ color: COLOR.ink }}>{t("txHistory")}</div>
      <div className="flex flex-col gap-2">
        {collectorLots.filter((l) => l.status === "COMPLETED" || l.status === "PICKUP_REQUESTED").map((l) => {
          const cat = CAT_BY_ID[l.category];
          return (
            <Card key={l.id} onClick={() => { setActiveLotId(l.id); setScreen("lotDetail"); }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm" style={{ color: COLOR.ink }}>{cat[props.lang] || cat.en}</div>
                  <div className="text-xs" style={{ color: COLOR.inkSoft }}>{new Date(l.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold" style={{ color: COLOR.teal }}>₹{l.finalValue ?? l.estimatedValue}</div>
                  <Pill tone={l.status === "COMPLETED" ? "good" : "warn"}>{l.status === "COMPLETED" ? t("paid") : t("pendingPay")}</Pill>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="h-2" />
    </div>
  );
}

/* ---- More / Safety -------------------------------------------------------- */
function MoreTab(props) {
  const { t, lang, setScreen, area } = props;
  return (
    <div className="px-4 pt-4 flex flex-col gap-3">
      <div className="text-lg font-bold" style={{ color: COLOR.ink }}>{t("more")}</div>
      <Card onClick={() => setScreen("safety")} className="flex items-center gap-3">
        <ShieldCheck size={20} color={COLOR.teal} /><span className="font-semibold text-sm" style={{ color: COLOR.ink }}>{t("safetyCenter")}</span>
      </Card>
      <Card className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: COLOR.ink }}>{t("languageSetting")}</span>
        <span className="text-sm" style={{ color: COLOR.inkSoft }}>{lang === "hi" ? "हिंदी" : lang === "mr" ? "मराठी" : "English"}</span>
      </Card>
      <Card className="flex items-center justify-between">
        <span className="font-semibold text-sm" style={{ color: COLOR.ink }}>{t("switchArea")}</span>
        <span className="text-sm" style={{ color: COLOR.inkSoft }}>{area}</span>
      </Card>
      <Card>
        <div className="font-semibold text-sm mb-1" style={{ color: COLOR.ink }}>{t("aboutProduct")}</div>
        <div className="text-xs" style={{ color: COLOR.inkSoft }}>{STR.appName[lang]} — {STR.tagline[lang]}</div>
      </Card>
    </div>
  );
}

function SafetyScreen(props) {
  const { t, lang, setScreen } = props;
  return (
    <div className="pb-6">
      <ScreenHeader title={t("safetyCenter")} onBack={() => setScreen(null)} />
      <div className="px-4 flex flex-col gap-3">
        {SAFETY_TOPICS.map((s) => (
          <Card key={s.id}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.severity === "high" ? COLOR.claySoft : COLOR.marigoldSoft, color: s.severity === "high" ? COLOR.clay : "#8A6110" }}>
                {s.icon}
              </div>
              <div className="font-bold text-sm" style={{ color: COLOR.ink }}>{s.title[lang]}</div>
            </div>
            <div className="text-sm mb-2" style={{ color: COLOR.inkSoft }}>{s.body[lang]}</div>
            <ListenBtn text={s.body[lang]} lang={lang} label={t("listen")} />
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---- Receipt --------------------------------------------------------------- */
function ReceiptScreen(props) {
  const { t, lang, collectorLots, activeLotId, setScreen } = props;
  const lot = collectorLots.find((l) => l.id === activeLotId);
  if (!lot) return null;
  const cat = CAT_BY_ID[lot.category];
  const recycler = lot.recyclerId ? RCY_BY_ID[lot.recyclerId] : null;
  const dt = lot.events.find((e) => e.key === "Material handed over")?.at || lot.createdAt;

  return (
    <div className="pb-6">
      <ScreenHeader title={t("receiptTitle")} onBack={() => setScreen("lotDetail")} />
      <div className="px-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: COLOR.white, border: `1.5px dashed ${COLOR.teal}` }}>
          <div className="text-center mb-3">
            <div className="font-bold" style={{ color: COLOR.teal }}>{STR.appName[lang]}</div>
            <div className="text-[11px]" style={{ color: COLOR.inkSoft }}>{t("receiptTitle")}</div>
          </div>
          <div className="text-center py-2 mb-3 rounded-xl" style={{ backgroundColor: COLOR.tealSoft }}>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: COLOR.teal }}>{t("reference")}</div>
            <div className="font-bold" style={{ color: COLOR.tealDark, fontFamily: "monospace" }}>{lot.handoverRef}</div>
          </div>
          <ReceiptRow label={t("material")} value={`${cat[lang] || cat.en}`} />
          <ReceiptRow label={t("approx")} value={`${lot.weight} ${t("kg")}`} />
          <ReceiptRow label={t("finalWeight")} value={`${lot.finalWeight ?? "—"} ${t("kg")}`} />
          <ReceiptRow label={t("quotedValue")} value={`₹${lot.quotedPrice ? Math.round(lot.quotedPrice * lot.weight) : lot.estimatedValue}`} />
          <ReceiptRow label={t("finalSaleValue")} value={`₹${lot.finalValue ?? lot.estimatedValue}`} bold />
          <ReceiptRow label={t("recyclerLbl")} value={recycler?.name || "—"} />
          <ReceiptRow label={t("handoverDate")} value={new Date(dt).toLocaleDateString("en-IN")} />
          <ReceiptRow label={t("timeLbl")} value={new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} />
          <ReceiptRow label={t("location")} value={lot.location} />
          <ReceiptRow label={t("paymentMethod")} value={lot.paymentMethod === "digital" ? t("digital") : t("cash")} />
          <ReceiptRow label={t("paymentStatus")} value={lot.paymentStatus === "PAID" ? t("paid") : t("pendingPay")} />
          <ReceiptRow label={t("recyclerConfirmation")} value={t("verified")} />
          <div className="flex justify-center mt-3">
            <QrCode size={64} color={COLOR.tealDark} />
          </div>
          <div className="text-center text-[10px] mt-2" style={{ color: COLOR.inkSoft }}>{t("demoDataTag")}</div>
        </div>
      </div>
    </div>
  );
}
function ReceiptRow({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-dashed" style={{ borderColor: COLOR.line }}>
      <span className="text-xs" style={{ color: COLOR.inkSoft }}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold" : "font-medium"}`} style={{ color: bold ? COLOR.teal : COLOR.ink }}>{value}</span>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Recycler app                                                            */
/* ---------------------------------------------------------------------- */
function RecyclerApp({ t, lang, lots, activeRecyclerId, recyclerAcceptLot, confirmHandoverFor, transactions }) {
  const [screen, setScreen] = useState("dashboard");
  const [activeLotId, setActiveLotId] = useState(null);
  const recycler = RCY_BY_ID[activeRecyclerId];

  const incoming = lots.filter((l) => l.category && recycler.accepts.includes(l.category) &&
    ["READY", "MATCHING", "OFFER_RECEIVED", "PICKUP_REQUESTED"].includes(l.status) &&
    (l.recyclerId === null || l.recyclerId === activeRecyclerId));
  const handled = lots.filter((l) => l.recyclerId === activeRecyclerId && l.status === "COMPLETED");

  if (screen === "lotDetail" && activeLotId) {
    const lot = lots.find((l) => l.id === activeLotId);
    return <RecyclerLotDetail {...{ t, lang, lot, recycler, setScreen, recyclerAcceptLot, confirmHandoverFor }} />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4">
        <div className="mb-1 text-xs font-semibold" style={{ color: COLOR.inkSoft }}>{t("recyclerRole")}</div>
        <div className="text-lg font-bold mb-1" style={{ color: COLOR.ink }}>{recycler.name}</div>
        <div className="flex items-center gap-2 mb-4">
          <Pill tone={recycler.auth === "VERIFIED" ? "good" : recycler.auth === "EXPIRED" ? "bad" : "warn"}>
            {recycler.auth === "VERIFIED" ? t("authVerified") : recycler.auth === "EXPIRED" ? t("authExpired") : t("authPending")}
          </Pill>
          <Pill tone="demo">{t("demoDataTag")}</Pill>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <StatBlock label={t("incomingLots")} value={incoming.length} />
          <StatBlock label={t("txCompleted")} value={handled.length} />
        </div>

        <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("incomingLots")}</div>
        <div className="flex flex-col gap-2.5">
          {incoming.length === 0 && <div className="text-sm py-6 text-center" style={{ color: COLOR.inkSoft }}>{t("noLotsYet")}</div>}
          {incoming.map((lot) => {
            const cat = CAT_BY_ID[lot.category];
            return (
              <Card key={lot.id} onClick={() => { setActiveLotId(lot.id); setScreen("lotDetail"); }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{cat.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ color: COLOR.ink }}>{cat[lang] || cat.en} · {lot.weight}{t("kg")}</div>
                      <div className="text-xs flex items-center gap-1" style={{ color: COLOR.inkSoft }}><MapPin size={11} />{lot.location} · {lot.id}</div>
                    </div>
                  </div>
                  <Pill tone={statusTone(lot.status)}>{t(LOT_STATUS_KEY[lot.status] || "readyStatus")}</Pill>
                </div>
              </Card>
            );
          })}
        </div>

        {handled.length > 0 && (
          <>
            <div className="text-sm font-bold mt-5 mb-2" style={{ color: COLOR.ink }}>{t("txCompleted")}</div>
            <div className="flex flex-col gap-2">
              {handled.map((lot) => (
                <div key={lot.id} className="flex items-center justify-between text-sm rounded-xl px-3.5 py-2.5" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }}>
                  <span style={{ color: COLOR.ink }}>{lot.id}</span>
                  <span className="font-bold" style={{ color: COLOR.teal }}>₹{lot.finalValue}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RecyclerLotDetail({ t, lang, lot, recycler, setScreen, recyclerAcceptLot, confirmHandoverFor }) {
  const cat = CAT_BY_ID[lot.category];
  const [rate, setRate] = useState(recycler.rates[lot.category] || 0);
  const [finalWeight, setFinalWeight] = useState(lot.weight);
  const [finalValue, setFinalValue] = useState(Math.round((lot.quotedPrice || rate) * lot.weight));
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [confirmedRef, setConfirmedRef] = useState(null);

  const stage = lot.status; // READY -> quote -> OFFER_RECEIVED/PICKUP_REQUESTED -> handover

  return (
    <div className="h-full overflow-y-auto pb-6">
      <ScreenHeader title={lot.id} onBack={() => setScreen("dashboard")} right={<Pill tone={statusTone(lot.status)}>{t(LOT_STATUS_KEY[lot.status])}</Pill>} />
      <div className="px-4 flex flex-col gap-4">
        {lot.photo && <img src={lot.photo} className="w-full h-40 object-cover rounded-2xl" alt="lot" />}
        <Card>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-2xl">{cat.icon}</span>
            <div className="font-bold" style={{ color: COLOR.ink }}>{cat[lang] || cat.en}</div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <StatBlock label={t("approxWeightNote").split(" ")[0] || "Weight"} value={`${lot.weight} ${t("kg")}`} />
            <StatBlock label={t("location")} value={lot.location} />
            <StatBlock label={t("estimatedValue")} value={`₹${lot.estimatedValue}`} />
            <StatBlock label={t("condition")} value={t(lot.condition + "Cond")} />
          </div>
        </Card>

        {(stage === "READY" || stage === "MATCHING") && (
          <Card>
            <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("giveOffer")}</div>
            <div className="flex items-center gap-2 mb-3">
              <input type="number" value={rate} onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                className="text-2xl font-bold w-28 text-center rounded-xl py-2" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.tealDark }} />
              <span className="text-sm" style={{ color: COLOR.inkSoft }}>{t("perKg")}</span>
            </div>
            <div className="text-xs mb-3" style={{ color: COLOR.inkSoft }}>{t("totalQuotedValue")}: ₹{Math.round(rate * lot.weight)}</div>
            <Btn full icon={CheckCircle2} onClick={() => recyclerAcceptLot(lot.id, recycler.id, rate)}>{t("acceptLot")}</Btn>
          </Card>
        )}

        {stage === "OFFER_RECEIVED" && (
          <Card style={{ backgroundColor: COLOR.tealSoft, border: "none" }}>
            <div className="text-sm font-semibold" style={{ color: COLOR.teal }}>{t("offerReceivedStatus")}</div>
            <div className="text-xs" style={{ color: COLOR.inkSoft }}>₹{lot.quotedPrice}{t("perKg")} — {t("pickupWaiting")}</div>
          </Card>
        )}

        {stage === "PICKUP_REQUESTED" && !confirmedRef && (
          <Card>
            <div className="text-sm font-bold mb-3" style={{ color: COLOR.ink }}>{t("confirmHandover")}</div>
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: COLOR.inkSoft }}>{t("finalWeight")}</div>
                <input type="number" value={finalWeight} onChange={(e) => setFinalWeight(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl px-3 py-2.5 font-bold" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.tealDark }} />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: COLOR.inkSoft }}>{t("finalValue")}</div>
                <input type="number" value={finalValue} onChange={(e) => setFinalValue(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl px-3 py-2.5 font-bold" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.tealDark }} />
              </div>
              <div>
                <div className="text-xs font-semibold mb-1" style={{ color: COLOR.inkSoft }}>{t("paymentMethod")}</div>
                <div className="flex gap-2">
                  {["cash", "digital"].map((m) => (
                    <button key={m} onClick={() => setPaymentMethod(m)}
                      className="flex-1 rounded-xl py-2 text-sm font-semibold"
                      style={paymentMethod === m ? { backgroundColor: COLOR.teal, color: COLOR.white } : { backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>
                      {t(m)}
                    </button>
                  ))}
                </div>
              </div>
              <Btn full icon={CheckCircle2} onClick={() => {
                const ref = confirmHandoverFor(lot.id, { finalWeight, finalValue, paymentMethod, paymentStatus: "PAID" });
                setConfirmedRef(ref);
              }}>{t("confirmTransaction")}</Btn>
            </div>
          </Card>
        )}

        {(confirmedRef || stage === "COMPLETED") && (
          <Card style={{ backgroundColor: COLOR.tealSoft, border: "none" }}>
            <div className="flex items-center gap-2 text-sm font-bold" style={{ color: COLOR.teal }}>
              <CheckCircle2 size={16} /> {t("completedStatus")}
            </div>
            <div className="text-xs mt-1 font-mono" style={{ color: COLOR.inkSoft }}>{confirmedRef || lot.handoverRef}</div>
          </Card>
        )}

        <div>
          <div className="text-sm font-bold mb-2" style={{ color: COLOR.ink }}>{t("timeline")}</div>
          <Timeline events={lot.events} />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin console                                                           */
/* ---------------------------------------------------------------------- */
function AdminConsole({ t, lots, transactions, lang, adminLotQuery, setAdminLotQuery, onLock }) {
  const [tab, setTab] = useState("overview");
  const totalWeight = transactions.reduce((s, tx) => s + (tx.weight || 0), 0);
  const totalValue = transactions.reduce((s, tx) => s + (tx.finalPrice || 0), 0);
  const pendingSync = lots.filter((l) => l.syncStatus === "PENDING_SYNC").length;
  const flagged = transactions.filter((tx) => tx.flagged);
  const collectors = new Set(lots.map((l) => l.collectorId));

  const foundLot = adminLotQuery ? lots.find((l) => l.id.toLowerCase() === adminLotQuery.trim().toLowerCase()) : null;

  const TABS = [
    { id: "overview", label: t("overview"), icon: ListChecks },
    { id: "materials", label: t("materialsDataset"), icon: Package },
    { id: "prices", label: t("priceDataset"), icon: IndianRupee },
    { id: "recyclers", label: t("recyclerDataset"), icon: Recycle },
    { id: "transactions", label: t("transactionDataset"), icon: Wallet },
    { id: "trace", label: t("traceabilityLookup"), icon: QrCode },
    { id: "ai", label: t("aiStatus"), icon: Sparkles },
    { id: "unit", label: t("unitEconomics"), icon: TrendingUp },
  ];

  return (
    <div className="w-full max-w-[980px] rounded-3xl overflow-hidden flex" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}`, minHeight: 640 }}>
      <div className="w-52 shrink-0 p-3 flex flex-col gap-1" style={{ backgroundColor: COLOR.tealDark }}>
        <div className="px-2 py-3 flex items-center gap-2">
          <Recycle size={18} color={COLOR.marigold} />
          <span className="font-bold text-sm" style={{ color: COLOR.white }}>{STR.appName.en} Admin</span>
        </div>
        {onLock && (
          <button onClick={onLock} className="mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold" style={{ color: "#B7C9BF", backgroundColor: "rgba(255,255,255,0.06)" }}>
            <ShieldCheck size={14} /> Lock console
          </button>
        )}
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-left"
            style={tab === tb.id ? { backgroundColor: "rgba(255,255,255,0.12)", color: COLOR.white } : { color: "#B7C9BF" }}>
            <tb.icon size={16} /> {tb.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("overview")}</div>
            <div className="grid grid-cols-4 gap-3">
              <StatBlock label={t("activeCollectors")} value={collectors.size} />
              <StatBlock label={t("activeRecyclers")} value={RECYCLERS.filter((r) => r.auth === "VERIFIED").length} />
              <StatBlock label={t("lotsCreated")} value={lots.length} />
              <StatBlock label={t("txCompleted")} value={transactions.length} />
              <StatBlock label={t("totalWeight")} value={`${totalWeight.toFixed(1)} kg`} />
              <StatBlock label={t("totalValue")} value={`₹${totalValue.toLocaleString("en-IN")}`} />
              <StatBlock label={t("pendingSyncCount")} value={pendingSync} accent={pendingSync ? COLOR.clay : undefined} />
              <StatBlock label={t("flaggedTx")} value={flagged.length} accent={flagged.length ? COLOR.clay : undefined} />
            </div>
            <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: COLOR.marigoldSoft, color: "#8A6110" }}>
              <div className="font-semibold mb-1">{t("fieldValidationRequired")}</div>
              This prototype has not yet been validated with real collectors in the field. Before a pilot, at least two
              scrap collectors / aggregators should be interviewed and the workflow adjusted from their feedback — see
              the README's field-research template.
            </div>
          </div>
        )}

        {tab === "materials" && (
          <DatasetTable
            title={t("materialsDataset")}
            columns={["Lot ID", "Category", "Weight", "Condition", "Source", "Location", "Status"]}
            rows={lots.map((l) => [l.id, CAT_BY_ID[l.category][lang] || CAT_BY_ID[l.category].en, `${l.weight} kg`, l.condition, l.sourceType, l.location, l.status])}
          />
        )}

        {tab === "prices" && (
          <DatasetTable
            title={t("priceDataset")}
            columns={["Price ID", "Category", "Location", "Date", "Price/kg", "Quality"]}
            rows={PRICE_HISTORY.map((p) => [p.id, p.category, p.location, p.date, `₹${p.price}`, p.quality])}
          />
        )}

        {tab === "recyclers" && (
          <div className="flex flex-col gap-3">
            <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("recyclerDataset")}</div>
            <Pill tone="demo">{t("demoDataWarning")}</Pill>
            <DatasetTable
              columns={["ID", "Name", "Location", "Accepts", "Authorization", "Pickup", "Service area"]}
              rows={RECYCLERS.map((r) => [r.id, r.name, r.location, r.accepts.join(", "), r.auth, r.pickup ? "Yes" : "No", r.serviceArea])}
            />
          </div>
        )}

        {tab === "transactions" && (
          <div className="flex flex-col gap-3">
            <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("transactionDataset")}</div>
            <DatasetTable
              columns={["Txn ID", "Lot", "Recycler", "Weight", "Final ₹", "Payment", "Status", "Flag"]}
              rows={transactions.map((tx) => [tx.id, tx.lotId, RCY_BY_ID[tx.recyclerId]?.name.split(" — ")[0] || tx.recyclerId, `${tx.weight} kg`, `₹${tx.finalPrice}`, `${tx.paymentMethod}/${tx.paymentStatus}`, tx.status, tx.flagged ? "⚠️" : ""])}
            />
          </div>
        )}

        {tab === "trace" && (
          <div className="flex flex-col gap-4">
            <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("traceabilityLookup")}</div>
            <div className="flex gap-2 max-w-md">
              <input value={adminLotQuery} onChange={(e) => setAdminLotQuery(e.target.value)} placeholder={t("enterLotId")}
                className="flex-1 rounded-xl px-3.5 py-2.5" style={{ border: `1px solid ${COLOR.line}` }} />
              <div className="flex flex-wrap gap-1.5 items-center">
                {lots.slice(0, 3).map((l) => (
                  <button key={l.id} onClick={() => setAdminLotQuery(l.id)} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: COLOR.tealSoft, color: COLOR.teal }}>{l.id}</button>
                ))}
              </div>
            </div>
            {foundLot ? (
              <div className="max-w-lg">
                <div className="text-sm mb-3" style={{ color: COLOR.inkSoft }}>
                  {foundLot.collectorId} → {CAT_BY_ID[foundLot.category][lang] || CAT_BY_ID[foundLot.category].en} → {foundLot.weight} kg → {foundLot.recyclerId ? RCY_BY_ID[foundLot.recyclerId].name : "—"}
                </div>
                <Timeline events={foundLot.events} />
              </div>
            ) : adminLotQuery ? (
              <div className="text-sm" style={{ color: COLOR.inkSoft }}>No lot found for "{adminLotQuery}".</div>
            ) : null}
          </div>
        )}

        {tab === "ai" && (
          <div className="flex flex-col gap-4 max-w-lg">
            <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("aiStatus")}</div>
            <Card>
              <div className="font-semibold text-sm mb-1" style={{ color: COLOR.ink }}>Material sub-type suggestion</div>
              <div className="text-xs mb-2" style={{ color: COLOR.inkSoft }}>Input: chosen category + "not sure" flag. Output: top sub-type by historical frequency + fixed 62% placeholder confidence.</div>
              <Pill tone="warn">{t("ruleBasedNote")}</Pill>
            </Card>
            <Card>
              <div className="font-semibold text-sm mb-1" style={{ color: COLOR.ink }}>Valuation estimate</div>
              <div className="text-xs" style={{ color: COLOR.inkSoft }}>rate(category, recycler) × weight × condition multiplier. Confidence is "high" only for categories with ≥3 recent demo price points (PCB, cables, batteries); otherwise "limited data".</div>
            </Card>
            <Card>
              <div className="font-semibold text-sm mb-1" style={{ color: COLOR.ink }}>Anomaly detection</div>
              <div className="text-xs" style={{ color: COLOR.inkSoft }}>Flags a transaction when final value differs from the estimate/quote by more than 40%. Labelled "{t("requiresReview")}", never "fraudulent".</div>
              {flagged.map((f) => (
                <div key={f.id} className="mt-2 text-xs rounded-lg px-2.5 py-1.5 flex items-center gap-1.5" style={{ backgroundColor: COLOR.claySoft, color: COLOR.clay }}>
                  <AlertTriangle size={12} /> {f.id}: {f.flagReason}
                </div>
              ))}
            </Card>
            <div className="text-xs rounded-xl px-3.5 py-2.5" style={{ backgroundColor: COLOR.marigoldSoft, color: "#8A6110" }}>
              No trained ML model exists in this prototype. Every prediction above is a transparent rule/heuristic, clearly labelled, with the collector always able to override it. A real classifier would need a labelled image dataset collected during a pilot — see README.
            </div>
          </div>
        )}

        {tab === "unit" && <UnitEconomics t={t} />}
      </div>
    </div>
  );
}

function DatasetTable({ title, columns, rows }) {
  return (
    <div className="flex flex-col gap-3">
      {title && <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{title}</div>}
      <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${COLOR.line}` }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: COLOR.tealSoft }}>
              {columns.map((c) => <th key={c} className="text-left px-3 py-2 font-semibold whitespace-nowrap" style={{ color: COLOR.teal }}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLOR.line}` }}>
                {r.map((cell, j) => <td key={j} className="px-3 py-2 whitespace-nowrap" style={{ color: COLOR.ink }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UnitEconomics({ t }) {
  const [volume, setVolume] = useState(100);
  const [informalPrice, setInformalPrice] = useState(110);
  const [informalTransport, setInformalTransport] = useState(200);
  const [platformPrice, setPlatformPrice] = useState(148);
  const [platformTransport, setPlatformTransport] = useState(150);
  const [platformFee, setPlatformFee] = useState(3);

  const informalNet = volume * informalPrice - informalTransport;
  const platformNet = volume * platformPrice - platformTransport - volume * platformFee;

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="text-xl font-bold" style={{ color: COLOR.ink }}>{t("unitEconomics")}</div>
      <div className="text-xs" style={{ color: COLOR.inkSoft }}>{t("demoDataTag")} — all figures below are editable illustrative assumptions, not measured field data.</div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="font-bold text-sm mb-3" style={{ color: COLOR.ink }}>Existing informal route</div>
          <NumField label="Material volume (kg)" value={volume} onChange={setVolume} />
          <NumField label="Avg. selling price (₹/kg)" value={informalPrice} onChange={setInformalPrice} />
          <NumField label="Transport cost (₹)" value={informalTransport} onChange={setInformalTransport} />
          <div className="mt-3 pt-3 border-t" style={{ borderColor: COLOR.line }}>
            <div className="text-xs" style={{ color: COLOR.inkSoft }}>Net earnings</div>
            <div className="text-2xl font-bold" style={{ color: COLOR.ink }}>₹{informalNet.toLocaleString("en-IN")}</div>
          </div>
        </Card>
        <Card style={{ backgroundColor: COLOR.tealSoft, border: "none" }}>
          <div className="font-bold text-sm mb-3" style={{ color: COLOR.tealDark }}>Platform-supported route</div>
          <NumField label="Recycler price (₹/kg)" value={platformPrice} onChange={setPlatformPrice} />
          <NumField label="Pickup/transport (₹)" value={platformTransport} onChange={setPlatformTransport} />
          <NumField label="Platform fee (₹/kg)" value={platformFee} onChange={setPlatformFee} />
          <div className="mt-3 pt-3 border-t" style={{ borderColor: COLOR.teal }}>
            <div className="text-xs" style={{ color: COLOR.tealDark }}>Net earnings</div>
            <div className="text-2xl font-bold" style={{ color: COLOR.tealDark }}>₹{platformNet.toLocaleString("en-IN")}</div>
          </div>
        </Card>
      </div>
      <div className="text-sm rounded-xl px-3.5 py-2.5" style={{ backgroundColor: platformNet > informalNet ? "#DDEFE2" : COLOR.claySoft, color: platformNet > informalNet ? "#1F6B3A" : COLOR.clay }}>
        {platformNet > informalNet
          ? `At these assumptions, the platform route earns the collector ₹${(platformNet - informalNet).toLocaleString("en-IN")} more.`
          : `At these assumptions, the informal route currently earns ₹${(informalNet - platformNet).toLocaleString("en-IN")} more — adjust the platform fee or recycler price to see what makes formal routing attractive.`}
      </div>
    </div>
  );
}
function NumField({ label, value, onChange }) {
  return (
    <div className="mb-2">
      <div className="text-[11px] mb-1" style={{ color: COLOR.inkSoft }}>{label}</div>
      <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-lg px-2.5 py-1.5 text-sm font-semibold" style={{ backgroundColor: COLOR.white, border: `1px solid ${COLOR.line}` }} />
    </div>
  );
}

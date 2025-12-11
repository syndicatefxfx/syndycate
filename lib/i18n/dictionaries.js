export const DEFAULT_LANGUAGE = "he";

export const languages = [
  {
    code: "en",
    label: "EN",
  },
  {
    code: "he",
    label: "HE",
  },
];

export const dictionaries = {
  en: {
    header: {
      nav: {
        program: "Program",
        tariffs: "Tariffs",
        faq: "FAQ",
      },
      menuButton: "MENU",
    },
    hero: {
      timer: {
        label: "Time until start:",
        days: "D",
        hours: "H",
        minutes: "M",
      },
      heading: {
        topLine: "THE",
        highlightLines: ["NEW ERA", "OF TRADING"],
        bottomLine: "IN ISRAEL",
      },
      subheadingLines: [
        "CLOSED-COMMUNITY TRAINING FOR THOSE WHO WANT TO MASTER THE MARKET",
        "AND TRADE WITH CONFIDENCE",
      ],
      cta: "Reserve your spot",
      saleBadge: "Hanukkah sale",
    },
    marquee: {
      text: "You don’t need more time. You need the right space.",
    },
    stats: {
      tag: "<ABOUT US>",
      title: {
        primary: "WHAT IS SYNDICATE",
        secondary: "IN NUMBERS?",
      },
      description:
        "WE ARE HAPPY TO PROVIDE YOU WITH ALL OUR COMPETENCIES AND MANY YEARS OF EXPERIENCE TO ACHIEVE YOUR FINANCIAL GOALS",
      items: [
        {
          id: "s1",
          value: "28",
          note: "(01)",
          description:
            "THEORETICAL & PRACTICAL MODULES DESIGNED FOR REAL TRADING RESULTS",
          area: "cell1",
        },
        {
          id: "s2",
          value: "90+",
          note: "(02)",
          description:
            "HOURS OF LIVE ONLINE SESSIONS WITH MENTORS (RECORDINGS INCLUDED)",
          area: "cell2",
        },
        {
          id: "s3",
          value: "60",
          note: "(03)",
          description:
            "DAYS OF ACCESS TO A PRIVATE SYNDICATE COMMUNITY WITH MARKET UPDATES",
          area: "cell3",
        },
        {
          id: "s4",
          value: "42",
          note: "(04)",
          description:
            "PRACTICAL ASSIGNMENTS WITH PERSONAL FEEDBACK + FINAL CERTIFICATION EXAM",
          area: "cell4",
        },
      ],
    },
    advantages: {
      tag: "OUR ADVANTAGES",
      title: ["SYNDICATE", "COMMUNITY SERVER"],
      quote: "“A FOCUSED ENVIRONMENT TURNS SLOW LEARNERS INTO FAST EARNERS.”",
      lead: "We aim to see our students grow by making solid trades. No matter their starting point, they all come looking for the same thing: a real trading community driven by support and experience. After over three years of learning and evolving, we’ve built a space where pros mentor newcomers and everyone levels up together.",
      cards: [
        {
          id: "a1",
          value: "20",
          desc: "CHANNELS FILLED WITH EDUCATIONAL CONTENT, HELPFUL LINKS, MARKET ANALYSIS, LIVE STREAMS, AND INTUITIVE NAVIGATION",
        },
        {
          id: "a2",
          value: "10",
          desc: "CHATS FOR TRADE REVIEWS, MARKET TALKS, PSYCHOLOGY, AND REAL CONNECTION",
        },
        {
          id: "a3",
          value: "35+",
          desc: "hours of educational materials <br/> and guides",
        },
        {
          id: "a4",
          value: "LIVE",
          desc: "CALLS WHERE MENTORS HOST Q&A SESSIONS, ANALYZE THE MARKET, AND PERFORM BACKTESTING",
        },
        {
          id: "a5",
          value: "24/7",
          desc: "HELP WITH ANY QUESTIONS THAT <br/> COME UP DURING LEARNING",
        },
        {
          id: "a6",
          value: "REGULAR",
          desc: "MORNING CALLS WITH MARKET OVERVIEWS",
        },
      ],
    },
    program: {
      titles: {
        desktop: [
          {
            text: "NEW PROGRAM",
          },
          {
            text: "— 28 MODULES",
          },
          {
            text: "A STEP-BY-STEP SYSTEM TO BUILD",
            highlight: true,
          },
          {
            text: "REAL TRADING SKILLS",
          },
        ],
        tablet: [
          {
            text: "NEW PROGRAM",
          },
          {
            text: "— 28 MODULES",
          },
          {
            text: "A STEP-BY-STEP SYSTEM TO BUILD",
            highlight: true,
          },
          {
            text: "REAL TRADING SKILLS",
          },
        ],
      },
      paragraphs: [
        {
          lines: [
            "THE PROGRAM IS DESIGNED FOR BOTH BEGINNERS AND EXPERIENCED TRADERS. YOU’LL GAIN STRUCTURED THEORETICAL AND PRACTICAL KNOWLEDGE, MASTER ESSENTIAL TRADING TOOLS, AND DEVELOP THE DISCIPLINE REQUIRED TO SUCCEED IN A MARKET THAT DOESN’T FORGIVE MISTAKES",
          ],
        },
        {
          lines: [
            "THE COURSE IS CONSTANTLY UPDATED, ENSURING",
            "YOU ALWAYS HAVE ACCESS TO THE LATEST VERSION.",
          ],
          highlight: "ADAPT TO THE MARKET — IT WILL NEVER ADAPT TO YOU",
        },
      ],
      buttons: {
        expand: "The whole program",
        collapse: "Hide program",
      },
      modules: [
        {
          title: "Introduction",
          answer:
            "Understanding what is trading, how it works, and your first steps.",
        },
        {
          title: "Market Structure",
          answer:
            "Market Structure Range, strong and weak swings, advanced structure.",
        },
        {
          title: "Liquidity",
          answer: "Definition, operating principles, and structural liquidity.",
        },
        {
          title: "Premium / Discount Zones",
          answer: "Using the Fibonacci grid and P/D zones.",
        },
        {
          title: "Fair Value Gap",
          answer:
            "Market imbalance, efficient vs. inefficient price delivery, rebalancing and price interaction with gaps, IFVG.",
        },
        {
          title: "Supply & Demand",
          answer:
            'Order Block, Blocks: Breaker, Mitigation, Rejection, Propulsion. "buy to sell" and "sell to buy" manipulation. Price delivery mechanics.',
        },
        {
          title: "Order Flow",
          answer:
            "How price reacts to liquidity, order flow and its components, types of order flow, inducement, examples.",
        },
        {
          title: "Multi-Timeframe Analysis",
          answer:
            "Effective chart analysis, optimal entry and target identification, recognition of key interest zones.",
        },
        {
          title: "Sessions / Part 1",
          answer:
            "Optimal trading periods, liquidity across sessions, raids on previous session high/low, Asia/London and London/New York.",
        },
        {
          title: "Sessions / Part 2",
          answer:
            "Session dynamics, workflow scheme, principle of operation based solely on liquidity and balance.",
        },
        {
          title: "Market Context",
          answer:
            "How to identify context? Context interpretation from SNDCT mentors.",
        },
        {
          title: "Risk Management",
          answer:
            "Risk/reward, how to calculate volume in TradingView for any asset, high vs low RR.",
        },
        {
          title: "Backtest",
          answer: "What is backtest. How to backtest correctly.",
        },
        {
          title: "Statics",
          answer:
            "What is statics, statics in dynamics, how to create your own setup.",
        },
        {
          title: "Dynamics",
          answer: "What is dynamics, example of applying a dynamic approach.",
        },
        {
          title: "Trading Strategy",
          answer:
            "Creating your own trading strategy, optimization, trading strategy templates.",
        },
        {
          title: "Indices",
          answer:
            "How to trade indices, correlations between indices. GER40, NAS100, S&P500.",
        },
        {
          title: "News",
          answer:
            "Forex news calendar, how news affects the market, NFP/CPI reports, FOMC meetings.",
        },
        {
          title: "Useful",
          answer:
            "AMD/PO3, SMT Divergence, causes of resweeps, price assignment, and spread.",
        },
        {
          title: "Technical Psychology",
          answer:
            "Trading plan and rules, managing emotions during trading, risk management and psychology.",
        },
        {
          title: "Roadmap",
          answer:
            "Turning knowledge into action: steps to take after completing your course.",
        },
        {
          title: "Crypto",
          answer: "Trading features, spot, drop, farming/staking.",
        },
        {
          title: "Prop Trading",
          answer:
            "What is prop trading? How to choose the right prop? Prop FAQ.",
        },
        {
          title: "Forex Market",
          answer:
            "Terminology, contract types, trading platforms, fundamentals of brokerage services, and market basics.",
        },
        {
          title: "Algorithms & Dynamics",
          answer: "Trading algorithms, models and long-term strategies.",
        },
        {
          title: "Working with XAU",
          answer:
            "How to trade using 4H/15M charts? Understanding price action and key features.",
        },
        {
          title: "Gold & Indices - Differences from forex",
          answer:
            "Timing manipulations, timing strategies for indices and gold, specifics of trading U.S. indices, and how to trade high risk/reward setups.",
        },
        {
          title: "Market Manipulations",
          answer:
            "Why does sweep and reversal not happen? Reversals, why do we get BE and then TP? How to understand key fractals?",
        },
      ],
      previewCount: 8,
    },
    whoIsFor: {
      tag: "WHO IS THIS FOR?",
      title: {
        prefix: "WHO IS",
        suffix: "THIS FOR?",
      },
      items: [
        {
          id: "w1",
          number: "/01",
          title: "STARTING FROM SCRATCH",
          bullets: [
            "YOU WANT TO START YOUR TRADING JOURNEY FROM ZERO AND BUILD A SOLID FOUNDATION WITH THE RIGHT KNOWLEDGE AND STRUCTURE.",
          ],
        },
        {
          id: "w2",
          number: "/02",
          title: "FIXING A BAD START",
          bullets: [
            "TRADING FEELS MESSY AND CHAOTIC",
            "YOU'VE TRIED TOO MANY TOOLS BUT DON'T KNOW HOW TO USE THEM",
            "YOU HAVE NO CLEAR STRATEGY",
            "YOU'RE NOT CONFIDENT IN YOUR TRADES",
            "YOU STRUGGLE WITH EMOTIONAL DISCIPLINE",
            "YOU LACK A FULL-PICTURE UNDERSTANDING OF HOW MARKETS WORK",
            "YOU WANT TO MANAGE YOUR FIRST LIVE TRADING ACCOUNT",
          ],
        },
        {
          id: "w3",
          number: "/03",
          title: "LEVELING UP",
          bullets: [
            "YOU WANT TO OPTIMIZE YOUR TRADING STRATEGY",
            "YOU'RE LOOKING FOR A STRONG AND FOCUSED COMMUNITY",
            "YOU AIM FOR STABILITY AND CONSISTENCY",
            "YOU WANT TO ACCESS NEW TRADING MARKETS",
            "YOU PLAN TO BUILD A PORTFOLIO ACROSS MULTIPLE PROP FIRMS",
            "YOU'RE READY TO TURN TRADING INTO YOUR MAIN INCOME STREAM",
          ],
        },
      ],
    },
    results: {
      title: {
        top: "AFTER THE PROGRAM",
        highlight: "YOU WILL",
      },
      bullets: [
        ["BUILD YOUR OWN OPTIMIZED", "TRADING STRATEGY"],
        ["UNDERSTAND MARKET LOGIC", "AT A DEEPER LEVEL"],
        ["RECEIVE LIFETIME ACCESS TO UPDATED", "COURSE MATERIALS"],
        ["STAY IN TOUCH WITH YOUR MENTORS EVEN AFTER THE PROGRAM ENDS"],
        ["GAIN ACCESS TO A PRIVATE COMMUNITY OF TRADERS"],
      ],
      cta: "Reserve your spot",
    },
    participation: {
      tag: "TARIFFS",
      title: ["PARTICIPATION", "FORMATS"],
      tariffs: [
        {
          id: "t1",
          title: "BEGINNER",
          mode: "SELF-PACED LEARNING",
          bullets: [
            {
              text: "LIFETIME ACCESS TO MATERIALS",
            },
            {
              text: "ACCESS TO MENTOR SETUPS",
            },
            {
              text: "REGULAR UPDATES",
            },
            {
              text: "NO LIVE CONFERENCES",
              muted: true,
            },
            {
              text: "NO HOMEWORK ASSIGNMENTS",
              muted: true,
            },
            {
              text: "NO TRADING STRATEGY OPTIMIZATION",
              muted: true,
            },
            {
              text: "NO ASSISTANCE WITH PROP CHALLENGE",
              muted: true,
            },
            {
              text: "NO FINAL EXAM",
              muted: true,
            },
          ],
          extra: [
            {
              text: "1 months of free community access",
            },
            {
              text: "Prop firm account for top 1 student — not included",
              muted: true,
            },
            {
              text: "Community Access: 1 months free",
            },
          ],
          price: "$149",
          cta: "Reserve your spot",
        },
        {
          id: "t2",
          title: "ADVANCE",
          mode: "GROUP LEARNING",
          bullets: [
            {
              text: "LIFETIME ACCESS TO MATERIALS",
            },
            {
              text: "ACCESS TO MENTOR SETUPS",
            },
            {
              text: "CHAT WITH MENTORS",
            },
            {
              text: "REGULAR UPDATES",
            },
            {
              text: "LIVE CONFERENCES",
            },
            {
              text: "HOMEWORK ASSIGNMENTS",
            },
            {
              text: "TRADING STRATEGY OPTIMIZATION",
            },
            {
              text: "HELP PASSING PROP CHALLENGE",
            },
            {
              text: "FINAL EXAM",
            },
          ],
          extra: [
            {
              text: "2 months of free community access",
            },
            {
              text: "Prop firm account for the top 1 student in the group",
            },
            {
              text: "Community Access: 2 months free",
            },
          ],
          price: "$699",
          oldPrice: "$799",
          cta: "Reserve your spot",
        },
        {
          id: "t3",
          title: "MENTORSHIP",
          mode: "INDIVIDUAL LEARNING",
          bullets: [
            {
              text: "LIFETIME ACCESS TO MATERIALS",
            },
            {
              text: "ACCESS TO MENTOR SETUPS",
            },
            {
              text: "CHAT WITH MENTORS",
            },
            {
              text: "REGULAR UPDATES",
            },
            {
              text: "LIVE CONFERENCES",
            },
            {
              text: "HOMEWORK ASSIGNMENTS",
            },
            {
              text: "TRADING STRATEGY OPTIMIZATION",
            },
            {
              text: "HELP PASSING PROP CHALLENGE",
            },
            {
              text: "FINAL EXAM",
            },
            {
              text: "ONGOING 1-ON-1 SUPPORT FROM YOUR MENTOR",
            },
            {
              text: "LIFETIME ACCESS TO THE PRIVATE COMMUNITY",
            },
            {
              text: "WE WORK WITH YOU UNTIL YOU GET RESULTS",
            },
            {
              text: "PERSONALIZED ANALYSIS AND TAILORED TRADING STRATEGY",
            },
          ],
          extra: [
            {
              text: "Community Access: lifetime",
            },
          ],
          price: "$???",
          cta: "Check with support",
        },
      ],
      form: {
        placeholders: {
          name: "NAME",
          contactMethod: "CHOOSE CONTACT METHOD",
          telegram: "TELEGRAM NICKNAME OR LINK",
          call: "TELEPHONE NUMBER",
          whatsapp: "WHATSAPP NUMBER",
        },
        contactOptions: [
          {
            value: "call",
            label: "CALL ME",
          },
          {
            value: "telegram",
            label: "TELEGRAM",
          },
          {
            value: "whatsapp",
            label: "WHATSAPP",
          },
        ],
        checkbox: {
          textBefore: "I ACCEPT THE",
          textAfter: "AND CONTRACTUAL OFFERS",
          privacy: "PRIVACY POLICY",
        },
        support: {
          text: "OR CONTACT US DIRECTLY",
          link: "SUPPORT",
        },
        cta: {
          default: "RESERVE YOUR SPOT",
          sending: "SENDING...",
        },
        modalClose: "Close",
        success: {
          title: "THANK YOU",
          message:
            "Thank you for leaving your details, we will contact you soon",
        },
      },
    },
    faq: {
      tag: "FAQ",
      items: [
        {
          question: "HOW LONG WILL I HAVE ACCESS TO THE MATERIALS?",
          answer: "LIFETIME ACCESS WITH ALL PLANS",
        },
        {
          question: "I MISSED A LIVE SESSION — WHAT SHOULD I DO?",
          answer:
            "EVERY SESSION IS RECORDED. THE REPLAY WILL BE IN YOUR DASHBOARD WITHIN 24 H.",
        },
        {
          question: "I DON’T HAVE A TRADING DEPOSIT YET — WHAT SHOULD I DO?",
          answer:
            "THE COURSE TEACHES RISK-FREE SIMULATION FIRST. YOU CAN START WITHOUT CAPITAL.",
        },
        {
          question: "CAN I JOIN THE COMMUNITY WITHOUT TAKING THE COURSE?",
          answer: "YES. COMMUNITY-ONLY ACCESS IS AVAILABLE AS A SEPARATE PLAN.",
        },
      ],
    },
    footer: {
      privacy: "PRIVACY POLICY",
      rights: "ALL RIGHTS RESERVED",
      copyright: "©2025",
    },
  },
  he: {
    header: {
      nav: {
        program: "Program",
        tariffs: "Tariffs",
        faq: "FAQ",
      },
      menuButton: "MENU",
    },
    hero: {
      timer: {
        label: "זמן עד ההתחלה:",
        days: "י",
        hours: "ש",
        minutes: "ד",
      },
      heading: {
        topLine: "THE",
        highlightLines: ["NEW ERA", "OF TRADING"],
        bottomLine: "IN ISRAEL",
      },
      subheadingLines: [
        "הכשרה בקהילה סגורה למי שרוצה לשלוט בשוק ולסחור בביטחון",
      ],
      cta: "שריין את המקום שלך",
      saleBadge: "הנחת חנוכה",
    },
    marquee: {
      text: "You don’t need more time. You need the right space.",
    },
    stats: {
      tag: "<עלינו>",
      title: {
        primary: "מה זה Syndicate",
        secondary: "במספרים?",
      },
      description:
        "אנחנו כאן בשביל לשתף אתכם בכל מה שלמדנו מהניסיון שלנו – כדי שתוכלו להגיע למטרות הכלכליות שלכם",
      items: [
        {
          id: "s1",
          value: "28",
          note: "(01)",
          description: "מודולים תיאורטיים ומעשיים שנבנו לתוצאות מסחר אמיתיות",
          area: "cell1",
        },
        {
          id: "s2",
          value: "+90",
          note: "(02)",
          description: "שעות של מפגשי אונליין עם מנטורים (כולל הקלטות)",
          area: "cell2",
        },
        {
          id: "s3",
          value: "60",
          note: "(03)",
          description: "ימי גישה לקהילת Syndicate סגורה עם ניתוחי שוק",
          area: "cell3",
        },
        {
          id: "s4",
          value: "42",
          note: "(04)",
          description: "משימות מעשיות עם פידבק אישי + מבחן הסמכה מסכם",
          area: "cell4",
        },
      ],
    },
    advantages: {
      tag: "היתרונות שלנו",
      title: ["קהילת", "Syndicate"],
      quote: "״סביבה ממוקדת הופכת לומדים איטיים למרוויחים מהירים.״",
      lead: "המטרה שלנו היא לראות את התלמידים שלנו גדלים דרך עסקאות חזקות. לא משנה מאיפה הם מתחילים – כולם באים בשביל אותו דבר: קהילת מסחר אמיתית שמבוססת על תמיכה וניסיון. אחרי יותר משלוש שנים של למידה והתפתחות, בנינו מקום שבו סוחרים מנוסים מלווים את החדשים – וכולם עולים רמה יחד.",
      cards: [
        {
          id: "a1",
          value: "20",
          desc: "ערוצים עם תוכן לימודי, לינקים שימושיים, ניתוחי שוק, שידורים חיים וניווט נוח",
        },
        {
          id: "a2",
          value: "10",
          desc: "צ׳אטים לפידבק על עסקאות, שיחות שוק, פסיכולוגיה וחיבור אמיתי",
        },
        {
          id: "a3",
          value: "+35",
          desc: "שעות של חומרי לימוד ומדריכים",
        },
        {
          id: "a4",
          value: "LIVE",
          desc: "שיחות לייב עם המנטורים: Q&A, ניתוח שוק ובק-טסטים",
        },
        {
          id: "a5",
          value: "24/7",
          desc: "עזרה בכל שאלה שעולה בזמן הלימודים",
        },
        {
          id: "a6",
          value: "REGULAR",
          desc: "שיחות בוקר קבועות עם סקירת שוק",
        },
      ],
    },
    program: {
      titles: {
        desktop: [
          {
            text: "תוכנית חדשה —",
          },
          {
            text: "28 מודולים",
          },
          {
            text: "מערכת צעד-אחר-צעד כדי לפתח",
            highlight: true,
          },
          {
            text: "מסחר אמיתי שעובד",
          },
        ],
        tablet: [
          {
            text: "תוכנית חדשה —",
          },
          {
            text: "28 מודולים",
          },
          {
            text: "מערכת צעד-אחר-צעד כדי לפתח",
            highlight: true,
          },
          {
            text: "מסחר אמיתי שעובד",
          },
        ],
      },
      paragraphs: [
        {
          lines: [
            "התוכנית בנויה גם למתחילים וגם לסוחרים שכבר פעילים. תקבל ידע מסחר – תיאורטי ומעשי – תכיר את כל הכלים החשובים למסחר ותפתח את המשמעת שצריך כדי להצליח בשוק שלא סולח על טעויות.",
          ],
        },
        {
          lines: [
            "הקורס מתעדכן כל הזמן, כך שתמיד תהיה לך גישה לגרסה הכי עדכנית.",
          ],
          highlight: "תתאים את עצמך לשוק – הוא אף פעם לא יתאים את עצמו אליך.",
        },
      ],
      buttons: {
        expand: "כל התוכנית",
        collapse: "הסתר את התוכנית",
      },
      modules: [
        {
          title: "מבוא",
          answer: "להבין מה זה מסחר, איך זה עובד ומה הצעדים הראשונים שלך.",
        },
        {
          title: "מבנה השוק",
          answer: "טווחי מבנה שוק, שאיים חזקים וחלשים במבנה, מבנה מתקדם.",
        },
        {
          title: "נזילות",
          answer: "הגדרה, עקרונות פעולה ונזילות מבנית.",
        },
        {
          title: "אזורי פרימיום / דיסקאונט",
          answer: "שימוש ברשת פיבונאצ׳י ובאזורי P/D.",
        },
        {
          title: "פער ערך הוגן (FVG)",
          answer:
            "אי־איזון בשוק, מסירת מחיר יעילה לעומת לא יעילה, ריבלנסינג ואיך המחיר מגיב לגאפים, IFVG.",
        },
        {
          title: "היצע וביקוש",
          answer:
            'אזורי Order Block, בלוקים: breaker, mitigation, rejection, propulsion. מנגנוני "buy to sell" ו-"sell to buy". מנגנוני מסירת מחיר.',
        },
        {
          title: "זרימת הוראות (Order Flow)",
          answer:
            "איך המחיר מגיב לנזילות, מה זה זרימת הוראות ומה המרכיבים שלה, סוגי זרימת הוראות, אינדוסמנט, דוגמאות.",
        },
        {
          title: "ניתוח רב-טיימפריים",
          answer:
            "ניתוח גרפים יעיל, זיהוי נקודות כניסה ויעדים אופטימליים, והבנה באזורי עניין מרכזיים.",
        },
        {
          title: "סשנים / חלק 1",
          answer:
            "זמני מסחר אופטימליים, נזילות בין סשנים, לקיחת נזילות מהשיא/שפל של הסשן הקודם, אסיה-לונדון ולונדון-ניו יורק.",
        },
        {
          title: "סשנים / חלק 2",
          answer:
            "דינמיקה של הסשן, תרשים עבודה, עיקרון פעולה שמבוסס רק על נזילות ואיזון.",
        },
        {
          title: "הקשר שוק",
          answer:
            'איך לזהות את הקונטקסט? פירוש הקונטקסט ע"י המנטורים של Syndicate.',
        },
        {
          title: "ניהול סיכונים",
          answer:
            "ניהול סיכונים, איך לחשב גודל פוזיציה לכל נכס, יחס סיכוי-סיכון גבוה מול נמוך.",
        },
        {
          title: "בק-טסט",
          answer: "מה זה בק-טסט ואיך עושים אותו בצורה נכונה.",
        },
        {
          title: "סטטיקה",
          answer: "מה זה סטטיקה, סטטיקה בתוך דינמיקה, איך לבנות סטאפ אישי.",
        },
        {
          title: "דינמיקה",
          answer: "מה זו דינמיקה, ואיך משתמשים בזה במסחר – עם דוגמה.",
        },
        {
          title: "אסטרטגיית מסחר",
          answer:
            "איך לבנות לעצמך אסטרטגיית מסחר, איך לשפר/לייעל אותה, ותבניות מוכנות לאסטרטגיות.",
        },
        {
          title: "מדדים",
          answer:
            "איך לסחור מדדים, קשרי קורלציה בין מדדים, GER40, NAS100, S&P500.",
        },
        {
          title: "חדשות",
          answer:
            "לוח חדשות פורקס, איך חדשות משפיעות על השוק, דוחות NFP/CPI, ישיבות ה-FOMC.",
        },
        {
          title: "שימושי",
          answer: "AMD/PO3, סטיית SMT, סיבות ל-resweeps, קביעת מחיר, וספרד.",
        },
        {
          title: "פסיכולוגיה טכנית",
          answer:
            "תוכנית מסחר וכללי עבודה, איך לשלוט ברגשות בזמן מסחר, חיבור בין ניהול סיכונים לפסיכולוגיית מסחר.",
        },
        {
          title: "מפת דרכים",
          answer: "להפוך את הידע למעשה: הצעדים שכדאי לעשות אחרי סיום הקורס.",
        },
        {
          title: "קריפטו",
          answer: "מסחר בחוזים (futures), ספוט, דרופים, farming/staking.",
        },
        {
          title: "מסחר נוסטרו",
          answer:
            "מה זה מסחר בחברת נוסטרו, איך לבחור חברת נוסטרו שמתאימה לך, ושאלות נפוצות על נוסטרו.",
        },
        {
          title: "שוק הפורקס",
          answer:
            "מונחים בסיסיים, סוגי חוזים, פלטפורמות מסחר, איך ברוקר עובד ומה הבסיס של השוק.",
        },
        {
          title: "אלגוריתמים דינמיקה",
          answer: "אלגוריתמי מסחר, מודלים ואסטרטגיות לטווח ארוך.",
        },
        {
          title: "עבודה עם XAU (זהב)",
          answer:
            "איך לסחור דרך גרפים 4h/15m, להבין את ה-price action והדגשים העיקריים בזהב.",
        },
        {
          title: "זהב ומדדים – במה הם שונים מפורקס",
          answer:
            "מניפולציות של טיימינג, שיטות טיימינג למסחר במדדים ובזהב, מה מיוחד במסחר במדדים אמריקאיים, ואיך לסחור סטאפים עם יחס סיכוי-סיכון גבוה.",
        },
        {
          title: "מניפולציות בשוק",
          answer:
            "למה לפעמים יש sweep אבל אין היפוך? למה יש היפוך אבל קודם מוציאים אותנו על BE ואז זה הולך ל-TP? איך לזהות ולקרוא פרקטלים חשובים.",
        },
      ],
      previewCount: 8,
    },
    whoIsFor: {
      tag: "למי זה מיועד?",
      title: {
        prefix: "למי זה",
        suffix: "מיועד?",
      },
      items: [
        {
          id: "w1",
          number: "/01",
          title: "מתחילים מאפס",
          bullets: [
            "אתה רוצה להתחיל את הדרך שלך במסחר מאפס ולבנות בסיס חזק עם ידע נכון ומבנה מסודר.",
          ],
        },
        {
          id: "w2",
          number: "/02",
          title: "לתקן התחלה לא טובה",
          bullets: [
            "המסחר מרגיש מבולגן וכאוטי",
            "ניסית יותר מדי כלים ולא ברור לך איך לעבוד איתם",
            "אין לך אסטרטגיה ברורה",
            "אתה לא מספיק בטוח בעסקאות שלך",
            "קשה לך עם משמעת רגשית במסחר",
            "חסרה לך תמונה מלאה של איך השווקים עובדים",
            "אתה רוצה להתחיל לנהל חשבון מסחר אמיתי ראשון",
          ],
        },
        {
          id: "w3",
          number: "/03",
          title: "להעלות רמה",
          bullets: [
            "אתה רוצה לחדד/לייעל את אסטרטגיית המסחר שלך",
            "אתה מחפש קהילה חזקה וממוקדת",
            "אתה מכוון ליציבות ולעקביות",
            "אתה רוצה להיכנס לשווקי מסחר חדשים",
            "אתה מתכנן לבנות פורטפוליו בכמה חברות נוסטרו",
            "אתה מוכן להפוך את המסחר להכנסה העיקרית שלך",
          ],
        },
      ],
    },
    results: {
      title: {
        top: "אחרי התוכנית",
        highlight: "אתה",
      },
      bullets: [
        ["תבנה לעצמך אסטרטגיית מסחר מותאמת ומשופרת"],
        ["תבין את הלוגיקה של השוק ברמה עמוקה יותר"],
        ["תקבל גישה לכל חומרי הקורס המתעדכנים בלי הגבלה בזמן"],
        ["תישאר בקשר עם המנטורים גם אחרי שהתוכנית נגמרת"],
        ["תיכנס לקהילה סגורה של סוחרים"],
      ],
      cta: "שריין את המקום שלך",
    },
    participation: {
      tag: "מסלולי השתתפות",
      title: ["מסלולי", "השתתפות"],
      tariffs: [
        {
          id: "t1",
          title: "Beginner",
          mode: "לימודים בקצב אישי",
          bullets: [
            {
              text: "גישה לכל החומרים לכל החיים",
            },
            {
              text: "גישה לסטאפים של המנטורים",
            },
            {
              text: "עדכונים שוטפים",
            },
            {
              text: "ללא שיחות לייב",
              muted: true,
            },
            {
              text: "ללא מטלות בית",
              muted: true,
            },
            {
              text: "ללא אופטימיזציית אסטרטגיה",
              muted: true,
            },
            {
              text: "ללא סיוע באתגרי Prop",
              muted: true,
            },
            {
              text: "ללא מבחן סיום",
              muted: true,
            },
          ],
          extra: [
            {
              text: "חודש אחד גישה חינמית לקהילה",
            },
            {
              text: "חשבון חברת נוסטרו למצטיין – לא כלול",
              muted: true,
            },
            {
              text: "גישה לקהילה: חודש בחינם",
            },
          ],
          price: "$149",
          cta: "שריין את המקום שלך",
        },
        {
          id: "t2",
          title: "Advance",
          mode: "למידה בקבוצה",
          bullets: [
            {
              text: "גישה לכל החומרים לכל החיים",
            },
            {
              text: "גישה לסטאפים של המנטורים",
            },
            {
              text: "צ׳אט עם המנטורים",
            },
            {
              text: "עדכונים שוטפים",
            },
            {
              text: "שיחות לייב",
            },
            {
              text: "מטלות בית",
            },
            {
              text: "אופטימיזציית אסטרטגיה",
            },
            {
              text: "סיוע במעבר אתגר נוסטרו",
            },
            {
              text: "מבחן סיום",
            },
          ],
          extra: [
            {
              text: "חודשיים גישה חינמית לקהילה",
            },
            {
              text: "חשבון חברת נוסטרו למצטיין בקבוצה",
            },
            {
              text: "גישה לקהילה: חודשיים בחינם",
            },
          ],
          price: "$699",
          oldPrice: "$799",
          cta: "שריין את המקום שלך",
        },
        {
          id: "t3",
          title: "Mentorship",
          mode: "למידה אישית",
          bullets: [
            {
              text: "גישה לכל החומרים לכל החיים",
            },
            {
              text: "גישה לסטאפים של המנטורים",
            },
            {
              text: "צ׳אט עם המנטורים",
            },
            {
              text: "עדכונים שוטפים",
            },
            {
              text: "שיחות לייב",
            },
            {
              text: "מטלות בית",
            },
            {
              text: "אופטימיזציית אסטרטגיה",
            },
            {
              text: "סיוע במעבר אתגר נוסטרו",
            },
            {
              text: "מבחן סיום",
            },
            {
              text: "ליווי אחד-על-אחד מתמשך מהמנטור",
            },
            {
              text: "גישה לכל החיים לקהילה הסגורה",
            },
            {
              text: "עובדים איתך עד שיש תוצאות",
            },
            {
              text: "ניתוח אישי ובניית אסטרטגיית מסחר מותאמת לך",
            },
          ],
          extra: [
            {
              text: "גישה לקהילה: לכל החיים",
            },
          ],
          price: "$???",
          cta: "דבר עם התמיכה",
        },
      ],
      form: {
        placeholders: {
          name: "שם מלא",
          contactMethod: "בחרו דרך תקשורת",
          telegram: "שם משתמש או קישור בטלגרם",
          call: "מספר טלפון",
          whatsapp: "מספר ווטסאפ",
        },
        contactOptions: [
          {
            value: "call",
            label: "חזרו אליי",
          },
          {
            value: "telegram",
            label: "טלגרם",
          },
          {
            value: "whatsapp",
            label: "ווטסאפ",
          },
        ],
        checkbox: {
          textBefore: "אני מאשר/ת את",
          textAfter: "ואת ההצעות החוזיות",
          privacy: "מדיניות הפרטיות",
        },
        support: {
          text: "או דברו איתנו ישירות",
          link: "תמיכה",
        },
        cta: {
          default: "שלחו לי פרטים",
          sending: "שולחים...",
        },
        modalClose: "סגור",
        success: {
          title: "תודה",
          message: "תודה שהשארת את הפרטים שלך, ניצור איתך קשר בקרוב",
        },
      },
    },
    faq: {
      tag: "שאלות נפוצות",
      items: [
        {
          question: "כמה זמן תהיה לי גישה לחומרים?",
          answer: "בכל המסלולים – גישה לכל החיים.",
        },
        {
          question: "פספסתי שיעור לייב – מה עושים?",
          answer: "כל שיעור מוקלט. ההקלטה תופיע בקהילה בתוך 24 שעות.",
        },
        {
          question: "אין לי עדיין כסף למסחר – מה עושים?",
          answer:
            "מתחילים להתאמן על חשבון דמו / סימולטור בלי סיכון. אפשר להתחיל גם בלי כסף.",
        },
        {
          question: "אפשר להצטרף לקהילה בלי לקחת את הקורס?",
          answer: "כן. יש הצטרפות לקהילה בלבד.",
        },
      ],
    },
    footer: {
      privacy: "מדיניות פרטיות",
      rights: "כל הזכויות שמורות",
      copyright: "©2025",
    },
  },
};

export function getDictionary(language) {
  return dictionaries[language] ?? dictionaries[DEFAULT_LANGUAGE];
}

// بيانات الحالة والوضع (عمرة أو حج)
    let ritualMode = localStorage.getItem("mutawwif_mode") || "umrah"; // "umrah" أو "hajj"
    let currentStage = parseInt(localStorage.getItem("mutawwif_stage")) || 1;
    let currentLap = parseInt(localStorage.getItem("mutawwif_lap")) || 1;
    let currentFontSize = parseInt(localStorage.getItem("mutawwif_fontsize")) || 18;

    const umrahStages = [
      { id: 1, name: "الإحرام" },
      { id: 2, name: "الطواف" },
      { id: 3, name: "الركعتان" },
      { id: 4, name: "السعي" },
      { id: 5, name: "الختام" }
    ];

    const tawafSupplications = [
      "«أول رؤية للكعبة: اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام..»",
      "سبحان الله والحمد لله ولا إله إلا الله والله أكبر، ولا حول ولا قوة إلا بالله العلي العظيم، والصلاة والسلام على رسول الله صلى الله عليه وسلم، اللهم إيمانـاً بك، وتصديقاً بكتابك، ووفاء بعهدك، واتباعاً لسنة نبيك وحبيبك محمد صلى الله عليه وسلم، اللهم إني أسألك العفو والعافية والمعافاة الدائمة في الدين والدنيا والآخرة، والفوز بالجنة والنجاة من النار، اللهم إنا نسألك إيماناً لا يزول ويقيناً لا ينفذ ومرافقة نبيك في الجنة، اللهم اجعل حجاً مبروراً وذنباً مغفوراً وسعياً مشكوراً، اللهم اجعل حبك أحب الأشياء إليَّ واجعل خشيتك أخوف الأشياء عندي واقطع عني حاجات الدنيا بالشوق إلى لقائك، واذا أقررت أعين أهل الدنيا من دنياهم فأقرر عيني من عبادتك , اللهم اغفر لي ولوالدي ولمشايخي وإخواني ولمن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم إن هذا البيت بيتك، والحرم حرمك، والأمن أمنك، والعبد عبدك، وأنا عبدك وابن عبدك، وهذا مقام العائد بك من النار، اللهم فحرم لحومنا وبشرتنا على النار، اللهم إن بيتك عظيم، وجهك كريم، وأنت أرحم الراحمين فأعذني من النار ومن الشيطان الرجيم، وحرّم لحمي ودمني على النار، وآمني من أهواء يوم القيامة، واكفني مؤونة الدنيا والآخرة، اللهم حبّب إلينا الإيمان وزيّنه في قلوبنا وكره إلينا الكفر والفسوق والعصيان واجعلنا من الراشدين، اللهم ارزقنا حبك وحب من يححب وحب من ينفعنا حبّه عندك، اللهم ما رزقتني مما أحب فاجعلـه قوة لي فيما تححب، اللهم وما زويت عني مما أحب فاجعلـه فراغاً لي فيما تحب، اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين",

      "اللهم إني أعوذ بك من الشك والشرك والشقاق والنفاق وسوء الأخلاق وسوء المنظر والمنقلب في المال والأهل والولد، اللهم إني أسألك رضاك والجنة وأعوذ بك من سخطك والنار، اللهم إني أعوذ بك من فتنة القبر، وأعوذ بك من فتنة المحيا والممات، وأعوذ بك من الكفر والفقر، وأعوذ بك من الخزي في الدنيا والآخرة، اللهم إني أعوذ بك من غلبة الدين وغلبة العدو وشماتة الأعداء، اللهم قني عذابك يوم تبعث عبادك، اللهم اكفني شر الفتن وادفع عني البلايا والمحن ما ظهر منها وما بطن، اللهم إني أعوذ بك من علم لا ينفع ومن قلب لا يخخشع ومن نفس لا تشبع ومن عمل لا يرفع ومن دعاء لا يسمع . اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم اجعلـها عمرة مبروراً، وسعياً مشكوراً، وذنباً مغفوراً، وعملاً صالحاً مبروراً، وتجارة لن تبور، يا عالم مافي الصدور، أخرجني من الظلمات إلى النور، اللهم إني أسألك موجبات رحمتك، وعزائم مغفرتك، والسلامة من كل إثم والغنيمة من كل بر والفوز بالجنة، والنجاة من النار، لا تدع لي ذنباً إلا غفرته، ولا همّ إلا فرّجته ولا ديناً إلا قضيته ولا حاجة إلا قضيتها . رب قنعني بما رزقتني وبارك لي فيما أعطيتني، اللهم اغفر لي خطيئتي وجهلي وإسرافي في أمري وما أنت أعلم به مني، اللهم اغفر لي خطئي وعمدي وهزلي وجدي وكل ذلك عندي، اللهم اغفر لي ما قدّمت وما أخّرت وما أسررت وما أعلنتُ، أنت المقدم وأنت المؤخر وأنت على كل شيء قدير . اللهم اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم أظلني تحت ظلّ عرشك يوم لا ظل إلا ظلك ولا باقٍ إلا وجهك واسقني من حوض نبيك سيدنا محمد صلّى الله عليه وسلم شربة هنيئة مريئة لا أظمأ بعدها أبداً، اللهم إني أسألك من خير ما سألك نبيك محمد صلّى الله عليه وسلم، اللهم إني أسألك الجنة ونعيمها وما يقربني إليها من قولٍ أو فعلٍ أو عمل، اللهم اهدني بالهدى ووفقني للتقوى واغفر لي في الآخرة والأولى . اللهم افتح مسامع قلبي لذكرك وارزقني طاعتك وطاعة رسولك وعملاً بكتابك، اللهم توفنا مسلمين وألحقنا بالصالحين واغفر لنا ذنوبنا يوم الدين . ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين.",

      "اللهم إن لك حقوقاً كثيرة فيما بيني وبينك وحقوقاً كثيرة فيما بيني وبين خلقك؛ اللهم ما كان لك منها فاغفره لي وما كان لخلقك فتحمله عني، وأغنني بحلالك عن حرامك وبطاعتك عن معصيتك وبفضلك عمن سواك يا واسع المغفرة. اللهم إن بيتك عظيم ووجهك كريم، وأنت يا الله حليم كريم تححب العفو فاعف عني يا كريم، اللهم هذا حالنا لا يخفى عليك وهذا ذلنا ظاهر بين يدين فعاملنا بالإحسان إذ الفضل منك وإليك . اللهم عافني في قدرتك وأدخلني في رحمتك واقض أجلي في طاعتك واختم لي بخير عمل واجعل ثوابه الجنة . اللهم كما حسَّنتَ خَلقي فحسُّن خُلُقي. ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين .",

      "اللهم إني أسألك إيماناً كاملاً ويقيناً صادقاً ورزقاً واسعاً وقلباً خاشعاً ولساناً ذاكراً وحلالاً طيباً وتوبةً نصوحاً وتويةً قبل الموت وراحة عند الموت ومغفرة ورحمة بعد الموت والعفو عند الحساب والفوز بالجنة والنجاة من النار برحمتك يا عزيز ويا غفار، رب زدني علماً ومعرفة واشرح صدري لذكرك ومحبتك وأسكن قلبي خشيتك وارزقني حبك وحُبّ من يححب وحب عمل صالح يقربني إلى حبك . رب توفني مسلماً وألحقني بالصالحين واغفر لي خطيئتي يوم الدين ولا تخزني يوم يبعثون ربِّ اغفر لي ولوالدي ولمشايخي وإخواني ومن أوصاني واستوصاني وللمسلمين أجمعين"
    ];

    const saySupplications = [
      "الله أكبر الله أكبر الله أكبر الله أكبر كبيراً والحمد لله كثيراً وسبحان الله العظيم وبحمده الكريم بكرة وأصيلا، الله أكبر على ما هدانا، والحمد لله على ما أُولانا، لا إله إلا الله وحده صدق وعده ونصر عبده وأعز جنده وهزم الأحزاب وحده، لا شيء قبله ولا شيء بعده يحيي ويميت وهو حيّ دائم لا يموت ولا يفوت أبداً، بيده الخير وإليه المصير، وهو على كل شيء قدير، اللهم انقلني من ذل المعاصي إلى عِزّ الطاعة واكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك، اللهم إني أسألك مما عندك، وأفض عليّ من فضلك، وانشر عليّ من رحمتك، وأنزل عليّ من بركاتك.اللهم إنك قلت ادعوني استجب لكم وإنك لا تخلف الميعاد، وإنّا سألناك يا رب كما هديتنام للإسلام أن لا تنزعه منا حتى تتوفانا ونحن مسلمين، اللهم إنّا نسألك موجبات رحمتك وعزائم مغفرتك والغنيمة من كل بر والسلامة من كل إثم والفوز بالجنة والنجاة من النار، لا تدع لي ذنباً إلا غفرته ولا همّاً إلا فرجته ولا ديناً إلا قضيته يا أرحم الراحمين، ربنا نجنا من النار سالمين غانمين مستبشرين مع عبادك الصالحين، مع الذين أنعمت عليهم من النبيين والصديقين والشهداء والصالحين وحسن أولئك رفيقاً، ذلك الفضل من الله وكفى بالله عليماً، لا إله إلا الله حقاً حقاً لا إله إلا الله تعبداً ورقاً لا إله إلا الله وعبد إلا إياه مخلصين له الدين ولو كره الكافرون، اللهم اجعلنا مع الأئمة الأبرار وأسكنا معهم في دار القرار.اللهم يا شاهداً غير غائب، ويا قريباً غير بعيد ويا غالباً غير مغلوب اجعل لنا من أمرنا فرجاً ومخرجاً وارزقنا من حيث لا نحتسب.",
      "الله أكبر الله أكبر الله أكبر الله أكبر لا إله إلا الله الواحد الفرد الصمد الذي لم يتخذ صاحبة ولا ولداً، ولم يكن له شريك في الملك، ولم يكن له ولي من الذل وكبّره تكبيراً، اللهم إنك قلت في كتابك المنزل ادعوني استجب لكم، إنك لا تخلف الميعاد، ربنا إننا سمعنا منادياً ينادي للإيمان أن آمنوا بربكم فآمنا ربنا فاغفر لنا ذنوبنا وكفّر عنا سيئاتنا وتوفنا مع الأبرار، ربنا وآتنا ما وعدتنا على رسلك ولا تخزنا يوم القيامة إنك لا تخلف الميعاد، ربنا عليك توكلنا وإليك أنبنا وإليك المصير، ربنا اغفر لنا ولإخواننا الذين سبقونا بالإيمان ولا تجعل في قلوبنا غلاً للذين آمنوا، ربنا إنك رؤوف رحيم، ربنا إنا نسألك فرجاً قريباً ونصرأً فتحاً مبيناً، وصبراً جميلا، وعلماً كثيراً نافعاً، ورزقاً واسعاً مباركاً، اللهم إنه لابد لنا من لقائك فاجعل عذرنا عندك مقبولاً وذنبنا مغفوراً، وعلمنا موفوراً، وسعينا مشكوراً، اللهم أجرنا من خزي الدنيا وعذاب الآخرة، وأحسن عاقبتنا في الأمور كلها، واحفظنا بألطافك واسترنا بسترك الجميل، اللهم إليك أرغب وإياك أرجو فتقبل نُسكي ووفقني وارزقني فيه من الخير أكثر مما أطلب ولا تخيبني إنك أنت الجواد الكريم.اللهم يا مقلب قلوب والأبصار ثبّت قلبي على دينك، اللهم اعصمني بدينك وطاعتك وطواعية رسولك، اللهم جنبي حدودك ورسلك وعبادك يحبك ويحب ملائكتك وأبيانك ورسلك وعبادك الصالحين، اللهم يسّر لي اليسرى وجنبي العسرى واغفر للصالحين، اللهم اجعلني من الأئمة المتقين الهادين لي في الآخرة والأولى واجعلني من ورثة النعيم، واغفر لي المهتدين، واجعلني من ورثة النعيم وعرّني يوم يبعثون يوم يبعثون يوم لا ينفع مال ولا بنون إلا من أتى الله بقلب سليم.",
      "الله أكبر الله أكبر الله أكبر الله أكبر وله الحمد ربنا أتمم لنا نورنا واغفر لنا إنك على كل شيء قدير، اللهم إني أسألك من الخير كله عاجله وآجله ما علمتُ منه وما لم أعلم، وأعوذ بك من الشر كله عاجله وآجله ما علمتُ منه وما لم أعلم، وأستغفرك لذنبي وأسألك رحمتك، اللهم ارحم غربتي في الدنيا ومصرعي عند الموت ووحدتي في قبري ومقامي بين يديك، واهدني لأحسن الأخلاق لا يهدي لأحسنها إلا أنت، واصرف عني سيء الأخلاق لا يصرف عني سيئها إلا أنت، اللهم اهدني سُبل السلام ونجني من الظلمات إلى النور.رب زدني علماً ولا تُزغ قلبي بعد إذ هديتني وهب لي من لدنك رحمة إنك أنت الوهاب، اللهم عافني في سمسي وبصري، اللهم اختم بالخيرات أجلي وحقق بفضللك أملي وسهّل رضاک سُبلي وحسّن في جميع الأحوال عملي، اللهم إني أعوذ بك من عذاب القبر وأعوذ بك من شتات الأمر، وأعوذ بك من ضيق الصدر، لا إله إلا أنت سبحانك إني كنت من الظالمين، يا أرحم الراحمين برحمتك عُمنا واكفنا شرّ ما أهمّنا وأغمُّنا وعلى الإيمان الكامل والكتاب والسنة جمعاً توفنا نلقاك وأنت راضٍ عنّا، اللهم إنا نعوذ برضاك من سخطك وبمعافاتك من عقوبتك ونعوذ بك منك لا نحصي ثناء عليك أنت كما أثنيت على نفسك، اللهم إني أسألك الهدى والتقى والعفاف والغنى، اللهم إنك عفو كريم تحب العفو فاعف عنا يا كريم، اللهم أعني على ذكرك وشكرك وحسن عبادتك، اللهم أنت السلام ومنك السلام وإليك السلام السلام فحينا ربنا بالسلام وأدخلنا الجنة دار السلام تباركت وتعاليت يا ذا الجلال والإكرام، نسألك أن تستجيب دعوتنا وتعطينا رغبتنا وتبلغ برضاك مقاصدنا.",
      "الله أكبر الله أكبر الله أكبر الله أكبر، اللهم إني أسألك من خير ما تعلم وأعوذ بك من شر ما تعلم وأستغفرك من كل ما تعلم إنك أنت علام الغيوب، لا إله إلا الله الملك الحق المبين محمد رسول الله الصادق الوعد الأمين، اللهم إني أسألك كما هديتني للإسلام أن لا تنزعه مني حتى تتوفاني وأنا مسلم وأنت راضٍ عني، اللهم اجعل في قلبي نوراً وفي سمعي نوراً وفي بصري نوراً وفي عقل نوراً، نوراً ومن أمامي نوراً ومن خلفي نوراً وعن يمين نوراً وعن شمالي نوراً ومن فوقي نوراً ومن تحتي نوراً وعظم لي نوراً واجعلني نوراً، اللهم اشرح لي صدري ويسر لي أمري ونوّر بصيرتي واقض حاجتي واقبل توبتي وامحُ حوبتي وحقق طلبتي، اللهم إني أعوذ بك من شر وساوس الصدر وشتات الأمر وفتنة القبر، اللهم إني أعوذ بك من شر ما يلج في النهار ومن شر ما تهُبُّ به الرياح يا أرحم الراحمين، سبحانك يا رب ما عبدناك حق عبادتك، سبحانك يا الله ما ذكرناك حق ذكرك، يا الله سبحانك أنت المحسن والمنعم فتفضّل علينا يا رب بالجود والإحسان، اللهم أنعم علينا بالإيمان، وأكرمنا بالعلم والعرفان، وزيّنا بالحلم يا رحمن، وأكرمنا بالتقوى والقرآن، وجمّلنا بالعافية والغفران يا حنان ويا منان. اللهم إني أسألك رضاك والجنة وما قرّب إليها من قول أو فعل أو عمل، اللهم اجعلها حجاً مبروراً وسعياً مشكوراً وذنباً مغفوراً وعملاً صالحاً مقبولاً، اللهم اجعل عمري آخره وخير عملي خواتمه، وخير أيامي يوم لقائك وأنت راضٍ عني يا كريم،اللهم اجعل خير  عمري آخره وخير عملي خواتمه، وخير أيامي يوم لقائك وأنت راضٍ عني يا كريم، اللهم ارحمني بشرك المعاصي ما أبقيتني وارحمني أن أكلّف ما لا يعنيني، وارزقني حسن النظر فيما يرضيك عني، اللهم يا مقلب القلوب والأبصار ثبّت قلبي على دينك، اللهم أعني على ذكرك وشكرك وحسن عبادتك.",
      "«الله أكبر الله أكبر الله أكبر الله أكبر، اللهم إليك توجهتُ وعلى أعتابك وقفتُ ولرحمتك طلبتُ، ومن النار استجرتُ ومن الحجاب عنك استعذتُ ولرضوانك ورحمتك سألتُ، اللهم استجب سؤلي وبلغني منيتي واختم بالصالحات عملي وبارك لي فيما أعطيتني، سبحانك ما أجل قدرك، اللهم حبّب إلينا الإيمان وزينه في قلوبنا وكره إلينا الكفر والفسوق والعصيان واجعلنا من الراشدين، ربنا لا تُزغ قلوبنا بعد إذ هديتنا وهبْ لنا من لدنك رحمة إنك أنت الوهاب، اللهم اغفر لي مغفرة تصلح بها شأني في الدارَين.اللهم قني عذابك يوم تبعث عبادك، اللهم ابسط علينا من بركاتك ورحمتك وفضلك ورزقك، اللهم إني أسألك مما عندك وأفضض علينا من فضلك وانشر علينا من رحمتك وأنزل علينا من بركاتك، اللهم اهدني بالهدى ووفقني للتقوى واختم لي بالحسنى واغفر لي في الآخرة والأولى، اللهم إني أسألك النعيم المقيم الذي لا يحول ولا يزول أبداً، رب اشرح لي صدري ويسر لي أمري، اللهم ثبتني بأمرك وارزقني من فضلك وأيدني بنصرك ونجني من عذابك يوم تبعث عبادك، وأدخلني الجنة مع المتقين الأبرار يا عزيز ويا غفار. اللهم لك الحمد كالذي نقول وخيراً مما نقول، اللهم لك صلاتي ونسكي ومحياي ومماتي وإليك مآبي ولك ربي تراثي، اللهم إني أعوذ بك من عذاب القبر ووسوسة الصدر وشتات الأمر ومن شر كل ذي شر، اللهم أنت ربي لا إله إلا أنت خلقتني وأنا عبدك وأنا على عهدك ووعدك ما استطعت أعوذ بك من شر ما صنعت، أبوء لك بنعمتك علي وأبوء بذنبي فاغفر لي فإنه لا يغفر الذنوب إلا أنت يا أرحم الراحمين.»",
      "الله أكبر الله أكبر الله أكبر الله أكبر لا إله إلا الله وحده صدق وعده ونصر عبده وهزم الأحزاب وحده، لا إله إلا الله ولا نعبد إلا إياه مخلصين له الدين ولو كره الكافرون، اللهم إني أسألك الهدى والتقى والعفاف والغنى، اللهم إني أسألك العفو والعافية والمعافاة الدائمة في الدين والدنيا والآخرة، اللهم إنك عفو كريم تحب العفو فاعفُ عني يا كريم، اللهم لك الحمد كالذي نقول وخيراً مما نقول، اللهم بنورك اهتدينا وبفضلك استغنينا وفي كنفك وإنعامك وعطائك أصبحنا وأمسينا، أنت الأول فليس قبلك شيء، وأنت الآخر فليس بعدك شيء، وأنت الظاهر فليس فوقك شيء، وأنت الباطن فليس دونك شيء، نعوذ بك من العجز والكسل وعذاب القبر وفتنة الغنى، اللهم وفقني لما تحب وترضى، وجنبني عما تسخط وتكره، وثبتني على ملتك وملة خليلك إبراهيم، اللهم انقلي من ذل المعصية إلى عزّ الطاعة، وأغنني بحلالك عن حرامك وبطاعتك عن معصيتك وبفضلك عمن سواك، ونوّر قلبي وقبري وأعذني من الشر كله واجمع لي الخير كله . اللهم اغفر لي ولوالدي وارحمهما كما ربياني صغيراً، ولجميع المؤمنين والمؤمنات الأحياء منهم والأموات يا جميل العفو والمعافاة يا مجيب الدعوات يا كاشف البليات. اللهم إليك خرجنا وبفنائك أنخنا وإليك قصدنا وإلإحسانك تعرضنا، ومن عذابك أشفقنا، وإليك بأثقال الذنوب هربنا، ولبيتك الحرام حججنا، يا من يملك حوائج السائلين، يا من يتفضل بعطائه على الطالبين، اللهم إنك جعلت لكل ضيف قرى، ونحن أضيافك فاجعل قرانا منك الجنة ونعيمها، اللهم إني أتيتك من بلاد بعيدة حتى أنا معروفك تغنيني به عن معروف من سواك يا معروفاً بالمعروف.",
      "الله أكبر الله أكبر الله أكبر الله أكبر، اللهم حبّب إلينا الإيمان وزيّنه في قلوبنا وكرّه إلينا الكفر والفسوق والعصيان واجعلنا من الراشدين، اللهم ثبّت على الإيمان قلبي واشرح بالمعرفة صدري ونوّر بالقرآن فؤادي ونجني من الفتن ما ظهر منها وما بطن، واكفني شر ما أهمّني وادفع عني البلايا والمحن، اللهم اغفر لي مغفرة تُصلح بها شأني في الدارين وارحمني رحمة واسعة أسعد بها في الدارين، وتب عليّ توبة نصوحاً لا أنكثها أبداً، وألزمني سبيل الاستقامة لا أزيغ عنها أبداً، ووفقني لطاعتك ما أبقيتني، اللهم إليك أرغب وإياك أرجو فتقبل نُسكي ووفقني ولا تخيبني إنك أنت الجواد الكريم. اللهم إني أسألك التوفيق والإخلاص والإخلاص ودوام النعم وحسن الختام، اللهم إني أسألك إيماناً كاملاً ويقيناً صادقاً ورزقاً واسعاً وقلباً خاشعاً وشفاءً من كل داء، اللهم إني أسألك إيماناً لا يرتدّ وقرّة عين لا تنقطع ومرافقة نبيك صلى الله عليه وسلم في الجنة، اللهم اكفني بحلالك عن حرامك وأغنني بفضلك عمن سواك، الحمد لله على ما أعطانا، الحمد لله الذي هدانا لهذا وما كنا لنهتدي لولا أن هدانا الله، الحمد لله حمداً كثيراً طيباً مباركاً كما يحبّ ربُّنا ويرضى، اللهم إني ظُلَمتُ نفسي ظلماً كثيراً وإن لا يغفر الذنوب إلا أنت فاغفر لي مغفرة من عندك، وارحمني إنك أنت الغفور الرحيم، يا من لا تنفعه الطاعة ولا تضره المعصية هب لي ما لا ينفعك واغفر لي ما لا يضرك، يا واسع المغفرة. اللهم اغفر لي مغفرة تُصلح بها شأني في الدارين واحفظني في ذلك لأكون بها من جملة السعداء، اللهم لا تجعل آخر العهد بهذا الموقف وارزقنيه ما بقيت أبداً واجعلني في هذا اليوم مستجاباً دعائي، مغفورةً ذنوبي، مقضيةً حوائجي، ميسرةً أموري، وأعطني من الرضوان والرزق الواسع الحلال ما تقَرُّ به عيني، وبارك لي في جميع أموري يا أرحم الراحمين."
    ];

    function saveProgress() {
      localStorage.setItem("mutawwif_mode", ritualMode);
      localStorage.setItem("mutawwif_stage", currentStage);
      localStorage.setItem("mutawwif_lap", currentLap);
      localStorage.setItem("mutawwif_fontsize", currentFontSize);
    }

    function switchRitualMode(mode) {
      ritualMode = mode;
      currentStage = 1;
      currentLap = 1;
      document.getElementById("btn-mode-umrah").classList.toggle("active", mode === "umrah");
      document.getElementById("btn-mode-hajj").classList.toggle("active", mode === "hajj");
      saveProgress();
      renderMutawwifStage();
    }

    function adjustFontSize(delta) {
      currentFontSize = Math.min(Math.max(currentFontSize + delta * 2, 14), 26);
      saveProgress();
      renderMutawwifStage();
    }

    function renderMutawwifStage() {
      const container = document.getElementById("mutawwif-stage-content");
      const stepsContainer = document.getElementById("steps-container");
      const prevBtn = document.getElementById("btn-prev-stage");
      const counterText = document.getElementById("stage-counter-text");
     
      if (!container || !stepsContainer) return;

      // إذا كان المستخدم قد اختر وضع الحج، سنعرض واجهة التطوير
      if (ritualMode === "hajj") {
        stepsContainer.innerHTML = `
          <div class="step-indicator text-center ">
            
            
          </div>
        `;
        if (counterText) counterText.textContent = "";
        if (prevBtn) prevBtn.classList.add("d-none");

        container.innerHTML = `
          <div class="text-center py-">
            <div class="mb-3">
              <i class="bi bi-tools gold fs-1"></i>
            </div>
            <h4 class="gold fw-bold mb-3">مناسك الحج </h4>
            <p class="text-light opacity-85 px-3 mb-4" style="font-size: ${currentFontSize}px;">
           نعمل حالياً على تطوير هذا القسم بعناية ليقدم لك دليلاً متكاملاً لمناسك الحج.
            </p>
            <div class="p-3 rounded-3 bg-dark-subtle border border-gold-subtle text-center">
              <p class="text-warning fw-bold mb-0"><i class="bi bi-clock-history me-1"></i> ترقبونا قريباً في التحديث القادم!</p>
            </div>
          </div>
        `;
        return;
      }

      // عرض مراحل العمرة الاعتيادية (5 مراحل)
      let stages = umrahStages;
      let stepsHtml = "";
      stages.forEach((st, idx) => {
        let statusClass = st.id === currentStage ? "active" : st.id < currentStage ? "completed" : "";
        stepsHtml += `
          <div class="step-indicator text-center ${statusClass}">
            <span class="badge-num">${st.id}</span>
            <small class="d-block mt-1" style="font-size: 0.75rem;">${st.name}</small>
          </div>
        `;
        if (idx < stages.length - 1) {
          stepsHtml += `<div class="step-line"></div>`;
        }
      });
      stepsContainer.innerHTML = stepsHtml;

      if (counterText) counterText.textContent = `المرحلة ${currentStage} من 5`;
      if (prevBtn) prevBtn.classList.toggle("d-none", currentStage === 1);

      let html = "";

      if (currentStage === 1) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-person-heart me-1"></i> الإحرام والنية من الميقات</h4>
            <p class="text-light opacity-85 px-3 mb-3" style="font-size: ${currentFontSize}px;">تُنوي الإحرام بالعمرة قائلًا:</p>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center ">
              <p class="text-gold fw-bold mb-0 mt-5" style="height: 350px; font-size: ${currentFontSize + 4}px;">« اللهم إني نويت العمرة وأحرمت بها لله تعالى عن <span class="text-warning">نفسي</span> <br> فإن حبسني حابس فمحلي حيث حبستني <br> لَبِّيكَ اللَّهُمَّ عُمْرَةً »</p>
            </div>
            <div class="mb-3 ">
              <button class="btn btn-sm btn-outline-warning me-3" data-bs-toggle="modal" data-bs-target="#extraAdiyaMODAL"><i class="bi bi-book me-1"></i> صيغة التلبية</button>
            
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaMODALL"><i class="bi bi-book me-1"></i>  أدعية إضافية</button>
            </div>
            
            <button onclick="nextStage()" class="btn btn-gold-solid rounded-pill px-5 py-2 fw-bold shadow">أتممت الإحرام <i class="bi bi-chevron-left ms-1"></i></button>
          </div>
        `;
      } else if (currentStage === 2) {
        let percent = (currentLap / 7) * 100;
        html = `
          <div class="text-center">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-dark border border-gold text-gold">طواف العمرة</span>
              <span class="text-light font-monospace">الشوط ${currentLap} / 7</span>
            </div>
            <div class="display-4 fw-bold gold mb-1 font-monospace">${currentLap}</div>
            <div class="progress bg-secondary bg-opacity-25 mx-auto mb-3" style="height: 6px; width: 80%;">
              <div class="progress-bar bg-gold" style="width: ${percent}%;"></div>
            </div>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center">
              <p class=" p-3 text-light lh-lg mb-0 " style="height: 350px; font-size: ${currentFontSize}px;">${tawafSupplications[currentLap]}</p>
            </div>
            <div class="mb-3">
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaModal"><i class="bi bi-book me-1"></i> أدعية إضافية</button>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <button onclick="prevLap()" class="btn btn-outline-light px-3 py-2 rounded-pill flex-fill">الشوط السابق</button>
              <button onclick="nextStage()" class="btn btn-gold-solid px-4 py-2 rounded-pill flex-fill fw-bold">أتممت الشوط <i class="bi bi-chevron-left ms-1"></i></button>
            </div>
          </div>
        `;
      } else if (currentStage === 3) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-award me-1"></i> ركعتا سنة الطواف وزمزم</h4>
            <p class="text-light opacity-85 px-2 mb-3" style="font-size: ${currentFontSize}px;">صلِ ركعتين خلف مقام سيدنا ابراهيم واشرب من ماء زمزم.</p>
            <div class="mb-3">
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaMODal"><i class="bi bi-book me-1"></i> دعاء مقام سيدنا ابراهيم عليه السلام  </button>
            </div>
            <div class="mb-3">
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaMODAl"><i class="bi bi-book me-1"></i> دعاء الشرب من ماء زمزم </button>
            </div>
            <button onclick="nextStage()" class="btn btn-gold-solid rounded-pill px-5 py-2 fw-bold shadow">التالي إلى السعي <i class="bi bi-chevron-left ms-1"></i></button>
          </div>
        `;
      } else if (currentStage === 4) {
        let percent = (currentLap / 7) * 100;
        html = `
          <div class="text-center">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge bg-dark border border-gold text-gold">سعي العمرة</span>
              <span class="text-light font-monospace small">الشوط ${currentLap}/7</span>
            </div>
            <div class="display-4 fw-bold gold mb-1 font-monospace">${currentLap}</div>
            <div class="progress bg-secondary bg-opacity-25 mx-auto mb-3" style="height: 6px; width: 80%;">
              <div class="progress-bar bg-gold" style="width: ${percent}%;"></div>
            </div>
            <div class="supplication-box p-3 rounded-3 mb-3 text-center">
              <p class="text-light lh-lg mb-0" style="height: 350px; font-size: ${currentFontSize}px;">${saySupplications[currentLap - 1]}</p>
            </div>
            <div class="mb-3">
              <button class="btn btn-sm btn-outline-warning" data-bs-toggle="modal" data-bs-target="#extraAdiyaMOdal"><i class="bi bi-book me-1"></i> أدعية إضافية</button>
            </div>
            <div class="d-flex gap-2 justify-content-center">
              <button onclick="prevLap()" class="btn btn-outline-light px-3 py-2 rounded-pill flex-fill">الشوط السابق</button>
              <button onclick="nextStage()" class="btn btn-gold-solid px-4 py-2 rounded-pill flex-fill fw-bold">أتممت الشوط <i class="bi bi-chevron-left ms-1"></i></button>
            </div>
          </div>
        `;
      } else if (currentStage === 5) {
        html = `
          <div class="text-center py-3">
            <h4 class="gold fw-bold mb-3"><i class="bi bi-scissors me-1"></i> ختام العمرة</h4>
            <p class="text-light opacity-85 px-2 mb-3" style="font-size: ${currentFontSize}px;">لقد أتممت طوافَك وسعيَك ولله الحمد! قم بالحلق أو التقصير.</p>
            <div class="p-3 rounded mb-3 bg-success bg-opacity-10 border border-success text-center">
              <p class="text-success fw-bold mb-0"> تقبل الله عمرتك وجعلها مبرورة مشكورة <br> وجعل ذنبك مغفورا إن شاء الله!</p>
            </div>
            <div class="d-grid gap-2 mb-3">
              <a href="https://api.whatsapp.com/send?text=الحمد%20لله%20الذي%20بنعمته%20تتم%20الصالحات،%20لقد%20أتممت%20عمرتي%20اليوم%20بفضل%20الله.%20تقبل%20الله%20منا%20ومنكم." target="_blank" class="btn btn-success rounded-pill fw-bold">
                <i class="bi bi-whatsapp me-1"></i> مشاركة إتمام العمرة عبر واتساب
              </a>
            </div>
            <button onclick="confirmReset()" class="btn btn-outline-light rounded-pill px-4 py-2 btn-sm">
              <i class="bi bi-arrow-counterclockwise me-1"></i> البدء من جديد
            </button>
          </div>
        `;
      }

      container.innerHTML = html;
    }

    function nextStage() {
      if (ritualMode === "hajj") return;
      if (currentStage === 2 || currentStage === 4) {
        if (currentLap < 7) {
          currentLap++;
          if (navigator.vibrate) navigator.vibrate(30);
          saveProgress();
          renderMutawwifStage();
          return;
        } else {
          currentLap = 1;
        }
      }
     
      if (currentStage < 5) {
        currentStage++;
        currentLap = 1;
        if (navigator.vibrate) navigator.vibrate(50);
        if (currentStage === 5) saveToHistory();
        saveProgress();
        renderMutawwifStage();
      }
    }

    function prevStage() {
      if (ritualMode === "hajj") return;

      if (currentStage > 1) {
        currentStage--;
        if (currentStage === 2 || currentStage === 4) {
          currentLap = 7;
        }
        saveProgress();
        renderMutawwifStage();
      }
    }

    function prevLap() {
      if (currentLap > 1) {
        currentLap--;
        if (navigator.vibrate) navigator.vibrate(20);
        saveProgress();
        renderMutawwifStage();
      }
    }

    function confirmReset() {
      if (confirm("هل أنت متأكد من رغبتك في إعادة ضبط التقدم والبدء من جديد؟")) {
        currentStage = 1;
        currentLap = 1;
        saveProgress();
        renderMutawwifStage();
      }
    }

    function saveToHistory() {
      let history = JSON.parse(localStorage.getItem("mutawwif_history")) || [];
      let now = new Date().toLocaleString("ar-SA");
      history.unshift({ type: "عمرة", date: now });
      localStorage.setItem("mutawwif_history", JSON.stringify(history));
      loadHistory();
    }

    function loadHistory() {
      const list = document.getElementById("history-list");
      if (!list) return;
      let history = JSON.parse(localStorage.getItem("mutawwif_history")) || [];
      if (history.length === 0) {
        list.innerHTML = `<li class="text-muted">لا توجد إنجازات مسجلة بعد.</li>`;
        return;
      }
      let html = "";
      history.forEach((item, index) => {
        html += `<li class="py-1 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <span><i class="bi bi-check-circle-fill text-gold me-1"></i> إتمام ${item.type}</span>
          <span class="d-flex align-items-center gap-2">
            <span class="font-monospace text-muted small">${item.date}</span>
            <button onclick="deleteHistoryItem(${index})" class="btn btn-sm btn-link text-danger p-0" title="حذف هذا الإنجاز" style="line-height: 1;">
              <i class="bi bi-x-circle-fill"></i>
            </button>
          </span>
        </li>`;
      });
      list.innerHTML = html;
    }

    // حذف إنجاز واحد بعينه من الأرشيف (وليس السجل كاملاً)
    function deleteHistoryItem(index) {
      if (!confirm("هل تريد حذف هذا الإنجاز من الأرشيف؟")) return;
      let history = JSON.parse(localStorage.getItem("mutawwif_history")) || [];
      history.splice(index, 1);
      localStorage.setItem("mutawwif_history", JSON.stringify(history));
      loadHistory();
    }

    function clearHistory() {
      if (confirm("هل تريد مسح سجل الإنجازات بالكامل؟")) {
        localStorage.removeItem("mutawwif_history");
        loadHistory();
      }
    }

    document.addEventListener("DOMContentLoaded", () => {
      renderMutawwifStage();
      loadHistory();
    });
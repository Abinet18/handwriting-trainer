let amharicFonts: { [key: string]: string } = {
	h: 'ሀሁሂሃሄህሆኋ',
	H: 'ሐሑሒሓሔሕሖሗ',
	l: 'ለሉሊላሌልሎሏ',
	m: 'መሙሚማሜምሞሟ',
	s: 'ሰሱሲሳሴስሶሷ',
	S: 'ሸሹሺሻሼሽሾሿ',
	r: 'ረሩሪራሬርሮሯ',
	v: 'ቨቩቪቫቬቭቮቯ',
	z: 'ዘዙዚዛዜዝዞዟ',
	t: 'ተቱቲታቴትቶቷ',
	b: 'በቡቢባቤብቦቧ',
	n: 'ነኑኒናኔንኖኗ',
	N: 'ኘኙኚኛኜኝኞኟ',
	a: 'አኡኢኣኤእኦኧ',
	A: 'ዐዑዒዓዔዕዖ',
	k: 'ከኩኪካኬክኮኳ',
	w: 'ወዉዊዋዌውዎዏ',
	Z: 'ዠዡዢዣዤዥዦዧ',
	y: 'የዩዪያዬይዮዯ',
	d: 'ደዱዲዳዴድዶዷ',
	x: 'ጸጹጺጻጼጽጾጿ',
	X: 'ፀፁፂፃፄፅፆ',
	j: 'ጀጁጂጃጄጅጆጇ',
	g: 'ገጉጊጋጌግጎጓ',
	T: 'ጠጡጢጣጤጥጦጧ',
	c: 'ጨጩጪጫጬጭጮጯ',
	C: 'ቸቹቺቻቼችቾቿ',
	P: 'ጰጱጲጳጴጵጶጷ',
	p: 'ፐፑፒፓፔፕፖፗ',
	f: 'ፈፉፊፋፌፍፎፏ',
	q: 'ቀቁቂቃቄቅቆቋ',
};

export const getCharsToTrain = () => {
	return Object.keys(amharicFonts).map((key) => amharicFonts[key][0]);
};

export const getCharVariants = (firstChar: string) => {
	let char = Object.keys(amharicFonts).find(
		(key) => amharicFonts[key][0] === firstChar
	);
	if (!char) {
		return [];
	}
	return amharicFonts[char].split('');
};

export const getFirstChar = (char: string) => {
	return amharicFonts[char][0];
};

export const getAllChars = () => {
	return Object.keys(amharicFonts)
		.map((key) => amharicFonts[key])
		.join('')
		.split('');
};

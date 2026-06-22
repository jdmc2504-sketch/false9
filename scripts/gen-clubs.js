const fs = require("fs");
const path = require("path");

const clubs = [
  // [name, categories, easy, medium, hard]
  ["Manchester City", ["Premier League", "Premier League Clubs", "Top European Clubs"], "Reigning Premier League powerhouse", "Sky blue side managed under Pep Guardiola for years", "Based at the Etihad Stadium"],
  ["Manchester United", ["Premier League", "Premier League Clubs", "Top European Clubs"], "Old Trafford's Red Devils", "Most decorated English club by trophies", "Famous for the 'Class of 92'"],
  ["Liverpool", ["Premier League", "Premier League Clubs", "Top European Clubs"], "Anfield's Reds", "Famous for 'You'll Never Walk Alone'", "Won a historic comeback in Istanbul"],
  ["Arsenal", ["Premier League", "Premier League Clubs", "Top European Clubs"], "North London's Gunners", "Went a whole season unbeaten in 2003-04", "Plays at the Emirates Stadium"],
  ["Chelsea", ["Premier League", "Premier League Clubs", "Top European Clubs"], "West London's Blues", "Owned by Roman Abramovich for nearly two decades", "Plays at Stamford Bridge"],
  ["Tottenham Hotspur", ["Premier League", "Premier League Clubs"], "North London's Spurs", "Famous for 'To Dare Is To Do'", "Moved into a new stadium in 2019"],
  ["Newcastle United", ["Premier League", "Premier League Clubs"], "Tyneside's Magpies", "Black and white striped shirts", "Plays at St James' Park"],
  ["Aston Villa", ["Premier League", "Premier League Clubs"], "Birmingham's claret and blue side", "Won the European Cup in 1982", "Plays at Villa Park"],
  ["West Ham United", ["Premier League", "Premier League Clubs"], "East London's Hammers", "Famous for 'I'm Forever Blowing Bubbles'", "Moved to the London Stadium"],
  ["Everton", ["Premier League", "Premier League Clubs"], "Merseyside's Toffees", "Liverpool's blue half of the city", "One of only a few ever-present top-flight clubs"],
  ["Brighton & Hove Albion", ["Premier League", "Premier League Clubs"], "South coast's Seagulls", "Known for sharp recruitment and resale profits", "Plays at the Amex Stadium"],
  ["Brentford", ["Premier League", "Premier League Clubs"], "West London's Bees", "Famous for data-driven transfer strategy", "Promoted to the top flight in 2021"],
  ["Wolverhampton Wanderers", ["Premier League", "Premier League Clubs"], "Black Country's Wolves", "Gold and black home colors", "Founding members of the Football League"],
  ["Crystal Palace", ["Premier League", "Premier League Clubs"], "South London's Eagles", "Famous for the 'Glad All Over' entrance song", "Plays at Selhurst Park"],
  ["Fulham", ["Premier League", "Premier League Clubs"], "West London club by the Thames", "Plays at Craven Cottage", "Known for a riverside stadium setting"],

  ["Real Madrid", ["La Liga", "Top European Clubs", "Champions League Clubs"], "The most decorated club in Champions League history", "Plays in all-white at the Santiago Bernabeu", "Known as 'Los Blancos'"],
  ["Barcelona", ["La Liga", "Top European Clubs", "Champions League Clubs"], "Catalan giants known for 'tiki-taka'", "Famous for the motto 'Mes que un club'", "Plays at Camp Nou"],
  ["Atletico Madrid", ["La Liga", "Top European Clubs"], "Madrid's red and white striped side", "Famous for a gritty defensive identity under Simeone", "Plays at the Metropolitano"],
  ["Sevilla", ["La Liga"], "Andalusian club famous for Europa League success", "Won the Europa League a record number of times", "Plays at the Ramon Sanchez Pizjuan"],
  ["Real Sociedad", ["La Liga"], "Basque club from San Sebastian", "Famous for an all-Basque policy for decades", "Plays at the Reale Arena"],
  ["Athletic Bilbao", ["La Liga"], "Basque club that only signs Basque-born players", "Never been relegated from the top flight", "Plays at San Mames"],
  ["Villarreal", ["La Liga"], "Known as the 'Yellow Submarine'", "Small-town club that won the Europa League", "Based in a town of around 50,000 people"],
  ["Valencia", ["La Liga"], "Spain's third most successful club historically", "Plays at the Mestalla", "Known by the nickname 'Los Che'"],

  ["Bayern Munich", ["Bundesliga", "Top European Clubs", "Champions League Clubs"], "Germany's most dominant club", "Won the Bundesliga title for over a decade straight", "Plays at the Allianz Arena"],
  ["Borussia Dortmund", ["Bundesliga", "Top European Clubs"], "Famous for the 'Yellow Wall' fan stand", "Plays at Signal Iduna Park", "Known for developing young talent"],
  ["Bayer Leverkusen", ["Bundesliga"], "Nicknamed 'Werkself'", "Won an unbeaten Bundesliga title", "Based in a town named after a pharmaceutical company"],
  ["RB Leipzig", ["Bundesliga"], "Modern club founded in 2009", "Backed by an energy drink company", "Rose from the fifth tier to the Bundesliga in a decade"],
  ["Borussia Monchengladbach", ["Bundesliga"], "Known for a famous 'Foals' nickname", "Dominant German force of the 1970s", "Plays at Borussia-Park"],

  ["Juventus", ["Serie A", "Top European Clubs", "Champions League Clubs"], "Turin's black-and-white striped giants", "Italy's most decorated league club", "Known as 'The Old Lady'"],
  ["AC Milan", ["Serie A", "Top European Clubs", "Champions League Clubs"], "San Siro's red-and-black Rossoneri", "Seven-time European Cup winners", "Famous for legendary defensive units"],
  ["Inter Milan", ["Serie A", "Top European Clubs", "Champions League Clubs"], "San Siro's blue-and-black Nerazzurri", "Won a historic treble in 2010", "Famous for a defensive era under Mourinho"],
  ["Napoli", ["Serie A"], "Southern Italian club Maradona made famous", "Won a Scudetto in 2023 after decades of waiting", "Plays at the Diego Armando Maradona stadium"],
  ["AS Roma", ["Serie A"], "Capital city club with a wolf emblem", "Won the inaugural Europa Conference League", "Plays at the Stadio Olimpico"],
  ["Atalanta", ["Serie A"], "Bergamo club famous for attacking football", "Won the Europa League in 2024", "Punches above its weight against bigger clubs"],
  ["Fiorentina", ["Serie A"], "Florence's purple-shirted club", "Known as 'La Viola'", "Famous for Gabriel Batistuta's era"],

  ["Paris Saint-Germain", ["Ligue 1", "Top European Clubs", "Champions League Clubs"], "France's dominant capital city club", "Backed by Qatari ownership since 2011", "Won the Champions League for the first time in 2025"],
  ["Olympique Lyonnais", ["Ligue 1"], "Won seven straight French titles in the 2000s", "Based in France's third-largest city", "Famous women's team won multiple Champions Leagues"],
  ["Olympique de Marseille", ["Ligue 1"], "France's only European Cup winner", "Famous for passionate fans at the Velodrome", "Mediterranean port city's club"],
  ["AS Monaco", ["Ligue 1"], "Principality club known for academy products", "Plays its home games in a tiny tax haven", "Produced Mbappe before his big transfer"],
  ["Lille", ["Ligue 1"], "Stunned PSG to win the 2021 league title", "Northern French club near the Belgian border", "Known for shrewd transfer business"],

  ["Ajax", ["Champions League Clubs", "Top European Clubs"], "Dutch club famous for Total Football", "Amsterdam giants with a legendary academy", "Won three straight European Cups in the 1970s"],
  ["Benfica", ["Champions League Clubs"], "Lisbon giants known for a club curse legend", "One of Portugal's 'big three'", "Famous for selling star players for huge fees"],
  ["FC Porto", ["Champions League Clubs"], "Won the Champions League under Mourinho in 2004", "Northern Portugal's dragon-emblazoned club", "Famous for shrewd scouting in South America"],
  ["Sporting CP", ["Champions League Clubs"], "Lisbon club that gave Ronaldo his start", "Known by the lion emblem", "Ended a 19-year title drought in 2021"],
  ["Celtic", ["Champions League Clubs"], "Glasgow's green-and-white hooped giants", "First British club to win the European Cup", "Famous Lisbon Lions team of 1967"],
  ["Rangers", ["Champions League Clubs"], "Glasgow's blue-shirted rivals to Celtic", "One half of the 'Old Firm' rivalry", "Plays at Ibrox Stadium"],
  ["Galatasaray", ["Champions League Clubs"], "Istanbul giants known for a fierce home atmosphere", "Famous 'Welcome to Hell' banner", "Turkey's most decorated European campaigner"],
  ["Shakhtar Donetsk", ["Champions League Clubs"], "Ukrainian club known for Brazilian recruits", "Forced to play home games away from its city", "Dominant force in Ukrainian football"],

  ["Brazil", ["National Teams", "World Cup Winners"], "Record five-time World Cup winners", "Famous canary-yellow jersey", "South American football's most decorated nation"],
  ["Argentina", ["National Teams", "World Cup Winners"], "Sky-blue and white striped jersey", "Won the World Cup in 2022", "Home of Messi and Maradona"],
  ["Germany", ["National Teams", "World Cup Winners"], "Four-time World Cup winners", "Known for tournament efficiency", "Famous for a 7-1 World Cup semi-final win"],
  ["France", ["National Teams", "World Cup Winners"], "Won the World Cup in 1998 and 2018", "Famous for a 'Black Blanc Beur' generation", "Wears blue home shirts"],
  ["England", ["National Teams"], "Birthplace of football's modern rules", "Won its only World Cup on home soil in 1966", "Known as the Three Lions"],
  ["Spain", ["National Teams", "World Cup Winners"], "Tiki-taka dominant team of 2008-2012", "Won the World Cup and back-to-back Euros", "Won a record fourth European Championship in 2024"],
  ["Italy", ["National Teams", "World Cup Winners"], "Four-time World Cup winners", "Famous for defensive 'catenaccio' style", "Surprise Euro 2020 champions"],
  ["Portugal", ["National Teams"], "Home of Cristiano Ronaldo", "Won its first major title at Euro 2016", "Known as 'A Seleção'"],
  ["Netherlands", ["National Teams"], "Famous for 'Total Football'", "Three-time World Cup final losers", "Known as the 'Oranje'"],
  ["Belgium", ["National Teams"], "Golden Generation of the 2010s", "Reached a World Cup semi-final in 2018", "Known as the 'Red Devils'"],
  ["Croatia", ["National Teams"], "Reached the World Cup final in 2018", "Famous checkered red-and-white jersey", "Punches well above its small population"],
  ["Uruguay", ["National Teams", "World Cup Winners"], "Won the very first World Cup in 1930", "Known as 'La Celeste'", "South America's smallest World Cup winner"],
  ["Morocco", ["National Teams"], "First African nation to reach a World Cup semi-final", "Stunning run at the 2022 World Cup", "Known as the 'Atlas Lions'"],
  ["Senegal", ["National Teams"], "AFCON champions in 2022", "Famous for Sadio Mane's leadership", "Known as the 'Lions of Teranga'"],
];

const entities = clubs.map(([name, categories, hintEasy, hintMedium, hintHard], i) => ({
  id: `club-${i + 1}`,
  name,
  type: "club",
  hintEasy,
  hintMedium,
  hintHard,
  categories,
}));

const outPath = path.join(__dirname, "..", "src", "data-packs", "base-pack", "clubs.json");
fs.writeFileSync(outPath, JSON.stringify(entities, null, 2));
console.log(`Wrote ${entities.length} clubs to ${outPath}`);

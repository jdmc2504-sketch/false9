// Generates data-packs/base-pack/players.json
// Run with: node scripts/gen-players.js
const fs = require("fs");
const path = require("path");

/**
 * Each row: [name, club/country hint topic, league/category tags..., easy, medium, hard]
 * We keep hints short and punchy — true to the "England" example in the spec.
 */
const players = [
  // ===== Premier League (current-ish, 2025/26 season feel) =====
  ["Erling Haaland", ["Premier League", "Manchester City", "Current Players", "Norway"], "Manchester City striker", "Norwegian goal machine", "Wears No. 9"],
  ["Mohamed Salah", ["Premier League", "Liverpool", "Current Players", "Egypt"], "Liverpool's Egyptian King", "Famous for cutting in from the right", "Egypt's all-time top scorer"],
  ["Bukayo Saka", ["Premier League", "Arsenal", "Current Players", "England"], "Arsenal academy graduate", "England's No. 7", "Hails from Ealing, London"],
  ["Kevin De Bruyne", ["Premier League", "Belgium", "Current Players"], "Belgian playmaking genius", "Known for pinpoint crosses", "Former Chelsea reject"],
  ["Declan Rice", ["Premier League", "Arsenal", "Current Players", "England"], "Arsenal's defensive midfielder", "Former West Ham captain", "England international from Kingston"],
  ["Cole Palmer", ["Premier League", "Chelsea", "Current Players", "England"], "Chelsea's ice-cold finisher", "Famous cold celebration pose", "Came through Man City academy"],
  ["Phil Foden", ["Premier League", "Manchester City", "Current Players", "England"], "Manchester City's homegrown talent", "Nicknamed Stockport Iniesta", "England's No. 47 growing up"],
  ["Son Heung-min", ["Premier League", "Tottenham", "Current Players"], "Tottenham's South Korean captain", "Famous for his speed and finishing", "Military service in South Korea"],
  ["Harry Kane", ["Premier League", "Bundesliga", "Current Players", "England"], "England's record goalscorer", "Moved to Bavaria in 2023", "Tottenham legend turned Bayern striker"],
  ["Virgil van Dijk", ["Premier League", "Liverpool", "Current Players", "Netherlands"], "Liverpool's commanding captain", "Dutch defensive colossus", "Signed from Southampton for a then-record fee"],
  ["Bruno Fernandes", ["Premier League", "Manchester United", "Current Players", "Portugal"], "Manchester United's captain", "Portuguese set-piece specialist", "Known for animated celebrations"],
  ["Marcus Rashford", ["Premier League", "Current Players", "England"], "Manchester-born forward", "Campaigned for free school meals", "England academy graduate from Wythenshawe"],
  ["Bernardo Silva", ["Premier League", "Manchester City", "Current Players", "Portugal"], "Manchester City's tireless winger", "Tiny but technically brilliant", "Came up through Benfica's academy"],
  ["Rodri", ["Premier League", "Manchester City", "Current Players", "Spain"], "Manchester City's deep midfield anchor", "Won Ballon d'Or in 2024", "Spain's midfield metronome"],
  ["Alexander Isak", ["Premier League", "Newcastle", "Current Players", "Sweden"], "Newcastle's elegant striker", "Swedish forward with silky touch", "Came through Real Sociedad"],
  ["William Saliba", ["Premier League", "Arsenal", "Current Players", "France"], "Arsenal's French centre-back", "Loaned to Marseille before breaking through", "Part of France's World Cup squad"],
  ["James Maddison", ["Premier League", "Tottenham", "Current Players", "England"], "Tottenham's creative spark", "Known for his set-piece deliveries", "Leicester academy product"],
  ["Trent Alexander-Arnold", ["Premier League", "Real Madrid", "England"], "Liverpool academy graduate turned Madrid star", "Famous for inch-perfect crosses", "Local Scouse lad who became a galactico"],
  ["Jack Grealish", ["Premier League", "Current Players", "England"], "Flashy English winger", "Famous for his rolled-down socks", "Aston Villa boyhood hero turned title winner"],
  ["Ollie Watkins", ["Premier League", "Aston Villa", "Current Players", "England"], "Aston Villa's clinical striker", "Scored a famous Euro 2024 semi winner", "Former Brentford forward"],
  ["Martin Odegaard", ["Premier League", "Arsenal", "Current Players", "Norway"], "Arsenal's Norwegian captain", "Real Madrid's youngest ever debutant", "Known for his calm composure"],
  ["Nicolas Jackson", ["Premier League", "Chelsea", "Current Players"], "Chelsea's lively Senegalese striker", "Known for pace over precision", "Came through Villarreal"],
  ["Moises Caicedo", ["Premier League", "Chelsea", "Current Players"], "Chelsea's record-fee midfielder", "Ecuadorian ball-winner", "Joined from Brighton for a huge fee"],
  ["Bryan Mbeumo", ["Premier League", "Manchester United", "Current Players"], "Cameroonian winger known for clinical finishing", "Captained Brentford before a big move", "Renowned for cutting inside on his left"],
  ["Morgan Rogers", ["Premier League", "Aston Villa", "Current Players", "England"], "Aston Villa's versatile attacker", "Came through Manchester City's academy", "Loan spells shaped his rise"],

  // ===== La Liga =====
  ["Kylian Mbappe", ["La Liga", "Real Madrid", "Current Players", "France"], "Real Madrid's French superstar", "Known for blistering pace", "World Cup winner at 19"],
  ["Vinicius Junior", ["La Liga", "Real Madrid", "Current Players", "Brazil"], "Real Madrid's Brazilian winger", "Famous for his dancing celebrations", "Came through Flamengo's academy"],
  ["Jude Bellingham", ["La Liga", "Real Madrid", "Current Players", "England"], "Real Madrid's English midfield star", "Left Birmingham as a teenager", "Known for arriving late into the box"],
  ["Robert Lewandowski", ["La Liga", "Barcelona", "Current Players", "Poland"], "Barcelona's Polish goal machine", "Once scored five in nine minutes", "Bundesliga's all-time top scorer before LaLiga"],
  ["Lamine Yamal", ["La Liga", "Barcelona", "Current Players", "Spain"], "Barcelona's teenage sensation", "Youngest ever Spain international", "Wears the iconic No. 10 at a young age"],
  ["Pedri", ["La Liga", "Barcelona", "Current Players", "Spain"], "Barcelona's tireless midfield metronome", "Canary Islands native", "Compared to Andres Iniesta"],
  ["Antoine Griezmann", ["La Liga", "Atletico Madrid", "Current Players", "France"], "Atletico Madrid's veteran forward", "Famous Fortnite celebration", "World Cup winner with France"],
  ["Thibaut Courtois", ["La Liga", "Real Madrid", "Current Players", "Belgium"], "Real Madrid's towering goalkeeper", "Belgian shot-stopper", "Former Chelsea and Atletico keeper"],
  ["Jan Oblak", ["La Liga", "Atletico Madrid", "Current Players"], "Atletico Madrid's Slovenian wall", "Known for his shot-stopping reflexes", "One of the best paid goalkeepers ever"],
  ["Frenkie de Jong", ["La Liga", "Barcelona", "Current Players", "Netherlands"], "Barcelona's elegant Dutch midfielder", "Famous for his signature turn", "Came through Ajax's academy"],
  ["Pau Cubarsi", ["La Liga", "Barcelona", "Current Players", "Spain"], "Barcelona's teenage centre-back prodigy", "Composed on the ball beyond his years", "Broke into the side aged just 17"],
  ["Julian Alvarez", ["La Liga", "Atletico Madrid", "Current Players", "Argentina"], "Argentine World Cup winner", "Left Manchester City for Atletico", "Known as 'La Araña'"],

  // ===== Bundesliga =====
  ["Jamal Musiala", ["Bundesliga", "Bayern Munich", "Current Players", "Germany"], "Bayern Munich's dribbling wizard", "Born in Germany, raised in England", "Came through Chelsea's academy"],
  ["Florian Wirtz", ["Bundesliga", "Bayer Leverkusen", "Current Players", "Germany"], "Bayer Leverkusen's creative German star", "Helped his club win an unbeaten title", "Tipped as Germany's next great No. 10"],
  ["Harry Kane", ["Bundesliga", "Bayern Munich", "Current Players"], "Bayern Munich's English striker", "Premier League's all-time second top scorer", "Finally won his first major trophy in Germany"],
  ["Manuel Neuer", ["Bundesliga", "Bayern Munich", "Germany"], "Bayern Munich's legendary sweeper-keeper", "Redefined the goalkeeper role", "Germany's 2014 World Cup winning keeper"],
  ["Joshua Kimmich", ["Bundesliga", "Bayern Munich", "Current Players", "Germany"], "Bayern Munich's versatile German engine", "Can play full-back or midfield", "Came through RB Leipzig"],

  // ===== Serie A =====
  ["Lautaro Martinez", ["Serie A", "Inter Milan", "Current Players", "Argentina"], "Inter Milan's Argentine captain", "World Cup winner in 2022", "Known as 'El Toro'"],
  ["Victor Osimhen", ["Serie A", "Current Players"], "Nigerian striker who won Napoli a title", "Famous fighter-jet celebration", "One of Africa's most prolific forwards"],
  ["Rafael Leao", ["Serie A", "AC Milan", "Current Players", "Portugal"], "AC Milan's explosive winger", "Portuguese pace merchant", "Came through Sporting CP's academy"],
  ["Theo Hernandez", ["Serie A", "AC Milan", "Current Players", "France"], "AC Milan's marauding left-back", "French defender with attacking flair", "Brother also plays professionally"],
  ["Nicolo Barella", ["Serie A", "Inter Milan", "Current Players", "Italy"], "Inter Milan's box-to-box engine", "Sardinian midfield dynamo", "Key man in Italy's midfield"],

  // ===== Ligue 1 =====
  ["Ousmane Dembele", ["Ligue 1", "Current Players", "France"], "French winger turned prolific striker", "Won Ballon d'Or contention at PSG", "Known for explosive dribbling"],
  ["Bradley Barcola", ["Ligue 1", "Current Players", "France"], "PSG's pacy young winger", "Came through Lyon's academy", "Breakout star of a Champions League run"],

  // ===== Legends / Past Eras =====
  ["Pele", ["Legends", "World Cup Winners", "Brazil"], "Brazilian icon, three-time World Cup winner", "Often called the greatest of all time", "Scored over 1000 career goals"],
  ["Diego Maradona", ["Legends", "World Cup Winners", "Argentina"], "Argentine icon famous for the Hand of God", "Carried Argentina to glory in 1986", "Played for Napoli and Boca Juniors"],
  ["Johan Cruyff", ["Legends", "Netherlands"], "Dutch master of Total Football", "Has a turn named after him", "Ajax and Barcelona icon"],
  ["Zinedine Zidane", ["Legends", "World Cup Winners", "France"], "French World Cup winning playmaker", "Famous for a Champions League final volley", "Later became a championship-winning coach"],
  ["Ronaldinho", ["Legends", "Brazil"], "Brazilian magician known for his smile", "Two-time FIFA World Player of the Year", "Famous for outrageous tricks"],
  ["Thierry Henry", ["Legends", "Premier League", "France"], "Arsenal's Invincibles era striker", "French World Cup winner from 1998", "Famous for cutting in from the left"],
  ["Ronaldo Nazario", ["Legends", "World Cup Winners", "Brazil"], "Brazilian 'Phenomenon' striker", "Devastating in the 2002 World Cup final", "Career shaped by serious knee injuries"],
  ["Paolo Maldini", ["Legends", "Serie A", "Italy"], "AC Milan's one-club defensive icon", "Rarely needed to make a tackle", "Captained Italy for over a decade"],
  ["Franz Beckenbauer", ["Legends", "World Cup Winners", "Germany"], "German 'Kaiser' who redefined sweeping", "Won the World Cup as player and manager", "Bayern Munich legend"],
  ["George Best", ["Legends", "Premier League"], "Northern Irish maverick of the 1960s", "Manchester United's flair icon", "Famous for his off-field lifestyle as much as skill"],
  ["David Beckham", ["Legends", "Premier League", "England"], "English icon famous for his right foot", "Free-kick specialist from Manchester", "Later became a Hollywood-adjacent global brand"],
  ["Andrea Pirlo", ["Legends", "Serie A", "Italy"], "Italian deep-lying playmaker", "Famous for his cool penalty technique", "World Cup winner in 2006"],
  ["Roberto Baggio", ["Legends", "Serie A", "Italy"], "Italian 'Divin Codino' forward", "Famous ponytail and missed 1994 final penalty", "Buddhist footballing artist"],
  ["Marco van Basten", ["Legends", "Netherlands"], "Dutch striker with a legendary volley", "Career cut short by ankle injuries", "Won three Ballons d'Or"],
  ["Eric Cantona", ["Legends", "Premier League", "France"], "Manchester United's collar-up Frenchman", "Famous for a kung-fu kick incident", "Philosophical icon of English football"],
  ["Alessandro Del Piero", ["Legends", "Serie A", "Italy"], "Juventus' elegant one-club forward", "Famous for his curling 'Del Piero zone' shots", "World Cup winner in 2006"],
  ["Luis Figo", ["Legends", "La Liga", "Portugal"], "Portuguese winger who shocked fans with a transfer", "Moved from Barcelona to Real Madrid", "Won the Ballon d'Or in 2000"],
  ["Rivaldo", ["Legends", "Brazil"], "Brazilian World Cup winner known for overhead kicks", "Won Ballon d'Or in 1999", "Part of Brazil's 2002 'Magic Trio'"],
  ["Gianluigi Buffon", ["Legends", "Serie A", "Italy"], "Italy's legendary World Cup winning keeper", "One-club hero at Juventus for most of his career", "Played professionally into his forties"],
  ["Xavi Hernandez", ["Legends", "La Liga", "Spain"], "Barcelona's tiki-taka conductor", "World Cup and double Euro winner", "Later returned to coach his boyhood club"],
  ["Iker Casillas", ["Legends", "La Liga", "Spain"], "Spain's World Cup winning captain", "Real Madrid's homegrown goalkeeper", "Known as 'San Iker' for his saves"],
  ["Carles Puyol", ["Legends", "La Liga", "Spain"], "Barcelona's fearless long-haired captain", "World Cup winning centre-back", "Famous for a header in a World Cup semi"],
  ["Didier Drogba", ["Legends", "Premier League"], "Chelsea's Ivorian talisman", "Scored the winning penalty in a Champions League final", "Famous for big-game performances"],
  ["Samuel Eto'o", ["Legends", "Serie A"], "Cameroonian striker, prolific across three leagues", "Won the Champions League with three different clubs", "African Player of the Year multiple times"],
  ["Steven Gerrard", ["Legends", "Premier League", "England"], "Liverpool's one-club inspirational captain", "Famous for the 'Istanbul' comeback final", "Known for thunderous long-range strikes"],
  ["Frank Lampard", ["Legends", "Premier League", "England"], "Chelsea's record goalscoring midfielder", "Known for late runs into the box", "England's all-time top-scoring midfielder"],
  ["Wayne Rooney", ["Legends", "Premier League", "England"], "Manchester United and England's record scorer", "Scored a famous overhead kick derby winner", "Broke through as a teenager at Everton"],
  ["Andres Iniesta", ["Legends", "La Liga", "Spain"], "Barcelona's quiet World Cup final hero", "Scored the winning goal in 2010", "Tiki-taka's most balletic midfielder"],
  ["Xabi Alonso", ["Legends", "La Liga", "Spain"], "Spain's deep-lying passing maestro", "Scored from the halfway line memorably", "Later became a title-winning coach"],
  ["Cafu", ["Legends", "Serie A", "Brazil"], "Brazilian right-back, three World Cup finals", "Captained Brazil to the 2002 title", "Famous for his tireless overlapping runs"],
  ["Roberto Carlos", ["Legends", "La Liga", "Brazil"], "Brazilian left-back famous for a bending free-kick", "Real Madrid's attacking full-back pioneer", "Known for thunderous shot power"],
  ["Gabriel Batistuta", ["Legends", "Serie A", "Argentina"], "Argentine striker famous for fist-pumping celebrations", "Fiorentina's prolific 'Batigol'", "One of the great World Cup poachers"],
  ["Michael Owen", ["Legends", "Premier League", "England"], "England striker famous for a wonder goal in 1998", "Won the Ballon d'Or in 2001", "Liverpool academy graduate"],
  ["Ryan Giggs", ["Legends", "Premier League"], "Manchester United's longest-serving player", "Famous solo FA Cup semi-final goal", "Welsh winger who never played in a major tournament"],
  ["Paul Scholes", ["Legends", "Premier League", "England"], "Manchester United's understated midfield genius", "Praised by Zidane as the best of his generation", "Known for raking long passes"],
  ["Lothar Matthaus", ["Legends", "World Cup Winners", "Germany"], "Germany's World Cup winning captain in 1990", "Most capped German international", "Won the inaugural Ballon d'Or era award for his year"],
  ["Hristo Stoichkov", ["Legends", "La Liga", "Bulgaria"], "Bulgarian forward, Barcelona's fiery icon", "Won the Ballon d'Or in 1994", "Led Bulgaria to a shock World Cup semi"],
  ["George Weah", ["Legends", "Serie A"], "Liberian striker turned national president", "Only African to win the Ballon d'Or", "AC Milan icon of the 1990s"],
  ["Pavel Nedved", ["Legends", "Serie A", "Czech Republic"], "Czech midfielder nicknamed 'Furia Ceca'", "Juventus icon known for stamina", "Won the Ballon d'Or in 2003"],
  ["Kaka", ["Legends", "Serie A", "Brazil"], "Brazilian playmaker known for his calm style", "Won the Ballon d'Or in 2007", "AC Milan and Real Madrid star"],
  ["Luis Suarez", ["Legends", "La Liga", "Uruguay"], "Uruguayan striker known for clinical, controversial play", "Part of Barcelona's lethal front three", "Infamous for a World Cup goal-line handball"],
  ["Edwin van der Sar", ["Legends", "Premier League", "Netherlands"], "Towering Dutch goalkeeper", "Holds a Premier League clean sheet record", "Manchester United's calm last line"],
  ["Patrick Vieira", ["Legends", "Premier League", "France"], "Arsenal's Invincibles midfield enforcer", "World Cup winner with France", "Later became a Premier League manager"],

  // ===== International / Current Mixed =====
  ["Lionel Messi", ["Legends", "World Cup Winners", "Argentina", "Current Players"], "Argentine World Cup winning No. 10", "Record eight-time Ballon d'Or winner", "Now plays in Major League Soccer"],
  ["Cristiano Ronaldo", ["Legends", "Current Players", "Portugal"], "Portuguese all-time top international scorer", "Famous for the 'Siuu' celebration", "Now plays in Saudi Arabia"],
  ["Neymar", ["Current Players", "Brazil"], "Brazilian forward famous for flair", "Once the world's most expensive transfer", "Known for elaborate step-overs"],
  ["Karim Benzema", ["Legends", "Current Players", "France"], "French striker who waited years for a Ballon d'Or", "Real Madrid's all-time great No. 9", "Now plays in Saudi Arabia"],
  ["Sadio Mane", ["Current Players"], "Senegalese forward, AFCON winner", "Part of a deadly Liverpool front three", "Known for his humble upbringing story"],
  ["Riyad Mahrez", ["Current Players"], "Algerian winger, Leicester title hero", "Famous for a cheeky chip technique", "Now plays in Saudi Arabia"],
  ["N'Golo Kante", ["Legends", "Current Players", "France"], "Tireless French midfield destroyer", "Won the league with two different underdog clubs", "World Cup winner in 2018"],
  ["Toni Kroos", ["Legends", "Current Players", "Germany"], "German passing metronome", "Won five Champions Leagues with Real Madrid", "Retired after Euro 2024"],
  ["Sergio Ramos", ["Legends", "Current Players", "Spain"], "Spanish defender famous for late dramatic goals", "Real Madrid's combative captain", "World Cup winner in 2010"],
  ["Luka Modric", ["Legends", "Current Players", "Croatia"], "Croatian playmaker, 2018 Ballon d'Or winner", "Led Croatia to a World Cup final", "Real Madrid's evergreen midfielder"],
];

const entities = players.map(([name, categories, hintEasy, hintMedium, hintHard], i) => ({
  id: `player-${i + 1}`,
  name,
  type: "player",
  hintEasy,
  hintMedium,
  hintHard,
  categories,
}));

const outPath = path.join(__dirname, "..", "src", "data-packs", "base-pack", "players.json");
fs.writeFileSync(outPath, JSON.stringify(entities, null, 2));
console.log(`Wrote ${entities.length} players to ${outPath}`);
